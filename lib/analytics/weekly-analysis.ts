import { formatWeekRangeLabel, getWeekDateRange, getWeekStartDateKey } from "@/lib/date/week-labels";
import { addDays, isDateInRange, parseDashboardDate, startOfWeek, type PeriodRange } from "@/lib/domain/dashboard/periods";
import { calculateMuscleSummary, getTopMuscles } from "@/lib/domain/training/muscle-load";
import { getRunningBreakdown, getSessionRunMeters, getStructuredRunningMeters } from "@/lib/domain/training/run-exposure";
import { formatDuration, formatKm, formatLoadKg, formatMuscleName, formatTrainingType } from "@/lib/utils/format";
import type { PlannedSession, PlannedSessionType } from "@/types/planning";
import type { ProgrammingSession, ProgrammingSessionType } from "@/types/programming";
import type { MuscleName, TrainingSession } from "@/types/training";

export type WeeklyAnalysisMode = "last_closed_week" | "current_week" | "custom_week";
export type WeeklyDisciplineKey =
  | "running"
  | "hyrox"
  | "crossfit"
  | "fuerza"
  | "halterofilia"
  | "gimnasticos"
  | "movilidad"
  | "mixed_other";

export type WeeklyAnalysisRange = {
  mode: WeeklyAnalysisMode;
  selectedWeekMode: WeeklyAnalysisMode;
  selectedWeekStart: string;
  selectedWeekEnd: string;
  selectedWeekLabel: string;
  startDate: string;
  endDate: string;
  label: string;
  displayLabel: string;
  statusLabel: string;
  isClosed: boolean;
};

export type WeeklySummaryMetrics = {
  sessions: number;
  trainingDays: number;
  movementDays: number;
  durationMinutes: number;
  averageRpe: number | null;
  totalRunMeters: number;
  structuredRunMeters: number;
  mixedRunMeters: number;
  fatigueCost: number | null;
  muscleLoad: number | null;
};

export type WeeklyDisciplineSummary = {
  key: WeeklyDisciplineKey;
  label: string;
  sessions: number;
  durationMinutes: number;
  averageRpe: number | null;
  keyMetric: string;
};

export type WeeklyExpectedSummary = {
  hasExpectations: boolean;
  plannedSessions: number;
  programmingSessions: number;
  expectedSessions: number;
  completedSessions: number;
  pendingSessions: number;
  skippedSessions: number;
  adherencePercentage: number | null;
  byDiscipline: Array<{
    key: WeeklyDisciplineKey;
    label: string;
    expected: number;
    completed: number;
  }>;
  message: string | null;
};

export type WeeklyProgressItem = {
  id: string;
  title: string;
  label: "Mejor dato registrado" | "Mejora frente a última referencia" | "Sin comparación suficiente";
  detail: string;
  evidence: string;
};

export type WeeklyLoadIntensity = {
  rpeBuckets: Array<{ key: "low" | "moderate" | "high" | "missing"; label: string; value: number }>;
  loadedDays: Array<{ date: string; label: string; load: number; detail: string }>;
  topMuscles: Array<{ muscle: MuscleName; label: string; load: number }>;
  runningReference: {
    currentMeters: number;
    recentAverageMeters: number | null;
    label: string;
  };
};

export type WeeklySignals = {
  positive: string[];
  review: string[];
  insufficient: string[];
};

export type WeeklyAnalysisReport = {
  range: WeeklyAnalysisRange;
  sessions: TrainingSession[];
  summary: WeeklySummaryMetrics;
  disciplines: WeeklyDisciplineSummary[];
  expected: WeeklyExpectedSummary;
  progress: WeeklyProgressItem[];
  loadIntensity: WeeklyLoadIntensity;
  signals: WeeklySignals;
};

const disciplineOrder: WeeklyDisciplineKey[] = [
  "running",
  "hyrox",
  "crossfit",
  "fuerza",
  "halterofilia",
  "gimnasticos",
  "movilidad",
  "mixed_other",
];

