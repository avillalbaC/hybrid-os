import { getWeekBuckets } from "@/lib/analytics/trends";
import { parseDashboardDate } from "@/lib/domain/dashboard/periods";
import { getAverageHeartRate } from "@/lib/domain/training/running";
import { getSessionRunMeters } from "@/lib/domain/training/run-exposure";
import { isPureRunningSession } from "@/lib/domain/training/session-kind";
import type { TrainingSession } from "@/types/training";

export type NonRunningLoadLabel = "baja" | "moderada" | "alta" | "muy alta";

export type WeeklyRunningLoadDatum = {
  weekKey: string;
  weekLabel: string;
  weekMetaLabel: string;
  weekStart: string;
  weekEnd: string;
  isCurrentWeek: boolean;
  totalRunKm: number;
  structuredRunKm: number;
  mixedRunKm: number;
  runningSessions: number;
  mixedRunSessions: number;
  nonRunningSessions: number;
  nonRunningDurationMinutes: number;
  nonRunningAverageRpe: number | null;
  nonRunningLoadRaw: number;
  nonRunningLoadNormalized: number;
  nonRunningLoadLabel: NonRunningLoadLabel;
  totalDurationMinutes: number;
  totalSessions: number;
};

export type RunningObjectiveContext = {
  headline: string;
  signalDetail: string;
  evidence: string[];
  nonRunningContext: string;
  dailyCheckContext: string;
  insufficientData: string[];
  copyText: string;
};

