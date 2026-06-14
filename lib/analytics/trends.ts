import {
  addDays,
  getPeriodProgress,
  parseDashboardDate,
  startOfWeek,
} from "@/lib/domain/dashboard/periods";
import { getSessionRunMeters } from "@/lib/domain/training/run-exposure";
import { isPureRunningSession } from "@/lib/domain/training/session-kind";
import { getWeekKey as getIsoWeekKey, muscleNames } from "@/lib/selectors/training";
import type { MuscleName, TrainingSession, TrainingSessionType } from "@/types/training";

export type TrendStatus =
  | "subiendo"
  | "estable"
  | "bajando"
  | "estancado"
  | "subida_brusca"
  | "descarga"
  | "referencia_insuficiente";

export type TrendMetricType = "volume" | "run" | "fatigue" | "impact" | "externalLoad" | "rpe";

export type WeeklyTrendMetricKey =
  | "totalRunExposureMeters"
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
  | "technicalLoad"
  | "totalMuscleLoad";

export type WeeklyTrendBucket = {
  weekKey: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  sessions: TrainingSession[];
  sessionsCount: number;
  completedSessionsCount: number;
  partialSessionsCount: number;
  durationMinutes: number;
  structuredRunMeters: number;
  mixedRunMeters: number;
  totalRunExposureMeters: number;
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
  highRpeSessionsCount: number;
  sessionsRpe8Plus: number;
  disciplineCounts: Partial<Record<TrainingSessionType | "secondary_activity", number>>;
  hyroxSessions: number;
  crossfitSessions: number;
  runningSessions: number;
  halteroSessions: number;
  fuerzaSessions: number;
  gymnasticSessions: number;
  secondaryActivitySessions: number;
  totalMuscleLoad: number;
  topMusclesOfWeek: Array<{ muscle: MuscleName; loadScore: number }>;
  lowerBodyLoad: number;
  upperBodyLoad: number;
  pushLoad: number;
  pullLoad: number;
  anteriorLoad: number;
  posteriorLoad: number;
};

export type TrendWeeklyValue = {
  weekKey: string;
  label: string;
  value: number;
};

export type TrendMetric = {
  id: string;
  key: WeeklyTrendMetricKey;
  label: string;
  unit: string;
  currentValue: number;
  currentWeekValue: number;
  recentAverage: number | null;
  previousAverage: number | null;
  changePercent: number | null;
  status: TrendStatus;
  message: string;
  detail?: string;
  weeklyValues: TrendWeeklyValue[];
  weeklySeries: TrendWeeklyValue[];
};

export type RunExposureTrend = {
  total: TrendMetric;
  structured: TrendMetric;
  mixed: TrendMetric;
};

export type DisciplineTrend = {
  current: Partial<Record<TrainingSessionType | "secondary_activity", number>>;
  recentAverage: Partial<Record<TrainingSessionType | "secondary_activity", number>>;
  previousAverage: Partial<Record<TrainingSessionType | "secondary_activity", number>>;
};

export type TrendWindow = {
  currentWeek: WeeklyTrendBucket | null;
  recentWindow: WeeklyTrendBucket[];
  previousWindow: WeeklyTrendBucket[];
  currentProgress: number;
};

export type WeeklyTrendMetrics = {
  buckets: WeeklyTrendBucket[];
  currentWeek: WeeklyTrendBucket | null;
  trendWindow: TrendWindow;
  runExposure: RunExposureTrend;
  duration: TrendMetric;
  load: TrendMetric;
  externalLoad: TrendMetric;
  impact: TrendMetric;
  averageRpe: TrendMetric;
  cardioLoad: TrendMetric;
  strengthLoad: TrendMetric;
  technicalLoad: TrendMetric;
  muscleLoad: TrendMetric;
  disciplineTrend: DisciplineTrend;
  keyTrends: TrendMetric[];
};

