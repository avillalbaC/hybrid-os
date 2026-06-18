import { getStructuredRunningMeters, getTotalRunExposureMeters } from "@/lib/domain/training/run-exposure";
import { formatDuration, formatMuscleName } from "@/lib/utils/format";
import { getPriorityStatus, type DailyEntry } from "@/types/daily";
import type { GoalProgressSignal } from "@/types/goals";
import type { TrainingSession } from "@/types/training";

function formatKm(meters: number) {
  return `${(meters / 1000).toFixed(1)} km`;
}

function getAverageRpe(sessions: TrainingSession[]) {
  const values = sessions.map((session) => session.rpe).filter((value): value is number => typeof value === "number" && value > 0);

  if (values.length === 0) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function countByType(sessions: TrainingSession[], predicate: (session: TrainingSession) => boolean) {
  return sessions.filter(predicate).length;
}

function getTopMuscles(sessions: TrainingSession[], limit = 3) {
  const totals = new Map<string, number>();

  for (const session of sessions) {
    for (const [muscle, load] of Object.entries(session.sessionMuscleSummary)) {
      totals.set(muscle, (totals.get(muscle) ?? 0) + load);
    }
  }

  return Array.from(totals.entries())
    .filter(([, load]) => load > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([muscle]) => formatMuscleName(muscle));
}

function getSignalLines(signals: GoalProgressSignal[]) {
  if (signals.length === 0) {
    return ["* Sin señales claras con los datos actuales."];
  }

  return signals.slice(0, 5).map((signal) => `* ${signal.label}: ${signal.evidence}`);
}

export function buildCheckInContext({
  goalTitle,
  goalProfileLabel,
  periodLabel,
  sessions,
  dailyEntries,
  positiveSignals,
  negativeSignals,
  insufficientData,
}: {
  goalTitle: string | null;
  goalProfileLabel: string | null;
  periodLabel: string;
  sessions: TrainingSession[];
  dailyEntries: DailyEntry[];
  positiveSignals: GoalProgressSignal[];
  negativeSignals: GoalProgressSignal[];
  insufficientData: GoalProgressSignal[];
}) {
  const totalDuration = sessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0);
  const totalRunMeters = getTotalRunExposureMeters(sessions);
  const structuredRunMeters = getStructuredRunningMeters(sessions);
  const mixedRunMeters = Math.max(0, totalRunMeters - structuredRunMeters);
  const averageRpe = getAverageRpe(sessions);
  const mobilityDone = dailyEntries.filter((entry) => entry.mobilityDone).length;
  const priorities = dailyEntries.flatMap((entry) => entry.priorities);
  const relevantPriorities = priorities.filter((priority) => getPriorityStatus(priority) !== "discarded");
  const completedPriorities = relevantPriorities.filter((priority) => getPriorityStatus(priority) === "completed").length;
  const topMuscles = getTopMuscles(sessions);
  const hardSignals = negativeSignals.filter((signal) => signal.checkInRelevance === "high").slice(0, 2);

  return [
    "CONTEXTO HYBRID OS",
    "",
    "Objetivo activo:",
    goalTitle ? `${goalTitle}${goalProfileLabel ? ` / ${goalProfileLabel}` : ""}` : "Sin objetivo activo",
    "",
    "Periodo:",
    periodLabel,
    "",
    "Entrenamiento:",
    `* Sesiones: ${sessions.length}`,
    `* Duración total: ${formatDuration(totalDuration)}`,
    `* RPE medio: ${averageRpe === null ? "Sin dato" : averageRpe.toFixed(1)}`,
    `* Carrera total: ${formatKm(totalRunMeters)}`,
    `* Running estructurado: ${formatKm(structuredRunMeters)}`,
    `* Carrera mixta: ${formatKm(mixedRunMeters)}`,
    `* Fuerza/Haltero: ${countByType(sessions, (session) => session.type === "fuerza" || session.type === "halterofilia" || session.subtypes.includes("strength") || session.subtypes.includes("weightlifting"))} sesiones`,
    `* HYROX/CrossFit: ${countByType(sessions, (session) => session.type === "hyrox" || session.type === "crossfit")} sesiones`,
    "",
    "Carga muscular:",
    `* Más cargados: ${topMuscles.length > 0 ? topMuscles.join(", ") : "Sin dato"}`,
    `* Señales a vigilar: ${hardSignals.length > 0 ? hardSignals.map((signal) => signal.label).join("; ") : "Sin señal principal"}`,
    "",
    "Daily Plan:",
    `* Movilidad registrada: ${mobilityDone}/${dailyEntries.length || 7} días`,
    `* Prioridades completadas: ${relevantPriorities.length > 0 ? `${completedPriorities}/${relevantPriorities.length}` : "Sin dato"}`,
    "",
    "Objetivo:",
    "Lo que está sumando:",
    ...getSignalLines(positiveSignals),
    "",
    "Lo que está restando:",
    ...getSignalLines(negativeSignals),
    "",
    "Datos insuficientes:",
    ...getSignalLines(insufficientData),
    "",
    "Notas:",
    "Usar este contexto en el check diario para decidir ajustes de entrenamiento, movilidad y nutrición.",
  ].join("\n");
}
