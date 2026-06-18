import { buildCheckInContext } from "@/lib/analytics/check-in-context";
import { getPeriodRange, isDateInRange } from "@/lib/domain/dashboard/periods";
import { getStructuredRunningMeters, getTotalRunExposureMeters } from "@/lib/domain/training/run-exposure";
import { getGoalProfileMeta } from "@/lib/goals/goal-profiles";
import { formatKm, formatMuscleName } from "@/lib/utils/format";
import type { BodyCheck } from "@/types/body";
import type { DailyEntry } from "@/types/daily";
import type { GoalBlock, GoalProgressSignal, GoalProgressStatus, GoalProgressSummary } from "@/types/goals";
import type { NutritionCheck } from "@/types/nutrition";
import type { PlannedSession } from "@/types/planning";
import type { TrainingSession } from "@/types/training";

type WeeklyProgressMetrics = {
  sessions: TrainingSession[];
  dailyEntries: DailyEntry[];
  bodyChecks: BodyCheck[];
  nutritionChecks: NutritionCheck[];
  plannedSessions: PlannedSession[];
  structuredRunSessions: number;
  structuredRunMeters: number;
  mixedRunMeters: number;
  totalRunMeters: number;
  strengthSessions: number;
  hyroxSessions: number;
  crossfitSessions: number;
  highIntensitySessions: number | null;
  averageRpe: number | null;
  durationMinutes: number;
  mobilityDays: number;
  partialSessions: number;
  topMuscles: Array<{ muscle: string; load: number }>;
  bodyTrend: {
    weightDeltaKg: number | null;
    waistDeltaCm: number | null;
    first: BodyCheck | null;
    latest: BodyCheck | null;
  };
};

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekLabel(referenceDate: Date) {
  const range = getPeriodRange("week", referenceDate);

  if (!range) {
    return "Semana actual";
  }

  return `${formatDateKey(range.start)} - ${formatDateKey(range.end)}`;
}

function getWeekRange(referenceDate: Date) {
  return getPeriodRange("week", referenceDate);
}

function inCurrentWeek(date: string, referenceDate: Date) {
  const range = getWeekRange(referenceDate);
  return range ? isDateInRange(date, range) : false;
}

function isStrengthSession(session: TrainingSession) {
  return session.type === "fuerza" ||
    session.type === "halterofilia" ||
    session.subtypes.includes("strength") ||
    session.subtypes.includes("weightlifting");
}

function isHyroxSession(session: TrainingSession) {
  return session.type === "hyrox" || session.subtypes.includes("hyrox" as never);
}

function isMobilitySession(session: TrainingSession) {
  return session.type === "movilidad" || session.subtypes.includes("mobility");
}

function getAverageRpe(sessions: TrainingSession[]) {
  const values = sessions.map((session) => session.rpe).filter((value): value is number => typeof value === "number" && value > 0);

  if (values.length === 0) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getTopMuscles(sessions: TrainingSession[]) {
  const totals = new Map<string, number>();

  for (const session of sessions) {
    for (const [muscle, load] of Object.entries(session.sessionMuscleSummary)) {
      totals.set(muscle, (totals.get(muscle) ?? 0) + load);
    }
  }

  return Array.from(totals.entries())
    .filter(([, load]) => load > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([muscle, load]) => ({ muscle, load }));
}

function getBodyTrend(bodyChecks: BodyCheck[]) {
  const sorted = [...bodyChecks].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0] ?? null;
  const latest = sorted.at(-1) ?? null;

  return {
    first,
    latest,
    weightDeltaKg: first && latest && first.id !== latest.id ? latest.weightKg - first.weightKg : null,
    waistDeltaCm: first && latest && first.id !== latest.id ? latest.waistCm - first.waistCm : null,
  };
}

