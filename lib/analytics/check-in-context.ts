import { getPeriodRange, isDateInRange } from "@/lib/domain/dashboard/periods";
import { calculateMuscleSummary, detectMuscleImbalances, getTopMuscles } from "@/lib/domain/training/muscle-load";
import { getStructuredRunningMeters, getTotalRunExposureMeters } from "@/lib/domain/training/run-exposure";
import { formatDuration, formatMuscleName } from "@/lib/utils/format";
import { getPriorityStatus } from "@/types/daily";
import type {
  CheckInContextData,
  CheckInContextInput,
  CheckInContextPeriod,
} from "@/types/check-in-context";
import type { BodyCheck } from "@/types/body";
import type { DailyEntry } from "@/types/daily";
import type { GoalProgressSignal } from "@/types/goals";
import type { NutritionCheck } from "@/types/nutrition";
import type { TrainingSession } from "@/types/training";

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatGeneratedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = formatDateKey(date);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${hours}:${minutes}`;
}

function getDefaultPeriod(referenceDate: Date): CheckInContextPeriod {
  const range = getPeriodRange("week", referenceDate);

  if (!range) {
    const date = formatDateKey(referenceDate);
    return {
      label: "Semana actual",
      startDate: date,
      endDate: date,
    };
  }

  return {
    label: "Semana actual",
    startDate: formatDateKey(range.start),
    endDate: formatDateKey(range.end),
  };
}

function getPeriodEndDate(period: CheckInContextPeriod) {
  const end = new Date(`${period.endDate}T00:00:00`);
  end.setHours(23, 59, 59, 999);
  return end;
}

function inPeriod(date: string, period: CheckInContextPeriod) {
  return isDateInRange(date, {
    start: new Date(`${period.startDate}T00:00:00`),
    end: getPeriodEndDate(period),
  });
}

function formatKmValue(km: number | null) {
  return km === null ? "Sin dato" : `${km.toFixed(1)} km`;
}

function toKm(meters: number) {
  return Number((meters / 1000).toFixed(1));
}

function getAverageRpe(sessions: TrainingSession[]) {
  const values = sessions
    .map((session) => session.rpe)
    .filter((value): value is number => typeof value === "number" && value > 0);

  if (values.length === 0) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function isStrengthSession(session: TrainingSession) {
  return session.type === "fuerza" ||
    session.type === "halterofilia" ||
    session.subtypes.includes("strength") ||
    session.subtypes.includes("weightlifting");
}

function isMobilitySession(session: TrainingSession) {
  return session.type === "movilidad" || session.subtypes.includes("mobility");
}

function isHyroxSession(session: TrainingSession) {
  return session.type === "hyrox" || session.subtypes.includes("hyrox" as never);
}

function hasResult(session: TrainingSession) {
  return Boolean(session.result && session.result.type !== "none" && (session.result.score || session.result.notes));
}

function isRunningWithoutShoes(session: TrainingSession) {
  return session.type === "running" && !session.equipment?.shoes;
}

function signalToLine(signal: GoalProgressSignal) {
  return `${signal.label}: ${signal.evidence}`;
}

function uniqueLines(lines: string[]) {
  return Array.from(new Set(lines.map((line) => line.trim()).filter(Boolean)));
}

function formatSignalLines(lines: string[], emptyLabel: string) {
  return (lines.length > 0 ? lines : [emptyLabel]).map((line) => `* ${line}`);
}

function getBodyTrendLabel(value: number | null, unit: string) {
  if (value === null) {
    return null;
  }

  if (value === 0) {
    return `estable (${value.toFixed(1)} ${unit})`;
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} ${unit}`;
}