const disciplineLabels: Record<WeeklyDisciplineKey, string> = {
  running: "Running",
  hyrox: "HYROX",
  crossfit: "CrossFit",
  fuerza: "Fuerza",
  halterofilia: "Halterofilia",
  gimnasticos: "Gimnásticos",
  movilidad: "Movilidad",
  mixed_other: "Mixed/other",
};

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getRangeFromWeekStart(weekStart: Date): PeriodRange {
  const start = parseDashboardDate(weekStart);
  const end = addDays(start, 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function getDefaultWeeklyAnalysisMode(referenceDate = new Date()): WeeklyAnalysisMode {
  return referenceDate.getDay() === 1 ? "last_closed_week" : "current_week";
}

function getWeeklyAnalysisStatusLabel(mode: WeeklyAnalysisMode) {
  if (mode === "last_closed_week") {
    return "Última semana cerrada";
  }

  if (mode === "current_week") {
    return "Semana en curso";
  }

  return "Semana seleccionada";
}

export function getWeeklyAnalysisRange(mode: WeeklyAnalysisMode, referenceDate = new Date(), customWeekStart?: string): WeeklyAnalysisRange {
  const currentWeekStart = startOfWeek(referenceDate);
  const weekStart = mode === "last_closed_week"
    ? addDays(currentWeekStart, -7)
    : mode === "custom_week" && customWeekStart
      ? parseDashboardDate(customWeekStart)
      : currentWeekStart;
  const { startDate, endDate } = getWeekDateRange(formatDateKey(weekStart));
  const label = formatWeekRangeLabel(startDate);
  const statusLabel = getWeeklyAnalysisStatusLabel(mode);

  return {
    mode,
    selectedWeekMode: mode,
    selectedWeekStart: startDate,
    selectedWeekEnd: endDate,
    selectedWeekLabel: label,
    startDate,
    endDate,
    label,
    displayLabel: `${statusLabel} · ${label}`,
    statusLabel,
    isClosed: mode === "last_closed_week" || mode === "custom_week",
  };
}

function isAnalysableSession(session: TrainingSession) {
  return session.status !== "cancelled" && session.status !== "planned";
}

function getAverageRpe(sessions: TrainingSession[]) {
  const values = sessions.map((session) => session.rpe).filter((value): value is number => typeof value === "number" && value > 0);

  return values.length > 0 ? Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(1)) : null;
}

function getWeekSessions(sessions: TrainingSession[], range: WeeklyAnalysisRange) {
  const periodRange = {
    start: parseDashboardDate(range.startDate),
    end: parseDashboardDate(range.endDate),
  };
  periodRange.end.setHours(23, 59, 59, 999);

  return sessions.filter(isAnalysableSession).filter((session) => isDateInRange(session.date, periodRange));
}

function getDisciplineKey(type: string): WeeklyDisciplineKey {
  if (type === "running" || type === "hyrox" || type === "crossfit" || type === "fuerza" || type === "halterofilia" || type === "gimnasticos" || type === "movilidad") {
    return type;
  }

  return "mixed_other";
}

function isExpectedTypeMatch(expectedType: string, session: TrainingSession) {
  const expectedKey = getDisciplineKey(expectedType);
  const sessionKey = getDisciplineKey(session.type);

  if (expectedKey === sessionKey) {
    return true;
  }

  if (expectedKey === "fuerza") {
    return session.type === "halterofilia" || session.subtypes.includes("strength") || session.subtypes.includes("weightlifting");
  }

  if (expectedKey === "movilidad") {
    return session.type === "movilidad" || session.subtypes.includes("mobility");
  }

  return false;
}

function buildSummary(sessions: TrainingSession[]): WeeklySummaryMetrics {
  const running = getRunningBreakdown(sessions);
  const muscleSummary = calculateMuscleSummary(sessions);
  const muscleLoad = Object.values(muscleSummary).reduce((total, value) => total + value, 0);
  const fatigueCost = sessions.reduce((total, session) => total + (session.sessionMetrics.fatigueCost ?? 0), 0);

  return {
    sessions: sessions.length,
    trainingDays: new Set(sessions.filter((session) => session.type !== "movilidad").map((session) => session.date)).size,
    movementDays: new Set(sessions.map((session) => session.date)).size,
    durationMinutes: sessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0),
    averageRpe: getAverageRpe(sessions),
    totalRunMeters: running.totalRunExposureMeters,
    structuredRunMeters: running.structuredMeters,
    mixedRunMeters: running.mixedMeters,
    fatigueCost: sessions.length > 0 ? Math.round(fatigueCost) : null,
    muscleLoad: muscleLoad > 0 ? Math.round(muscleLoad) : null,
  };
}

