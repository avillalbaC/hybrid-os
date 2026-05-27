import type {
  MuscleName,
  SessionMuscleSummary,
  TrainingAlert,
  TrainingSession,
  TrainingSessionType,
  WeeklyMuscleBalance,
  WeeklyTrainingLoad,
} from "@/types/training";

export const muscleNames: MuscleName[] = [
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "hipFlexors",
  "adductors",
  "core",
  "lowerBack",
  "lats",
  "upperBack",
  "traps",
  "shoulders",
  "chest",
  "triceps",
  "biceps",
  "forearms",
];

export type MuscleTotal = {
  muscle: MuscleName;
  loadScore: number;
};

export function createEmptyMuscleSummary(): SessionMuscleSummary {
  return Object.fromEntries(muscleNames.map((muscle) => [muscle, 0])) as SessionMuscleSummary;
}

export function getCompletedSessions(sessions: TrainingSession[]) {
  return sessions.filter((session) => session.status === "completed" || session.status === "partial").length;
}

export function getTotalDuration(sessions: TrainingSession[]) {
  return sessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0);
}

export function getAverageRpe(sessions: TrainingSession[]) {
  const sessionsWithRpe = sessions.filter((session) => typeof session.rpe === "number" && session.rpe > 0);

  if (sessionsWithRpe.length === 0) {
    return 0;
  }

  const total = sessionsWithRpe.reduce((sum, session) => sum + (session.rpe ?? 0), 0);
  return Number((total / sessionsWithRpe.length).toFixed(1));
}

export function calculateWeeklyRunningVolume(sessions: TrainingSession[]) {
  return sessions.reduce((total, session) => total + session.sessionMetrics.totalRunMeters, 0);
}

export function getRunningKm(sessions: TrainingSession[]) {
  return Number((calculateWeeklyRunningVolume(sessions) / 1000).toFixed(1));
}

export function calculateSessionMuscleSummary(session: TrainingSession): SessionMuscleSummary {
  const summary = createEmptyMuscleSummary();

  session.blocks.forEach((block) => {
    block.exercises.forEach((exercise) => {
      exercise.muscleLoad.forEach((entry) => {
        summary[entry.muscle] += entry.load;
      });
    });
  });

  return summary;
}

export function calculateWeeklyMuscleLoad(sessions: TrainingSession[]): SessionMuscleSummary {
  const summary = createEmptyMuscleSummary();

  sessions.forEach((session) => {
    muscleNames.forEach((muscle) => {
      summary[muscle] += session.sessionMuscleSummary[muscle] ?? 0;
    });
  });

  return summary;
}

export function getTopMuscles(sessions: TrainingSession[], limit = 5): MuscleTotal[] {
  const totals = calculateWeeklyMuscleLoad(sessions);

  return muscleNames
    .map((muscle) => ({ muscle, loadScore: totals[muscle] }))
    .filter((entry) => entry.loadScore > 0)
    .sort((a, b) => b.loadScore - a.loadScore)
    .slice(0, limit);
}

export const calculateRunningKm = getRunningKm;
export const calculateAverageRpe = getAverageRpe;
export const calculateTotalDuration = getTotalDuration;
export const calculateMuscleLoadRanking = getTopMuscles;

export function getSessionsByType(sessions: TrainingSession[]): Partial<Record<TrainingSessionType, number>>;
export function getSessionsByType(sessions: TrainingSession[], type: TrainingSessionType): TrainingSession[];
export function getSessionsByType(sessions: TrainingSession[], type?: TrainingSessionType) {
  if (type) {
    return sessions.filter((session) => session.type === type);
  }

  return sessions.reduce(
    (result, session) => {
      result[session.type] = (result[session.type] ?? 0) + 1;
      return result;
    },
    {} as Partial<Record<TrainingSessionType, number>>,
  );
}

export function getSessionsByMuscle(sessions: TrainingSession[], muscle: MuscleName) {
  return sessions.filter((session) => (session.sessionMuscleSummary[muscle] ?? 0) > 0);
}

