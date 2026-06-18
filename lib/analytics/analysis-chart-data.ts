import { getMonthlyChartData, getWeeklyChartData, type MonthlyChartDataPoint, type WeeklyChartDataPoint } from "@/lib/analytics/chart-data";
import { getWeekBuckets } from "@/lib/analytics/trends";
import { filterSessionsByPeriod, parseDashboardDate, type DashboardPeriod } from "@/lib/domain/dashboard/periods";
import { getRunningBreakdown } from "@/lib/domain/training/run-exposure";
import { formatMuscleName } from "@/lib/utils/format";
import type { MuscleName, TrainingSession, TrainingSessionType } from "@/types/training";

export type AnalysisStackSegmentKey =
  | "running"
  | "hyrox"
  | "crossfit"
  | "strength"
  | "gymnastics"
  | "mobility"
  | "functional"
  | "mixed"
  | "low"
  | "moderate"
  | "high"
  | "missing"
  | "complete"
  | "partial"
  | "withoutRpe"
  | "withoutDuration"
  | "withoutResult"
  | "runningWithoutShoes";

export type AnalysisStackSegment = {
  key: AnalysisStackSegmentKey;
  label: string;
  value: number;
  tone?: "accent" | "secondary" | "warning" | "danger" | "neutral";
};

export type AnalysisStackedPoint = {
  key: string;
  label: string;
  metaLabel?: string;
  isCurrentWeek?: boolean;
  segments: AnalysisStackSegment[];
};

export type DurationRpePoint = {
  id: string;
  label: string;
  date: string;
  durationMinutes: number;
  rpe: number;
  type: TrainingSessionType;
};

export type MuscleTrendPoint = {
  muscle: MuscleName;
  label: string;
  totalLoad: number;
  points: Array<{ key: string; label: string; value: number }>;
};

