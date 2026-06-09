import {
  getPeriodProgress,
  parseDashboardDate,
  startOfWeek,
  addDays,
} from "@/lib/domain/dashboard/periods";
import { getSessionRunMeters } from "@/lib/domain/training/run-exposure";
import { isPureRunningSession } from "@/lib/domain/training/session-kind";
import { getWeekKey } from "@/lib/selectors/training";
import type { TrainingSession, TrainingSessionType } from "@/types/training";

export type TrendStatus =
  | "subiendo"
  | "estable"
  | "bajando"
  | "estancado"
  | "subida_brusca"
  | "referencia_insuficiente";

export type WeeklyTrendMetricKey =
  | "totalRunMeters"
  | "structuredRunMeters"
  | "mixedRunMeters"
  | "durationMinutes"
  | "fatigueCost"
  | "totalExternalLoadKg"
  | "impactScore"
  | "averageRpe"
  | "cardioLoad"
  | "strengthLoad"
  | "technicalLoad";

export type WeeklyTrendBucket = {
  weekKey: string;
  startDate: string;
  endDate: string;
  sessions: TrainingSession[];
  sessionsCount: number;
  durationMinutes: number;
  structuredRunMeters: number;
  mixedRunMeters: number;
  totalRunMeters: number;
  cardioLoad: number;
  fatigueCost: number;
  impactScore: number;
  strengthLoad: number;
  technicalLoad: number;
  totalExternalLoadKg: number;
  totalBarbellReps: number;
  totalDumbbellReps: number;
  totalKettlebellReps: number;
  hardSetsEstimate: number;
  averageRpe: number | null;
  disciplineCounts: Partial<Record<TrainingSessionType, number>>;
};

export type TrendWeeklyValue = {
  weekKey: string;
  value: number;
};

export type TrendMetric = {
  key: WeeklyTrendMetricKey;
  label: string;
  currentValue: number;
  recentAverage: number | null;
  previousAverage: number | null;
  changePercent: number | null;
  status: TrendStatus;
  message: string;
  weeklyValues: TrendWeeklyValue[];
};

export type RunExposureTrend = {
  total: TrendMetric;
  structured: TrendMetric;
  mixed: TrendMetric;
};

export type DisciplineTrend = {
  current: Partial<Record<TrainingSessionType, number>>;
  recentAverage: Partial<Record<TrainingSessionType, number>>;
  previousAverage: Partial<Record<TrainingSessionType, number>>;
};

export type WeeklyTrendMetrics = {
  buckets: WeeklyTrendBucket[];
  currentWeek: WeeklyTrendBucket | null;
  runExposure: RunExposureTrend;
  duration: TrendMetric;
  load: TrendMetric;
  externalLoad: TrendMetric;
  impact: TrendMetric;
  averageRpe: TrendMetric;
  cardioLoad: TrendMetric;
  strengthLoad: TrendMetric;
  technicalLoad: TrendMetric;
  disciplineTrend: DisciplineTrend;
  keyTrends: TrendMetric[];
};

