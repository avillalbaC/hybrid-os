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
  getLatestDate,
  getPeriodDetail,
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

export type DashboardMetric = {
  value: number | null;
  formattedValue: string;
  delta: MetricDelta;
  deltaLabel: string;
  deltaTone: MetricDeltaTone;
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

function makeMetric({
  current,
  previous,
  period,
  format,
  mode = "percent",
  unit = "",
  neutralDelta = false,
}: {
  current: number | null;
  previous: number | null;
  period: DashboardPeriod;
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
    deltaLabel: formatDeltaLabel(delta, period, unit),
    deltaTone: getDeltaTone(delta, neutralDelta),
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
      format: (value) => `${value ?? 0}`,
    }),
    runningKm: makeMetric({
      current: roundValue(calculateRunningKm(sessionPeriods.current)),
      previous: sessionPeriods.previous.length > 0 ? roundValue(calculateRunningKm(sessionPeriods.previous)) : null,
      period,
      format: (value) => `${(value ?? 0).toFixed(1)} km`,
    }),
    durationMinutes: makeMetric({
      current: calculateTotalDuration(sessionPeriods.current),
      previous: sessionPeriods.previous.length > 0 ? calculateTotalDuration(sessionPeriods.previous) : null,
      period,
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
    muscleLoadDeltaLabel: formatDeltaLabel(muscleLoadDelta, period),
    recentSessions: [...sessionPeriods.current]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4),
    alerts,
  };
}
