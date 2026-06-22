import { formatRelativeWeekLabel, getCurrentWeekStartLocal, getWeekStartDateKey } from "@/lib/date/week-labels";
import { getPeriodRange, isDateInRange } from "@/lib/domain/dashboard/periods";
import { getStructuredRunningMeters, getTotalRunExposureMeters } from "@/lib/domain/training/run-exposure";
import { formatMuscleName } from "@/lib/utils/format";
import type { DailyEntry } from "@/types/daily";
import type { GoalBlock, GoalEvaluation, GoalEvaluationItem, GoalEvaluationStatus, GoalTargetRange } from "@/types/goals";
import type { TrainingSession } from "@/types/training";

type WeeklyGoalMetrics = {
  structuredRunSessions: number;
  structuredRunKm: number;
  totalRunExposureKm: number;
  hyroxSessions: number;
  strengthSessions: number;
  mobilityDays: number | null;
  highIntensitySessions: number | null;
  averageRpe: number | null;
  totalDurationMinutes: number | null;
  watchedMuscles: Array<{ muscle: string; load: number; isHigh: boolean }>;
};

const metricLabels: Record<keyof NonNullable<GoalBlock["targets"]["weekly"]>, string> = {
  structuredRunSessions: "Running estructurado",
  structuredRunKm: "Kilómetros running",
  totalRunExposureKm: "Exposición total carrera",
  hyroxSessions: "Sesiones HYROX",
  strengthSessions: "Sesiones fuerza",
  mobilityDays: "Días de movilidad",
  highIntensitySessions: "Sesiones alta intensidad",
  averageRpe: "RPE medio",
  totalDurationMinutes: "Duración total",
};

function getWeekLabel(referenceDate: Date) {
  const range = getPeriodRange("week", referenceDate);

  if (!range) {
    return "Semana en curso";
  }

  return formatRelativeWeekLabel(getWeekStartDateKey(range.start), getCurrentWeekStartLocal());
}

function getWeekSessions(sessions: TrainingSession[], referenceDate: Date) {
  const range = getPeriodRange("week", referenceDate);

  if (!range) {
    return [];
  }

  return sessions.filter((session) => isDateInRange(session.date, range));
}

function getMobilityDays(sessions: TrainingSession[], dailyEntries: DailyEntry[] | undefined, referenceDate: Date) {
  const range = getPeriodRange("week", referenceDate);

  if (!range) {
    return null;
  }

  const days = new Set<string>();

  for (const session of sessions) {
    const isMobilitySession = session.type === "movilidad" || session.subtypes.includes("mobility");

    if (isMobilitySession && isDateInRange(session.date, range)) {
      days.add(session.date);
    }
  }

  if (dailyEntries) {
    for (const entry of dailyEntries) {
      if (entry.mobilityDone && isDateInRange(entry.entryDate, range)) {
        days.add(entry.entryDate);
      }
    }
  }

  if (days.size === 0 && !dailyEntries) {
    return sessions.some((session) => session.type === "movilidad" || session.subtypes.includes("mobility")) ? 0 : null;
  }

  return days.size;
}

function isStrengthSession(session: TrainingSession) {
  return (
    session.type === "fuerza" ||
    session.type === "halterofilia" ||
    session.subtypes.includes("strength") ||
    session.subtypes.includes("weightlifting")
  );
}

function isHyroxSession(session: TrainingSession) {
  return session.type === "hyrox" || session.subtypes.includes("hyrox" as never);
}