function getBodySummary(bodyChecks: BodyCheck[], period: CheckInContextPeriod) {
  if (bodyChecks.length === 0) {
    return undefined;
  }

  const sorted = [...bodyChecks].sort((a, b) => a.date.localeCompare(b.date));
  const periodChecks = sorted.filter((check) => inPeriod(check.date, period));
  const trendChecks = periodChecks.length >= 2 ? periodChecks : sorted.slice(-2);
  const first = trendChecks[0] ?? null;
  const latest = sorted.at(-1) ?? null;
  const trendLatest = trendChecks.at(-1) ?? null;

  return {
    latestWeightKg: latest?.weightKg ?? null,
    latestWaistCm: latest?.waistCm ?? null,
    weightTrendLabel: first && trendLatest && first.id !== trendLatest.id
      ? getBodyTrendLabel(trendLatest.weightKg - first.weightKg, "kg")
      : null,
    waistTrendLabel: first && trendLatest && first.id !== trendLatest.id
      ? getBodyTrendLabel(trendLatest.waistCm - first.waistCm, "cm")
      : null,
  };
}

function getNutritionSummary(nutritionChecks: NutritionCheck[], period: CheckInContextPeriod) {
  if (nutritionChecks.length === 0) {
    return {
      available: false,
      notes: ["Dato insuficiente: no hay nutrition checks disponibles."],
    };
  }

  const periodChecks = nutritionChecks.filter((check) => inPeriod(check.date, period));

  return {
    available: true,
    notes: [
      `Dato disponible: ${periodChecks.length} nutrition checks en el periodo.`,
      ...(periodChecks.length === 0 ? ["Dato insuficiente: sin nutrition checks dentro de la semana actual."] : []),
    ],
  };
}

function getDailySummary(dailyEntries: DailyEntry[]) {
  const priorities = dailyEntries.flatMap((entry) => entry.priorities);
  const prioritiesCompleted = priorities.filter((priority) => getPriorityStatus(priority) === "completed").length;
  const prioritiesDiscarded = priorities.filter((priority) => getPriorityStatus(priority) === "discarded").length;
  const prioritiesPostponed = priorities.filter((priority) => getPriorityStatus(priority) === "postponed").length;
  const openPriorities = priorities.filter((priority) => getPriorityStatus(priority) === "pending").length;

  return {
    dailyEntriesCount: dailyEntries.length,
    mobilityDays: dailyEntries.filter((entry) => entry.mobilityDone).length,
    prioritiesTotal: priorities.length,
    prioritiesCompleted,
    prioritiesDiscarded,
    prioritiesPostponed,
    openPriorities,
  };
}

function getDataQualitySummary(sessions: TrainingSession[]) {
  const partialSessions = sessions.filter((session) => session.dataQuality === "partial" || session.status === "partial").length;
  const sessionsWithoutRpe = sessions.filter((session) => typeof session.rpe !== "number" || session.rpe <= 0).length;
  const sessionsWithoutResult = sessions.filter((session) => !hasResult(session)).length;
  const sessionsWithoutDuration = sessions.filter((session) => typeof session.durationMinutes !== "number" || session.durationMinutes <= 0).length;
  const runningWithoutShoes = sessions.filter(isRunningWithoutShoes).length;
  const notes = [
    ...(partialSessions > 0 ? [`Dato insuficiente: ${partialSessions} sesiones parciales en el periodo.`] : []),
    ...(sessionsWithoutRpe > 0 ? [`Dato insuficiente: ${sessionsWithoutRpe} sesiones sin RPE.`] : []),
    ...(sessionsWithoutDuration > 0 ? [`Dato insuficiente: ${sessionsWithoutDuration} sesiones sin duración.`] : []),
    ...(sessionsWithoutResult > 0 ? [`Dato insuficiente: ${sessionsWithoutResult} sesiones sin resultado estructurado.`] : []),
    ...(runningWithoutShoes > 0 ? [`Dato disponible: ${runningWithoutShoes} sesiones de running sin zapatillas registradas.`] : []),
  ];

  return {
    partialSessions,
    sessionsWithoutRpe,
    sessionsWithoutResult,
    sessionsWithoutDuration,
    runningWithoutShoes,
    notes,
  };
}