function round(value: number, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function formatKmValue(value: number) {
  return `${value.toFixed(1)} km`;
}

function formatRpeValue(value: number | null) {
  return value === null ? "Sin dato" : `${value.toFixed(1)}/10`;
}

function getAverage(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function getNonRunningLoadRaw(session: TrainingSession) {
  if (session.sessionMetrics.fatigueCost > 0) {
    return session.sessionMetrics.fatigueCost;
  }

  if (session.durationMinutes && session.durationMinutes > 0 && session.rpe && session.rpe > 0) {
    return session.durationMinutes * session.rpe;
  }

  return session.durationMinutes && session.durationMinutes > 0 ? session.durationMinutes : 0;
}

function getNonRunningLoadLabel(normalized: number): NonRunningLoadLabel {
  if (normalized <= 0.25) {
    return "baja";
  }

  if (normalized <= 0.55) {
    return "moderada";
  }

  if (normalized <= 0.8) {
    return "alta";
  }

  return "muy alta";
}

function getSessionsInWeek(sessions: TrainingSession[], week: WeeklyRunningLoadDatum) {
  const start = parseDashboardDate(week.weekStart).getTime();
  const end = parseDashboardDate(week.weekEnd).getTime();

  return sessions.filter((session) => {
    const time = parseDashboardDate(session.date).getTime();
    return time >= start && time <= end;
  });
}

export function getWeeklyRunningLoadData(sessions: TrainingSession[], visibleWeeks = 12): WeeklyRunningLoadDatum[] {
  const buckets = getWeekBuckets(sessions).slice(-visibleWeeks);
  const baseData = buckets.map((bucket) => {
    const nonRunningSessions = bucket.sessions.filter((session) => !isPureRunningSession(session));
    const nonRunningRpeValues = nonRunningSessions
      .map((session) => session.rpe)
      .filter((value): value is number => typeof value === "number" && value > 0);
    const mixedRunSessions = nonRunningSessions.filter((session) => getSessionRunMeters(session) > 0).length;
    const nonRunningLoadRaw = nonRunningSessions.reduce((total, session) => total + getNonRunningLoadRaw(session), 0);

    return {
      weekKey: bucket.weekKey,
      weekLabel: bucket.weekLabel,
      weekMetaLabel: bucket.weekMetaLabel,
      weekStart: bucket.startDate,
      weekEnd: bucket.endDate,
      isCurrentWeek: bucket.isCurrentWeek,
      totalRunKm: round(bucket.totalRunExposureMeters / 1000),
      structuredRunKm: round(bucket.structuredRunMeters / 1000),
      mixedRunKm: round(bucket.mixedRunMeters / 1000),
      runningSessions: bucket.runningSessions,
      mixedRunSessions,
      nonRunningSessions: nonRunningSessions.length,
      nonRunningDurationMinutes: nonRunningSessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0),
      nonRunningAverageRpe: nonRunningRpeValues.length > 0 ? round(getAverage(nonRunningRpeValues) ?? 0) : null,
      nonRunningLoadRaw,
      nonRunningLoadNormalized: 0,
      nonRunningLoadLabel: "baja" as NonRunningLoadLabel,
      totalDurationMinutes: bucket.durationMinutes,
      totalSessions: bucket.sessionsCount,
    };
  });
  const maxRaw = Math.max(...baseData.map((item) => item.nonRunningLoadRaw), 0);

  return baseData.map((item) => {
    const normalized = maxRaw > 0 ? round(item.nonRunningLoadRaw / maxRaw, 2) : 0;

    return {
      ...item,
      nonRunningLoadNormalized: normalized,
      nonRunningLoadLabel: getNonRunningLoadLabel(normalized),
    };
  });
}

export function buildRunningObjectiveContext(sessions: TrainingSession[], weeklyData: WeeklyRunningLoadDatum[]): RunningObjectiveContext {
  const current = weeklyData[weeklyData.length - 1] ?? null;

  if (!current) {
    return {
      headline: "Datos insuficientes de carrera.",
      signalDetail: "No hay semanas disponibles para construir una lectura específica de running.",
      evidence: ["Dato insuficiente: no hay sesiones registradas en el rango visible."],
      nonRunningContext: "Carga no-running no disponible.",
      dailyCheckContext: "Útil para valorar en check diario cuando exista historial de carrera y carga global.",
      insufficientData: ["Sin semanas con datos en el rango visible."],
      copyText: "CONTEXTO RUNNING HYBRID OS\n\nDato insuficiente: no hay semanas disponibles para construir contexto running.",
    };
  }

  const previous = weeklyData[weeklyData.length - 2] ?? null;
  const recentWeeks = weeklyData.slice(0, -1).filter((week) => week.totalSessions > 0).slice(-4);
  const recentAverage = getAverage(recentWeeks.map((week) => week.totalRunKm));
  const currentWeekSessions = getSessionsInWeek(sessions, current);
  const structuredRunningSessions = currentWeekSessions.filter(isPureRunningSession);
  const runningRpeValues = structuredRunningSessions
    .map((session) => session.rpe)
    .filter((value): value is number => typeof value === "number" && value > 0);
  const runningAverageRpe = runningRpeValues.length > 0 ? round(getAverage(runningRpeValues) ?? 0) : null;
  const runningPaceReadySessions = structuredRunningSessions.filter((session) => getSessionRunMeters(session) > 0 && (session.durationMinutes ?? 0) > 0).length;
  const mixedRatio = current.totalRunKm > 0 ? current.mixedRunKm / current.totalRunKm : 0;
  const changePercent = recentAverage && recentAverage > 0 ? round(((current.totalRunKm - recentAverage) / recentAverage) * 100) : null;
  const weekDeltaPercent = previous && previous.totalRunKm > 0 ? round(((current.totalRunKm - previous.totalRunKm) / previous.totalRunKm) * 100) : null;
  const highRunReference = recentAverage && recentAverage > 0 ? current.totalRunKm >= recentAverage * 1.15 : current.totalRunKm >= 8;
  const insufficientData = [
    ...(structuredRunningSessions.some((session) => typeof session.rpe !== "number" || session.rpe <= 0) ? ["RPE faltante en parte del running estructurado."] : []),
    ...(structuredRunningSessions.some((session) => !session.equipment?.shoes?.trim() && getSessionRunMeters(session) > 0) ? ["Zapatilla no registrada en parte del running estructurado."] : []),
    ...(structuredRunningSessions.some((session) => getAverageHeartRate(session) === null) ? ["FC media ausente en parte del running estructurado."] : []),
    ...(runningPaceReadySessions < Math.min(2, structuredRunningSessions.length) ? ["Pocas sesiones con distancia y duración para ritmo medio."] : []),
    ...(recentWeeks.length < 3 ? ["Referencia reciente limitada para comparar tendencia."] : []),
  ];

  let headline = "Carrera total estable frente a referencia reciente.";
  let signalDetail = "Se observa una semana de carrera sin desviación clara frente al bloque reciente.";

  if (recentAverage === null) {
    headline = current.totalRunKm > 0 ? "Carrera registrada con referencia reciente limitada." : "Sin carrera registrada en la semana visible.";
    signalDetail = current.totalRunKm > 0
      ? "Hay volumen de carrera, pero faltan semanas comparables para leer tendencia."
      : "No se observa distancia de carrera en la semana actual del gráfico.";
  } else if (changePercent !== null && changePercent >= 20) {
    headline = "Carrera total por encima de referencia reciente.";
    signalDetail = `${formatKmValue(current.totalRunKm)} esta semana frente a ${formatKmValue(recentAverage)} de media reciente.`;
  } else if (changePercent !== null && changePercent <= -20) {
    headline = "Carrera total por debajo de referencia reciente.";
    signalDetail = `${formatKmValue(current.totalRunKm)} esta semana frente a ${formatKmValue(recentAverage)} de media reciente.`;
  } else if (current.totalRunKm > 0) {
    signalDetail = `${formatKmValue(current.totalRunKm)} esta semana frente a ${formatKmValue(recentAverage)} de media reciente.`;
  }

  const evidence = [
    `Carrera total: ${formatKmValue(current.totalRunKm)} (${formatKmValue(current.structuredRunKm)} running estructurado · ${formatKmValue(current.mixedRunKm)} mixto).`,
    recentAverage === null
      ? "Media reciente: dato insuficiente."
      : `Media reciente visible: ${formatKmValue(recentAverage)}${changePercent === null ? "." : ` · cambio ${changePercent > 0 ? "+" : ""}${changePercent}%.`}`,
    mixedRatio >= 0.55
      ? "Parte relevante de la carrera viene de sesiones mixtas."
      : "El running estructurado pesa más que la carrera mixta en la semana visible.",
    weekDeltaPercent === null
      ? "Progresión semanal: dato insuficiente."
      : weekDeltaPercent >= 25
        ? `Progresión semanal: subida relevante frente a la semana anterior (${weekDeltaPercent > 0 ? "+" : ""}${weekDeltaPercent}%).`
        : weekDeltaPercent <= -25
          ? `Progresión semanal: bajada relevante frente a la semana anterior (${weekDeltaPercent}%).`
          : `Progresión semanal: estable frente a la semana anterior (${weekDeltaPercent > 0 ? "+" : ""}${weekDeltaPercent}%).`,
  ];

  let nonRunningContext = `La semana incluye carga no-running ${current.nonRunningLoadLabel}: ${current.nonRunningSessions} sesiones, ${current.nonRunningDurationMinutes} min, RPE medio ${formatRpeValue(current.nonRunningAverageRpe)}.`;

  if (highRunReference && current.nonRunningLoadNormalized > 0.55) {
    nonRunningContext = `Los km ocurren en una semana con carga no-running ${current.nonRunningLoadLabel}: ${current.nonRunningSessions} sesiones, ${current.nonRunningDurationMinutes} min, RPE medio ${formatRpeValue(current.nonRunningAverageRpe)}.`;
  } else if (highRunReference && current.nonRunningLoadNormalized <= 0.25) {
    nonRunningContext = `Volumen de carrera concentrado en semana de baja carga no-running: ${current.nonRunningSessions} sesiones y ${current.nonRunningDurationMinutes} min.`;
  }

  const dailyCheckContext = "Útil para valorar impacto acumulado junto a gemelos, sóleo, aductores, molestias y sensación de fatiga en el check diario.";
  const copyLines = [
    "CONTEXTO RUNNING HYBRID OS",
    "",
    "Periodo:",
    `${current.isCurrentWeek ? "Esta semana" : "Semana visible"} (${current.weekLabel} · ${current.weekMetaLabel})`,
    "",
    "Carrera:",
    `* Carrera total: ${formatKmValue(current.totalRunKm)}`,
    `* Running estructurado: ${formatKmValue(current.structuredRunKm)}`,
    `* Carrera mixta: ${formatKmValue(current.mixedRunKm)}`,
    `* Sesiones running: ${current.runningSessions}`,
    `* Ritmo medio running: ${runningPaceReadySessions > 0 ? "con dato en sesiones registradas" : "dato insuficiente"}`,
    `* RPE medio running: ${formatRpeValue(runningAverageRpe)}`,
    "",
    "Carga no-running:",
    `* Sesiones no-running: ${current.nonRunningSessions}`,
    `* Duración no-running: ${current.nonRunningDurationMinutes} min`,
    `* Carga relativa: ${current.nonRunningLoadLabel}`,
    "",
    "Señales:",
    `* ${headline}`,
    `* ${mixedRatio >= 0.55 ? "Parte relevante de la carrera viene de sesiones mixtas." : "Running estructurado y carrera mixta diferenciados."}`,
    `* Semana con carga no-running ${current.nonRunningLoadLabel}.`,
    "",
    "Datos insuficientes:",
    ...(insufficientData.length > 0 ? insufficientData.map((item) => `* ${item}`) : ["* Sin huecos relevantes para esta lectura."]),
    "",
    "Uso:",
    "Pegar este bloque en el check diario para valorar running, impacto y recuperación.",
  ];

  return {
    headline,
    signalDetail,
    evidence,
    nonRunningContext,
    dailyCheckContext,
    insufficientData,
    copyText: copyLines.join("\n"),
  };
}
