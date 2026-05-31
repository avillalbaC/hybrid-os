import type { BodyCheck } from "@/types/body";
import type { NutritionCheck } from "@/types/nutrition";
import type { TrainingSession } from "@/types/training";
import {
  calculateAverageRpe,
  calculateMuscleLoadRanking,
  calculateRunningKm,
  calculateTotalDuration,
  getCompletedSessions,
  type MuscleTotal,
} from "@/lib/selectors/training";
import {
  type DashboardPeriod,
  type PeriodRange,
  addDays,
  getLatestDate,
  getPeriodDetail,
  getPeriodProgress,
  getPeriodProgressLabel,
  getPeriodRange,
  getPeriodTitle,
  getPreviousPeriodLabel,
  getPreviousPeriodRange,
  isDateInRange,
  resolvePeriodReferenceDate,
} from "./periods";

export type DeltaMode = "percent" | "points" | "absolute";

export type MetricDelta = {
  kind: "change" | "new" | "unchanged" | "no-previous" | "no-current" | "all-time";
  value: number;
  mode: DeltaMode;
};

export type MetricDeltaTone = "positive" | "negative" | "neutral";

export type ExpectedProgress = {
  kind: "above" | "on-track" | "below" | "insufficient" | "no-reference" | "all-time";
  expected: number | null;
  referenceAverage: number | null;
  label: string;
  tone: MetricDeltaTone;
};

export type DashboardMetric = {
  value: number | null;
  formattedValue: string;
  delta: MetricDelta;
  deltaLabel: string;
  deltaTone: MetricDeltaTone;
  expectedProgress?: ExpectedProgress;
  previousDeltaLabel?: string;
  previousDeltaTone?: MetricDeltaTone;
};

export type DashboardAlert = {
  title: string;
  detail: string;
  tone: "warning" | "critical";
};

export type DashboardMetrics = {
  period: DashboardPeriod;
  periodTitle: string;
  periodDetail: string;
  sessions: DashboardMetric;
  runningKm: DashboardMetric;
  durationMinutes: DashboardMetric;
  averageRpe: DashboardMetric;
  weightKg: DashboardMetric;
  waistCm: DashboardMetric;
  nutritionAdherence: DashboardMetric;
  sleepHours: DashboardMetric;
  topMuscles: MuscleTotal[];
  muscleLoadDelta: MetricDelta;
  muscleLoadDeltaLabel: string;
  recentSessions: TrainingSession[];
  alerts: DashboardAlert[];
};

function filterByRange<T extends { date: string }>(items: T[], range: PeriodRange | null) {
  return range ? items.filter((item) => isDateInRange(item.date, range)) : items;
}

function getPeriodItems<T extends { date: string }>(items: T[], period: DashboardPeriod, referenceDate: Date | null) {
  if (period === "all") {
    return { current: items, previous: [] };
  }

  if (!referenceDate) {
    return { current: [], previous: [] };
  }

  return {
    current: filterByRange(items, getPeriodRange(period, referenceDate)),
    previous: filterByRange(items, getPreviousPeriodRange(period, referenceDate)),
  };
}

function getFullHistoricalRanges(period: DashboardPeriod, referenceDate: Date, earliestDate: Date | null) {
  if (period === "all" || !earliestDate) {
    return [];
  }

  const ranges: PeriodRange[] = [];
  let cursorEnd = addDays(getPeriodRange(period, referenceDate)?.start ?? referenceDate, -1);

  while (cursorEnd.getTime() >= earliestDate.getTime()) {
    const range = getPeriodRange(period, cursorEnd);

    if (!range || range.end.getTime() >= referenceDate.getTime()) {
      break;
    }

    ranges.push(range);
    cursorEnd = addDays(range.start, -1);
  }

  return ranges;
}

function getLatestItem<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null;
}