export type TrainingConsistencyDay = {
  date: string;
  label: string;
  sessions: number;
  durationMinutes: number;
  fatigueCost: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type AnalysisSummaryData = {
  sessions: number;
  durationMinutes: number;
  fatigueCost: number;
  averageRpe: number | null;
  totalRunMeters: number;
  structuredRunMeters: number;
  mixedRunMeters: number;
  highRpeSessions: number;
  missingRpeSessions: number;
  missingDurationSessions: number;
};

const disciplineSegments: Array<{ key: AnalysisStackSegmentKey; label: string; tone: NonNullable<AnalysisStackSegment["tone"]> }> = [
  { key: "running", label: "Running", tone: "accent" },
  { key: "hyrox", label: "HYROX", tone: "warning" },
  { key: "crossfit", label: "CrossFit", tone: "secondary" },
  { key: "strength", label: "Fuerza/Haltero", tone: "neutral" },
  { key: "gymnastics", label: "Gimnásticos", tone: "secondary" },
  { key: "mobility", label: "Movilidad", tone: "accent" },
  { key: "functional", label: "Actividad funcional", tone: "neutral" },
  { key: "mixed", label: "Mixed", tone: "warning" },
];

const intensitySegments: Array<{ key: AnalysisStackSegmentKey; label: string; tone: NonNullable<AnalysisStackSegment["tone"]> }> = [
  { key: "low", label: "Bajo RPE <= 5", tone: "accent" },
  { key: "moderate", label: "Moderado RPE 6-7", tone: "secondary" },
  { key: "high", label: "Alto RPE >= 8", tone: "warning" },
  { key: "missing", label: "Sin RPE", tone: "neutral" },
];

const qualitySegments: Array<{ key: AnalysisStackSegmentKey; label: string; tone: NonNullable<AnalysisStackSegment["tone"]> }> = [
  { key: "complete", label: "Completas", tone: "accent" },
  { key: "partial", label: "Partial", tone: "warning" },
  { key: "withoutRpe", label: "Sin RPE", tone: "neutral" },
  { key: "withoutDuration", label: "Sin duración", tone: "danger" },
  { key: "withoutResult", label: "Sin resultado", tone: "secondary" },
  { key: "runningWithoutShoes", label: "Running sin zapatillas", tone: "warning" },
];

const trackedMuscles: MuscleName[] = [
  "calves",
  "quadriceps",
  "glutes",
  "hamstrings",
  "shoulders",
  "core",
  "lowerBack",
  "upperBack",
];

function isAnalysableSession(session: TrainingSession) {
  return session.status !== "cancelled" && session.status !== "planned";
}

function getScopedSessions(sessions: TrainingSession[], period: DashboardPeriod | "all") {
  const analysable = sessions.filter(isAnalysableSession);
  return period === "all" ? analysable : filterSessionsByPeriod(analysable, period);
}

function round(value: number, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function getAverageRpe(sessions: TrainingSession[]) {
  const values = sessions.map((session) => session.rpe).filter((value): value is number => typeof value === "number" && value > 0);
  return values.length > 0 ? round(values.reduce((total, value) => total + value, 0) / values.length) : null;
}

function hasResult(session: TrainingSession) {
  if (!session.result || session.result.type === "none") {
    return false;
  }

  return Boolean(session.result.score || session.result.timeSeconds || session.result.capMinutes);
}

function isRunningWithoutShoes(session: TrainingSession) {
  return session.type === "running" && session.sessionMetrics.totalRunMeters > 0 && !session.equipment?.shoes?.trim();
}

function getDisciplineSegmentKey(session: TrainingSession): AnalysisStackSegmentKey {
  if (session.type === "fuerza" || session.type === "halterofilia") {
    return "strength";
  }

  if (session.type === "gimnasticos") {
    return "gymnastics";
  }

  if (session.type === "movilidad") {
    return "mobility";
  }

  if (session.type === "actividad_funcional") {
    return "functional";
  }

  return session.type;
}

function getIntensitySegmentKey(session: TrainingSession): AnalysisStackSegmentKey {
  if (typeof session.rpe !== "number" || session.rpe <= 0) {
    return "missing";
  }

  if (session.rpe <= 5) {
    return "low";
  }

  if (session.rpe <= 7) {
    return "moderate";
  }

  return "high";
}

function countBySegment(
  sessions: TrainingSession[],
  segments: Array<{ key: AnalysisStackSegmentKey; label: string; tone: NonNullable<AnalysisStackSegment["tone"]> }>,
  getKey: (session: TrainingSession) => AnalysisStackSegmentKey,
) {
  const counts = new Map<AnalysisStackSegmentKey, number>();

  sessions.forEach((session) => {
    const key = getKey(session);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return segments.map((segment) => ({
    ...segment,
    value: counts.get(segment.key) ?? 0,
  }));
}

function getMonthGroups(sessions: TrainingSession[]) {
  return sessions.reduce<Record<string, TrainingSession[]>>((groups, session) => {
    const date = parseDashboardDate(session.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    groups[key] = groups[key] ?? [];
    groups[key].push(session);
    return groups;
  }, {});
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", { month: "short", year: "2-digit" }).format(new Date(year, month - 1, 1));
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDayLabel(date: Date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function buildQualitySegments(sessions: TrainingSession[]) {
  const partial = sessions.filter((session) => session.status === "partial" || session.dataQuality === "partial").length;
  const withoutRpe = sessions.filter((session) => !(typeof session.rpe === "number" && session.rpe > 0)).length;
  const withoutDuration = sessions.filter((session) => !session.durationMinutes).length;
  const withoutResult = sessions.filter((session) => !hasResult(session)).length;
  const runningWithoutShoes = sessions.filter(isRunningWithoutShoes).length;
  const complete = sessions.filter(
    (session) =>
      session.status !== "partial" &&
      session.dataQuality !== "partial" &&
      typeof session.rpe === "number" &&
      session.rpe > 0 &&
      Boolean(session.durationMinutes) &&
      hasResult(session),
  ).length;
  const values: Record<AnalysisStackSegmentKey, number> = {
    complete,
    partial,
    withoutRpe,
    withoutDuration,
    withoutResult,
    runningWithoutShoes,
    running: 0,
    hyrox: 0,
    crossfit: 0,
    strength: 0,
    gymnastics: 0,
    mobility: 0,
    functional: 0,
    mixed: 0,
    low: 0,
    moderate: 0,
    high: 0,
    missing: 0,
  };

  return qualitySegments.map((segment) => ({
    ...segment,
    value: values[segment.key],
  }));
}

export function buildWeeklyTrainingLoadData(sessions: TrainingSession[]): WeeklyChartDataPoint[] {
  return getWeeklyChartData(sessions.filter(isAnalysableSession));
}

export function buildMonthlyTrainingLoadData(sessions: TrainingSession[]): MonthlyChartDataPoint[] {
  return getMonthlyChartData(sessions.filter(isAnalysableSession));
}

export function buildDisciplineDistributionData(sessions: TrainingSession[], grain: "week" | "month" = "week"): AnalysisStackedPoint[] {
  const analysable = sessions.filter(isAnalysableSession);

  if (grain === "month") {
    return Object.entries(getMonthGroups(analysable))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, monthSessions]) => ({
        key: monthKey,
        label: formatMonthLabel(monthKey),
        segments: countBySegment(monthSessions, disciplineSegments, getDisciplineSegmentKey),
      }));
  }

  return getWeekBuckets(analysable).map((bucket) => ({
    key: bucket.weekKey,
    label: bucket.weekLabel,
    metaLabel: bucket.weekMetaLabel,
    isCurrentWeek: bucket.isCurrentWeek,
    segments: countBySegment(bucket.sessions, disciplineSegments, getDisciplineSegmentKey),
  }));
}

export function buildRunningSplitData(sessions: TrainingSession[], grain: "week" | "month" = "week"): AnalysisStackedPoint[] {
  const analysable = sessions.filter(isAnalysableSession);

  if (grain === "month") {
    return Object.entries(getMonthGroups(analysable))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, monthSessions]) => {
        const running = getRunningBreakdown(monthSessions);
        return {
          key: monthKey,
          label: formatMonthLabel(monthKey),
          segments: [
            { key: "running", label: "Running estructurado", value: running.structuredMeters / 1000, tone: "accent" },
            { key: "mixed", label: "Carrera mixta", value: running.mixedMeters / 1000, tone: "warning" },
          ],
        };
      });
  }

  return getWeekBuckets(analysable).map((bucket) => ({
    key: bucket.weekKey,
    label: bucket.weekLabel,
    metaLabel: bucket.weekMetaLabel,
    isCurrentWeek: bucket.isCurrentWeek,
    segments: [
      { key: "running", label: "Running estructurado", value: bucket.structuredRunMeters / 1000, tone: "accent" },
      { key: "mixed", label: "Carrera mixta", value: bucket.mixedRunMeters / 1000, tone: "warning" },
    ],
  }));
}

export function buildIntensityDistributionData(sessions: TrainingSession[], grain: "week" | "month" = "week"): AnalysisStackedPoint[] {
  const analysable = sessions.filter(isAnalysableSession);

  if (grain === "month") {
    return Object.entries(getMonthGroups(analysable))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, monthSessions]) => ({
        key: monthKey,
        label: formatMonthLabel(monthKey),
        segments: countBySegment(monthSessions, intensitySegments, getIntensitySegmentKey),
      }));
  }

  return getWeekBuckets(analysable).map((bucket) => ({
    key: bucket.weekKey,
    label: bucket.weekLabel,
    metaLabel: bucket.weekMetaLabel,
    isCurrentWeek: bucket.isCurrentWeek,
    segments: countBySegment(bucket.sessions, intensitySegments, getIntensitySegmentKey),
  }));
}

