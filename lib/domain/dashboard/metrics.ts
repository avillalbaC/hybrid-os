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
import { isPureRunningSession } from "@/lib/domain/training/session-kind";
import { getRunningBreakdown, type RunningBreakdown } from "@/lib/domain/training/run-exposure";
import {
  type DashboardPeriod,
  type PeriodRange,
  addDays,
  getLatestDate,
  getPeriodDetail,
  getPeriodProgress,
  getPeriodRange,
  getPeriodTitle,
  getPreviousPeriodLabel,
  getPreviousPeriodRange,
  isDateInRange,
  parseDashboardDate,
  resolvePeriodReferenceDate,
  startOfYear,
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

export type PeriodComparisonStatus = "above_expected" | "on_track" | "below_expected" | "insufficient_reference";

export type PeriodComparison = {
  currentToDate: number;
  expectedToDate: number | null;
  deltaVsExpected: number | null;
  deltaVsExpectedPercent: number | null;
  previousFullPeriod: number | null;
  previousSameProgress: number | null;
  deltaVsPreviousFullPercent: number | null;
  status: PeriodComparisonStatus;
};

export type MetricComparisonDisplay = {
  expectedLabel: string;
  expectedValue: string | null;
  deltaVsExpectedLabel: string | null;
  previousFullLabel: string;
  previousFullValue: string | null;
  previousSameProgressLabel: string;
  previousSameProgressValue: string | null;
  deltaVsPreviousFullLabel: string | null;
  badgeLabel: string;
  badgeTone: MetricDeltaTone;
};

export type DashboardMetric = {
  value: number | null;
  formattedValue: string;
  delta: MetricDelta;
  deltaLabel: string;
  deltaTone: MetricDeltaTone;
  expectedProgress?: ExpectedProgress;
  periodComparison?: PeriodComparison;
  comparisonDisplay?: MetricComparisonDisplay;
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
  runningBreakdown: RunningBreakdown;
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

function endOfDashboardDay(date: Date) {
  const end = parseDashboardDate(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getDayOfYear(date: Date) {
  const start = startOfYear(date);
  return Math.floor((parseDashboardDate(date).getTime() - start.getTime()) / 86400000) + 1;
}

function getRangeDays(range: PeriodRange) {
  return Math.floor((range.end.getTime() - range.start.getTime()) / 86400000) + 1;
}

function getCurrentToDateRange(period: DashboardPeriod, referenceDate: Date) {
  const currentRange = getPeriodRange(period, referenceDate);

  if (!currentRange) {
    return null;
  }

  return {
    start: currentRange.start,
    end: endOfDashboardDay(new Date(Math.min(parseDashboardDate(referenceDate).getTime(), currentRange.end.getTime()))),
  };
}

function getPreviousSameProgressRange(period: DashboardPeriod, referenceDate: Date) {
  const previousRange = getPreviousPeriodRange(period, referenceDate);

  if (!previousRange) {
    return null;
  }

  const reference = parseDashboardDate(referenceDate);

  if (period === "week") {
    const weekDay = reference.getDay() || 7;
    return {
      start: previousRange.start,
      end: endOfDashboardDay(addDays(previousRange.start, weekDay - 1)),
    };
  }

  if (period === "month") {
    const previousMonthDays = new Date(previousRange.start.getFullYear(), previousRange.start.getMonth() + 1, 0).getDate();
    const day = Math.min(reference.getDate(), previousMonthDays);
    return {
      start: previousRange.start,
      end: endOfDashboardDay(new Date(previousRange.start.getFullYear(), previousRange.start.getMonth(), day)),
    };
  }

  const previousYearDays = getRangeDays(previousRange);
  const day = Math.min(getDayOfYear(reference), previousYearDays);

  return {
    start: previousRange.start,
    end: endOfDashboardDay(addDays(previousRange.start, day - 1)),
  };
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
  return sessions.filter(isPureRunningSession).length;
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
      title: "Baja frecuencia de running estructurado",
      detail: `${runningSessions} sesiones type running en la semana actual.`,
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

function getStatusTone(status: PeriodComparisonStatus): MetricDeltaTone {
  if (status === "above_expected") {
    return "positive";
  }

  if (status === "below_expected") {
    return "negative";
  }

  return "neutral";
}

function getStatusLabel(status: PeriodComparisonStatus) {
  const labels: Record<PeriodComparisonStatus, string> = {
    above_expected: "Por encima del ritmo esperado",
    on_track: "En ritmo",
    below_expected: "Por debajo del ritmo esperado",
    insufficient_reference: "Referencia insuficiente",
  };

  return labels[status];
}

function getExpectedLabel(period: DashboardPeriod) {
  if (period === "week") {
    return "Esperado hoy";
  }

  return "Esperado a día de hoy";
}

function getPreviousFullDisplayLabel(period: DashboardPeriod) {
  const labels: Record<DashboardPeriod, string> = {
    week: "Semana anterior completa",
    month: "Mes anterior completo",
    year: "Año anterior completo",
    all: "Histórico completo",
  };

  return labels[period];
}

function getPreviousSameProgressDisplayLabel(period: DashboardPeriod) {
  const labels: Record<DashboardPeriod, string> = {
    week: "Mismo día anterior",
    month: "Mismo día del mes anterior",
    year: "Mismo punto del año anterior",
    all: "Histórico completo",
  };

  return labels[period];
}

function formatExpectedLabel(kind: ExpectedProgress["kind"], period: DashboardPeriod) {
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

  return "En ritmo";
}

export function calculatePeriodComparison<T extends { date: string }>({
  items,
  period,
  referenceDate,
  valueForRange,
  minimumRanges = 3,
}: {
  items: T[];
  period: DashboardPeriod;
  referenceDate: Date | null;
  valueForRange: (items: T[]) => number;
  minimumRanges?: number;
}): PeriodComparison {
  if (period === "all" || !referenceDate) {
    return {
      currentToDate: roundValue(valueForRange(items)),
      expectedToDate: null,
      deltaVsExpected: null,
      deltaVsExpectedPercent: null,
      previousFullPeriod: null,
      previousSameProgress: null,
      deltaVsPreviousFullPercent: null,
      status: "insufficient_reference",
    };
  }

  const currentRange = getCurrentToDateRange(period, referenceDate);
  const previousFullRange = getPreviousPeriodRange(period, referenceDate);
  const previousSameProgressRange = getPreviousSameProgressRange(period, referenceDate);
  const currentToDate = currentRange ? roundValue(valueForRange(filterByRange(items, currentRange))) : 0;
  const previousFullItems = previousFullRange ? filterByRange(items, previousFullRange) : [];
  const previousSameProgressItems = previousSameProgressRange ? filterByRange(items, previousSameProgressRange) : [];
  const previousFullPeriod = previousFullItems.length > 0 ? roundValue(valueForRange(previousFullItems)) : null;
  const previousSameProgress = previousSameProgressItems.length > 0 ? roundValue(valueForRange(previousSameProgressItems)) : null;
  const ranges = getFullHistoricalRanges(period, referenceDate, getEarliestDate(items));
  const rangeValues = ranges.map((range) => valueForRange(filterByRange(items, range)));
  const positiveReferenceValues = rangeValues.filter((value) => value > 0);
  const deltaVsPreviousFullPercent = previousFullPeriod && previousFullPeriod > 0
    ? roundValue(((currentToDate - previousFullPeriod) / previousFullPeriod) * 100)
    : null;

  if (positiveReferenceValues.length < minimumRanges) {
    return {
      currentToDate,
      expectedToDate: null,
      deltaVsExpected: null,
      deltaVsExpectedPercent: null,
      previousFullPeriod,
      previousSameProgress,
      deltaVsPreviousFullPercent,
      status: "insufficient_reference",
    };
  }

  const referenceFullPeriod = positiveReferenceValues.reduce((total, value) => total + value, 0) / positiveReferenceValues.length;
  const expectedToDate = roundValue(referenceFullPeriod * getPeriodProgress(period, referenceDate));
  const deltaVsExpected = roundValue(currentToDate - expectedToDate);
  const deltaVsExpectedPercent = expectedToDate > 0 ? roundValue((deltaVsExpected / expectedToDate) * 100) : null;
  const ratio = expectedToDate > 0 ? currentToDate / expectedToDate : 0;
  const status = ratio > 1.15 ? "above_expected" : ratio < 0.85 ? "below_expected" : "on_track";

  return {
    currentToDate,
    expectedToDate,
    deltaVsExpected,
    deltaVsExpectedPercent,
    previousFullPeriod,
    previousSameProgress,
    deltaVsPreviousFullPercent,
    status,
  };
}

function formatSignedValue(value: number, format: (value: number | null) => string) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${format(Math.abs(value))}`;
}

function formatSignedPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value}%`;
}

function getPreviousFullDeltaLabel(period: DashboardPeriod) {
  const labels: Record<DashboardPeriod, string> = {
    week: "Diferencia vs semana completa",
    month: "Diferencia vs mes completo",
    year: "Diferencia vs año completo",
    all: "Diferencia vs histórico completo",
  };

  return labels[period];
}

function formatComparisonDisplay(
  period: DashboardPeriod,
  comparison: PeriodComparison,
  format: (value: number | null) => string,
): MetricComparisonDisplay | undefined {
  if (period === "all") {
    return undefined;
  }

  return {
    expectedLabel: getExpectedLabel(period),
    expectedValue: comparison.expectedToDate === null ? null : format(comparison.expectedToDate),
    deltaVsExpectedLabel: comparison.deltaVsExpected === null ? null : formatSignedValue(comparison.deltaVsExpected, format),
    previousFullLabel: getPreviousFullDisplayLabel(period),
    previousFullValue: comparison.previousFullPeriod === null ? null : format(comparison.previousFullPeriod),
    previousSameProgressLabel: getPreviousSameProgressDisplayLabel(period),
    previousSameProgressValue: comparison.previousSameProgress === null ? null : format(comparison.previousSameProgress),
    deltaVsPreviousFullLabel: comparison.deltaVsPreviousFullPercent === null
      ? null
      : `${getPreviousFullDeltaLabel(period)}: ${formatSignedPercent(comparison.deltaVsPreviousFullPercent)}`,
    badgeLabel: getStatusLabel(comparison.status),
    badgeTone: getStatusTone(comparison.status),
  };
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
    label: formatExpectedLabel(kind, period),
    tone: kind === "above" ? "positive" : kind === "below" ? "negative" : "neutral",
  };
}

function makeMetric({
  current,
  previous,
  period,
  expectedProgress,
  periodComparison,
  format,
  mode = "percent",
  unit = "",
  neutralDelta = false,
}: {
  current: number | null;
  previous: number | null;
  period: DashboardPeriod;
  expectedProgress?: ExpectedProgress;
  periodComparison?: PeriodComparison;
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
    periodComparison,
    comparisonDisplay: periodComparison ? formatComparisonDisplay(period, periodComparison, format) : undefined,
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
  const currentRunningBreakdown = getRunningBreakdown(sessionPeriods.current);
  const sessionComparison = calculatePeriodComparison({
    items: sessions,
    period,
    referenceDate,
    valueForRange: getCompletedSessions,
  });
  const runningComparison = calculatePeriodComparison({
    items: sessions,
    period,
    referenceDate,
    valueForRange: (items) => roundValue(calculateRunningKm(items)),
  });
  const durationComparison = calculatePeriodComparison({
    items: sessions,
    period,
    referenceDate,
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
      current: period === "all" ? getCompletedSessions(sessionPeriods.current) : sessionComparison.currentToDate,
      previous: sessionComparison.previousFullPeriod,
      period,
      periodComparison: sessionComparison,
      format: (value) => `${value ?? 0}`,
    }),
    runningKm: makeMetric({
      current: period === "all" ? roundValue(calculateRunningKm(sessionPeriods.current)) : runningComparison.currentToDate,
      previous: runningComparison.previousFullPeriod,
      period,
      periodComparison: runningComparison,
      format: (value) => `${(value ?? 0).toFixed(1)} km`,
    }),
    runningBreakdown: currentRunningBreakdown,
    durationMinutes: makeMetric({
      current: period === "all" ? calculateTotalDuration(sessionPeriods.current) : durationComparison.currentToDate,
      previous: durationComparison.previousFullPeriod,
      period,
      periodComparison: durationComparison,
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