function getWeeklyMetrics({
  sessions,
  dailyEntries,
  bodyChecks,
  nutritionChecks,
  plannedSessions,
  referenceDate,
}: {
  sessions: TrainingSession[];
  dailyEntries: DailyEntry[];
  bodyChecks: BodyCheck[];
  nutritionChecks: NutritionCheck[];
  plannedSessions: PlannedSession[];
  referenceDate: Date;
}): WeeklyProgressMetrics {
  const weekSessions = sessions.filter((session) => inCurrentWeek(session.date, referenceDate));
  const weekDailyEntries = dailyEntries.filter((entry) => inCurrentWeek(entry.entryDate, referenceDate));
  const weekBodyChecks = bodyChecks.filter((check) => inCurrentWeek(check.date, referenceDate));
  const weekNutritionChecks = nutritionChecks.filter((check) => inCurrentWeek(check.date, referenceDate));
  const weekPlannedSessions = plannedSessions.filter((session) => inCurrentWeek(session.plannedDate, referenceDate));
  const structuredRunMeters = getStructuredRunningMeters(weekSessions);
  const totalRunMeters = getTotalRunExposureMeters(weekSessions);
  const mobilityDays = new Set([
    ...weekSessions.filter(isMobilitySession).map((session) => session.date),
    ...weekDailyEntries.filter((entry) => entry.mobilityDone).map((entry) => entry.entryDate),
  ]).size;
  const rpeValues = weekSessions.map((session) => session.rpe).filter((value): value is number => typeof value === "number" && value > 0);

  return {
    sessions: weekSessions,
    dailyEntries: weekDailyEntries,
    bodyChecks: weekBodyChecks,
    nutritionChecks: weekNutritionChecks,
    plannedSessions: weekPlannedSessions,
    structuredRunSessions: weekSessions.filter((session) => session.type === "running").length,
    structuredRunMeters,
    mixedRunMeters: Math.max(0, totalRunMeters - structuredRunMeters),
    totalRunMeters,
    strengthSessions: weekSessions.filter(isStrengthSession).length,
    hyroxSessions: weekSessions.filter(isHyroxSession).length,
    crossfitSessions: weekSessions.filter((session) => session.type === "crossfit").length,
    highIntensitySessions: rpeValues.length > 0 ? weekSessions.filter((session) => (session.rpe ?? 0) >= 8).length : null,
    averageRpe: getAverageRpe(weekSessions),
    durationMinutes: weekSessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0),
    mobilityDays,
    partialSessions: weekSessions.filter((session) => session.dataQuality === "partial" || session.status === "partial").length,
    topMuscles: getTopMuscles(weekSessions),
    bodyTrend: getBodyTrend(weekBodyChecks),
  };
}

function signal(signal: GoalProgressSignal): GoalProgressSignal {
  return signal;
}