export function getRecentSessions(sessions: TrainingSession[], limit = 4) {
  return [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getHardSessionsCount(sessions: TrainingSession[]) {
  return sessions.filter(
    (session) => (session.rpe ?? 0) >= 8 || session.sessionMetrics.fatigueCost >= 75 || session.sessionMetrics.impactScore >= 75,
  ).length;
}

export function getWeekKey(date: string) {
  const current = new Date(`${date}T00:00:00`);
  const day = current.getDay() || 7;
  current.setDate(current.getDate() + 4 - day);
  const yearStart = new Date(current.getFullYear(), 0, 1);
  const week = Math.ceil(((current.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${current.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function getSessionsByWeek(sessions: TrainingSession[]) {
  return sessions.reduce<Record<string, TrainingSession[]>>((weeks, session) => {
    const weekKey = getWeekKey(session.date);
    weeks[weekKey] = [...(weeks[weekKey] ?? []), session];
    return weeks;
  }, {});
}

export function calculateWeeklyTrainingStats(sessions: TrainingSession[]): WeeklyTrainingLoad {
  const weekKey = sessions[0] ? getWeekKey(sessions[0].date) : "empty";

  return {
    weekKey,
    sessions: sessions.length,
    hardSessions: getHardSessionsCount(sessions),
    durationMinutes: getTotalDuration(sessions),
    runMeters: calculateWeeklyRunningVolume(sessions),
    bikeMeters: sessions.reduce((total, session) => total + session.sessionMetrics.totalBikeMeters, 0),
    rowMeters: sessions.reduce((total, session) => total + session.sessionMetrics.totalRowMeters, 0),
    skiMeters: sessions.reduce((total, session) => total + session.sessionMetrics.totalSkiMeters, 0),
    externalLoadKg: sessions.reduce((total, session) => total + (session.sessionMetrics.totalExternalLoadKg ?? 0), 0),
    impactScore: sessions.reduce((total, session) => total + session.sessionMetrics.impactScore, 0),
    cardioLoad: sessions.reduce((total, session) => total + session.sessionMetrics.cardioLoad, 0),
    strengthLoad: sessions.reduce((total, session) => total + session.sessionMetrics.strengthLoad, 0),
    technicalLoad: sessions.reduce((total, session) => total + session.sessionMetrics.technicalLoad, 0),
    fatigueCost: sessions.reduce((total, session) => total + session.sessionMetrics.fatigueCost, 0),
  };
}

export function detectWeeklyLoadSpikes(currentWeek: WeeklyTrainingLoad, previousWeek: WeeklyTrainingLoad): TrainingAlert[] {
  const alerts: TrainingAlert[] = [];
  const previousRunMeters = previousWeek.runMeters || 1;
  const runIncrease = (currentWeek.runMeters - previousWeek.runMeters) / previousRunMeters;

  if (currentWeek.runMeters > 0 && runIncrease > 0.2) {
    alerts.push({
      level: "yellow",
      title: "Subida de carrera semanal",
      factors: [`${previousWeek.runMeters}m -> ${currentWeek.runMeters}m`],
      recommendation: "Mantener la siguiente semana estable o subir menos del 10%.",
    });
  }

  if (currentWeek.hardSessions > 3) {
    alerts.push({
      level: "yellow",
      title: "Más de 3 sesiones duras esta semana",
      factors: [`${currentWeek.hardSessions} sesiones duras`],
      recommendation: "Separar sesiones de alto impacto y priorizar recuperación entre ellas.",
    });
  }

  if (currentWeek.fatigueCost >= 300) {
    alerts.push({
      level: "yellow",
      title: "FatigueCost semanal alto",
      factors: [`FatigueCost ${currentWeek.fatigueCost}`],
      recommendation: "Reducir volumen accesorio o intensidad si aparecen molestias.",
    });
  }

  if (currentWeek.impactScore >= 220 && previousWeek.impactScore >= 220) {
    alerts.push({
      level: "yellow",
      title: "ImpactScore alto dos semanas seguidas",
      factors: [`Actual ${currentWeek.impactScore}`, `Anterior ${previousWeek.impactScore}`],
      recommendation: "Evitar añadir carrera intensa o pliometría pesada 48 h.",
    });
  }

  return alerts;
}

export function detectMuscleImbalances(weeklyMuscleLoad: SessionMuscleSummary): WeeklyMuscleBalance {
  const values = muscleNames.map((muscle) => weeklyMuscleLoad[muscle]);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length || 0;

  return {
    weekKey: "current",
    muscles: weeklyMuscleLoad,
    overloaded: muscleNames.filter((muscle) => weeklyMuscleLoad[muscle] >= Math.max(70, average * 1.6)),
    neglected: muscleNames.filter((muscle) => weeklyMuscleLoad[muscle] <= Math.max(5, average * 0.25)),
  };
}

export function compareWeeks(currentWeek: TrainingSession[], previousWeek: TrainingSession[]) {
  const current = calculateWeeklyTrainingStats(currentWeek);
  const previous = calculateWeeklyTrainingStats(previousWeek);

  return {
    current,
    previous,
    alerts: detectWeeklyLoadSpikes(current, previous),
    muscleBalance: detectMuscleImbalances(calculateWeeklyMuscleLoad(currentWeek)),
  };
}

export function getMovementBalance(sessions: TrainingSession[]) {
  const topMuscles = getTopMuscles(sessions, 100);
  const loadFor = (muscles: MuscleName[]) =>
    topMuscles
      .filter((entry) => muscles.includes(entry.muscle))
      .reduce((total, entry) => total + entry.loadScore, 0);

  const push = loadFor(["chest", "shoulders", "triceps", "quadriceps", "glutes"]);
  const pull = loadFor(["lats", "upperBack", "biceps", "forearms", "traps", "hamstrings"]);
  const lower = loadFor(["quadriceps", "hamstrings", "glutes", "calves", "hipFlexors", "lowerBack"]);
  const upper = loadFor(["chest", "shoulders", "triceps", "lats", "upperBack", "biceps", "forearms", "traps"]);
  const anterior = loadFor(["quadriceps", "hipFlexors", "core", "chest", "shoulders", "triceps"]);
  const posterior = loadFor(["hamstrings", "glutes", "calves", "lats", "upperBack", "lowerBack", "traps"]);

  const percent = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

  return {
    push: percent(push, push + pull),
    pull: percent(pull, push + pull),
    lower: percent(lower, lower + upper),
    upper: percent(upper, lower + upper),
    anterior: percent(anterior, anterior + posterior),
    posterior: percent(posterior, anterior + posterior),
  };
}
