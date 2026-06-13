import { getTrainingDataInsights, type DataInsight } from "@/lib/analytics/data-insights";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  isDateInRange,
  parseDashboardDate,
  startOfMonth,
  startOfWeek,
  type PeriodRange,
} from "@/lib/domain/dashboard/periods";
import { calculateMuscleSummary, getTopMuscles } from "@/lib/domain/training/muscle-load";
import { getRunningBreakdown } from "@/lib/domain/training/run-exposure";
import { isSecondaryActivity } from "@/lib/domain/training/secondary-activity";
import { getWeekKey } from "@/lib/analytics/trends";
import { formatDuration, formatKm, formatLoadKg, formatMuscleName, formatRpe, formatTrainingType } from "@/lib/utils/format";
import type { MuscleName, TrainingSession, TrainingSessionType } from "@/types/training";

export type PeriodReportType = "week" | "month";

export type PeriodReportMetrics = {
  sessions: number;
  durationMinutes: number;
  totalRunMeters: number;
  structuredRunMeters: number;
  mixedRunMeters: number;
  averageRpe: number | null;
  fatigueCost: number;
  impactScore: number;
  totalExternalLoadKg: number;
};

export type PeriodReport = {
  id: string;
  type: PeriodReportType;
  periodKey: string;
  label: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  headline: string;
  conclusion: string;
  metrics: PeriodReportMetrics;
  disciplineBreakdown: Array<{
    label: string;
    value: number;
  }>;
  topMuscles: Array<{
    muscle: MuscleName;
    load: number;
  }>;
  keyInsights: DataInsight[];
  recommendations: string[];
};

export type PeriodReportOptions = {
  limit?: number;
  includeOpen?: boolean;
  referenceDate?: Date;
};

type DisciplineKey = TrainingSessionType | "secondary_activity";

const monthFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  year: "numeric",
});

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isAnalysableSession(session: TrainingSession) {
  return session.status !== "cancelled" && session.status !== "planned";
}

function getAverageRpe(sessions: TrainingSession[]) {
  const values = sessions
    .map((session) => session.rpe)
    .filter((value): value is number => typeof value === "number" && value > 0);

  if (values.length === 0) {
    return null;
  }

  return Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(1));
}

function getRangeForKey(type: PeriodReportType, periodKey: string): PeriodRange | null {
  if (type === "week") {
    const match = periodKey.match(/^(\d{4})-W(\d{2})$/);

    if (!match) {
      return null;
    }

    const year = Number(match[1]);
    const week = Number(match[2]);
    const januaryFourth = new Date(year, 0, 4);
    const firstWeekStart = startOfWeek(januaryFourth);
    const start = addDays(firstWeekStart, (week - 1) * 7);

    return { start, end: endOfWeek(start) };
  }

  const match = periodKey.match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const start = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return { start: startOfMonth(start), end: endOfMonth(start) };
}

function getPeriodKey(type: PeriodReportType, date: string | Date) {
  const parsed = parseDashboardDate(date);

  if (type === "week") {
    return getWeekKey(parsed);
  }

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

function getPeriodLabel(type: PeriodReportType, range: PeriodRange, periodKey: string) {
  if (type === "week") {
    return `${periodKey} · ${range.start.getDate().toString().padStart(2, "0")}/${(range.start.getMonth() + 1).toString().padStart(2, "0")} - ${range.end.getDate().toString().padStart(2, "0")}/${(range.end.getMonth() + 1).toString().padStart(2, "0")}`;
  }

  return monthFormatter.format(range.start);
}

function getDisciplineKey(session: TrainingSession): DisciplineKey {
  return isSecondaryActivity(session) ? "secondary_activity" : session.type;
}

function buildDisciplineBreakdown(sessions: TrainingSession[]) {
  const counts = sessions.reduce<Partial<Record<DisciplineKey, number>>>((totals, session) => {
    const key = getDisciplineKey(session);
    totals[key] = (totals[key] ?? 0) + 1;
    return totals;
  }, {});

  return (Object.entries(counts) as Array<[DisciplineKey, number]>)
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([key, value]) => ({
      label: key === "secondary_activity" ? "Actividad secundaria" : formatTrainingType(key),
      value,
    }));
}

function buildMetrics(sessions: TrainingSession[]): PeriodReportMetrics {
  const running = getRunningBreakdown(sessions);

  return {
    sessions: sessions.length,
    durationMinutes: sessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0),
    totalRunMeters: running.totalRunExposureMeters,
    structuredRunMeters: running.structuredMeters,
    mixedRunMeters: running.mixedMeters,
    averageRpe: getAverageRpe(sessions),
    fatigueCost: sessions.reduce((total, session) => total + session.sessionMetrics.fatigueCost, 0),
    impactScore: sessions.reduce((total, session) => total + session.sessionMetrics.impactScore, 0),
    totalExternalLoadKg: sessions.reduce((total, session) => total + (session.sessionMetrics.totalExternalLoadKg ?? 0), 0),
  };
}