const lowerBodyMuscles: MuscleName[] = ["quadriceps", "hamstrings", "glutes", "calves", "hipFlexors", "adductors", "lowerBack"];
const upperBodyMuscles: MuscleName[] = ["lats", "upperBack", "traps", "shoulders", "chest", "triceps", "biceps", "forearms"];
const pushMuscles: MuscleName[] = ["chest", "shoulders", "triceps", "quadriceps", "glutes"];
const pullMuscles: MuscleName[] = ["lats", "upperBack", "biceps", "forearms", "traps", "hamstrings"];
const anteriorMuscles: MuscleName[] = ["quadriceps", "hipFlexors", "core", "chest", "shoulders", "triceps"];
const posteriorMuscles: MuscleName[] = ["hamstrings", "glutes", "calves", "lats", "upperBack", "lowerBack", "traps"];

const secondaryActivityTags = new Set(["secondary-activity", "padel", "hiking", "walking", "route", "recovery"]);

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

function sumMuscles(session: TrainingSession, muscles: MuscleName[]) {
  return muscles.reduce((total, muscle) => total + (session.sessionMuscleSummary[muscle] ?? 0), 0);
}

function getSessionTotalMuscleLoad(session: TrainingSession) {
  return muscleNames.reduce((total, muscle) => total + (session.sessionMuscleSummary[muscle] ?? 0), 0);
}

function isSecondaryActivitySession(session: TrainingSession) {
  return session.type === "actividad_funcional" || session.type === "movilidad" || session.tags.some((tag) => secondaryActivityTags.has(tag));
}

function getDisciplineKey(session: TrainingSession): TrainingSessionType | "secondary_activity" {
  return isSecondaryActivitySession(session) ? "secondary_activity" : session.type;
}

export function getWeekStart(date: string | Date) {
  return startOfWeek(parseDashboardDate(date));
}

export function getWeekEnd(date: string | Date) {
  return addDays(getWeekStart(date), 6);
}

export function getWeekKey(date: string | Date) {
  return getIsoWeekKey(formatDateKey(parseDashboardDate(date)));
}

export function getWeekLabel(date: string | Date) {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);

  return `${start.getDate().toString().padStart(2, "0")}/${(start.getMonth() + 1).toString().padStart(2, "0")} - ${end.getDate().toString().padStart(2, "0")}/${(end.getMonth() + 1).toString().padStart(2, "0")}`;
}

export function getStructuredRunningMeters(session: TrainingSession) {
  return isPureRunningSession(session) ? getSessionRunMeters(session) : 0;
}

export function getMixedRunningMeters(session: TrainingSession) {
  return isPureRunningSession(session) ? 0 : getSessionRunMeters(session);
}

export function getTotalRunExposureMeters(session: TrainingSession) {
  return getStructuredRunningMeters(session) + getMixedRunningMeters(session);
}

function makeEmptyBucket(start: Date): WeeklyTrendBucket {
  const end = addDays(start, 6);

  return {
    weekKey: getWeekKey(start),
    weekLabel: getWeekLabel(start),
    startDate: formatDateKey(start),
    endDate: formatDateKey(end),
    sessions: [],
    sessionsCount: 0,
    completedSessionsCount: 0,
    partialSessionsCount: 0,
    durationMinutes: 0,
    structuredRunMeters: 0,
    mixedRunMeters: 0,
    totalRunExposureMeters: 0,
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
    highRpeSessionsCount: 0,
    sessionsRpe8Plus: 0,
    disciplineCounts: {},
    hyroxSessions: 0,
    crossfitSessions: 0,
    runningSessions: 0,
    halteroSessions: 0,
    fuerzaSessions: 0,
    gymnasticSessions: 0,
    secondaryActivitySessions: 0,
    totalMuscleLoad: 0,
    topMusclesOfWeek: [],
    lowerBodyLoad: 0,
    upperBodyLoad: 0,
    pushLoad: 0,
    pullLoad: 0,
    anteriorLoad: 0,
    posteriorLoad: 0,
  };
}

