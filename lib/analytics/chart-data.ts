import { getWeekBuckets } from "@/lib/analytics/trends";
import { filterSessionsByPeriod, parseDashboardDate, type DashboardPeriod } from "@/lib/domain/dashboard/periods";
import { calculateMuscleSummary, getTopMuscles } from "@/lib/domain/training/muscle-load";
import { getRunningBreakdown } from "@/lib/domain/training/run-exposure";
import { isSecondaryActivity } from "@/lib/domain/training/secondary-activity";
import { formatMuscleName, formatTrainingType } from "@/lib/utils/format";
import type { MuscleName, PendingField, TrainingSession, TrainingSessionType } from "@/types/training";

export type WeeklyChartDataPoint = {
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  label: string;
  metaLabel: string;
  isCurrentWeek: boolean;
  sessions: number;
  durationMinutes: number;
  totalRunMeters: number;
  structuredRunMeters: number;
  mixedRunMeters: number;
  fatigueCost: number;
  impactScore: number;
  totalExternalLoadKg: number;
  averageRpe: number | null;
  cardioLoad: number;
  strengthLoad: number;
  technicalLoad: number;
};

export type MonthlyChartDataPoint = {
  monthKey: string;
  label: string;
  sessions: number;
  durationMinutes: number;
  totalRunMeters: number;
  structuredRunMeters: number;
  mixedRunMeters: number;
  fatigueCost: number;
  impactScore: number;
  totalExternalLoadKg: number;
  averageRpe: number | null;
};

export type DisciplineDistributionItem = {
  label: string;
  count: number;
  durationMinutes: number;
  fatigueCost: number;
  percentage: number;
};

export type RunExposureChartPoint = {
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  label: string;
  metaLabel: string;
  isCurrentWeek: boolean;
  structuredRunMeters: number;
  mixedRunMeters: number;
  totalRunMeters: number;
};

export type MuscleRankingChartItem = {
  muscle: MuscleName;
  label: string;
  load: number;
  percentage: number;
};

export type DataQualityChartData = {
  total: number;
  withRpe: number;
  withoutRpe: number;
  withDuration: number;
  withoutDuration: number;
  withResult: number;
  withoutResult: number;
  partial: number;
  complete: number;
  runningWithoutShoes: number;
  pendingFields: Array<{ field: PendingField | string; count: number }>;
};

type DisciplineKey = TrainingSessionType | "secondary_activity";

const monthFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "short",
  year: "2-digit",
});

function round(value: number, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function getAverageRpe(sessions: TrainingSession[]) {
  const values = sessions
    .map((session) => session.rpe)
    .filter((value): value is number => typeof value === "number" && value > 0);

  if (values.length === 0) {
    return null;
  }

  return round(values.reduce((total, value) => total + value, 0) / values.length);
}

function getMonthKey(date: string | Date) {
  const parsed = parseDashboardDate(date);
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return monthFormatter.format(new Date(year, month - 1, 1));
}

function getDisciplineKey(session: TrainingSession): DisciplineKey {
  return isSecondaryActivity(session) ? "secondary_activity" : session.type;
}

function formatDiscipline(key: DisciplineKey) {
  return key === "secondary_activity" ? "Actividad secundaria" : formatTrainingType(key);
}

function hasResult(session: TrainingSession) {
  if (!session.result || session.result.type === "none") {
    return false;
  }

  return Boolean(session.result.score || session.result.timeSeconds || session.result.capMinutes);
}

export function getWeeklyChartData(sessions: TrainingSession[]): WeeklyChartDataPoint[] {
  return getWeekBuckets(sessions).map((bucket) => ({
    weekKey: bucket.weekKey,
    weekStart: bucket.startDate,
    weekEnd: bucket.endDate,
    label: bucket.weekLabel,
    metaLabel: bucket.weekMetaLabel,
    isCurrentWeek: bucket.isCurrentWeek,
    sessions: bucket.sessionsCount,
    durationMinutes: bucket.durationMinutes,
    totalRunMeters: bucket.totalRunExposureMeters,
    structuredRunMeters: bucket.structuredRunMeters,
    mixedRunMeters: bucket.mixedRunMeters,
    fatigueCost: bucket.fatigueCost,
    impactScore: bucket.impactScore,
    totalExternalLoadKg: bucket.totalExternalLoadKg,
    averageRpe: bucket.averageRpe,
    cardioLoad: bucket.cardioLoad,
    strengthLoad: bucket.strengthLoad,
    technicalLoad: bucket.technicalLoad,
  }));
}

export function getMonthlyChartData(sessions: TrainingSession[]): MonthlyChartDataPoint[] {
  const months = sessions.reduce<Record<string, TrainingSession[]>>((groups, session) => {
    const key = getMonthKey(session.date);
    groups[key] = groups[key] ?? [];
    groups[key].push(session);
    return groups;
  }, {});

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, monthSessions]) => {
      const running = getRunningBreakdown(monthSessions);

      return {
        monthKey,
        label: getMonthLabel(monthKey),
        sessions: monthSessions.length,
        durationMinutes: monthSessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0),
        totalRunMeters: running.totalRunExposureMeters,
        structuredRunMeters: running.structuredMeters,
        mixedRunMeters: running.mixedMeters,
        fatigueCost: monthSessions.reduce((total, session) => total + session.sessionMetrics.fatigueCost, 0),
        impactScore: monthSessions.reduce((total, session) => total + session.sessionMetrics.impactScore, 0),
        totalExternalLoadKg: monthSessions.reduce((total, session) => total + (session.sessionMetrics.totalExternalLoadKg ?? 0), 0),
        averageRpe: getAverageRpe(monthSessions),
      };
    });
}

