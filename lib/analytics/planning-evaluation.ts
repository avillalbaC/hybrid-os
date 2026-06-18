import { getPeriodRange } from "@/lib/domain/dashboard/periods";
import { getTotalRunExposureMeters } from "@/lib/domain/training/run-exposure";
import type { DailyEntry } from "@/types/daily";
import type { GoalBlock } from "@/types/goals";
import type { PlannedSession, PlannedSessionType, WeeklyPlanDeviation, WeeklyPlanSummary } from "@/types/planning";
import type { TrainingSession } from "@/types/training";

type PlannedSessionMatch = {
  plannedSession: PlannedSession;
  matchedTrainingSession: TrainingSession | null;
  isCompleted: boolean;
  reason: "manual" | "training_session" | "daily_mobility" | "rest_day" | "not_completed";
};

export type WeeklyPlanningEvaluation = {
  summary: WeeklyPlanSummary;
  matches: PlannedSessionMatch[];
  unplannedSessions: TrainingSession[];
  weekTrainingSessions: TrainingSession[];
  dailyEntries: DailyEntry[];
};

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getPlanningWeekBounds(referenceDate = new Date()) {
  const range = getPeriodRange("week", referenceDate);

  if (!range) {
    const today = formatLocalDate(referenceDate);
    return { weekStart: today, weekEnd: today };
  }

  return {
    weekStart: formatLocalDate(range.start),
    weekEnd: formatLocalDate(range.end),
  };
}

function isSessionTypeMatch(plannedType: PlannedSessionType, session: TrainingSession) {
  if (plannedType === "descanso") {
    return false;
  }

  if (plannedType === session.type) {
    return true;
  }

  if (plannedType === "fuerza") {
    return session.type === "halterofilia" || session.subtypes.includes("strength") || session.subtypes.includes("weightlifting");
  }

  if (plannedType === "movilidad") {
    return session.type === "movilidad" || session.subtypes.includes("mobility");
  }

  return false;
}

function isHardSession(session: TrainingSession) {
  return (session.rpe ?? 0) >= 8 || session.sessionMetrics.impactScore >= 80 || session.sessionMetrics.fatigueCost >= 85;
}

function hasDailyMobility(date: string, dailyEntries: DailyEntry[]) {
  return dailyEntries.some((entry) => entry.entryDate === date && entry.mobilityDone);
}

function countByType(items: Array<{ type: string }>) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1;
    return acc;
  }, {});
}

function getWeekItems<T extends { plannedDate?: string; date?: string; entryDate?: string }>(
  items: T[],
  weekStart: string,
  weekEnd: string,
  getDate: (item: T) => string,
) {
  return items.filter((item) => {
    const date = getDate(item);
    return date >= weekStart && date <= weekEnd;
  });
}

function matchPlannedSession(plannedSession: PlannedSession, sessions: TrainingSession[], dailyEntries: DailyEntry[]): PlannedSessionMatch {
  if (plannedSession.status === "completed") {
    return {
      plannedSession,
      matchedTrainingSession: plannedSession.matchedTrainingSessionId
        ? sessions.find((session) => session.id === plannedSession.matchedTrainingSessionId) ?? null
        : null,
      isCompleted: true,
      reason: "manual",
    };
  }

  if (plannedSession.status === "skipped" || plannedSession.status === "cancelled" || plannedSession.status === "moved") {
    return {
      plannedSession,
      matchedTrainingSession: null,
      isCompleted: false,
      reason: "not_completed",
    };
  }

  const sameDaySessions = sessions.filter((session) => session.date === plannedSession.plannedDate);

  if (plannedSession.type === "movilidad" && hasDailyMobility(plannedSession.plannedDate, dailyEntries)) {
    return {
      plannedSession,
      matchedTrainingSession: null,
      isCompleted: true,
      reason: "daily_mobility",
    };
  }

  if (plannedSession.type === "descanso") {
    return {
      plannedSession,
      matchedTrainingSession: null,
      isCompleted: !sameDaySessions.some(isHardSession),
      reason: !sameDaySessions.some(isHardSession) ? "rest_day" : "not_completed",
    };
  }

  const matchedTrainingSession = sameDaySessions.find((session) => isSessionTypeMatch(plannedSession.type, session)) ?? null;

  return {
    plannedSession,
    matchedTrainingSession,
    isCompleted: matchedTrainingSession !== null,
    reason: matchedTrainingSession ? "training_session" : "not_completed",
  };
}