export function buildDurationRpeScatterData(sessions: TrainingSession[], period: DashboardPeriod | "all" = "all"): DurationRpePoint[] {
  return getScopedSessions(sessions, period)
    .filter((session) => typeof session.durationMinutes === "number" && session.durationMinutes > 0 && typeof session.rpe === "number" && session.rpe > 0)
    .map((session) => ({
      id: session.id,
      label: session.title,
      date: session.date,
      durationMinutes: session.durationMinutes ?? 0,
      rpe: session.rpe ?? 0,
      type: session.type,
    }));
}

export function buildMuscleRankingData(sessions: TrainingSession[], period: DashboardPeriod | "all" = "all") {
  const totals = new Map<MuscleName, number>();

  getScopedSessions(sessions, period).forEach((session) => {
    Object.entries(session.sessionMuscleSummary).forEach(([muscle, load]) => {
      totals.set(muscle as MuscleName, (totals.get(muscle as MuscleName) ?? 0) + load);
    });
  });

  const maxLoad = Math.max(...Array.from(totals.values()), 1);

  return Array.from(totals.entries())
    .filter(([, load]) => load > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([muscle, load]) => ({
      muscle,
      label: formatMuscleName(muscle),
      load,
      percentage: Math.round((load / maxLoad) * 100),
    }));
}