function getDisciplineKeyMetric(key: WeeklyDisciplineKey, sessions: TrainingSession[]) {
  if (sessions.length === 0) {
    return "Sin sesiones";
  }

  if (key === "running") {
    return formatKm(getStructuredRunningMeters(sessions), { forceKm: true });
  }

  if (key === "hyrox" || key === "crossfit" || key === "mixed_other") {
    return `Fatiga ${Math.round(sessions.reduce((total, session) => total + session.sessionMetrics.fatigueCost, 0))}`;
  }

  if (key === "fuerza" || key === "halterofilia") {
    return formatLoadKg(sessions.reduce((total, session) => total + (session.sessionMetrics.totalExternalLoadKg ?? 0), 0));
  }

  if (key === "gimnasticos") {
    const reps = sessions.reduce((total, session) => total + session.sessionMetrics.totalGymnasticsReps, 0);
    return reps > 0 ? `${reps} reps` : "Técnica registrada";
  }

  return formatDuration(sessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0), { emptyLabel: "Movimiento" });
}

function buildDisciplines(sessions: TrainingSession[]): WeeklyDisciplineSummary[] {
  return disciplineOrder.map((key) => {
    const disciplineSessions = sessions.filter((session) => getDisciplineKey(session.type) === key);

    return {
      key,
      label: disciplineLabels[key],
      sessions: disciplineSessions.length,
      durationMinutes: disciplineSessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0),
      averageRpe: getAverageRpe(disciplineSessions),
      keyMetric: getDisciplineKeyMetric(key, disciplineSessions),
    };
  });
}

function isExpectedCompletedBySession(type: PlannedSessionType | ProgrammingSessionType, date: string, weekSessions: TrainingSession[]) {
  return weekSessions.some((session) => session.date === date && isExpectedTypeMatch(type, session));
}

function buildExpectedSummary({
  plannedSessions,
  programmingSessions,
  weekSessions,
  range,
}: {
  plannedSessions: PlannedSession[];
  programmingSessions: ProgrammingSession[];
  weekSessions: TrainingSession[];
  range: WeeklyAnalysisRange;
}): WeeklyExpectedSummary {
  const weekPlanned = plannedSessions.filter((session) => session.plannedDate >= range.startDate && session.plannedDate <= range.endDate);
  const weekProgramming = programmingSessions.filter((session) => session.scheduledDate >= range.startDate && session.scheduledDate <= range.endDate);
  const activePlanned = weekPlanned.filter((session) => session.status !== "cancelled" && session.status !== "moved");
  const activeProgramming = weekProgramming.filter((session) => session.status !== "skipped");
  const expectedSessions = activePlanned.length + activeProgramming.length;
  const completedPlanned = activePlanned.filter(
    (session) => session.status === "completed" || isExpectedCompletedBySession(session.type, session.plannedDate, weekSessions),
  ).length;
  const completedProgramming = activeProgramming.filter(
    (session) => session.status === "completed" || session.status === "partially_completed" || isExpectedCompletedBySession(session.type, session.scheduledDate, weekSessions),
  ).length;
  const skippedSessions = weekPlanned.filter((session) => session.status === "skipped").length + weekProgramming.filter((session) => session.status === "skipped").length;
  const completedSessions = completedPlanned + completedProgramming;
  const expectedByDiscipline = new Map<WeeklyDisciplineKey, { expected: number; completed: number }>();

  for (const key of disciplineOrder) {
    expectedByDiscipline.set(key, { expected: 0, completed: 0 });
  }

  activePlanned.forEach((session) => {
    const key = getDisciplineKey(session.type);
    const value = expectedByDiscipline.get(key);
    if (value) {
      value.expected += 1;
      value.completed += session.status === "completed" || isExpectedCompletedBySession(session.type, session.plannedDate, weekSessions) ? 1 : 0;
    }
  });

  activeProgramming.forEach((session) => {
    const key = getDisciplineKey(session.type);
    const value = expectedByDiscipline.get(key);
    if (value) {
      value.expected += 1;
      value.completed += session.status === "completed" || session.status === "partially_completed" || isExpectedCompletedBySession(session.type, session.scheduledDate, weekSessions) ? 1 : 0;
    }
  });

  return {
    hasExpectations: expectedSessions > 0,
    plannedSessions: activePlanned.length,
    programmingSessions: activeProgramming.length,
    expectedSessions,
    completedSessions,
    pendingSessions: Math.max(expectedSessions - completedSessions - skippedSessions, 0),
    skippedSessions,
    adherencePercentage: expectedSessions > 0 ? Math.round((completedSessions / expectedSessions) * 100) : null,
    byDiscipline: disciplineOrder
      .map((key) => ({
        key,
        label: disciplineLabels[key],
        expected: expectedByDiscipline.get(key)?.expected ?? 0,
        completed: expectedByDiscipline.get(key)?.completed ?? 0,
      }))
      .filter((item) => item.expected > 0 || item.completed > 0),
    message: expectedSessions > 0 ? null : "Sin programación semanal definida. La lectura se basa solo en sesiones registradas.",
  };
}