function formatDelta(value: number, unit: string) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} ${unit}`;
}

function hasTopMuscle(metrics: WeeklyProgressMetrics, muscles: string[]) {
  return metrics.topMuscles.some((item) => muscles.includes(item.muscle));
}

function buildBaseSignals(metrics: WeeklyProgressMetrics, activeGoal: GoalBlock | null): GoalProgressSignal[] {
  const signals: GoalProgressSignal[] = [];

  if (!activeGoal) {
    signals.push(signal({
      id: "no-active-goal",
      label: "Sin objetivo activo",
      category: "data_quality",
      direction: "neutral",
      severity: "info",
      evidence: "Hybrid OS puede mostrar datos, pero no evaluar progreso contra un bloque activo.",
      checkInRelevance: "high",
    }));
  }

  if (metrics.sessions.length === 0) {
    signals.push(signal({
      id: "no-training-sessions",
      label: "Sin sesiones esta semana",
      category: "training",
      direction: "neutral",
      severity: "info",
      evidence: "No hay entrenamientos registrados en la semana calendario actual.",
      checkInRelevance: "high",
    }));
  }

  if (metrics.averageRpe === null && metrics.sessions.length > 0) {
    signals.push(signal({
      id: "missing-rpe",
      label: "RPE incompleto",
      category: "data_quality",
      direction: "neutral",
      severity: "info",
      evidence: "Las sesiones de la semana no tienen RPE suficiente para leer intensidad.",
      checkInRelevance: "medium",
    }));
  }

  if (metrics.partialSessions >= Math.max(2, Math.ceil(metrics.sessions.length * 0.4))) {
    signals.push(signal({
      id: "partial-sessions",
      label: "Calidad de datos parcial",
      category: "data_quality",
      direction: "neutral",
      severity: "info",
      valueLabel: `${metrics.partialSessions}/${metrics.sessions.length}`,
      evidence: `${metrics.partialSessions} sesiones de la semana están marcadas como parciales.`,
      checkInRelevance: "medium",
    }));
  }

  if (metrics.bodyChecks.length === 0 && activeGoal?.profile === "recomposition") {
    signals.push(signal({
      id: "no-body-checks",
      label: "Sin body checks",
      category: "body",
      direction: "neutral",
      severity: "info",
      evidence: "No hay peso/cintura esta semana para evaluar recomposición corporal.",
      checkInRelevance: "high",
    }));
  }

  if (metrics.nutritionChecks.length === 0 && activeGoal?.profile === "recomposition") {
    signals.push(signal({
      id: "no-nutrition-checks",
      label: "Sin datos nutricionales",
      category: "data_quality",
      direction: "neutral",
      severity: "info",
      evidence: "No hay nutrition checks esta semana; la lectura corporal queda incompleta.",
      checkInRelevance: "medium",
    }));
  }

  if (metrics.plannedSessions.length === 0) {
    signals.push(signal({
      id: "no-weekly-plan",
      label: "Sin plan semanal",
      category: "planning",
      direction: "neutral",
      severity: "info",
      evidence: "No hay planned_sessions esta semana. No penaliza el objetivo, solo limita la comparación intención vs ejecución.",
      checkInRelevance: "low",
    }));
  }

  return signals;
}

function buildProfileSignals(activeGoal: GoalBlock, metrics: WeeklyProgressMetrics): GoalProgressSignal[] {
  const signals: GoalProgressSignal[] = [];
  const structuredKm = metrics.structuredRunMeters / 1000;
  const totalRunKm = metrics.totalRunMeters / 1000;
  const highIntensity = metrics.highIntensitySessions ?? 0;

  if (activeGoal.profile === "recomposition" || activeGoal.profile === "custom") {
    if (metrics.bodyTrend.waistDeltaCm !== null && metrics.bodyTrend.waistDeltaCm <= 0) {
      signals.push(signal({
        id: "waist-stable-or-down",
        label: "Cintura estable o bajando",
        category: "body",
        direction: "positive",
        severity: "positive",
        valueLabel: formatDelta(metrics.bodyTrend.waistDeltaCm, "cm"),
        evidence: `La cintura cambia ${formatDelta(metrics.bodyTrend.waistDeltaCm, "cm")} dentro de la semana.`,
        checkInRelevance: "high",
      }));
    }

    if (metrics.bodyTrend.weightDeltaKg !== null && metrics.bodyTrend.weightDeltaKg <= 0 && metrics.bodyTrend.weightDeltaKg >= -1) {
      signals.push(signal({
        id: "weight-controlled-down",
        label: "Peso bajando de forma controlada",
        category: "body",
        direction: "positive",
        severity: "positive",
        valueLabel: formatDelta(metrics.bodyTrend.weightDeltaKg, "kg"),
        evidence: `El peso cambia ${formatDelta(metrics.bodyTrend.weightDeltaKg, "kg")} en la semana, sin caída brusca.`,
        checkInRelevance: "medium",
      }));
    }

    if (metrics.strengthSessions >= 1) {
      signals.push(signal({
        id: "strength-present",
        label: "Fuerza presente",
        category: "strength",
        direction: "positive",
        severity: "positive",
        valueLabel: `${metrics.strengthSessions} sesiones`,
        evidence: `${metrics.strengthSessions} estímulo(s) de fuerza/halterofilia sostienen masa y rendimiento.`,
        checkInRelevance: "high",
      }));
    } else {
      signals.push(signal({
        id: "strength-absent",
        label: "Fuerza ausente",
        category: "strength",
        direction: "negative",
        severity: "warning",
        evidence: "No hay estímulos claros de fuerza/halterofilia esta semana.",
        checkInRelevance: "high",
      }));
    }

    if (metrics.structuredRunSessions >= 1) {
      signals.push(signal({
        id: "structured-running-present",
        label: "Running estructurado presente",
        category: "running",
        direction: "positive",
        severity: "positive",
        valueLabel: `${structuredKm.toFixed(1)} km`,
        evidence: `${metrics.structuredRunSessions} sesión(es) y ${structuredKm.toFixed(1)} km de running estructurado.`,
        checkInRelevance: "medium",
      }));
    }

    if (metrics.mobilityDays >= 3) {
      signals.push(signal({
        id: "mobility-sufficient",
        label: "Movilidad suficiente",
        category: "mobility",
        direction: "positive",
        severity: "positive",
        valueLabel: `${metrics.mobilityDays} días`,
        evidence: `${metrics.mobilityDays} días con movilidad registrada.`,
        checkInRelevance: "medium",
      }));
    } else if (highIntensity >= 3) {
      signals.push(signal({
        id: "low-mobility-high-intensity",
        label: "Movilidad baja con intensidad",
        category: "mobility",
        direction: "negative",
        severity: "warning",
        valueLabel: `${metrics.mobilityDays} días`,
        evidence: `${metrics.mobilityDays} días de movilidad con ${highIntensity} sesiones RPE 8 o más.`,
        checkInRelevance: "high",
      }));
    }
  }

  if (activeGoal.profile === "running_base") {
    if (metrics.structuredRunSessions >= 2 && metrics.structuredRunSessions <= 3) {
      signals.push(signal({
        id: "running-base-frequency",
        label: "Frecuencia running útil",
        category: "running",
        direction: "positive",
        severity: "positive",
        valueLabel: `${metrics.structuredRunSessions} sesiones`,
        evidence: `${metrics.structuredRunSessions} sesiones de running estructurado encajan con base aeróbica.`,
        checkInRelevance: "high",
      }));
    } else if (metrics.structuredRunSessions === 0) {
      signals.push(signal({
        id: "no-structured-running",
        label: "Sin running estructurado",
        category: "running",
        direction: "negative",
        severity: "warning",
        evidence: "La semana no tiene sesiones running puras.",
        checkInRelevance: "high",
      }));
    }

    if (metrics.mixedRunMeters > metrics.structuredRunMeters && metrics.mixedRunMeters >= 3000) {
      signals.push(signal({
        id: "mixed-running-dominates",
        label: "Carrera mixta domina",
        category: "running",
        direction: "negative",
        severity: "warning",
        valueLabel: formatKm(metrics.mixedRunMeters, { forceKm: true }),
        evidence: `${formatKm(metrics.mixedRunMeters, { forceKm: true })} vienen de sesiones mixtas frente a ${formatKm(metrics.structuredRunMeters, { forceKm: true })} estructurados.`,
        checkInRelevance: "high",
      }));
    }

    if (metrics.averageRpe !== null && metrics.averageRpe <= 7) {
      signals.push(signal({
        id: "running-rpe-controlled",
        label: "RPE controlado",
        category: "recovery",
        direction: "positive",
        severity: "positive",
        valueLabel: metrics.averageRpe.toFixed(1),
        evidence: `RPE medio semanal ${metrics.averageRpe.toFixed(1)}/10.`,
        checkInRelevance: "medium",
      }));
    }
  }

  if (activeGoal.profile === "hyrox_build") {
    if (totalRunKm >= 8) {
      signals.push(signal({
        id: "hyrox-run-exposure",
        label: "Exposición de carrera suficiente",
        category: "running",
        direction: "positive",
        severity: "positive",
        valueLabel: `${totalRunKm.toFixed(1)} km`,
        evidence: `${totalRunKm.toFixed(1)} km de exposición total a carrera.`,
        checkInRelevance: "high",
      }));
    }

    if (metrics.hyroxSessions >= 1) {
      signals.push(signal({
        id: "hyrox-present",
        label: "HYROX presente",
        category: "training",
        direction: "positive",
        severity: "positive",
        valueLabel: `${metrics.hyroxSessions} sesiones`,
        evidence: `${metrics.hyroxSessions} sesión(es) HYROX en la semana.`,
        checkInRelevance: "high",
      }));
    }

    if (metrics.structuredRunSessions === 0) {
      signals.push(signal({
        id: "hyrox-no-structured-running",
        label: "Running comprometido ausente",
        category: "running",
        direction: "negative",
        severity: "warning",
        evidence: "Hay contexto HYROX, pero no hay running estructurado puro.",
        checkInRelevance: "high",
      }));
    }

    if (highIntensity >= 3) {
      signals.push(signal({
        id: "hyrox-intensity-stacked",
        label: "Intensidad acumulada",
        category: "recovery",
        direction: "negative",
        severity: "warning",
        valueLabel: `${highIntensity} sesiones`,
        evidence: `${highIntensity} sesiones con RPE 8 o más.`,
        checkInRelevance: "high",
      }));
    }
  }

  if (activeGoal.profile === "strength_maintenance") {
    if (metrics.strengthSessions >= 1 && metrics.strengthSessions <= 3) {
      signals.push(signal({
        id: "strength-maintenance-dose",
        label: "Dosis de fuerza presente",
        category: "strength",
        direction: "positive",
        severity: "positive",
        valueLabel: `${metrics.strengthSessions} sesiones`,
        evidence: `${metrics.strengthSessions} estímulo(s) de fuerza/halterofilia esta semana.`,
        checkInRelevance: "high",
      }));
    } else if (metrics.strengthSessions === 0) {
      signals.push(signal({
        id: "strength-maintenance-absent",
        label: "Fuerza ausente",
        category: "strength",
        direction: "negative",
        severity: "warning",
        evidence: "No hay estímulos de fuerza en una semana de mantenimiento.",
        checkInRelevance: "high",
      }));
    }

    if (metrics.totalRunMeters >= 18000) {
      signals.push(signal({
        id: "strength-high-impact",
        label: "Impacto alto para mantenimiento",
        category: "running",
        direction: "negative",
        severity: "warning",
        valueLabel: `${totalRunKm.toFixed(1)} km`,
        evidence: `${totalRunKm.toFixed(1)} km de carrera total pueden interferir con fuerza si se acumula fatiga.`,
        checkInRelevance: "medium",
      }));
    }
  }

  if (activeGoal.profile === "deload") {
    if (highIntensity === 0 && metrics.sessions.length > 0) {
      signals.push(signal({
        id: "deload-low-intensity",
        label: "Intensidad baja",
        category: "recovery",
        direction: "positive",
        severity: "positive",
        evidence: "No aparecen sesiones con RPE 8 o más esta semana.",
        checkInRelevance: "high",
      }));
    }

    if (metrics.mobilityDays >= 3) {
      signals.push(signal({
        id: "deload-mobility",
        label: "Movilidad alta",
        category: "mobility",
        direction: "positive",
        severity: "positive",
        valueLabel: `${metrics.mobilityDays} días`,
        evidence: `${metrics.mobilityDays} días con movilidad registrada en descarga.`,
        checkInRelevance: "medium",
      }));
    }

    if (metrics.hyroxSessions > 0 || highIntensity > 0) {
      signals.push(signal({
        id: "deload-extra-intensity",
        label: "Intensidad extra en descarga",
        category: "recovery",
        direction: "negative",
        severity: "critical",
        evidence: `${metrics.hyroxSessions} HYROX y ${highIntensity} sesiones RPE 8 o más dentro de una descarga.`,
        checkInRelevance: "high",
      }));
    }

    if (metrics.totalRunMeters >= 10000) {
      signals.push(signal({
        id: "deload-high-running",
        label: "Carrera alta para descarga",
        category: "running",
        direction: "negative",
        severity: "warning",
        valueLabel: `${totalRunKm.toFixed(1)} km`,
        evidence: `${totalRunKm.toFixed(1)} km de carrera total durante descarga.`,
        checkInRelevance: "high",
      }));
    }
  }

  if (hasTopMuscle(metrics, ["calves", "quadriceps", "shoulders", "lowerBack"])) {
    const muscles = metrics.topMuscles
      .filter((item) => ["calves", "quadriceps", "shoulders", "lowerBack"].includes(item.muscle))
      .map((item) => formatMuscleName(item.muscle))
      .join(", ");

    signals.push(signal({
      id: "watch-muscles-loaded",
      label: "Músculos de vigilancia cargados",
      category: "recovery",
      direction: "negative",
      severity: "warning",
      evidence: `${muscles} aparecen en el top muscular semanal.`,
      checkInRelevance: "medium",
    }));
  }

  return signals;
}

function getOverallStatus(signals: GoalProgressSignal[]): GoalProgressStatus {
  const negative = signals.filter((item) => item.direction === "negative");
  const positive = signals.filter((item) => item.direction === "positive");
  const insufficient = signals.filter((item) => item.direction === "neutral" && item.category === "data_quality");

  if (negative.some((item) => item.severity === "critical")) {
    return "off_track";
  }

  if (negative.length > positive.length) {
    return "worsening";
  }

  if (positive.length > 0 && negative.length === 0) {
    return "on_track";
  }

  if (positive.length > negative.length) {
    return "improving";
  }

  if (insufficient.length > 0 && positive.length === 0 && negative.length === 0) {
    return "insufficient_data";
  }

  return "stable";
}

function getSummary(goal: GoalBlock | null, status: GoalProgressStatus, positives: GoalProgressSignal[], negatives: GoalProgressSignal[], insufficient: GoalProgressSignal[]) {
  if (!goal) {
    return "Sin objetivo activo: la página puede preparar contexto, pero no evaluar progreso hacia un bloque concreto.";
  }

  if (status === "off_track" || status === "worsening") {
    return `${goal.title}: hay más señales que frenan que señales a favor. La lectura principal está en ${negatives[0]?.label.toLowerCase() ?? "las señales en contra"}.`;
  }

  if (status === "on_track" || status === "improving") {
    return `${goal.title}: las señales disponibles acercan el bloque al objetivo. La señal más clara es ${positives[0]?.label.toLowerCase() ?? "la consistencia registrada"}.`;
  }

  if (status === "insufficient_data" || insufficient.length > positives.length + negatives.length) {
    return `${goal.title}: faltan datos para afirmar progreso con confianza. Lo más útil ahora es mejorar la calidad del contexto del check diario.`;
  }

  return `${goal.title}: lectura estable con señales mixtas. Conviene usar el contexto para decidir el ajuste diario fuera de la app.`;
}

export function getGoalProgressSummary({
  activeGoal,
  sessions,
  dailyEntries = [],
  bodyChecks = [],
  nutritionChecks = [],
  plannedSessions = [],
  referenceDate = new Date(),
}: {
  activeGoal: GoalBlock | null;
  sessions: TrainingSession[];
  dailyEntries?: DailyEntry[];
  bodyChecks?: BodyCheck[];
  nutritionChecks?: NutritionCheck[];
  plannedSessions?: PlannedSession[];
  referenceDate?: Date;
}): GoalProgressSummary {
  const periodLabel = getWeekLabel(referenceDate);
  const metrics = getWeeklyMetrics({ sessions, dailyEntries, bodyChecks, nutritionChecks, plannedSessions, referenceDate });
  const allSignals = [
    ...(activeGoal ? buildProfileSignals(activeGoal, metrics) : []),
    ...buildBaseSignals(metrics, activeGoal),
  ];
  const positiveSignals = allSignals.filter((item) => item.direction === "positive");
  const negativeSignals = allSignals.filter((item) => item.direction === "negative");
  const insufficientData = allSignals.filter((item) => item.direction === "neutral");
  const progressItems = [
    signal({
      id: "body-progress",
      label: "Progreso corporal",
      category: "body",
      direction: metrics.bodyTrend.waistDeltaCm !== null || metrics.bodyTrend.weightDeltaKg !== null ? "positive" : "neutral",
      severity: metrics.bodyTrend.waistDeltaCm !== null || metrics.bodyTrend.weightDeltaKg !== null ? "positive" : "info",
      valueLabel: metrics.bodyTrend.waistDeltaCm !== null ? formatDelta(metrics.bodyTrend.waistDeltaCm, "cm cintura") : undefined,
      evidence: metrics.bodyTrend.waistDeltaCm !== null || metrics.bodyTrend.weightDeltaKg !== null
        ? `Body checks disponibles: peso ${metrics.bodyTrend.weightDeltaKg === null ? "sin tendencia" : formatDelta(metrics.bodyTrend.weightDeltaKg, "kg")}, cintura ${metrics.bodyTrend.waistDeltaCm === null ? "sin tendencia" : formatDelta(metrics.bodyTrend.waistDeltaCm, "cm")}.`
        : "No hay suficientes body checks semanales para medir cambio corporal.",
      checkInRelevance: "high",
    }),
    signal({
      id: "training-progress",
      label: "Progreso de entrenamiento",
      category: "training",
      direction: metrics.sessions.length > 0 ? "positive" : "neutral",
      severity: metrics.sessions.length > 0 ? "positive" : "info",
      valueLabel: `${metrics.sessions.length} sesiones`,
      evidence: `${metrics.sessions.length} sesiones, ${formatKm(metrics.totalRunMeters, { forceKm: true })} de carrera total y ${metrics.strengthSessions} estímulos de fuerza.`,
      checkInRelevance: "high",
    }),
    signal({
      id: "habit-progress",
      label: "Hábitos y soporte",
      category: "mobility",
      direction: metrics.mobilityDays >= 3 ? "positive" : "neutral",
      severity: metrics.mobilityDays >= 3 ? "positive" : "info",
      valueLabel: `${metrics.mobilityDays} días`,
      evidence: `${metrics.mobilityDays} días de movilidad registrados y ${metrics.dailyEntries.length} entradas de Daily Plan.`,
      checkInRelevance: "medium",
    }),
    signal({
      id: "data-quality-progress",
      label: "Calidad de datos",
      category: "data_quality",
      direction: metrics.partialSessions === 0 && metrics.sessions.length > 0 ? "positive" : "neutral",
      severity: metrics.partialSessions === 0 && metrics.sessions.length > 0 ? "positive" : "info",
      valueLabel: `${metrics.partialSessions} parciales`,
      evidence: metrics.sessions.length > 0
        ? `${metrics.partialSessions}/${metrics.sessions.length} sesiones parciales; body checks ${metrics.bodyChecks.length}; nutrition checks ${metrics.nutritionChecks.length}.`
        : "Sin sesiones en la semana, la calidad de datos depende del próximo registro.",
      checkInRelevance: "medium",
    }),
  ];
  const overallStatus = getOverallStatus([...positiveSignals, ...negativeSignals, ...insufficientData]);
  const profileMeta = activeGoal ? getGoalProfileMeta(activeGoal.profile) : null;

  return {
    goalId: activeGoal?.id ?? null,
    goalTitle: activeGoal?.title ?? null,
    periodLabel,
    overallStatus,
    summary: getSummary(activeGoal, overallStatus, positiveSignals, negativeSignals, insufficientData),
    progressItems,
    positiveSignals,
    negativeSignals,
    insufficientData,
    checkInContext: buildCheckInContext({
      goalTitle: activeGoal?.title ?? null,
      goalProfileLabel: profileMeta?.title ?? null,
      periodLabel,
      sessions: metrics.sessions,
      dailyEntries: metrics.dailyEntries,
      positiveSignals,
      negativeSignals,
      insufficientData,
    }),
  };
}