const abruptIncreaseKeys = new Set<WeeklyTrendMetricKey>([
  "totalRunMeters",
  "structuredRunMeters",
  "mixedRunMeters",
  "fatigueCost",
  "impactScore",
  "cardioLoad",
  "strengthLoad",
  "technicalLoad",
]);

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function roundValue(value: number, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function getAverage(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getMetricValue(bucket: WeeklyTrendBucket, key: WeeklyTrendMetricKey) {
  return bucket[key] ?? 0;
}

function getSessionDateTime(session: TrainingSession) {
  return parseDashboardDate(session.date).getTime();
}

function getTrendReferenceDate() {
  return parseDashboardDate(new Date());
}

function makeEmptyBucket(start: Date): WeeklyTrendBucket {
  const end = addDays(start, 6);

  return {
    weekKey: getWeekKey(formatDateKey(start)),
    startDate: formatDateKey(start),
    endDate: formatDateKey(end),
    sessions: [],
    sessionsCount: 0,
    durationMinutes: 0,
    structuredRunMeters: 0,
    mixedRunMeters: 0,
    totalRunMeters: 0,
    cardioLoad: 0,
    fatigueCost: 0,
    impactScore: 0,
    strengthLoad: 0,
    technicalLoad: 0,
    totalExternalLoadKg: 0,
    totalBarbellReps: 0,
    totalDumbbellReps: 0,
    totalKettlebellReps: 0,
    hardSetsEstimate: 0,
    averageRpe: null,
    disciplineCounts: {},
  };
}

function aggregateBucket(bucket: WeeklyTrendBucket, sessions: TrainingSession[]): WeeklyTrendBucket {
  const rpeValues = sessions
    .map((session) => session.rpe)
    .filter((value): value is number => typeof value === "number" && value > 0);

  return sessions.reduce(
    (result, session) => {
      const runMeters = getSessionRunMeters(session);

      result.sessionsCount += 1;
      result.durationMinutes += session.durationMinutes ?? 0;
      result.structuredRunMeters += isPureRunningSession(session) ? runMeters : 0;
      result.mixedRunMeters += isPureRunningSession(session) ? 0 : runMeters;
      result.totalRunMeters = result.structuredRunMeters + result.mixedRunMeters;
      result.cardioLoad += session.sessionMetrics.cardioLoad;
      result.fatigueCost += session.sessionMetrics.fatigueCost;
      result.impactScore += session.sessionMetrics.impactScore;
      result.strengthLoad += session.sessionMetrics.strengthLoad;
      result.technicalLoad += session.sessionMetrics.technicalLoad;
      result.totalExternalLoadKg += session.sessionMetrics.totalExternalLoadKg ?? 0;
      result.totalBarbellReps += session.sessionMetrics.totalBarbellReps;
      result.totalDumbbellReps += session.sessionMetrics.totalDumbbellReps;
      result.totalKettlebellReps += session.sessionMetrics.totalKettlebellReps;
      result.hardSetsEstimate += session.sessionMetrics.hardSetsEstimate ?? 0;
      result.disciplineCounts[session.type] = (result.disciplineCounts[session.type] ?? 0) + 1;

      return result;
    },
    {
      ...bucket,
      sessions,
      averageRpe: rpeValues.length > 0 ? roundValue(rpeValues.reduce((total, value) => total + value, 0) / rpeValues.length) : null,
    },
  );
}

export function getWeekBuckets(sessions: TrainingSession[]) {
  if (sessions.length === 0) {
    return [];
  }

  const sortedSessions = [...sessions].sort((a, b) => getSessionDateTime(a) - getSessionDateTime(b));
  const referenceDate = getTrendReferenceDate();
  const firstWeekStart = startOfWeek(parseDashboardDate(sortedSessions[0].date));
  const lastWeekStart = startOfWeek(referenceDate);
  const buckets: WeeklyTrendBucket[] = [];

  for (let cursor = firstWeekStart; cursor.getTime() <= lastWeekStart.getTime(); cursor = addDays(cursor, 7)) {
    const bucket = makeEmptyBucket(cursor);
    const startTime = parseDashboardDate(bucket.startDate).getTime();
    const endTime = parseDashboardDate(bucket.endDate).getTime();
    const weekSessions = sortedSessions.filter((session) => {
      const time = getSessionDateTime(session);
      return time >= startTime && time <= endTime;
    });

    buckets.push(aggregateBucket(bucket, weekSessions));
  }

  return buckets;
}

export function getTrendStatus(
  current: number,
  recentAverage: number | null,
  previousAverage: number | null,
  options: { metricKey?: WeeklyTrendMetricKey; dataWeeks?: number } = {},
): TrendStatus {
  if ((options.dataWeeks ?? 0) < 3 || recentAverage === null || previousAverage === null || recentAverage <= 0) {
    return "referencia_insuficiente";
  }

  const changePercent = ((current - recentAverage) / recentAverage) * 100;
  const baselineChange = previousAverage > 0 ? Math.abs(((recentAverage - previousAverage) / previousAverage) * 100) : null;

  if (changePercent > 25 && options.metricKey && abruptIncreaseKeys.has(options.metricKey)) {
    return "subida_brusca";
  }

  if (changePercent < -20) {
    return "bajando";
  }

  if (baselineChange !== null && baselineChange <= 5 && Math.abs(changePercent) <= 5) {
    return "estancado";
  }

  if (changePercent >= -10 && changePercent <= 10) {
    return "estable";
  }

  if (changePercent > 10) {
    return "subiendo";
  }

  return "bajando";
}

function getStatusMessage(status: TrendStatus, label: string) {
  const messages: Record<TrendStatus, string> = {
    subiendo: `${label} por encima de la media reciente.`,
    estable: `${label} estable frente a las últimas semanas.`,
    bajando: `${label} por debajo de la media reciente.`,
    estancado: `${label} sin tendencia clara.`,
    subida_brusca: `${label} con subida brusca. Vigilar acumulación.`,
    referencia_insuficiente: "Histórico insuficiente para tendencia.",
  };

  return messages[status];
}

function buildTrendMetric({
  buckets,
  key,
  label,
  currentProgress,
  averageNullWhenNoRpe = false,
}: {
  buckets: WeeklyTrendBucket[];
  key: WeeklyTrendMetricKey;
  label: string;
  currentProgress: number;
  averageNullWhenNoRpe?: boolean;
}): TrendMetric {
  const currentBucket = buckets[buckets.length - 1] ?? null;
  const completedBuckets = buckets.slice(0, -1);
  const recentBuckets = completedBuckets.slice(-4);
  const previousBuckets = completedBuckets.slice(-8, -4);
  const dataWeeks = buckets.filter((bucket) => bucket.sessionsCount > 0).length;
  const currentRawValue = currentBucket ? getMetricValue(currentBucket, key) : 0;
  const currentValue = averageNullWhenNoRpe && currentBucket?.averageRpe === null ? 0 : currentRawValue;
  const recentValues = recentBuckets
    .map((bucket) => getMetricValue(bucket, key))
    .filter((value) => !averageNullWhenNoRpe || value > 0);
  const previousValues = previousBuckets
    .map((bucket) => getMetricValue(bucket, key))
    .filter((value) => !averageNullWhenNoRpe || value > 0);
  const recentFullAverage = getAverage(recentValues);
  const previousAverage = getAverage(previousValues);
  const recentAverage = recentFullAverage === null ? null : recentFullAverage * currentProgress;
  const changePercent = recentAverage && recentAverage > 0
    ? roundValue(((currentValue - recentAverage) / recentAverage) * 100)
    : null;
  const status = getTrendStatus(currentValue, recentAverage, previousAverage, { metricKey: key, dataWeeks });

  return {
    key,
    label,
    currentValue: roundValue(currentValue),
    recentAverage: recentAverage === null ? null : roundValue(recentAverage),
    previousAverage: previousAverage === null ? null : roundValue(previousAverage),
    changePercent,
    status,
    message: getStatusMessage(status, label),
    weeklyValues: buckets.slice(-8).map((bucket) => ({
      weekKey: bucket.weekKey,
      value: roundValue(getMetricValue(bucket, key)),
    })),
  };
}

export function getRunExposureTrend(sessions: TrainingSession[]): RunExposureTrend {
  const buckets = getWeekBuckets(sessions);
  const referenceDate = getTrendReferenceDate();
  const currentProgress = getPeriodProgress("week", referenceDate);

  return {
    total: buildTrendMetric({ buckets, key: "totalRunMeters", label: "Carrera total", currentProgress }),
    structured: buildTrendMetric({ buckets, key: "structuredRunMeters", label: "Running estructurado", currentProgress }),
    mixed: buildTrendMetric({ buckets, key: "mixedRunMeters", label: "Carrera mixta", currentProgress }),
  };
}

export function getLoadTrend(sessions: TrainingSession[]) {
  const buckets = getWeekBuckets(sessions);
  const referenceDate = getTrendReferenceDate();
  const currentProgress = getPeriodProgress("week", referenceDate);

  return buildTrendMetric({ buckets, key: "fatigueCost", label: "Carga/fatiga", currentProgress });
}

export function getExternalLoadTrend(sessions: TrainingSession[]) {
  const buckets = getWeekBuckets(sessions);
  const referenceDate = getTrendReferenceDate();
  const currentProgress = getPeriodProgress("week", referenceDate);

  return buildTrendMetric({ buckets, key: "totalExternalLoadKg", label: "Peso movido", currentProgress });
}

function getDisciplineAverages(buckets: WeeklyTrendBucket[]) {
  const totals: Partial<Record<TrainingSessionType, number>> = {};

  buckets.forEach((bucket) => {
    Object.entries(bucket.disciplineCounts).forEach(([type, count]) => {
      const sessionType = type as TrainingSessionType;
      totals[sessionType] = (totals[sessionType] ?? 0) + (count ?? 0);
    });
  });

  return Object.fromEntries(
    Object.entries(totals).map(([type, total]) => [type, roundValue((total ?? 0) / Math.max(1, buckets.length))]),
  ) as Partial<Record<TrainingSessionType, number>>;
}

export function getDisciplineTrend(sessions: TrainingSession[]): DisciplineTrend {
  const buckets = getWeekBuckets(sessions);
  const current = buckets[buckets.length - 1]?.disciplineCounts ?? {};
  const completedBuckets = buckets.slice(0, -1);

  return {
    current,
    recentAverage: getDisciplineAverages(completedBuckets.slice(-4)),
    previousAverage: getDisciplineAverages(completedBuckets.slice(-8, -4)),
  };
}

export function getWeeklyTrendMetrics(sessions: TrainingSession[]): WeeklyTrendMetrics {
  const buckets = getWeekBuckets(sessions);
  const referenceDate = getTrendReferenceDate();
  const currentProgress = getPeriodProgress("week", referenceDate);
  const runExposure: RunExposureTrend = {
    total: buildTrendMetric({ buckets, key: "totalRunMeters", label: "Carrera total", currentProgress }),
    structured: buildTrendMetric({ buckets, key: "structuredRunMeters", label: "Running estructurado", currentProgress }),
    mixed: buildTrendMetric({ buckets, key: "mixedRunMeters", label: "Carrera mixta", currentProgress }),
  };
  const duration = buildTrendMetric({ buckets, key: "durationMinutes", label: "Duración", currentProgress });
  const load = buildTrendMetric({ buckets, key: "fatigueCost", label: "Carga/fatiga", currentProgress });
  const externalLoad = buildTrendMetric({ buckets, key: "totalExternalLoadKg", label: "Peso movido", currentProgress });
  const impact = buildTrendMetric({ buckets, key: "impactScore", label: "Impacto", currentProgress });
  const averageRpe = buildTrendMetric({
    buckets,
    key: "averageRpe",
    label: "RPE medio",
    currentProgress: 1,
    averageNullWhenNoRpe: true,
  });
  const cardioLoad = buildTrendMetric({ buckets, key: "cardioLoad", label: "Carga cardio", currentProgress });
  const strengthLoad = buildTrendMetric({ buckets, key: "strengthLoad", label: "Carga fuerza", currentProgress });
  const technicalLoad = buildTrendMetric({ buckets, key: "technicalLoad", label: "Carga técnica", currentProgress });

  return {
    buckets,
    currentWeek: buckets[buckets.length - 1] ?? null,
    runExposure,
    duration,
    load,
    externalLoad,
    impact,
    averageRpe,
    cardioLoad,
    strengthLoad,
    technicalLoad,
    disciplineTrend: getDisciplineTrend(sessions),
    keyTrends: [runExposure.total, duration, load, externalLoad, impact, averageRpe],
  };
}