function getComparableRunningPace(currentSessions: TrainingSession[], previousSessions: TrainingSession[]): WeeklyProgressItem | null {
  const currentRuns = currentSessions
    .filter((session) => getDisciplineKey(session.type) === "running" && getSessionRunMeters(session) >= 1000 && (session.durationMinutes ?? 0) > 0)
    .map((session) => ({ session, meters: getSessionRunMeters(session), pace: ((session.durationMinutes ?? 0) * 60) / (getSessionRunMeters(session) / 1000) }))
    .sort((a, b) => a.pace - b.pace);
  const currentBest = currentRuns[0];

  if (!currentBest) {
    return null;
  }

  const previousComparable = previousSessions
    .filter((session) => getDisciplineKey(session.type) === "running" && (session.durationMinutes ?? 0) > 0)
    .map((session) => ({ session, meters: getSessionRunMeters(session), pace: ((session.durationMinutes ?? 0) * 60) / (getSessionRunMeters(session) / 1000) }))
    .filter((item) => item.meters > 0 && Math.abs(item.meters - currentBest.meters) / currentBest.meters <= 0.15)
    .sort((a, b) => a.pace - b.pace);

  if (previousComparable.length === 0) {
    return {
      id: "running-pace-no-reference",
      title: "Ritmo running comparable",
      label: "Sin comparación suficiente",
      detail: `${currentBest.session.title}: ${formatKm(currentBest.meters, { forceKm: true })} en ${formatDuration(currentBest.session.durationMinutes)}.`,
      evidence: "No hay una referencia previa con distancia comparable.",
    };
  }

  const previousBest = previousComparable[0];
  const paceLabel = `${Math.floor(currentBest.pace / 60)}:${String(Math.round(currentBest.pace % 60)).padStart(2, "0")}/km`;

  return {
    id: "running-pace-reference",
    title: "Ritmo running comparable",
    label: currentBest.pace < previousBest.pace ? "Mejora frente a última referencia" : "Sin comparación suficiente",
    detail: `${currentBest.session.title}: ${paceLabel} en distancia comparable.`,
    evidence: currentBest.pace < previousBest.pace
      ? `Referencia previa: ${previousBest.session.title}.`
      : `Referencia previa igual o mejor: ${previousBest.session.title}.`,
  };
}