function aggregateBucket(bucket: WeeklyTrendBucket, sessions: TrainingSession[]): WeeklyTrendBucket {
  const rpeValues = sessions
    .map((session) => session.rpe)
    .filter((value): value is number => typeof value === "number" && value > 0);
  const muscleTotals = Object.fromEntries(muscleNames.map((muscle) => [muscle, 0])) as Record<MuscleName, number>;
  const result = { ...bucket, sessions };

  sessions.forEach((session) => {
    const structuredRunMeters = getStructuredRunningMeters(session);
    const mixedRunMeters = getMixedRunningMeters(session);
    const disciplineKey = getDisciplineKey(session);

    result.sessionsCount += 1;
    result.completedSessionsCount += session.status === "completed" ? 1 : 0;
    result.partialSessionsCount += session.status === "partial" ? 1 : 0;
    result.durationMinutes += session.durationMinutes ?? 0;
    result.structuredRunMeters += structuredRunMeters;
    result.mixedRunMeters += mixedRunMeters;
    result.totalRunExposureMeters = result.structuredRunMeters + result.mixedRunMeters;
    result.totalRunMeters = result.totalRunExposureMeters;
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
    result.highRpeSessionsCount += (session.rpe ?? 0) >= 8 ? 1 : 0;
    result.sessionsRpe8Plus = result.highRpeSessionsCount;
    result.disciplineCounts[disciplineKey] = (result.disciplineCounts[disciplineKey] ?? 0) + 1;
    result.hyroxSessions += session.type === "hyrox" ? 1 : 0;
    result.crossfitSessions += session.type === "crossfit" ? 1 : 0;
    result.runningSessions += session.type === "running" ? 1 : 0;
    result.halteroSessions += session.type === "halterofilia" ? 1 : 0;
    result.fuerzaSessions += session.type === "fuerza" ? 1 : 0;
    result.gymnasticSessions += session.type === "gimnasticos" ? 1 : 0;
    result.secondaryActivitySessions += isSecondaryActivitySession(session) ? 1 : 0;
    result.totalMuscleLoad += getSessionTotalMuscleLoad(session);
    result.lowerBodyLoad += sumMuscles(session, lowerBodyMuscles);
    result.upperBodyLoad += sumMuscles(session, upperBodyMuscles);
    result.pushLoad += sumMuscles(session, pushMuscles);
    result.pullLoad += sumMuscles(session, pullMuscles);
    result.anteriorLoad += sumMuscles(session, anteriorMuscles);
    result.posteriorLoad += sumMuscles(session, posteriorMuscles);

    muscleNames.forEach((muscle) => {
      muscleTotals[muscle] += session.sessionMuscleSummary[muscle] ?? 0;
    });
  });

  result.averageRpe = rpeValues.length > 0 ? roundValue(rpeValues.reduce((total, value) => total + value, 0) / rpeValues.length) : null;
  result.topMusclesOfWeek = muscleNames
    .map((muscle) => ({ muscle, loadScore: muscleTotals[muscle] }))
    .filter((entry) => entry.loadScore > 0)
    .sort((a, b) => b.loadScore - a.loadScore)
    .slice(0, 5);

  return result;
}