function buildSignalBuckets({
  sessions,
  dailyEntries,
  bodyChecks,
  nutritionChecks,
  plannedSessionsCount,
  positiveSignals,
  negativeSignals,
  insufficientData,
}: {
  sessions: TrainingSession[];
  dailyEntries: DailyEntry[];
  bodyChecks: BodyCheck[];
  nutritionChecks: NutritionCheck[];
  plannedSessionsCount: number;
  positiveSignals: GoalProgressSignal[];
  negativeSignals: GoalProgressSignal[];
  insufficientData: GoalProgressSignal[];
}) {
  const totalRunMeters = getTotalRunExposureMeters(sessions);
  const structuredRunMeters = getStructuredRunningMeters(sessions);
  const strengthSessions = sessions.filter(isStrengthSession).length;
  const dailySummary = getDailySummary(dailyEntries);
  const dataQuality = getDataQualitySummary(sessions);
  const generatedPositive = [
    ...(sessions.length >= 3 ? ["Señal a favor: registro de entrenamientos constante en el periodo."] : []),
    ...(structuredRunMeters > 0 ? ["Señal a favor: running estructurado presente."] : []),
    ...(strengthSessions > 0 ? ["Señal a favor: fuerza/halterofilia presente esta semana."] : []),
  ];
  const generatedNegative = [
    ...(dailyEntries.length > 0 && dailySummary.mobilityDays < 2 ? ["Señal en contra: movilidad registrada por debajo de la referencia semanal."] : []),
    ...(totalRunMeters >= 5000 && sessions.some((session) => (session.sessionMuscleSummary.calves ?? 0) >= 120)
      ? ["Señal en contra: gemelos con carga relevante junto a carrera acumulada."]
      : []),
  ];
  const generatedInsufficient = [
    ...(sessions.length === 0 ? ["Dato insuficiente: sin sesiones registradas en el periodo."] : []),
    ...(dailyEntries.length === 0 ? ["Dato insuficiente: sin entradas de Daily Plan en el periodo."] : []),
    ...(bodyChecks.length === 0 ? ["Dato insuficiente: faltan body checks recientes."] : []),
    ...(nutritionChecks.length === 0 ? ["Dato insuficiente: faltan nutrition checks recientes."] : []),
    ...(plannedSessionsCount === 0 ? ["Dato insuficiente: plan semanal beta vacío; no afecta al entrenamiento real."] : []),
    ...dataQuality.notes,
  ];

  return {
    positive: uniqueLines([...positiveSignals.map(signalToLine), ...generatedPositive]).slice(0, 8),
    negative: uniqueLines([...negativeSignals.map(signalToLine), ...generatedNegative]).slice(0, 8),
    insufficient: uniqueLines([...insufficientData.map(signalToLine), ...generatedInsufficient]).slice(0, 10),
  };
}