export function getDisciplineDistributionData(
  sessions: TrainingSession[],
  period: DashboardPeriod | "all" = "all",
): DisciplineDistributionItem[] {
  const scopedSessions = period === "all" ? sessions : filterSessionsByPeriod(sessions, period);
  const totals = scopedSessions.reduce<Record<string, DisciplineDistributionItem>>((groups, session) => {
    const key = getDisciplineKey(session);
    const label = formatDiscipline(key);

    groups[label] = groups[label] ?? {
      label,
      count: 0,
      durationMinutes: 0,
      fatigueCost: 0,
      percentage: 0,
    };
    groups[label].count += 1;
    groups[label].durationMinutes += session.durationMinutes ?? 0;
    groups[label].fatigueCost += session.sessionMetrics.fatigueCost;
    return groups;
  }, {});

  return Object.values(totals)
    .map((item) => ({
      ...item,
      percentage: scopedSessions.length > 0 ? Math.round((item.count / scopedSessions.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function getRunExposureChartData(sessions: TrainingSession[]): RunExposureChartPoint[] {
  return getWeeklyChartData(sessions).map((week) => ({
    weekKey: week.weekKey,
    weekStart: week.weekStart,
    weekEnd: week.weekEnd,
    label: week.label,
    metaLabel: week.metaLabel,
    isCurrentWeek: week.isCurrentWeek,
    structuredRunMeters: week.structuredRunMeters,
    mixedRunMeters: week.mixedRunMeters,
    totalRunMeters: week.totalRunMeters,
  }));
}

export function getMuscleRankingChartData(
  sessions: TrainingSession[],
  period: DashboardPeriod | "all" = "all",
  limit = 8,
): MuscleRankingChartItem[] {
  const scopedSessions = period === "all" ? sessions : filterSessionsByPeriod(sessions, period);
  const ranking = getTopMuscles(calculateMuscleSummary(scopedSessions), limit);
  const maxLoad = Math.max(...ranking.map((item) => item.load), 1);

  return ranking.map((item) => ({
    muscle: item.muscle,
    label: formatMuscleName(item.muscle),
    load: item.load,
    percentage: Math.round((item.load / maxLoad) * 100),
  }));
}

export function getDataQualityChartData(sessions: TrainingSession[]): DataQualityChartData {
  const pendingFieldCounts = new Map<string, number>();

  sessions.forEach((session) => {
    session.pendingFields.forEach((field) => {
      pendingFieldCounts.set(field, (pendingFieldCounts.get(field) ?? 0) + 1);
    });
  });

  const withRpe = sessions.filter((session) => typeof session.rpe === "number" && session.rpe > 0).length;
  const withDuration = sessions.filter((session) => typeof session.durationMinutes === "number" && session.durationMinutes > 0).length;
  const withResult = sessions.filter(hasResult).length;
  const partial = sessions.filter((session) => session.status === "partial" || session.dataQuality === "partial").length;

  return {
    total: sessions.length,
    withRpe,
    withoutRpe: sessions.length - withRpe,
    withDuration,
    withoutDuration: sessions.length - withDuration,
    withResult,
    withoutResult: sessions.length - withResult,
    partial,
    complete: Math.max(0, sessions.length - partial),
    runningWithoutShoes: sessions.filter((session) => session.type === "running" && session.sessionMetrics.totalRunMeters > 0 && !session.equipment?.shoes?.trim()).length,
    pendingFields: Array.from(pendingFieldCounts.entries())
      .map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count || a.field.localeCompare(b.field))
      .slice(0, 8),
  };
}