function buildHeadline(metrics: PeriodReportMetrics, insights: DataInsight[]) {
  const warning = insights.find((insight) => insight.severity === "critical" || insight.severity === "warning");

  if (metrics.sessions === 0) {
    return "Periodo sin sesiones registradas.";
  }

  if (metrics.sessions < 2) {
    return "Periodo con datos limitados.";
  }

  if (warning) {
    return warning.title;
  }

  if (metrics.structuredRunMeters === 0 && metrics.mixedRunMeters > 0) {
    return "Carrera acumulada sin running estructurado.";
  }

  if (metrics.totalExternalLoadKg > 0 && metrics.totalRunMeters > 0) {
    return "Periodo híbrido con fuerza y carrera.";
  }

  return `${metrics.sessions} sesiones con carga registrada.`;
}

export function buildPeriodConclusion(metrics: PeriodReportMetrics, insights: DataInsight[]) {
  if (metrics.sessions === 0) {
    return "No hay datos suficientes para cerrar una conclusión del periodo.";
  }

  if (metrics.sessions < 2) {
    return `Lectura limitada: ${metrics.sessions} sesión, ${formatDuration(metrics.durationMinutes)} y RPE medio ${formatRpe(metrics.averageRpe)}.`;
  }

  const primaryInsight = insights.find((insight) => insight.severity === "critical" || insight.severity === "warning") ?? insights[0];
  const runningText = `${formatKm(metrics.totalRunMeters, { forceKm: true })} de carrera total: ${formatKm(metrics.structuredRunMeters, { forceKm: true })} estructurado y ${formatKm(metrics.mixedRunMeters, { forceKm: true })} mixto`;
  const loadText = `${formatDuration(metrics.durationMinutes)}, fatiga ${metrics.fatigueCost}, impacto ${metrics.impactScore}, peso movido ${formatLoadKg(metrics.totalExternalLoadKg)}`;

  if (primaryInsight) {
    return `${primaryInsight.message} Evidencia principal: ${primaryInsight.evidence[0] ?? loadText}. Periodo con ${runningText}.`;
  }

  return `Periodo cerrado con ${metrics.sessions} sesiones, ${loadText}. ${runningText}.`;
}

function buildRecommendations(insights: DataInsight[], metrics: PeriodReportMetrics) {
  const recommendations = insights
    .map((insight) => insight.recommendation)
    .filter((recommendation): recommendation is string => Boolean(recommendation));
  const unique = Array.from(new Set(recommendations)).slice(0, 3);

  if (unique.length > 0) {
    return unique;
  }

  if (metrics.sessions < 2) {
    return ["Acumular más datos antes de cambiar el bloque por esta lectura."];
  }

  return ["Mantener el registro y revisar la siguiente prioridad según el objetivo del bloque."];
}

function buildReport(
  sessions: TrainingSession[],
  type: PeriodReportType,
  periodKey: string,
  range: PeriodRange,
  referenceDate: Date,
): PeriodReport {
  const periodSessions = sessions
    .filter(isAnalysableSession)
    .filter((session) => isDateInRange(session.date, range));
  const metrics = buildMetrics(periodSessions);
  const analysis = getTrainingDataInsights(periodSessions, { period: "all" });
  const keyInsights = analysis.insights.slice(0, 4);
  const muscleSummary = calculateMuscleSummary(periodSessions);
  const isClosed = range.end.getTime() < parseDashboardDate(referenceDate).getTime();

  return {
    id: `${type}-${periodKey}`,
    type,
    periodKey,
    label: getPeriodLabel(type, range, periodKey),
    startDate: formatDateKey(range.start),
    endDate: formatDateKey(range.end),
    isClosed,
    headline: buildHeadline(metrics, keyInsights),
    conclusion: buildPeriodConclusion(metrics, keyInsights),
    metrics,
    disciplineBreakdown: buildDisciplineBreakdown(periodSessions),
    topMuscles: getTopMuscles(muscleSummary, 5).map((item) => ({
      muscle: item.muscle,
      load: item.load,
    })),
    keyInsights,
    recommendations: buildRecommendations(keyInsights, metrics),
  };
}

function getReports(sessions: TrainingSession[], type: PeriodReportType, options: PeriodReportOptions = {}) {
  const limit = options.limit ?? (type === "week" ? 4 : 3);
  const referenceDate = options.referenceDate ?? new Date();
  const includeOpen = options.includeOpen ?? true;
  const keys = Array.from(new Set(sessions.filter(isAnalysableSession).map((session) => getPeriodKey(type, session.date))));

  return keys
    .map((periodKey) => {
      const range = getRangeForKey(type, periodKey);
      return range ? buildReport(sessions, type, periodKey, range, referenceDate) : null;
    })
    .filter((report): report is PeriodReport => Boolean(report))
    .filter((report) => includeOpen || report.isClosed)
    .sort((a, b) => parseDashboardDate(b.startDate).getTime() - parseDashboardDate(a.startDate).getTime())
    .slice(0, limit);
}

export function getWeeklyReports(sessions: TrainingSession[], options: PeriodReportOptions = {}) {
  return getReports(sessions, "week", options);
}

export function getMonthlyReports(sessions: TrainingSession[], options: PeriodReportOptions = {}) {
  return getReports(sessions, "month", options);
}

export function getPeriodReport(sessions: TrainingSession[], periodType: PeriodReportType, periodKey: string) {
  const range = getRangeForKey(periodType, periodKey);

  if (!range) {
    return null;
  }

  return buildReport(sessions, periodType, periodKey, range, new Date());
}

export function formatReportMuscles(report: PeriodReport) {
  return report.topMuscles.map((item) => `${formatMuscleName(item.muscle)} ${item.load}`).join(" · ");
}