export function buildCheckInContextData(input: CheckInContextInput): CheckInContextData {
  const referenceDate = input.referenceDate ?? new Date();
  const period = input.period ?? getDefaultPeriod(referenceDate);
  const generatedAt = input.generatedAt ?? referenceDate.toISOString();
  const sessions = input.sessions.filter((session) => inPeriod(session.date, period));
  const dailyEntries = (input.dailyEntries ?? []).filter((entry) => inPeriod(entry.entryDate, period));
  const bodyChecks = input.bodyChecks ?? [];
  const periodBodyChecks = bodyChecks.filter((check) => inPeriod(check.date, period));
  const nutritionChecks = input.nutritionChecks ?? [];
  const periodNutritionChecks = nutritionChecks.filter((check) => inPeriod(check.date, period));
  const plannedSessions = (input.plannedSessions ?? []).filter((session) => inPeriod(session.plannedDate, period));
  const totalDuration = sessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0);
  const averageRpe = getAverageRpe(sessions);
  const rpeValues = sessions.map((session) => session.rpe).filter((value): value is number => typeof value === "number" && value > 0);
  const totalRunMeters = getTotalRunExposureMeters(sessions);
  const structuredRunMeters = getStructuredRunningMeters(sessions);
  const mixedRunMeters = Math.max(0, totalRunMeters - structuredRunMeters);
  const muscleSummary = calculateMuscleSummary(sessions);
  const muscleSignals = detectMuscleImbalances(muscleSummary, { runningDistanceMeters: totalRunMeters });
  const dataQuality = getDataQualitySummary(sessions);
  const signals = buildSignalBuckets({
    sessions,
    dailyEntries,
    bodyChecks: periodBodyChecks,
    nutritionChecks: periodNutritionChecks,
    plannedSessionsCount: plannedSessions.length,
    positiveSignals: input.positiveSignals ?? [],
    negativeSignals: input.negativeSignals ?? [],
    insufficientData: input.insufficientData ?? [],
  });

  return {
    generatedAt,
    period,
    goal: {
      title: input.activeGoal?.title ?? null,
      profile: input.goalProfileLabel ?? input.activeGoal?.profile ?? null,
      status: input.activeGoal?.status ?? null,
      positiveSignals: (input.positiveSignals ?? []).map(signalToLine),
      negativeSignals: (input.negativeSignals ?? []).map(signalToLine),
      insufficientData: (input.insufficientData ?? []).map(signalToLine),
    },
    training: {
      sessionsCount: sessions.length,
      totalDurationMinutes: totalDuration > 0 ? totalDuration : null,
      averageRpe,
      highIntensitySessions: rpeValues.length > 0 ? sessions.filter((session) => (session.rpe ?? 0) >= 8).length : null,
      totalRunKm: totalRunMeters > 0 ? toKm(totalRunMeters) : 0,
      structuredRunKm: structuredRunMeters > 0 ? toKm(structuredRunMeters) : 0,
      mixedRunKm: mixedRunMeters > 0 ? toKm(mixedRunMeters) : 0,
      strengthSessions: sessions.filter(isStrengthSession).length,
      hyroxSessions: sessions.filter(isHyroxSession).length,
      crossfitSessions: sessions.filter((session) => session.type === "crossfit").length,
      mobilitySessions: sessions.filter(isMobilitySession).length,
    },
    muscle: {
      topMuscles: getTopMuscles(muscleSummary, 5).map((item) => ({
        muscle: item.muscle,
        load: item.load,
        label: formatMuscleName(item.muscle),
      })),
      watchSignals: muscleSignals.map((signal) => `${signal.title}: ${signal.detail}`),
    },
    daily: getDailySummary(dailyEntries),
    body: getBodySummary(bodyChecks, period),
    nutrition: getNutritionSummary(nutritionChecks, period),
    dataQuality,
    signals,
  };
}