function roundValue(value: number, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function getLatestDashboardDate(
  sessions: TrainingSession[],
  bodyChecks: BodyCheck[],
  nutritionChecks: NutritionCheck[],
) {
  return getLatestDate([
    ...sessions.map((item) => ({ date: item.date })),
    ...bodyChecks.map((item) => ({ date: item.date })),
    ...nutritionChecks.map((item) => ({ date: item.date })),
  ]);
}

function getEarliestDate<T extends { date: string }>(items: T[]) {
  if (items.length === 0) {
    return null;
  }

  return items.reduce<Date | null>((earliest, item) => {
    const current = new Date(`${item.date}T00:00:00`);
    current.setHours(0, 0, 0, 0);
    return !earliest || current.getTime() < earliest.getTime() ? current : earliest;
  }, null);
}

function getAverageNutritionAdherence(items: NutritionCheck[]) {
  const values = items
    .map((item) => item.adherencePercent)
    .filter((value) => typeof value === "number" && Number.isFinite(value));

  if (values.length === 0) {
    return null;
  }

  return roundValue(values.reduce((total, value) => total + value, 0) / values.length, 0);
}

function getRunningSessionCount(sessions: TrainingSession[]) {
  return sessions.filter((session) => session.sessionMetrics.totalRunMeters > 0).length;
}

function calculateDashboardAlerts({
  period,
  sessions,
  topMuscles,
  averageRpe,
  nutritionAdherence,
}: {
  period: DashboardPeriod;
  sessions: TrainingSession[];
  topMuscles: MuscleTotal[];
  averageRpe: number | null;
  nutritionAdherence: number | null;
}): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const muscleLoadByName = new Map(topMuscles.map((item) => [item.muscle, item.loadScore]));
  const shouldersLoad = muscleLoadByName.get("shoulders") ?? 0;
  const calvesLoad = muscleLoadByName.get("calves") ?? 0;
  const runningSessions = getRunningSessionCount(sessions);

  if (shouldersLoad >= 220) {
    alerts.push({
      title: "Carga alta de hombros",
      detail: `Hombros acumulan ${shouldersLoad} puntos de carga en este periodo.`,
      tone: shouldersLoad >= 300 ? "critical" : "warning",
    });
  }

  if (calvesLoad >= 180) {
    alerts.push({
      title: "Carga alta de gemelos",
      detail: `Gemelos acumulan ${calvesLoad} puntos de carga en este periodo.`,
      tone: calvesLoad >= 260 ? "critical" : "warning",
    });
  }

  if (period === "week" && runningSessions < 2) {
    alerts.push({
      title: "Baja frecuencia de running",
      detail: `${runningSessions} sesiones con carrera en la semana actual.`,
      tone: "warning",
    });
  }

  if (averageRpe !== null && averageRpe >= 8) {
    alerts.push({
      title: "RPE medio alto",
      detail: `RPE medio ${averageRpe}/10 en este periodo.`,
      tone: averageRpe >= 9 ? "critical" : "warning",
    });
  }

  if (nutritionAdherence !== null && nutritionAdherence < 80) {
    alerts.push({
      title: "Adherencia nutricional baja",
      detail: `Media del periodo: ${nutritionAdherence}%.`,
      tone: nutritionAdherence < 65 ? "critical" : "warning",
    });
  }

  return alerts;
}

export function calculateMetricDelta(
  currentValue: number | null,
  previousValue: number | null,
  mode: DeltaMode = "percent",
): MetricDelta {
  if (currentValue === null) {
    return { kind: "no-current", value: 0, mode };
  }

  if (previousValue === null) {
    return { kind: "no-previous", value: 0, mode };
  }

  if (previousValue === 0 && currentValue > 0) {
    return { kind: "new", value: mode === "percent" ? 100 : currentValue, mode };
  }

  if (previousValue === 0 && currentValue === 0) {
    return { kind: "unchanged", value: 0, mode };
  }

  if (mode === "percent") {
    return {
      kind: "change",
      value: roundValue(((currentValue - previousValue) / previousValue) * 100),
      mode,
    };
  }

  return {
    kind: "change",
    value: roundValue(currentValue - previousValue),
    mode,
  };
}

export function formatDeltaLabel(delta: MetricDelta, period: DashboardPeriod, unit = "") {
  if (period === "all" || delta.kind === "all-time") {
    return "Histórico completo";
  }

  if (delta.kind === "no-current") {
    return "Sin datos del periodo";
  }

  if (delta.kind === "no-previous") {
    return "Sin datos previos";
  }

  if (delta.kind === "unchanged") {
    return "Sin cambios";
  }

  if (delta.kind === "new") {
    return delta.mode === "percent"
      ? `+100% vs ${getPreviousPeriodLabel(period)}`
      : `Nuevo periodo activo`;
  }

  const sign = delta.value > 0 ? "+" : "";
  const suffix = delta.mode === "percent" ? "%" : unit;

  return `${sign}${delta.value}${suffix} vs ${getPreviousPeriodLabel(period)}`;
}

function getDeltaTone(delta: MetricDelta, neutral = false): MetricDeltaTone {
  if (neutral || delta.kind === "no-current" || delta.kind === "no-previous" || delta.kind === "unchanged") {
    return "neutral";
  }

  return delta.value < 0 ? "negative" : "positive";
}

function formatExpectedLabel(kind: ExpectedProgress["kind"], period: DashboardPeriod, referenceDate: Date) {
  if (period === "all" || kind === "all-time") {
    return "Histórico completo";
  }

  if (kind === "insufficient") {
    return "Referencia insuficiente";
  }

  if (kind === "no-reference") {
    return "Sin referencia";
  }

  if (kind === "above") {
    return "Por encima del ritmo esperado";
  }

  if (kind === "below") {
    return "Por debajo del ritmo esperado";
  }

  return `En ritmo para ${getPeriodProgressLabel(period, referenceDate)}`;
}