function getUnplannedSessions(sessions: TrainingSession[], matches: PlannedSessionMatch[]) {
  const matchedIds = new Set(matches.map((match) => match.matchedTrainingSession?.id).filter(Boolean));

  return sessions.filter((session) => !matchedIds.has(session.id));
}

function addDeviation(deviations: WeeklyPlanDeviation[], deviation: WeeklyPlanDeviation) {
  if (deviations.some((item) => item.id === deviation.id)) {
    return;
  }

  deviations.push(deviation);
}

function buildDeviations({
  activeGoal,
  matches,
  plannedSessions,
  unplannedSessions,
  weekTrainingSessions,
  dailyEntries,
}: {
  activeGoal: GoalBlock | null;
  matches: PlannedSessionMatch[];
  plannedSessions: PlannedSession[];
  unplannedSessions: TrainingSession[];
  weekTrainingSessions: TrainingSession[];
  dailyEntries: DailyEntry[];
}) {
  const deviations: WeeklyPlanDeviation[] = [];
  const missingRunning = matches.some((match) => match.plannedSession.type === "running" && !match.isCompleted);
  const missingStrength = matches.some((match) => match.plannedSession.type === "fuerza" && !match.isCompleted);
  const missedMobility = matches.some((match) => match.plannedSession.type === "movilidad" && !match.isCompleted);
  const unplannedHighIntensity = unplannedSessions.some(isHardSession);
  const extraRunExposureMeters = getTotalRunExposureMeters(unplannedSessions);
  const unplannedHyrox = unplannedSessions.some((session) => session.type === "hyrox");
  const mobilityDays = new Set(dailyEntries.filter((entry) => entry.mobilityDone).map((entry) => entry.entryDate)).size +
    weekTrainingSessions.filter((session) => session.type === "movilidad" || session.subtypes.includes("mobility")).length;
  const highIntensitySessions = weekTrainingSessions.filter(isHardSession).length;

  if (missingRunning) {
    addDeviation(deviations, {
      id: "planned-running-missing",
      severity: activeGoal?.profile === "running_base" ? "warning" : "info",
      title: "Running planificado pendiente",
      description: "Había running planificado y no aparece una sesión running equivalente ese día.",
      recommendation: "Prioriza un estímulo Z2 corto si la recuperación lo permite.",
    });
  }

  if (missingStrength) {
    addDeviation(deviations, {
      id: "planned-strength-missing",
      severity: activeGoal?.profile === "strength_maintenance" ? "warning" : "info",
      title: "Fuerza por debajo del plan",
      description: "Había fuerza planificada y no aparece una sesión equivalente.",
      recommendation: "Mete un estímulo básico de fuerza antes de sumar más impacto.",
    });
  }

  if (missedMobility) {
    addDeviation(deviations, {
      id: "mobility-missed",
      severity: "warning",
      title: "Movilidad planificada sin marcar",
      description: "Había movilidad prevista y no aparece marcada en Daily Plan ni como sesión.",
      recommendation: "Añade 8-10 minutos hoy y registra movilidad en el Plan diario.",
    });
  }

  if (unplannedHighIntensity) {
    addDeviation(deviations, {
      id: "unplanned-high-intensity",
      severity: activeGoal?.profile === "deload" ? "critical" : "warning",
      title: "Intensidad no planificada",
      description: "Hay una sesión intensa no prevista dentro de la semana.",
      recommendation: "Compensa con baja intensidad o movilidad antes de añadir otro estímulo duro.",
    });
  }

  if (extraRunExposureMeters >= 3000) {
    addDeviation(deviations, {
      id: "extra-impact",
      severity: activeGoal?.profile === "deload" || activeGoal?.profile === "strength_maintenance" ? "warning" : "info",
      title: "Impacto extra no previsto",
      description: `Se acumularon ${(extraRunExposureMeters / 1000).toFixed(1)} km de carrera no previstos.`,
      recommendation: "Evita sumar más impacto salvo que sea muy suave.",
    });
  }

  if (activeGoal?.profile === "deload" && unplannedHyrox) {
    addDeviation(deviations, {
      id: "deload-extra-hyrox",
      severity: "critical",
      title: "Descarga con HYROX extra",
      description: "El bloque es de descarga y apareció una sesión HYROX no planificada.",
      recommendation: "Reduce intensidad el resto de la semana y prioriza recuperación.",
    });
  }

  if (activeGoal?.profile === "recomposition" && mobilityDays < 3 && highIntensitySessions >= 3) {
    addDeviation(deviations, {
      id: "recomposition-low-mobility-high-intensity",
      severity: "warning",
      title: "Movilidad baja con intensidad alta",
      description: "Para recomposición, la combinación de poca movilidad e intensidad alta reduce margen de recuperación.",
      recommendation: "Añade movilidad hoy y evita convertir la próxima sesión en otro estímulo intenso.",
    });
  }

  if (plannedSessions.length === 0) {
    addDeviation(deviations, {
      id: "no-weekly-plan",
      severity: "info",
      title: "No hay plan semanal registrado",
      description: "La lectura de esta semana es descriptiva porque no hay sesiones planificadas.",
      recommendation: "Crea una sesión planificada para comparar intención y ejecución.",
    });
  }

  if (deviations.length === 0) {
    addDeviation(deviations, {
      id: "plan-on-track",
      severity: "positive",
      title: "Plan semanal en curso",
      description: "No hay desviaciones relevantes entre lo planificado y lo realizado.",
      recommendation: "Mantén el plan y registra los cambios si mueves sesiones.",
    });
  }

  return deviations;
}