export function getWeekBuckets(sessions: TrainingSession[]) {
  if (sessions.length === 0) {
    return [];
  }

  const sortedSessions = [...sessions].sort((a, b) => getSessionDateTime(a) - getSessionDateTime(b));
  const referenceDate = getTrendReferenceDate();
  const firstWeekStart = getWeekStart(sortedSessions[0].date);
  const lastWeekStart = getWeekStart(referenceDate);
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

export function getWeeklyMetrics(sessions: TrainingSession[]) {
  return getWeekBuckets(sessions);
}

export function getTrendWindow(weeklyMetrics: WeeklyTrendBucket[]): TrendWindow {
  const referenceDate = getTrendReferenceDate();
  const currentWeek = weeklyMetrics[weeklyMetrics.length - 1] ?? null;
  const completedWeeks = weeklyMetrics.slice(0, -1);

  return {
    currentWeek,
    recentWindow: completedWeeks.slice(-4),
    previousWindow: completedWeeks.slice(-8, -4),
    currentProgress: getPeriodProgress("week", referenceDate),
  };
}

export function getTrendStatus(
  current: number,
  recentAverage: number | null,
  previousAverage: number | null,
  metricType: TrendMetricType = "volume",
  options: { dataWeeks?: number } = {},
): TrendStatus {
  if ((options.dataWeeks ?? 0) < 3 || recentAverage === null || previousAverage === null || recentAverage <= 0) {
    return "referencia_insuficiente";
  }

  const changePercent = ((current - recentAverage) / recentAverage) * 100;
  const baselineChange = previousAverage > 0 ? Math.abs(((recentAverage - previousAverage) / previousAverage) * 100) : null;
  const abruptThreshold = metricType === "fatigue" || metricType === "impact" ? 35 : 25;

  if (changePercent > abruptThreshold) {
    return "subida_brusca";
  }

  if (changePercent < -25) {
    return "descarga";
  }

  if (changePercent < -10) {
    return "bajando";
  }

  if (baselineChange !== null && baselineChange <= 5 && Math.abs(changePercent) <= 5) {
    return "estancado";
  }

  if (changePercent >= -10 && changePercent <= 10) {
    return "estable";
  }

  return "subiendo";
}

function getStatusMessage(status: TrendStatus, label: string, metricType: TrendMetricType) {
  if (status === "referencia_insuficiente") {
    return "Histórico insuficiente para tendencia.";
  }

  if (status === "subida_brusca") {
    if (metricType === "run") {
      return "Carrera total por encima de referencia. Vigilar impacto antes de sumar intensidad.";
    }

    if (metricType === "impact") {
      return "Impacto por encima de referencia. Revisar gemelos, aductores y molestias.";
    }

    if (metricType === "fatigue") {
      return "Fatiga por encima de referencia. Vigilar recuperación.";
    }

    return `${label} por encima de referencia. Vigilar acumulación.`;
  }

  if (status === "descarga") {
    return "Semana de descarga frente a la media reciente.";
  }

  if (status === "estancado") {
    return `${label} estable frente a las ventanas recientes.`;
  }

  if (status === "subiendo") {
    return metricType === "externalLoad" ? "Volumen externo subiendo respecto a la media reciente." : `${label} subiendo de forma controlada.`;
  }

  if (status === "bajando") {
    return metricType === "externalLoad" ? "Peso movido bajando; puede cuadrar si hubo más HYROX o carrera." : `${label} por debajo de la media reciente.`;
  }

  return `${label} estable frente a la media reciente.`;
}

function getMetricType(key: WeeklyTrendMetricKey): TrendMetricType {
  if (key.includes("Run") && key.includes("Meters")) {
    return "run";
  }

  if (key === "fatigueCost" || key === "cardioLoad" || key === "strengthLoad" || key === "technicalLoad") {
    return "fatigue";
  }

  if (key === "impactScore") {
    return "impact";
  }

  if (key === "totalExternalLoadKg") {
    return "externalLoad";
  }

  if (key === "averageRpe") {
    return "rpe";
  }

  return "volume";
}

function getMetricUnit(key: WeeklyTrendMetricKey) {
  if (key.includes("Run") && key.includes("Meters")) {
    return "m";
  }

  if (key === "durationMinutes") {
    return "min";
  }

  if (key === "totalExternalLoadKg") {
    return "kg";
  }

  if (key === "averageRpe") {
    return "/10";
  }

  return "pts";
}

function buildTrendMetric({
  buckets,
  key,
  label,
  currentProgress,
  averageNullWhenNoRpe = false,
  detail,
}: {
  buckets: WeeklyTrendBucket[];
  key: WeeklyTrendMetricKey;
  label: string;
  currentProgress: number;
  averageNullWhenNoRpe?: boolean;
  detail?: string;
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
  const metricType = getMetricType(key);
  const status = getTrendStatus(currentValue, recentAverage, previousAverage, metricType, { dataWeeks });
  const weeklySeries = buckets.slice(-8).map((bucket) => ({
    weekKey: bucket.weekKey,
    label: bucket.weekLabel,
    value: roundValue(getMetricValue(bucket, key)),
  }));

  return {
    id: key,
    key,
    label,
    unit: getMetricUnit(key),
    currentValue: roundValue(currentValue),
    currentWeekValue: roundValue(currentValue),
    recentAverage: recentAverage === null ? null : roundValue(recentAverage),
    previousAverage: previousAverage === null ? null : roundValue(previousAverage),
    changePercent,
    status,
    message: getStatusMessage(status, label, metricType),
    detail,
    weeklyValues: weeklySeries,
    weeklySeries,
  };
}

function buildRunExposureTrend(buckets: WeeklyTrendBucket[], currentProgress: number): RunExposureTrend {
  const currentWeek = buckets[buckets.length - 1] ?? null;
  const detail = currentWeek
    ? `${roundValue(currentWeek.structuredRunMeters / 1000)} km running · ${roundValue(currentWeek.mixedRunMeters / 1000)} km mixto`
    : undefined;

  return {
    total: buildTrendMetric({ buckets, key: "totalRunExposureMeters", label: "Carrera total", currentProgress, detail }),
    structured: buildTrendMetric({ buckets, key: "structuredRunMeters", label: "Running estructurado", currentProgress }),
    mixed: buildTrendMetric({ buckets, key: "mixedRunMeters", label: "Carrera en sesiones mixtas", currentProgress }),
  };
}

function getDisciplineAverages(buckets: WeeklyTrendBucket[]) {
  const totals: Partial<Record<TrainingSessionType | "secondary_activity", number>> = {};

  buckets.forEach((bucket) => {
    Object.entries(bucket.disciplineCounts).forEach(([type, count]) => {
      const sessionType = type as TrainingSessionType | "secondary_activity";
      totals[sessionType] = (totals[sessionType] ?? 0) + (count ?? 0);
    });
  });

  return Object.fromEntries(
    Object.entries(totals).map(([type, total]) => [type, roundValue((total ?? 0) / Math.max(1, buckets.length))]),
  ) as Partial<Record<TrainingSessionType | "secondary_activity", number>>;
}

export function getDisciplineTrend(sessions: TrainingSession[]): DisciplineTrend {
  const buckets = getWeekBuckets(sessions);
  const { currentWeek, recentWindow, previousWindow } = getTrendWindow(buckets);

  return {
    current: currentWeek?.disciplineCounts ?? {},
    recentAverage: getDisciplineAverages(recentWindow),
    previousAverage: getDisciplineAverages(previousWindow),
  };
}

export function getTrendCards(weeklyMetrics: WeeklyTrendBucket[]) {
  const { currentProgress } = getTrendWindow(weeklyMetrics);
  const runExposure = buildRunExposureTrend(weeklyMetrics, currentProgress);

  return [
    runExposure.total,
    buildTrendMetric({ buckets: weeklyMetrics, key: "durationMinutes", label: "Duración", currentProgress, detail: "Volumen total de entrenamiento de la semana." }),
    buildTrendMetric({ buckets: weeklyMetrics, key: "fatigueCost", label: "Fatiga", currentProgress, detail: "Fatiga acumulada respecto a la media reciente." }),
    buildTrendMetric({ buckets: weeklyMetrics, key: "impactScore", label: "Impacto", currentProgress, detail: "Impacto semanal de carrera, HYROX, saltos y sesiones mixtas." }),
    buildTrendMetric({ buckets: weeklyMetrics, key: "totalExternalLoadKg", label: "Peso movido", currentProgress, detail: "Volumen externo total de barra, mancuernas y kettlebell." }),
    buildTrendMetric({ buckets: weeklyMetrics, key: "averageRpe", label: "RPE medio", currentProgress: 1, averageNullWhenNoRpe: true, detail: "Intensidad percibida media de la semana." }),
  ];
}

export function getHomeTrendSummary(weeklyMetrics: WeeklyTrendBucket[]) {
  const cards = getTrendCards(weeklyMetrics);
  const externalLoad = cards.find((card) => card.key === "totalExternalLoadKg");
  const duration = cards.find((card) => card.key === "durationMinutes");

  return [
    cards.find((card) => card.key === "totalRunExposureMeters"),
    cards.find((card) => card.key === "fatigueCost"),
    externalLoad && externalLoad.currentValue > 0 ? externalLoad : duration,
  ].filter((card): card is TrendMetric => Boolean(card)).slice(0, 3);
}

export function getDashboardTrendAnalysis(weeklyMetrics: WeeklyTrendBucket[]): WeeklyTrendMetrics {
  const trendWindow = getTrendWindow(weeklyMetrics);
  const runExposure = buildRunExposureTrend(weeklyMetrics, trendWindow.currentProgress);
  const duration = buildTrendMetric({ buckets: weeklyMetrics, key: "durationMinutes", label: "Duración", currentProgress: trendWindow.currentProgress, detail: "Volumen total de entrenamiento de la semana." });
  const load = buildTrendMetric({ buckets: weeklyMetrics, key: "fatigueCost", label: "Fatiga", currentProgress: trendWindow.currentProgress, detail: "Fatiga acumulada respecto a la media reciente." });
  const externalLoad = buildTrendMetric({ buckets: weeklyMetrics, key: "totalExternalLoadKg", label: "Peso movido", currentProgress: trendWindow.currentProgress, detail: "Volumen externo total de barra, mancuernas y kettlebell." });
  const impact = buildTrendMetric({ buckets: weeklyMetrics, key: "impactScore", label: "Impacto", currentProgress: trendWindow.currentProgress, detail: "Impacto semanal de carrera, HYROX, saltos y sesiones mixtas." });
  const averageRpe = buildTrendMetric({ buckets: weeklyMetrics, key: "averageRpe", label: "RPE medio", currentProgress: 1, averageNullWhenNoRpe: true, detail: "Intensidad percibida media de la semana." });
  const cardioLoad = buildTrendMetric({ buckets: weeklyMetrics, key: "cardioLoad", label: "Carga cardio", currentProgress: trendWindow.currentProgress });
  const strengthLoad = buildTrendMetric({ buckets: weeklyMetrics, key: "strengthLoad", label: "Carga fuerza", currentProgress: trendWindow.currentProgress });
  const technicalLoad = buildTrendMetric({ buckets: weeklyMetrics, key: "technicalLoad", label: "Carga técnica", currentProgress: trendWindow.currentProgress });
  const muscleLoad = buildTrendMetric({ buckets: weeklyMetrics, key: "totalMuscleLoad", label: "Carga muscular", currentProgress: trendWindow.currentProgress });

  return {
    buckets: weeklyMetrics,
    currentWeek: trendWindow.currentWeek,
    trendWindow,
    runExposure,
    duration,
    load,
    externalLoad,
    impact,
    averageRpe,
    cardioLoad,
    strengthLoad,
    technicalLoad,
    muscleLoad,
    disciplineTrend: {
      current: trendWindow.currentWeek?.disciplineCounts ?? {},
      recentAverage: getDisciplineAverages(trendWindow.recentWindow),
      previousAverage: getDisciplineAverages(trendWindow.previousWindow),
    },
    keyTrends: [runExposure.total, duration, load, impact, externalLoad, averageRpe],
  };
}

export function getRunExposureTrend(sessions: TrainingSession[]): RunExposureTrend {
  const buckets = getWeekBuckets(sessions);
  return getDashboardTrendAnalysis(buckets).runExposure;
}

export function getLoadTrend(sessions: TrainingSession[]) {
  return getDashboardTrendAnalysis(getWeekBuckets(sessions)).load;
}

export function getExternalLoadTrend(sessions: TrainingSession[]) {
  return getDashboardTrendAnalysis(getWeekBuckets(sessions)).externalLoad;
}

export function getWeeklyTrendMetrics(sessions: TrainingSession[]): WeeklyTrendMetrics {
  return getDashboardTrendAnalysis(getWeekBuckets(sessions));
}