function getWatchedMuscles(sessions: TrainingSession[], muscles: string[]) {
  if (muscles.length === 0) {
    return [];
  }

  const totals = new Map<string, number>();
  let highestLoad = 0;

  for (const session of sessions) {
    for (const [muscle, load] of Object.entries(session.sessionMuscleSummary)) {
      const nextLoad = (totals.get(muscle) ?? 0) + load;
      totals.set(muscle, nextLoad);
      highestLoad = Math.max(highestLoad, nextLoad);
    }
  }

  const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
  const topMuscles = new Set(sorted.slice(0, 5).map(([muscle]) => muscle));
  const highLoadThreshold = highestLoad * 0.7;

  return muscles
    .map((muscle) => {
      const load = totals.get(muscle) ?? 0;
      return {
        muscle,
        load,
        isHigh: load > 0 && (topMuscles.has(muscle) || load >= highLoadThreshold),
      };
    })
    .filter((item) => item.load > 0);
}

function getWeeklyGoalMetrics(sessions: TrainingSession[], dailyEntries: DailyEntry[] | undefined, goal: GoalBlock, referenceDate: Date): WeeklyGoalMetrics {
  const weekSessions = getWeekSessions(sessions, referenceDate);
  const rpeValues = weekSessions.map((session) => session.rpe).filter((value): value is number => typeof value === "number" && value > 0);
  const durationValues = weekSessions.map((session) => session.durationMinutes).filter((value): value is number => typeof value === "number" && value > 0);

  return {
    structuredRunSessions: weekSessions.filter((session) => session.type === "running").length,
    structuredRunKm: getStructuredRunningMeters(weekSessions) / 1000,
    totalRunExposureKm: getTotalRunExposureMeters(weekSessions) / 1000,
    hyroxSessions: weekSessions.filter(isHyroxSession).length,
    strengthSessions: weekSessions.filter(isStrengthSession).length,
    mobilityDays: getMobilityDays(weekSessions, dailyEntries, referenceDate),
    highIntensitySessions: rpeValues.length > 0 ? weekSessions.filter((session) => (session.rpe ?? 0) >= 8).length : null,
    averageRpe: rpeValues.length > 0 ? rpeValues.reduce((total, value) => total + value, 0) / rpeValues.length : null,
    totalDurationMinutes: durationValues.length > 0 ? durationValues.reduce((total, value) => total + value, 0) : null,
    watchedMuscles: getWatchedMuscles(weekSessions, goal.targets.watch?.muscles ?? []),
  };
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getTargetLabel(range: GoalTargetRange) {
  const unit = range.unit ? ` ${range.unit}` : "";

  if (typeof range.min === "number" && typeof range.max === "number") {
    return `${formatNumber(range.min)}-${formatNumber(range.max)}${unit}`;
  }

  if (typeof range.target === "number" && typeof range.max === "number") {
    return `${formatNumber(range.target)} objetivo · máx. ${formatNumber(range.max)}${unit}`;
  }

  if (typeof range.min === "number" && typeof range.target === "number") {
    return `${formatNumber(range.min)} mín. · objetivo ${formatNumber(range.target)}${unit}`;
  }

  if (typeof range.target === "number") {
    return `${formatNumber(range.target)}${unit}`;
  }

  if (typeof range.min === "number") {
    return `mín. ${formatNumber(range.min)}${unit}`;
  }

  if (typeof range.max === "number") {
    return `máx. ${formatNumber(range.max)}${unit}`;
  }

  return "Sin target";
}

function getStatusForRange(value: number | null, range: GoalTargetRange): GoalEvaluationStatus {
  if (value === null) {
    return "insufficient_data";
  }

  if (typeof range.min === "number" && value < range.min) {
    return "under_target";
  }

  if (typeof range.max === "number" && value > range.max) {
    return "over_target";
  }

  return "on_track";
}

function getSeverity(status: GoalEvaluationStatus, value: number | null, range: GoalTargetRange, profile: GoalBlock["profile"]): GoalEvaluationItem["severity"] {
  if (status === "on_track") {
    return "positive";
  }

  if (status === "insufficient_data" || status === "neutral") {
    return "info";
  }

  if (status === "over_target" && value !== null && typeof range.max === "number") {
    const criticalMultiplier = profile === "deload" ? 1.1 : 1.25;
    return value >= range.max * criticalMultiplier ? "critical" : "warning";
  }

  return "warning";
}

function getRecommendation(id: keyof NonNullable<GoalBlock["targets"]["weekly"]>, status: GoalEvaluationStatus) {
  if (status === "on_track") {
    return undefined;
  }

  if (id === "structuredRunSessions" || id === "structuredRunKm") {
    return status === "under_target"
      ? "Prioriza una sesión Z2 corta antes de añadir otro estímulo intenso."
      : "No sumes más impacto esta semana salvo que sea muy suave.";
  }

  if (id === "totalRunExposureKm") {
    return "No sumes más impacto esta semana salvo que sea muy suave.";
  }

  if (id === "mobilityDays") {
    return "Añade 8-10 minutos de movilidad hoy y márcalo en el Plan diario.";
  }

  if (id === "hyroxSessions") {
    return "Evita otra sesión mixta intensa hasta recuperar gemelos/cuádriceps.";
  }

  if (id === "strengthSessions") {
    return "Mete un estímulo básico de fuerza si la recuperación lo permite.";
  }

  if (id === "highIntensitySessions" || id === "averageRpe") {
    return "Baja la siguiente sesión a control técnico o zona cómoda.";
  }

  if (id === "totalDurationMinutes") {
    return status === "under_target" ? "Suma volumen fácil antes de buscar intensidad." : "Recorta extras y protege la recuperación del bloque.";
  }

  return undefined;
}

function getExplanation(label: string, value: number | null, range: GoalTargetRange, status: GoalEvaluationStatus) {
  if (value === null) {
    return `Faltan datos suficientes para evaluar ${label.toLowerCase()} contra el objetivo.`;
  }

  if (status === "under_target") {
    return `${label} va por debajo del mínimo semanal (${formatNumber(value)} / ${getTargetLabel(range)}).`;
  }

  if (status === "over_target") {
    return `${label} supera el máximo recomendado (${formatNumber(value)} / ${getTargetLabel(range)}).`;
  }

  return `${label} está dentro del rango del bloque (${formatNumber(value)} / ${getTargetLabel(range)}).`;
}

function getGoalSummary(goal: GoalBlock, items: GoalEvaluationItem[]) {
  const critical = items.filter((item) => item.severity === "critical");
  const warnings = items.filter((item) => item.severity === "warning");
  const positives = items.filter((item) => item.severity === "positive");

  if (critical.length > 0) {
    return `${goal.title}: ${critical[0].label.toLowerCase()} está claramente fuera del rango del bloque.`;
  }

  if (warnings.length > 0) {
    return `${goal.title}: ${warnings.slice(0, 2).map((item) => item.label.toLowerCase()).join(" y ")} necesita ajuste esta semana.`;
  }

  if (positives.length > 0) {
    return `${goal.title}: las métricas principales disponibles están alineadas con el objetivo.`;
  }

  return `${goal.title}: faltan datos para una lectura prescriptiva completa.`;
}

function getOverallStatus(items: GoalEvaluationItem[]): GoalEvaluationStatus {
  if (items.some((item) => item.severity === "critical")) {
    return "risk";
  }

  if (items.some((item) => item.status === "over_target")) {
    return "over_target";
  }

  if (items.some((item) => item.status === "under_target")) {
    return "under_target";
  }

  if (items.length > 0 && items.every((item) => item.status === "insufficient_data")) {
    return "insufficient_data";
  }

  if (items.some((item) => item.status === "on_track")) {
    return "on_track";
  }

  return "neutral";
}

function getDecision(items: GoalEvaluationItem[]): GoalEvaluation["recommendedDecision"] {
  const critical = items.find((item) => item.severity === "critical");
  const warning = items.find((item) => item.severity === "warning");
  const target = critical ?? warning;

  if (!target) {
    return {
      title: "Mantener el bloque",
      description: "No hay desviaciones principales con los datos disponibles. Mantén el plan y registra RPE, duración y movilidad.",
      priority: "low",
    };
  }

  return {
    title: target.status === "over_target" ? "Contener carga" : "Cerrar el mínimo útil",
    description: target.recommendation ?? target.explanation,
    priority: critical ? "high" : "medium",
  };
}

function buildRangeItem(
  id: keyof NonNullable<GoalBlock["targets"]["weekly"]>,
  value: number | null,
  range: GoalTargetRange,
  goal: GoalBlock,
): GoalEvaluationItem {
  const label = metricLabels[id];
  const status = getStatusForRange(value, range);
  const severity = getSeverity(status, value, range, goal.profile);

  return {
    id,
    label,
    currentValue: value,
    targetLabel: getTargetLabel(range),
    status,
    severity,
    explanation: getExplanation(label, value, range, status),
    recommendation: getRecommendation(id, status),
  };
}

function buildWatchItems(metrics: WeeklyGoalMetrics): GoalEvaluationItem[] {
  return metrics.watchedMuscles
    .filter((item) => item.isHigh)
    .map((item) => ({
      id: `watch-${item.muscle}`,
      label: `${formatMuscleName(item.muscle)} en vigilancia`,
      currentValue: item.load,
      targetLabel: "No aparecer como carga dominante",
      status: "risk" as const,
      severity: "warning" as const,
      explanation: `${formatMuscleName(item.muscle)} aparece entre las cargas relevantes de la semana (${Math.round(item.load)} pts).`,
      recommendation: "Evita añadir impacto o intensidad local hasta comprobar sensaciones.",
    }));
}

export function evaluateGoalBlock({
  activeGoal,
  sessions,
  dailyEntries,
  referenceDate = new Date(),
}: {
  activeGoal: GoalBlock | null;
  sessions: TrainingSession[];
  dailyEntries?: DailyEntry[];
  referenceDate?: Date;
}): GoalEvaluation {
  const periodLabel = getWeekLabel(referenceDate);

  if (!activeGoal) {
    return {
      goal: null,
      periodLabel,
      overallStatus: "neutral",
      summary: "No hay objetivo activo. Las lecturas son descriptivas, no prescriptivas.",
      items: [],
      recommendedDecision: {
        title: "Crear objetivo activo",
        description: "Define un bloque para que las recomendaciones tengan contexto.",
        priority: "low",
      },
    };
  }

  const metrics = getWeeklyGoalMetrics(sessions, dailyEntries, activeGoal, referenceDate);
  const weeklyTargets = activeGoal.targets.weekly ?? {};
  const items: GoalEvaluationItem[] = [];

  for (const key of Object.keys(weeklyTargets) as Array<keyof typeof weeklyTargets>) {
    const range = weeklyTargets[key];

    if (!range) {
      continue;
    }

    items.push(buildRangeItem(key, metrics[key], range, activeGoal));
  }

  items.push(...buildWatchItems(metrics));

  const recompositionMobilityWarning = activeGoal.profile === "recomposition" &&
    (metrics.mobilityDays ?? 0) < 3 &&
    (metrics.highIntensitySessions ?? 0) >= 3;

  if (recompositionMobilityWarning) {
    items.push({
      id: "recomposition-mobility-intensity",
      label: "Movilidad baja + intensidad",
      currentValue: metrics.mobilityDays,
      targetLabel: "Movilidad 3-4 días con intensidad controlada",
      status: "risk",
      severity: "warning",
      explanation: "Para recomposición, intensidad alta con poca movilidad reduce margen de recuperación.",
      recommendation: "Movilidad registrada por debajo de la referencia junto a intensidad alta.",
    });
  }

  return {
    goal: activeGoal,
    periodLabel,
    overallStatus: getOverallStatus(items),
    summary: getGoalSummary(activeGoal, items),
    items,
    recommendedDecision: getDecision(items),
  };
}