function getLoadProgress(currentSessions: TrainingSession[], previousSessions: TrainingSession[]): WeeklyProgressItem[] {
  const currentLoads = new Map<string, { name: string; load: number; sessionTitle: string }>();
  const previousLoads = new Map<string, number>();

  currentSessions.forEach((session) => {
    session.blocks.forEach((block) => {
      block.exercises.forEach((exercise) => {
        if (!exercise.loadKg || exercise.loadKg <= 0) {
          return;
        }

        const key = exercise.canonicalName || exercise.name;
        const current = currentLoads.get(key);
        if (!current || exercise.loadKg > current.load) {
          currentLoads.set(key, { name: exercise.name, load: exercise.loadKg, sessionTitle: session.title });
        }
      });
    });
  });

  previousSessions.forEach((session) => {
    session.blocks.forEach((block) => {
      block.exercises.forEach((exercise) => {
        if (!exercise.loadKg || exercise.loadKg <= 0) {
          return;
        }

        const key = exercise.canonicalName || exercise.name;
        previousLoads.set(key, Math.max(previousLoads.get(key) ?? 0, exercise.loadKg));
      });
    });
  });

  return Array.from(currentLoads.entries())
    .sort(([, a], [, b]) => b.load - a.load)
    .slice(0, 3)
    .map(([key, item]) => {
      const previousBest = previousLoads.get(key) ?? 0;
      return {
        id: `load-${key}`,
        title: item.name,
        label: previousBest > 0 && item.load > previousBest ? "Mejora frente a última referencia" : previousBest > 0 ? "Sin comparación suficiente" : "Mejor dato registrado",
        detail: `${formatLoadKg(item.load)} en ${item.sessionTitle}.`,
        evidence: previousBest > 0 ? `Referencia previa: ${formatLoadKg(previousBest)}.` : "No hay carga previa comparable para ese movimiento.",
      };
    });
}

function getBenchmarkProgress(currentSessions: TrainingSession[], previousSessions: TrainingSession[]): WeeklyProgressItem | null {
  for (const session of currentSessions) {
    const result = session.result;
    if (!result || result.type === "none" || result.type === "partial" || (!result.timeSeconds && !result.score)) {
      continue;
    }

    const previous = previousSessions.find((item) => item.title.toLowerCase() === session.title.toLowerCase() && item.result?.type === result.type);
    if (!previous?.result) {
      continue;
    }

    if (result.type === "time" && result.timeSeconds && previous.result.timeSeconds) {
      return {
        id: `benchmark-${session.id}`,
        title: session.title,
        label: result.timeSeconds < previous.result.timeSeconds ? "Mejora frente a última referencia" : "Sin comparación suficiente",
        detail: result.score ?? `${Math.round(result.timeSeconds / 60)} min`,
        evidence: `Mismo título y métrica que ${previous.date}: ${previous.result.score ?? `${Math.round(previous.result.timeSeconds / 60)} min`}.`,
      };
    }
  }

  return null;
}

function getProgrammingProgress(programmingSessions: ProgrammingSession[], range: WeeklyAnalysisRange): WeeklyProgressItem | null {
  const weekProgramming = programmingSessions.filter((session) => session.scheduledDate >= range.startDate && session.scheduledDate <= range.endDate);
  const completedBlocks = weekProgramming.reduce((total, session) => total + session.blocks.filter((block) => block.status === "completed").length, 0);
  const finalLogs = weekProgramming.filter((session) => session.finalLog !== null);

  if (completedBlocks === 0 && finalLogs.length === 0) {
    return null;
  }

  return {
    id: "programming-completion",
    title: "Programaciones completadas",
    label: "Mejor dato registrado",
    detail: `${completedBlocks} bloques completados y ${finalLogs.length} final_log registrados.`,
    evidence: "Dato descriptivo de programación semanal; no compara marca física.",
  };
}

function buildProgressItems(
  currentSessions: TrainingSession[],
  allSessions: TrainingSession[],
  programmingSessions: ProgrammingSession[],
  range: WeeklyAnalysisRange,
): WeeklyProgressItem[] {
  const previousSessions = allSessions.filter(isAnalysableSession).filter((session) => session.date < range.startDate);
  const items = [
    getComparableRunningPace(currentSessions, previousSessions),
    ...getLoadProgress(currentSessions, previousSessions),
    getProgrammingProgress(programmingSessions, range),
    getBenchmarkProgress(currentSessions, previousSessions),
  ].filter((item): item is WeeklyProgressItem => Boolean(item));

  if (items.length === 0) {
    return [
      {
        id: "no-progress-reference",
        title: "Marcas y comparaciones",
        label: "Sin comparación suficiente",
        detail: "No hay datos comparables de ritmo, carga, final_log o benchmark esta semana.",
        evidence: "La sección queda descriptiva hasta que existan referencias equivalentes.",
      },
    ];
  }

  return items.slice(0, 5);
}