export function evaluateWeeklyPlan({
  plannedSessions,
  trainingSessions,
  dailyEntries = [],
  activeGoal = null,
  referenceDate = new Date(),
}: {
  plannedSessions: PlannedSession[];
  trainingSessions: TrainingSession[];
  dailyEntries?: DailyEntry[];
  activeGoal?: GoalBlock | null;
  referenceDate?: Date;
}): WeeklyPlanningEvaluation {
  const { weekStart, weekEnd } = getPlanningWeekBounds(referenceDate);
  const weekPlannedSessions = getWeekItems(plannedSessions, weekStart, weekEnd, (item) => item.plannedDate);
  const weekTrainingSessions = getWeekItems(trainingSessions, weekStart, weekEnd, (item) => item.date);
  const weekDailyEntries = getWeekItems(dailyEntries, weekStart, weekEnd, (item) => item.entryDate);
  const matches = weekPlannedSessions.map((plannedSession) => matchPlannedSession(plannedSession, weekTrainingSessions, weekDailyEntries));
  const completedPlannedSessions = matches.filter((match) => match.isCompleted).length;
  const skippedSessions = weekPlannedSessions.filter((session) => session.status === "skipped").length;
  const unplannedSessions = getUnplannedSessions(weekTrainingSessions, matches);
  const plannedByType = countByType(weekPlannedSessions);
  const completedByType = countByType(weekTrainingSessions);
  const adherencePercentage = weekPlannedSessions.length > 0
    ? Math.round((completedPlannedSessions / weekPlannedSessions.length) * 100)
    : null;
  const deviations = buildDeviations({
    activeGoal,
    matches,
    plannedSessions: weekPlannedSessions,
    unplannedSessions,
    weekTrainingSessions,
    dailyEntries: weekDailyEntries,
  });

  return {
    summary: {
      weekStart,
      weekEnd,
      plannedSessions: weekPlannedSessions.length,
      completedPlannedSessions,
      skippedSessions,
      unplannedCompletedSessions: unplannedSessions.length,
      plannedByType,
      completedByType,
      adherencePercentage,
      deviations,
    },
    matches,
    unplannedSessions,
    weekTrainingSessions,
    dailyEntries: weekDailyEntries,
  };
}