export function buildMuscleTrendData(sessions: TrainingSession[], muscles: MuscleName[] = trackedMuscles): MuscleTrendPoint[] {
  const buckets = getWeekBuckets(sessions.filter(isAnalysableSession)).slice(-8);

  return muscles.map((muscle) => {
    const points = buckets.map((bucket) => ({
      key: bucket.weekKey,
      label: bucket.weekLabel,
      metaLabel: bucket.weekMetaLabel,
      isCurrentWeek: bucket.isCurrentWeek,
      value: bucket.sessions.reduce((total, session) => total + (session.sessionMuscleSummary[muscle] ?? 0), 0),
    }));

    return {
      muscle,
      label: formatMuscleName(muscle),
      totalLoad: points.reduce((total, point) => total + point.value, 0),
      points,
    };
  }).filter((item) => item.totalLoad > 0);
}

export function buildTrainingConsistencyData(sessions: TrainingSession[], days = 84): TrainingConsistencyDay[] {
  const analysable = sessions.filter(isAnalysableSession);
  const latestDate = analysable.length > 0
    ? analysable.map((session) => parseDashboardDate(session.date)).sort((a, b) => b.getTime() - a.getTime())[0]
    : parseDashboardDate(new Date());
  const startDate = addDays(latestDate, -(days - 1));
  const sessionsByDate = analysable.reduce<Record<string, TrainingSession[]>>((groups, session) => {
    groups[session.date] = groups[session.date] ?? [];
    groups[session.date].push(session);
    return groups;
  }, {});

  return Array.from({ length: days }).map((_, index) => {
    const date = addDays(startDate, index);
    const key = getDateKey(date);
    const daySessions = sessionsByDate[key] ?? [];
    const durationMinutes = daySessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0);
    const fatigueCost = daySessions.reduce((total, session) => total + session.sessionMetrics.fatigueCost, 0);
    const level = daySessions.length === 0 ? 0 : fatigueCost >= 180 ? 4 : fatigueCost >= 100 ? 3 : durationMinutes >= 60 ? 2 : 1;

    return {
      date: key,
      label: getDayLabel(date),
      sessions: daySessions.length,
      durationMinutes,
      fatigueCost,
      level,
    };
  });
}

export function buildDataQualityTimelineData(sessions: TrainingSession[], grain: "week" | "month" = "week"): AnalysisStackedPoint[] {
  const analysable = sessions.filter(isAnalysableSession);

  if (grain === "month") {
    return Object.entries(getMonthGroups(analysable))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, monthSessions]) => ({
        key: monthKey,
        label: formatMonthLabel(monthKey),
        segments: buildQualitySegments(monthSessions),
      }));
  }

  return getWeekBuckets(analysable).map((bucket) => ({
    key: bucket.weekKey,
    label: bucket.weekLabel,
    metaLabel: bucket.weekMetaLabel,
    isCurrentWeek: bucket.isCurrentWeek,
    segments: buildQualitySegments(bucket.sessions),
  }));
}

export function buildAnalysisSummaryData(sessions: TrainingSession[], period: DashboardPeriod | "all" = "week"): AnalysisSummaryData {
  const scopedSessions = getScopedSessions(sessions, period);
  const running = getRunningBreakdown(scopedSessions);

  return {
    sessions: scopedSessions.length,
    durationMinutes: scopedSessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0),
    fatigueCost: scopedSessions.reduce((total, session) => total + session.sessionMetrics.fatigueCost, 0),
    averageRpe: getAverageRpe(scopedSessions),
    totalRunMeters: running.totalRunExposureMeters,
    structuredRunMeters: running.structuredMeters,
    mixedRunMeters: running.mixedMeters,
    highRpeSessions: scopedSessions.filter((session) => (session.rpe ?? 0) >= 8).length,
    missingRpeSessions: scopedSessions.filter((session) => !(typeof session.rpe === "number" && session.rpe > 0)).length,
    missingDurationSessions: scopedSessions.filter((session) => !session.durationMinutes).length,
  };
}