function buildLoadIntensity(currentSessions: TrainingSession[], allSessions: TrainingSession[], range: WeeklyAnalysisRange): WeeklyLoadIntensity {
  const rpeBuckets = [
    { key: "low" as const, label: "Bajo", value: currentSessions.filter((session) => typeof session.rpe === "number" && session.rpe > 0 && session.rpe <= 4).length },
    { key: "moderate" as const, label: "Moderado", value: currentSessions.filter((session) => typeof session.rpe === "number" && session.rpe >= 5 && session.rpe <= 7).length },
    { key: "high" as const, label: "Alto", value: currentSessions.filter((session) => typeof session.rpe === "number" && session.rpe >= 8).length },
    { key: "missing" as const, label: "Sin dato", value: currentSessions.filter((session) => typeof session.rpe !== "number" || session.rpe <= 0).length },
  ];
  const byDay = new Map<string, { load: number; duration: number; sessions: number }>();

  currentSessions.forEach((session) => {
    const value = byDay.get(session.date) ?? { load: 0, duration: 0, sessions: 0 };
    value.load += session.sessionMetrics.fatigueCost ?? 0;
    value.duration += session.durationMinutes ?? 0;
    value.sessions += 1;
    byDay.set(session.date, value);
  });

  const muscleSummary = calculateMuscleSummary(currentSessions);
  const previousWeekStarts = Array.from({ length: 4 }, (_, index) => addDays(parseDashboardDate(range.startDate), -7 * (index + 1)));
  const previousRunMeters = previousWeekStarts.map((weekStart) => {
    const previousRange = getRangeFromWeekStart(weekStart);
    return getRunningBreakdown(allSessions.filter(isAnalysableSession).filter((session) => isDateInRange(session.date, previousRange))).totalRunExposureMeters;
  });
  const nonZeroPreviousRuns = previousRunMeters.filter((value) => value > 0);
  const recentAverageMeters = nonZeroPreviousRuns.length > 0
    ? Math.round(nonZeroPreviousRuns.reduce((total, value) => total + value, 0) / nonZeroPreviousRuns.length)
    : null;

  return {
    rpeBuckets,
    loadedDays: Array.from(byDay.entries())
      .map(([date, value]) => ({
        date,
        label: new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "2-digit", month: "short" }).format(parseDashboardDate(date)),
        load: Math.round(value.load),
        detail: `${value.sessions} sesiones · ${formatDuration(value.duration, { emptyLabel: "0 min" })}`,
      }))
      .sort((a, b) => b.load - a.load)
      .slice(0, 3),
    topMuscles: getTopMuscles(muscleSummary, 5).map((item) => ({
      muscle: item.muscle,
      label: formatMuscleName(item.muscle),
      load: item.load,
    })),
    runningReference: {
      currentMeters: getRunningBreakdown(currentSessions).totalRunExposureMeters,
      recentAverageMeters,
      label: recentAverageMeters === null
        ? "Sin referencia reciente de carrera."
        : `${formatKm(getRunningBreakdown(currentSessions).totalRunExposureMeters, { forceKm: true })} vs ${formatKm(recentAverageMeters, { forceKm: true })} de referencia reciente.`,
    },
  };
}

function pushUnique(target: string[], value: string) {
  if (!target.includes(value)) {
    target.push(value);
  }
}