export function calculateExpectedProgress<T extends { date: string }>({
  items,
  period,
  referenceDate,
  currentValue,
  valueForRange,
  minimumRanges = 3,
}: {
  items: T[];
  period: DashboardPeriod;
  referenceDate: Date | null;
  currentValue: number | null;
  valueForRange: (items: T[]) => number;
  minimumRanges?: number;
}): ExpectedProgress {
  if (period === "all") {
    return {
      kind: "all-time",
      expected: null,
      referenceAverage: null,
      label: "Histórico completo",
      tone: "neutral",
    };
  }

  if (!referenceDate || currentValue === null) {
    return {
      kind: "no-reference",
      expected: null,
      referenceAverage: null,
      label: "Sin referencia",
      tone: "neutral",
    };
  }

  const ranges = getFullHistoricalRanges(period, referenceDate, getEarliestDate(items));
  const rangeValues = ranges.map((range) => valueForRange(filterByRange(items, range)));
  const values = rangeValues.filter((value) => value > 0);

  if (rangeValues.length >= minimumRanges && values.length === 0) {
    return {
      kind: "no-reference",
      expected: null,
      referenceAverage: null,
      label: "Sin referencia",
      tone: "neutral",
    };
  }

  if (values.length < minimumRanges) {
    return {
      kind: "insufficient",
      expected: null,
      referenceAverage: null,
      label: "Referencia insuficiente",
      tone: "neutral",
    };
  }

  const referenceAverage = values.reduce((total, value) => total + value, 0) / values.length;

  if (referenceAverage <= 0) {
    return {
      kind: "no-reference",
      expected: null,
      referenceAverage: null,
      label: "Sin referencia",
      tone: "neutral",
    };
  }

  const expected = referenceAverage * getPeriodProgress(period, referenceDate);
  const ratio = expected > 0 ? currentValue / expected : 0;
  const kind = ratio > 1.15 ? "above" : ratio < 0.85 ? "below" : "on-track";

  return {
    kind,
    expected: roundValue(expected),
    referenceAverage: roundValue(referenceAverage),
    label: formatExpectedLabel(kind, period, referenceDate),
    tone: kind === "above" ? "positive" : kind === "below" ? "negative" : "neutral",
  };
}

function makeMetric({
  current,
  previous,
  period,
  expectedProgress,
  format,
  mode = "percent",
  unit = "",
  neutralDelta = false,
}: {
  current: number | null;
  previous: number | null;
  period: DashboardPeriod;
  expectedProgress?: ExpectedProgress;
  format: (value: number | null) => string;
  mode?: DeltaMode;
  unit?: string;
  neutralDelta?: boolean;
}): DashboardMetric {
  const delta = period === "all"
    ? { kind: "all-time", value: 0, mode } satisfies MetricDelta
    : calculateMetricDelta(current, previous, mode);

  return {
    value: current,
    formattedValue: format(current),
    delta,
    deltaLabel: expectedProgress?.label ?? formatDeltaLabel(delta, period, unit),
    deltaTone: expectedProgress?.tone ?? getDeltaTone(delta, neutralDelta),
    expectedProgress,
    previousDeltaLabel: expectedProgress ? formatDeltaLabel(delta, period, unit) : undefined,
    previousDeltaTone: expectedProgress ? getDeltaTone(delta, neutralDelta) : undefined,
  };
}