export function buildCheckInContextText(context: CheckInContextData): string {
  const topMuscles = context.muscle.topMuscles.slice(0, 3).map((item) => item.label).join(", ");
  const bodyLines = context.body
    ? [
        `* Peso más reciente: ${context.body.latestWeightKg ?? "Sin dato"} kg`,
        `* Cintura más reciente: ${context.body.latestWaistCm ?? "Sin dato"} cm`,
        `* Tendencia peso: ${context.body.weightTrendLabel ?? "Dato insuficiente"}`,
        `* Tendencia cintura: ${context.body.waistTrendLabel ?? "Dato insuficiente"}`,
      ]
    : ["* Sin datos suficientes."];
  const nutritionLines = context.nutrition
    ? context.nutrition.notes.map((note) => `* ${note}`)
    : ["* Sin datos suficientes."];

  return [
    "CONTEXTO HYBRID OS",
    "",
    "Generado:",
    formatGeneratedAt(context.generatedAt),
    "",
    "Periodo:",
    `${context.period.label} (${context.period.startDate} - ${context.period.endDate})`,
    "",
    "Objetivo activo:",
    context.goal.title
      ? `* ${context.goal.title}${context.goal.profile ? ` / Perfil: ${context.goal.profile}` : ""}`
      : "* No hay objetivo activo. El contexto es descriptivo.",
    "",
    "Entrenamiento:",
    `* Sesiones: ${context.training.sessionsCount}`,
    `* Duración total: ${formatDuration(context.training.totalDurationMinutes)}`,
    `* RPE medio: ${context.training.averageRpe === null ? "Sin dato" : context.training.averageRpe.toFixed(1)}`,
    `* Sesiones intensas: ${context.training.highIntensitySessions === null ? "Sin dato" : context.training.highIntensitySessions}`,
    `* Carrera total: ${formatKmValue(context.training.totalRunKm)}`,
    `* Running estructurado: ${formatKmValue(context.training.structuredRunKm)}`,
    `* Carrera mixta: ${formatKmValue(context.training.mixedRunKm)}`,
    `* Fuerza/Halterofilia: ${context.training.strengthSessions} sesiones`,
    `* HYROX/CrossFit: ${context.training.hyroxSessions + context.training.crossfitSessions} sesiones`,
    `* Movilidad registrada como sesión: ${context.training.mobilitySessions}`,
    "",
    "Carga muscular:",
    `* Más cargados: ${topMuscles || "Sin datos suficientes"}`,
    ...formatSignalLines(context.muscle.watchSignals.slice(0, 3), "Sin señales musculares principales."),
    "",
    "Daily Plan:",
    `* Entradas registradas: ${context.daily.dailyEntriesCount}/7 días`,
    `* Movilidad marcada: ${context.daily.mobilityDays}/7 días`,
    `* Prioridades completadas: ${context.daily.prioritiesCompleted}/${context.daily.prioritiesTotal}`,
    `* Prioridades abiertas: ${context.daily.openPriorities}`,
    `* Pospuestas: ${context.daily.prioritiesPostponed}`,
    `* Descartadas: ${context.daily.prioritiesDiscarded}`,
    "",
    "Body:",
    ...bodyLines,
    "",
    "Nutrition:",
    ...nutritionLines,
    "",
    "Calidad de datos:",
    `* Sesiones parciales: ${context.dataQuality.partialSessions}`,
    `* Sesiones sin RPE: ${context.dataQuality.sessionsWithoutRpe}`,
    `* Sesiones sin resultado: ${context.dataQuality.sessionsWithoutResult}`,
    `* Sesiones sin duración: ${context.dataQuality.sessionsWithoutDuration}`,
    `* Running sin zapatillas: ${context.dataQuality.runningWithoutShoes ?? 0}`,
    "",
    "Señales que suman:",
    ...formatSignalLines(context.signals.positive, "Sin señales a favor claras con los datos actuales."),
    "",
    "Señales que restan:",
    ...formatSignalLines(context.signals.negative, "Sin señales en contra claras con los datos actuales."),
    "",
    "Datos insuficientes:",
    ...formatSignalLines(context.signals.insufficient, "Sin huecos relevantes de datos para esta lectura."),
    "",
    "Uso sugerido:",
    "Pegar este contexto en el check diario con ChatGPT para valorar ajustes de entrenamiento, movilidad, nutrición y recuperación.",
  ].join("\n");
}

export function buildCompactCheckInContextText(context: CheckInContextData): string {
  return [
    "CONTEXTO HYBRID OS - RESUMEN",
    `${context.period.label}: ${context.period.startDate} - ${context.period.endDate}`,
    context.goal.title ? `Objetivo: ${context.goal.title}` : "Objetivo: sin objetivo activo",
    `Entrenamiento: ${context.training.sessionsCount} sesiones, ${formatDuration(context.training.totalDurationMinutes)}, ${formatKmValue(context.training.totalRunKm)} carrera total.`,
    `Running: ${formatKmValue(context.training.structuredRunKm)} estructurado / ${formatKmValue(context.training.mixedRunKm)} mixto.`,
    `Daily Plan: ${context.daily.dailyEntriesCount}/7 entradas, movilidad ${context.daily.mobilityDays}/7.`,
    `Señales a favor: ${context.signals.positive.slice(0, 3).join(" | ") || "Sin señales claras."}`,
    `Señales en contra: ${context.signals.negative.slice(0, 3).join(" | ") || "Sin señales claras."}`,
    `Datos insuficientes: ${context.signals.insufficient.slice(0, 3).join(" | ") || "Sin huecos relevantes."}`,
  ].join("\n");
}