function buildSignals(report: {
  summary: WeeklySummaryMetrics;
  disciplines: WeeklyDisciplineSummary[];
  expected: WeeklyExpectedSummary;
  loadIntensity: WeeklyLoadIntensity;
}): WeeklySignals {
  const positive: string[] = [];
  const review: string[] = [];
  const insufficient: string[] = [];
  const highRpe = report.loadIntensity.rpeBuckets.find((bucket) => bucket.key === "high")?.value ?? 0;
  const missingRpe = report.loadIntensity.rpeBuckets.find((bucket) => bucket.key === "missing")?.value ?? 0;
  const activeDisciplines = report.disciplines.filter((item) => item.sessions > 0).length;

  if (report.summary.sessions > 0) {
    pushUnique(positive, `Se observa registro semanal con ${report.summary.sessions} sesiones en ${report.summary.movementDays} días con movimiento.`);
  }

  if (activeDisciplines >= 3) {
    pushUnique(positive, `Dato relevante: aparecen ${activeDisciplines} disciplinas con sesiones registradas.`);
  }

  if (report.expected.hasExpectations && report.expected.adherencePercentage !== null) {
    pushUnique(positive, `Cumplimiento semanal registrado: ${report.expected.adherencePercentage}% de sesiones esperadas completadas.`);
  }

  if (highRpe > 0) {
    pushUnique(review, `Se observa intensidad alta en ${highRpe} sesiones con RPE 8+.`);
  }

  if (report.loadIntensity.loadedDays[0]) {
    pushUnique(review, `Día más cargado: ${report.loadIntensity.loadedDays[0].label}, carga ${report.loadIntensity.loadedDays[0].load}.`);
  }

  if (report.summary.totalRunMeters > 0 && report.loadIntensity.runningReference.recentAverageMeters !== null && report.summary.totalRunMeters > report.loadIntensity.runningReference.recentAverageMeters * 1.25) {
    pushUnique(review, `Señal de contexto: carrera total por encima de la referencia reciente (${report.loadIntensity.runningReference.label}).`);
  }

  if (missingRpe > 0) {
    pushUnique(insufficient, `Datos insuficientes: ${missingRpe} sesiones sin RPE.`);
  }

  if (!report.expected.hasExpectations) {
    pushUnique(insufficient, "Datos insuficientes: no hay programación semanal para comparar esperado y realizado.");
  }

  if (report.loadIntensity.topMuscles.length === 0) {
    pushUnique(insufficient, "Datos insuficientes: no hay carga muscular agregada para la semana.");
  }

  return {
    positive: positive.slice(0, 3),
    review: review.slice(0, 3),
    insufficient: insufficient.slice(0, 3),
  };
}

export function buildWeeklyAnalysisReport({
  sessions,
  plannedSessions = [],
  programmingSessions = [],
  mode,
  selectedWeek,
  referenceDate = new Date(),
}: {
  sessions: TrainingSession[];
  plannedSessions?: PlannedSession[];
  programmingSessions?: ProgrammingSession[];
  mode: WeeklyAnalysisMode;
  selectedWeek?: WeeklyAnalysisRange;
  referenceDate?: Date;
}): WeeklyAnalysisReport {
  const range = selectedWeek ?? getWeeklyAnalysisRange(mode, referenceDate);
  const weekSessions = getWeekSessions(sessions, range);
  const summary = buildSummary(weekSessions);
  const disciplines = buildDisciplines(weekSessions);
  const expected = buildExpectedSummary({ plannedSessions, programmingSessions, weekSessions, range });
  const loadIntensity = buildLoadIntensity(weekSessions, sessions, range);
  const progress = buildProgressItems(weekSessions, sessions, programmingSessions, range);

  return {
    range,
    sessions: weekSessions,
    summary,
    disciplines,
    expected,
    progress,
    loadIntensity,
    signals: buildSignals({ summary, disciplines, expected, loadIntensity }),
  };
}

export function getWeeklyAnalysisRangeOptions(referenceDate = new Date()) {
  return [
    getWeeklyAnalysisRange("last_closed_week", referenceDate),
    getWeeklyAnalysisRange("current_week", referenceDate),
  ];
}

export function getWeeklyAnalysisWeekStartForSession(session: TrainingSession) {
  return getWeekStartDateKey(session.date);
}

export function formatExpectedType(type: string) {
  return disciplineLabels[getDisciplineKey(type)] ?? formatTrainingType(type);
}