export function calculateDashboardMetrics(
  sessions: TrainingSession[],
  bodyChecks: BodyCheck[],
  nutritionChecks: NutritionCheck[],
  period: DashboardPeriod,
): DashboardMetrics {
  const referenceDate = resolvePeriodReferenceDate(period, getLatestDashboardDate(sessions, bodyChecks, nutritionChecks));
  const sessionPeriods = getPeriodItems(sessions, period, referenceDate);
  const bodyPeriods = getPeriodItems(bodyChecks, period, referenceDate);
  const nutritionPeriods = getPeriodItems(nutritionChecks, period, referenceDate);

  const currentBody = getLatestItem(bodyPeriods.current);
  const previousBody = getLatestItem(bodyPeriods.previous);
  const currentNutritionAdherence = getAverageNutritionAdherence(nutritionPeriods.current);
  const previousNutritionAdherence = getAverageNutritionAdherence(nutritionPeriods.previous);

  const currentMuscleLoad = calculateMuscleLoadRanking(sessionPeriods.current, 100);
  const previousMuscleLoad = calculateMuscleLoadRanking(sessionPeriods.previous, 100);
  const currentAverageRpe = sessionPeriods.current.some((session) => typeof session.rpe === "number" && session.rpe > 0)
    ? calculateAverageRpe(sessionPeriods.current)
    : null;
  const previousAverageRpe = sessionPeriods.previous.some((session) => typeof session.rpe === "number" && session.rpe > 0)
    ? calculateAverageRpe(sessionPeriods.previous)
    : null;
  const currentMuscleTotal = currentMuscleLoad.reduce((total, item) => total + item.loadScore, 0);
  const previousMuscleTotal = previousMuscleLoad.length > 0
    ? previousMuscleLoad.reduce((total, item) => total + item.loadScore, 0)
    : null;
  const muscleLoadDelta = period === "all"
    ? ({ kind: "all-time", value: 0, mode: "percent" } satisfies MetricDelta)
    : calculateMetricDelta(currentMuscleTotal, previousMuscleTotal);
  const sessionProgress = calculateExpectedProgress({
    items: sessions,
    period,
    referenceDate,
    currentValue: getCompletedSessions(sessionPeriods.current),
    valueForRange: getCompletedSessions,
  });
  const runningProgress = calculateExpectedProgress({
    items: sessions,
    period,
    referenceDate,
    currentValue: roundValue(calculateRunningKm(sessionPeriods.current)),
    valueForRange: (items) => roundValue(calculateRunningKm(items)),
  });
  const durationProgress = calculateExpectedProgress({
    items: sessions,
    period,
    referenceDate,
    currentValue: calculateTotalDuration(sessionPeriods.current),
    valueForRange: calculateTotalDuration,
  });
  const muscleLoadProgress = calculateExpectedProgress({
    items: sessions,
    period,
    referenceDate,
    currentValue: currentMuscleTotal,
    valueForRange: (items) => calculateMuscleLoadRanking(items, 100).reduce((total, item) => total + item.loadScore, 0),
  });

  const alerts = calculateDashboardAlerts({
    period,
    sessions: sessionPeriods.current,
    topMuscles: currentMuscleLoad,
    averageRpe: currentAverageRpe,
    nutritionAdherence: currentNutritionAdherence,
  });

  return {
    period,
    periodTitle: getPeriodTitle(period),
    periodDetail: getPeriodDetail(period),
    sessions: makeMetric({
      current: getCompletedSessions(sessionPeriods.current),
      previous: sessionPeriods.previous.length > 0 ? getCompletedSessions(sessionPeriods.previous) : null,
      period,
      expectedProgress: sessionProgress,
      format: (value) => `${value ?? 0}`,
    }),
    runningKm: makeMetric({
      current: roundValue(calculateRunningKm(sessionPeriods.current)),
      previous: sessionPeriods.previous.length > 0 ? roundValue(calculateRunningKm(sessionPeriods.previous)) : null,
      period,
      expectedProgress: runningProgress,
      format: (value) => `${(value ?? 0).toFixed(1)} km`,
    }),
    durationMinutes: makeMetric({
      current: calculateTotalDuration(sessionPeriods.current),
      previous: sessionPeriods.previous.length > 0 ? calculateTotalDuration(sessionPeriods.previous) : null,
      period,
      expectedProgress: durationProgress,
      format: (value) => `${value ?? 0} min`,
    }),
    averageRpe: makeMetric({
      current: currentAverageRpe,
      previous: previousAverageRpe,
      period,
      format: (value) => (value === null ? "-" : `${value}/10`),
      mode: "points",
      neutralDelta: true,
    }),
    weightKg: makeMetric({
      current: currentBody?.weightKg ?? null,
      previous: previousBody?.weightKg ?? null,
      period,
      format: (value) => (value === null ? "-" : `${value.toFixed(1)} kg`),
      mode: "absolute",
      unit: " kg",
      neutralDelta: true,
    }),
    waistCm: makeMetric({
      current: currentBody?.waistCm ?? null,
      previous: previousBody?.waistCm ?? null,
      period,
      format: (value) => (value === null ? "-" : `${value.toFixed(1)} cm`),
      mode: "absolute",
      unit: " cm",
      neutralDelta: true,
    }),
    nutritionAdherence: makeMetric({
      current: currentNutritionAdherence,
      previous: previousNutritionAdherence,
      period,
      format: (value) => (value === null ? "-" : `${value}%`),
    }),
    sleepHours: makeMetric({
      current: currentBody?.sleepHours ?? null,
      previous: previousBody?.sleepHours ?? null,
      period,
      format: (value) => (value === null ? "-" : `${value.toFixed(1)} h`),
      mode: "absolute",
      unit: " h",
      neutralDelta: true,
    }),
    topMuscles: currentMuscleLoad.slice(0, 5),
    muscleLoadDelta,
    muscleLoadDeltaLabel: muscleLoadProgress.label,
    recentSessions: [...sessionPeriods.current]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4),
    alerts,
  };
}
