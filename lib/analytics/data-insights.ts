import { getWeeklyTrendMetrics, type TrendMetric, type WeeklyTrendMetrics } from "@/lib/analytics/trends";
import {
  type DashboardPeriod,
  filterSessionsByPeriod,
  getLatestDate,
  resolvePeriodReferenceDate,
} from "@/lib/domain/dashboard/periods";
import {
  calculateMuscleGroups,
  calculateMuscleSummary,
  getMuscleLoadTotal,
  getTopMuscles,
  getUnderusedMuscles,
  type MuscleGroupKey,
  type MuscleGroupTotal,
  type MuscleLoadTotal,
} from "@/lib/domain/training/muscle-load";
import { getRunningBreakdown } from "@/lib/domain/training/run-exposure";
import { isSecondaryActivity, summarizeSecondaryActivities } from "@/lib/domain/training/secondary-activity";
import { formatDuration, formatKm, formatLoadKg, formatMuscleName, formatRpe, formatTrainingType } from "@/lib/utils/format";
import type { MuscleName, TrainingSession, TrainingSessionType } from "@/types/training";

export type DataInsightSeverity = "info" | "positive" | "warning" | "critical";

export type DataInsightCategory =
  | "load"
  | "running"
  | "muscle"
  | "intensity"
  | "volume"
  | "discipline"
  | "recovery"
  | "consistency"
  | "data_quality";

export type DataInsight = {
  id: string;
  category: DataInsightCategory;
  severity: DataInsightSeverity;
  title: string;
  message: string;
  evidence: string[];
  recommendation?: string;
  metric?: {
    label: string;
    value: string;
  };
};

export type DataAnalysisSummary = {
  status: "normal" | "vigilar" | "alta_carga" | "baja_carga" | "insuficiente";
  headline: string;
  summary: string;
  topSignals: DataInsight[];
  warnings: DataInsight[];
  positives: DataInsight[];
  recommendations: string[];
};

export type TrainingDataInsightsResult = {
  summary: DataAnalysisSummary;
  insights: DataInsight[];
  debugMetrics?: DataInsightDebugMetrics;
};

export type DataInsightsOptions = {
  period?: DashboardPeriod;
  includeDebugMetrics?: boolean;
};

type DisciplineKey = TrainingSessionType | "secondary_activity";

type DataQualityMetrics = {
  partialSessions: number;
  missingDuration: number;
  missingRpe: number;
  missingResult: number;
  pendingFields: number;
  runningWithoutShoes: number;
};

type AggregateMetrics = {
  sessions: number;
  completedSessions: number;
  partialSessions: number;
  durationMinutes: number;
  running: ReturnType<typeof getRunningBreakdown>;
  cardioLoad: number;
  fatigueCost: number;
  impactScore: number;
  strengthLoad: number;
  technicalLoad: number;
  externalLoadKg: number;
  reps: number;
  averageRpe: number | null;
  highRpeSessions: number;
  disciplineCounts: Partial<Record<DisciplineKey, number>>;
  secondarySummary: ReturnType<typeof summarizeSecondaryActivities>;
  muscleSummary: Record<MuscleName, number>;
  muscleTotal: number;
  muscleGroups: MuscleGroupTotal[];
  topMuscles: MuscleLoadTotal[];
  underusedMuscles: MuscleLoadTotal[];
  dataQuality: DataQualityMetrics;
};

type DataInsightDebugMetrics = {
  period: DashboardPeriod;
  periodSessions: number;
  activeWeeks: number;
  current: AggregateMetrics;
  trendChanges: Record<string, number | null>;
};

const severityRank: Record<DataInsightSeverity, number> = {
  critical: 0,
  warning: 1,
  positive: 2,
  info: 3,
};

function roundValue(value: number, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function percent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "Sin referencia";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${Math.round(value)}%`;
}

function formatRatio(value: number, total: number) {
  return `${percent(value, total)}%`;
}

function metricChanged(metric: TrendMetric, threshold: number) {
  return metric.changePercent !== null && Math.abs(metric.changePercent) >= threshold;
}

function getPositiveSessions(sessions: TrainingSession[]) {
  return sessions.filter((session) => session.status !== "cancelled" && session.status !== "planned");
}

function getDominantDiscipline(counts: Partial<Record<DisciplineKey, number>>) {
  return (Object.entries(counts) as Array<[DisciplineKey, number]>)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)[0] ?? null;
}

function getDisciplineCount(counts: Partial<Record<DisciplineKey, number>>, key: DisciplineKey) {
  return counts[key] ?? 0;
}

function getGroup(groups: MuscleGroupTotal[], key: MuscleGroupKey) {
  return groups.find((group) => group.key === key);
}

function getCoreLumbarLoad(muscleSummary: Record<MuscleName, number>) {
  return (muscleSummary.core ?? 0) + (muscleSummary.lowerBack ?? 0);
}

function hasTopMuscle(topMuscles: MuscleLoadTotal[], muscle: MuscleName) {
  return topMuscles.some((item) => item.muscle === muscle);
}

function getMuscleNames(muscles: MuscleLoadTotal[]) {
  return muscles.map((item) => formatMuscleName(item.muscle)).join(", ");
}

function getDataQualityMetrics(sessions: TrainingSession[]): DataQualityMetrics {
  return sessions.reduce<DataQualityMetrics>(
    (totals, session) => {
      const hasRunningShoesGap =
        session.type === "running" &&
        session.sessionMetrics.totalRunMeters > 0 &&
        !session.equipment?.shoes?.trim();
      const resultIsMissing =
        !session.result ||
        (session.result.type !== "none" && !session.result.score && !session.result.timeSeconds && !session.result.capMinutes);

      return {
        partialSessions: totals.partialSessions + (session.status === "partial" || session.dataQuality === "partial" ? 1 : 0),
        missingDuration: totals.missingDuration + (session.durationMinutes ? 0 : 1),
        missingRpe: totals.missingRpe + (typeof session.rpe === "number" && session.rpe > 0 ? 0 : 1),
        missingResult: totals.missingResult + (resultIsMissing ? 1 : 0),
        pendingFields: totals.pendingFields + session.pendingFields.length,
        runningWithoutShoes: totals.runningWithoutShoes + (hasRunningShoesGap ? 1 : 0),
      };
    },
    {
      partialSessions: 0,
      missingDuration: 0,
      missingRpe: 0,
      missingResult: 0,
      pendingFields: 0,
      runningWithoutShoes: 0,
    },
  );
}

function aggregateSessions(sessions: TrainingSession[]): AggregateMetrics {
  const positiveSessions = getPositiveSessions(sessions);
  const rpeSessions = positiveSessions.filter((session) => typeof session.rpe === "number" && session.rpe > 0);
  const rpeTotal = rpeSessions.reduce((total, session) => total + (session.rpe ?? 0), 0);
  const muscleSummary = calculateMuscleSummary(positiveSessions);
  const disciplineCounts = positiveSessions.reduce<Partial<Record<DisciplineKey, number>>>((counts, session) => {
    const key = isSecondaryActivity(session) ? "secondary_activity" : session.type;
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});

  return {
    sessions: positiveSessions.length,
    completedSessions: positiveSessions.filter((session) => session.status === "completed").length,
    partialSessions: positiveSessions.filter((session) => session.status === "partial").length,
    durationMinutes: positiveSessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0),
    running: getRunningBreakdown(positiveSessions),
    cardioLoad: positiveSessions.reduce((total, session) => total + session.sessionMetrics.cardioLoad, 0),
    fatigueCost: positiveSessions.reduce((total, session) => total + session.sessionMetrics.fatigueCost, 0),
    impactScore: positiveSessions.reduce((total, session) => total + session.sessionMetrics.impactScore, 0),
    strengthLoad: positiveSessions.reduce((total, session) => total + session.sessionMetrics.strengthLoad, 0),
    technicalLoad: positiveSessions.reduce((total, session) => total + session.sessionMetrics.technicalLoad, 0),
    externalLoadKg: positiveSessions.reduce((total, session) => total + (session.sessionMetrics.totalExternalLoadKg ?? 0), 0),
    reps: positiveSessions.reduce(
      (total, session) =>
        total +
        session.sessionMetrics.totalBarbellReps +
        session.sessionMetrics.totalDumbbellReps +
        session.sessionMetrics.totalKettlebellReps +
        session.sessionMetrics.totalGymnasticsReps,
      0,
    ),
    averageRpe: rpeSessions.length > 0 ? roundValue(rpeTotal / rpeSessions.length) : null,
    highRpeSessions: rpeSessions.filter((session) => (session.rpe ?? 0) >= 8).length,
    disciplineCounts,
    secondarySummary: summarizeSecondaryActivities(positiveSessions),
    muscleSummary,
    muscleTotal: getMuscleLoadTotal(muscleSummary),
    muscleGroups: calculateMuscleGroups(muscleSummary),
    topMuscles: getTopMuscles(muscleSummary, 8),
    underusedMuscles: getUnderusedMuscles(muscleSummary, 8),
    dataQuality: getDataQualityMetrics(positiveSessions),
  };
}

function getActiveWeeks(trends: WeeklyTrendMetrics) {
  return trends.buckets.filter((bucket) => bucket.sessionsCount > 0).length;
}

function getTrendEvidence(metric: TrendMetric, valueLabel: string) {
  const evidence = [`Periodo actual: ${valueLabel}.`];

  if (metric.recentAverage !== null) {
    evidence.push(`Media reciente: ${Math.round(metric.recentAverage).toLocaleString("es-ES")} ${metric.unit}.`);
  }

  if (metric.changePercent !== null) {
    evidence.push(`Cambio frente a referencia: ${formatPercent(metric.changePercent)}.`);
  }

  return evidence;
}

function buildInsights(
  period: DashboardPeriod,
  metrics: AggregateMetrics,
  trends: WeeklyTrendMetrics,
  activeWeeks: number,
): DataInsight[] {
  const insights: DataInsight[] = [];
  const hasReference = period === "week" && activeWeeks >= 3;
  const totalRun = metrics.running.totalRunExposureMeters;
  const mixedRunRatio = totalRun > 0 ? metrics.running.mixedMeters / totalRun : 0;
  const highRpeRatio = metrics.sessions > 0 ? metrics.highRpeSessions / metrics.sessions : 0;
  const lowerBody = getGroup(metrics.muscleGroups, "lowerBody");
  const upperBody = getGroup(metrics.muscleGroups, "upperBody");
  const core = getGroup(metrics.muscleGroups, "core");
  const push = getGroup(metrics.muscleGroups, "push");
  const pull = getGroup(metrics.muscleGroups, "pull");
  const topThreeLoad = metrics.topMuscles.slice(0, 3).reduce((total, item) => total + item.load, 0);
  const topThreePercent = percent(topThreeLoad, metrics.muscleTotal);
  const hyroxSessions = getDisciplineCount(metrics.disciplineCounts, "hyrox");
  const crossfitSessions = getDisciplineCount(metrics.disciplineCounts, "crossfit");
  const strengthSessions = getDisciplineCount(metrics.disciplineCounts, "fuerza") + getDisciplineCount(metrics.disciplineCounts, "halterofilia");
  const mobilitySessions = getDisciplineCount(metrics.disciplineCounts, "movilidad");

  const addInsight = (insight: DataInsight) => insights.push(insight);

  if (metrics.sessions < 2 || (period === "week" && activeWeeks < 3)) {
    addInsight({
      id: "reference-insufficient",
      category: "data_quality",
      severity: "info",
      title: "Referencia limitada",
      message: "La lectura evita conclusiones fuertes porque hay poca base reciente para comparar.",
      evidence: [
        `${metrics.sessions} sesiones en el periodo.`,
        `${activeWeeks} semanas con datos en el histórico analizado.`,
      ],
      recommendation: "Mantener el registro consistente antes de subir o bajar carga solo por esta señal.",
    });
  }

  if (hasReference && trends.load.changePercent !== null && trends.load.changePercent >= 25) {
    addInsight({
      id: "fatigue-spike",
      category: "load",
      severity: trends.load.changePercent >= 45 || highRpeRatio >= 0.5 ? "critical" : "warning",
      title: "Fatiga semanal en subida",
      message: "La carga interna sube por encima de la referencia reciente.",
      evidence: getTrendEvidence(trends.load, `${metrics.fatigueCost} pts de fatiga`),
      recommendation: "Evitar sumar otra sesión dura hasta confirmar recuperación y molestias.",
      metric: { label: "Fatiga", value: `${metrics.fatigueCost}` },
    });
  }

  if (hasReference && trends.impact.changePercent !== null && trends.impact.changePercent >= 25) {
    addInsight({
      id: "impact-spike",
      category: "load",
      severity: trends.impact.changePercent >= 45 ? "critical" : "warning",
      title: "Impacto por encima de referencia",
      message: "El impacto acumulado sube y puede condicionar carrera, gemelos y tren inferior.",
      evidence: getTrendEvidence(trends.impact, `${metrics.impactScore} pts de impacto`),
      recommendation: "Priorizar bajo impacto o técnica si la próxima sesión mantiene intensidad.",
      metric: { label: "Impacto", value: `${metrics.impactScore}` },
    });
  }

  if (hasReference && trends.duration.changePercent !== null && trends.duration.changePercent <= -20 && (metrics.averageRpe ?? 0) >= 8) {
    addInsight({
      id: "low-volume-high-intensity",
      category: "intensity",
      severity: "warning",
      title: "Menos volumen, intensidad alta",
      message: "El periodo tiene menos duración que la referencia, pero el RPE medio sigue alto.",
      evidence: [
        `Duración: ${formatDuration(metrics.durationMinutes)} (${formatPercent(trends.duration.changePercent)}).`,
        `RPE medio: ${formatRpe(metrics.averageRpe)}.`,
      ],
      recommendation: "No interpretar la bajada de minutos como descarga completa si la intensidad sigue alta.",
      metric: { label: "RPE medio", value: formatRpe(metrics.averageRpe) },
    });
  }

  if (hasReference && trends.load.changePercent !== null && trends.duration.changePercent !== null && trends.load.changePercent <= -15 && trends.duration.changePercent <= -15) {
    addInsight({
      id: "possible-deload",
      category: "recovery",
      severity: "positive",
      title: "Posible descarga real",
      message: "Duración y fatiga bajan a la vez frente a la referencia reciente.",
      evidence: [
        `Duración: ${formatDuration(metrics.durationMinutes)} (${formatPercent(trends.duration.changePercent)}).`,
        `Fatiga: ${metrics.fatigueCost} (${formatPercent(trends.load.changePercent)}).`,
      ],
      recommendation: "Aprovechar la ventana para recuperar o reintroducir volumen de forma progresiva.",
    });
  }

  if (hasReference && trends.duration.changePercent !== null && trends.duration.changePercent >= 20 && trends.load.changePercent !== null && trends.load.changePercent <= 10) {
    addInsight({
      id: "efficient-volume",
      category: "volume",
      severity: "positive",
      title: "Más volumen sin gran subida de fatiga",
      message: "El volumen temporal sube sin que la fatiga acompañe en la misma proporción.",
      evidence: [
        `Duración: ${formatDuration(metrics.durationMinutes)} (${formatPercent(trends.duration.changePercent)}).`,
        `Fatiga: ${metrics.fatigueCost} (${formatPercent(trends.load.changePercent)}).`,
      ],
      recommendation: "Mantener la progresión si sueño, molestias y rendimiento acompañan.",
    });
  }

  if (hasReference && trends.runExposure.total.changePercent !== null && trends.runExposure.total.changePercent >= 25) {
    addInsight({
      id: "run-exposure-spike",
      category: "running",
      severity: trends.runExposure.total.changePercent >= 45 ? "critical" : "warning",
      title: "Carrera total en subida brusca",
      message: "La exposición total de carrera sube frente al bloque reciente.",
      evidence: getTrendEvidence(trends.runExposure.total, formatKm(totalRun, { forceKm: true })),
      recommendation: "No añadir intensidad de carrera hasta validar gemelos, sóleo y molestias de impacto.",
      metric: { label: "Carrera total", value: formatKm(totalRun, { forceKm: true }) },
    });
  }

  if (metrics.running.structuredMeters === 0 && metrics.running.mixedMeters > 0) {
    addInsight({
      id: "mixed-running-only",
      category: "running",
      severity: hyroxSessions >= 2 || crossfitSessions >= 2 ? "warning" : "info",
      title: "Carrera sin running estructurado",
      message: "Toda la carrera registrada viene de sesiones mixtas, no de sesiones type running.",
      evidence: [
        `${formatKm(metrics.running.mixedMeters, { forceKm: true })} en sesiones mixtas.`,
        `${formatKm(metrics.running.structuredMeters, { forceKm: true })} en running estructurado.`,
      ],
      recommendation: "Separar una sesión suave o técnica si quieres controlar ritmos, zapatillas y progresión de carrera.",
      metric: { label: "Running estructurado", value: formatKm(metrics.running.structuredMeters, { forceKm: true }) },
    });
  } else if (mixedRunRatio >= 0.6) {
    addInsight({
      id: "mixed-running-dominates",
      category: "running",
      severity: "info",
      title: "Carrera concentrada en sesiones mixtas",
      message: "La mayor parte de la carrera aparece dentro de HYROX, CrossFit u otras sesiones mixtas.",
      evidence: [
        `Mixto: ${formatKm(metrics.running.mixedMeters, { forceKm: true })} (${formatRatio(metrics.running.mixedMeters, totalRun)}).`,
        `Estructurado: ${formatKm(metrics.running.structuredMeters, { forceKm: true })}.`,
      ],
      recommendation: "Interpretar ritmos y fatiga como carrera bajo contexto mixto, no como running fresco.",
    });
  }

  if (hasReference && trends.externalLoad.changePercent !== null && trends.externalLoad.changePercent >= 20 && trends.load.changePercent !== null && trends.load.changePercent >= 20) {
    addInsight({
      id: "strength-fatigue-spike",
      category: "load",
      severity: "warning",
      title: "Carga externa y fatiga suben juntas",
      message: "La carga de fuerza sube al mismo tiempo que la carga interna.",
      evidence: [
        `Carga externa: ${formatLoadKg(metrics.externalLoadKg)} (${formatPercent(trends.externalLoad.changePercent)}).`,
        `Fatiga: ${metrics.fatigueCost} (${formatPercent(trends.load.changePercent)}).`,
        `${metrics.reps.toLocaleString("es-ES")} repeticiones contabilizadas.`,
      ],
      recommendation: "Evitar combinar otra sesión pesada con alta intensidad metabólica en el corto plazo.",
      metric: { label: "Carga externa", value: formatLoadKg(metrics.externalLoadKg) },
    });
  }

  if (hasReference && trends.externalLoad.changePercent !== null && trends.externalLoad.changePercent <= -10 && trends.cardioLoad.changePercent !== null && trends.cardioLoad.changePercent >= 10) {
    addInsight({
      id: "cardio-shift",
      category: "discipline",
      severity: "info",
      title: "Periodo más cardiovascular",
      message: "Baja la carga externa mientras sube el componente cardiovascular.",
      evidence: [
        `Carga externa: ${formatLoadKg(metrics.externalLoadKg)} (${formatPercent(trends.externalLoad.changePercent)}).`,
        `Carga cardio: ${metrics.cardioLoad} (${formatPercent(trends.cardioLoad.changePercent)}).`,
      ],
      recommendation: "Revisar si esta distribución encaja con el objetivo del bloque.",
    });
  }

  if (hasReference && metricChanged(trends.externalLoad, 8) === false && metrics.externalLoadKg > 0 && metrics.strengthLoad > 0) {
    addInsight({
      id: "stable-strength",
      category: "load",
      severity: "positive",
      title: "Fuerza estable",
      message: "La carga externa no muestra una desviación relevante frente a la referencia reciente.",
      evidence: [
        `Carga externa: ${formatLoadKg(metrics.externalLoadKg)}.`,
        `Cambio: ${formatPercent(trends.externalLoad.changePercent)}.`,
      ],
      recommendation: "Buen punto para consolidar técnica o pequeñas progresiones.",
    });
  }

  if (metrics.muscleTotal > 0 && topThreePercent >= 45) {
    addInsight({
      id: "muscle-concentration",
      category: "muscle",
      severity: topThreePercent >= 60 ? "warning" : "info",
      title: "Carga muscular concentrada",
      message: "El top 3 muscular concentra una parte importante de la carga del periodo.",
      evidence: [
        `Top 3: ${getMuscleNames(metrics.topMuscles.slice(0, 3))}.`,
        `${topThreePercent}% de la carga muscular total.`,
      ],
      recommendation: "Evitar repetir el mismo patrón dominante si aparece fatiga local.",
    });
  }

  if (lowerBody && upperBody && lowerBody.load > upperBody.load * 1.25) {
    addInsight({
      id: "lower-body-bias",
      category: "muscle",
      severity: "warning",
      title: "Sesgo hacia tren inferior",
      message: "El tren inferior supera claramente la carga de tren superior.",
      evidence: [
        `Tren inferior: ${lowerBody.load} pts.`,
        `Tren superior: ${upperBody.load} pts.`,
      ],
      recommendation: "Controlar impacto y volumen de pierna antes de añadir más carrera o sentadilla pesada.",
    });
  }

  if (totalRun >= 5000 && hasTopMuscle(metrics.topMuscles.slice(0, 5), "calves")) {
    addInsight({
      id: "calves-running",
      category: "muscle",
      severity: "warning",
      title: "Gemelos cargados con carrera relevante",
      message: "Gemelos aparecen arriba en el ranking muscular con exposición de carrera suficiente para vigilar impacto.",
      evidence: [
        `Carrera total: ${formatKm(totalRun, { forceKm: true })}.`,
        `Top muscular: ${getMuscleNames(metrics.topMuscles.slice(0, 5))}.`,
      ],
      recommendation: "Bajar impacto si notas rigidez y evitar series rápidas sin calentamiento específico.",
    });
  }

  if ((hyroxSessions > 0 || metrics.secondarySummary.kindCounts.padel > 0) && hasTopMuscle(metrics.topMuscles.slice(0, 5), "adductors")) {
    addInsight({
      id: "adductors-hyrox-padel",
      category: "muscle",
      severity: "warning",
      title: "Aductores a vigilar",
      message: "Aductores están en el top muscular dentro de un periodo con HYROX o actividad lateral.",
      evidence: [
        `HYROX: ${hyroxSessions} sesiones.`,
        `Pádel: ${metrics.secondarySummary.kindCounts.padel} sesiones.`,
        `Top muscular: ${getMuscleNames(metrics.topMuscles.slice(0, 5))}.`,
      ],
      recommendation: "Evitar cambios bruscos de dirección o zancadas pesadas si aparece tensión.",
    });
  }

  if (push && pull && pull.load > 0 && push.load < pull.load * 0.6) {
    addInsight({
      id: "push-under-pull",
      category: "muscle",
      severity: "info",
      title: "Empuje bajo respecto a tracción",
      message: "La tracción domina el reparto frente al empuje.",
      evidence: [`Empuje: ${push.load} pts.`, `Tracción: ${pull.load} pts.`],
      recommendation: "Introducir empuje técnico o accesorios ligeros si el bloque no busca sesgo de tracción.",
    });
  }

  if (core && metrics.muscleTotal > 0 && core.load < metrics.muscleTotal * 0.15 && (metrics.impactScore >= 120 || totalRun >= 5000)) {
    addInsight({
      id: "core-low-with-impact",
      category: "muscle",
      severity: "warning",
      title: "Core/lumbar bajo con impacto",
      message: "La carga de core y lumbar queda baja para un periodo con impacto o carrera relevante.",
      evidence: [
        `Core/lumbar: ${getCoreLumbarLoad(metrics.muscleSummary)} pts (${formatRatio(getCoreLumbarLoad(metrics.muscleSummary), metrics.muscleTotal)}).`,
        `Impacto: ${metrics.impactScore}.`,
        `Carrera total: ${formatKm(totalRun, { forceKm: true })}.`,
      ],
      recommendation: "Añadir estabilidad de core o bisagra técnica antes de aumentar impacto.",
    });
  }

  if (metrics.underusedMuscles.length >= 4 && metrics.muscleTotal > 0) {
    addInsight({
      id: "underused-muscles",
      category: "muscle",
      severity: "info",
      title: "Músculos poco estimulados",
      message: "Hay varios grupos con carga baja frente al músculo dominante del periodo.",
      evidence: [`Menor estímulo: ${getMuscleNames(metrics.underusedMuscles.slice(0, 5))}.`],
      recommendation: "Usar accesorios o técnica para completar el reparto si el objetivo es equilibrio general.",
    });
  }

  if (hyroxSessions >= 2 && metrics.running.structuredMeters === 0) {
    addInsight({
      id: "hyrox-without-structured-run",
      category: "discipline",
      severity: "warning",
      title: "HYROX sin running estructurado",
      message: "Hay varias sesiones HYROX, pero no aparece running puro para controlar progresión.",
      evidence: [`HYROX: ${hyroxSessions} sesiones.`, `Running estructurado: ${formatKm(0, { forceKm: true })}.`],
      recommendation: "Añadir una sesión suave o técnica si el objetivo del bloque incluye carrera.",
    });
  }

  if (metrics.secondarySummary.sessions > 0 && metrics.secondarySummary.fatigueCost >= Math.max(70, metrics.fatigueCost * 0.25)) {
    addInsight({
      id: "secondary-fatigue",
      category: "recovery",
      severity: "info",
      title: "Actividad secundaria suma fatiga",
      message: "El volumen complementario aporta una parte visible de la fatiga del periodo.",
      evidence: [
        `${metrics.secondarySummary.sessions} actividades secundarias.`,
        `${metrics.secondarySummary.fatigueCost} pts de fatiga secundaria.`,
      ],
      recommendation: "Contarlo como carga real antes de planificar otra sesión intensa.",
    });
  }

  if (metrics.sessions >= 2 && strengthSessions === 0 && metrics.strengthLoad <= metrics.cardioLoad * 0.35) {
    addInsight({
      id: "strength-underrepresented",
      category: "discipline",
      severity: "info",
      title: "Fuerza poco representada",
      message: "El periodo está más orientado a motor que a fuerza.",
      evidence: [
        `Fuerza/Halterofilia: ${strengthSessions} sesiones.`,
        `Carga fuerza: ${metrics.strengthLoad}.`,
        `Carga cardio: ${metrics.cardioLoad}.`,
      ],
      recommendation: "Añadir fuerza técnica si el objetivo no era una semana claramente cardiovascular.",
    });
  }

  if (mobilitySessions === 0 && (metrics.fatigueCost >= 180 || (metrics.averageRpe ?? 0) >= 8)) {
    addInsight({
      id: "no-recovery-with-load",
      category: "recovery",
      severity: "info",
      title: "Sin recuperación explícita",
      message: "No hay movilidad registrada en un periodo con fatiga o intensidad relevantes.",
      evidence: [`Movilidad: ${mobilitySessions} sesiones.`, `Fatiga: ${metrics.fatigueCost}.`, `RPE medio: ${formatRpe(metrics.averageRpe)}.`],
      recommendation: "Registrar o añadir trabajo suave de recuperación si existe rigidez.",
    });
  }

  if (metrics.dataQuality.partialSessions > 0 && metrics.dataQuality.partialSessions / Math.max(metrics.sessions, 1) >= 0.3) {
    addInsight({
      id: "partial-data",
      category: "data_quality",
      severity: "info",
      title: "Datos parciales",
      message: "Una parte relevante del periodo está marcada como parcial.",
      evidence: [`${metrics.dataQuality.partialSessions}/${metrics.sessions} sesiones parciales.`],
      recommendation: "Completar duración, RPE o resultado para que las comparativas sean más fiables.",
    });
  }

  if (metrics.dataQuality.missingRpe > 0 && metrics.dataQuality.missingRpe / Math.max(metrics.sessions, 1) >= 0.4) {
    addInsight({
      id: "missing-rpe",
      category: "data_quality",
      severity: "info",
      title: "Falta RPE en varias sesiones",
      message: "La lectura de intensidad queda limitada por sesiones sin RPE.",
      evidence: [`${metrics.dataQuality.missingRpe}/${metrics.sessions} sesiones sin RPE.`],
      recommendation: "Registrar RPE para separar carga real de volumen aparente.",
    });
  }

  if (metrics.dataQuality.missingDuration > 0) {
    addInsight({
      id: "missing-duration",
      category: "data_quality",
      severity: "info",
      title: "Duración incompleta",
      message: "Hay sesiones sin duración, así que el volumen temporal puede estar infravalorado.",
      evidence: [`${metrics.dataQuality.missingDuration} sesiones sin duración.`],
      recommendation: "Completar duración exacta o aproximada cuando sea posible.",
    });
  }

  if (metrics.dataQuality.pendingFields > 0 || metrics.dataQuality.missingResult > 0) {
    addInsight({
      id: "pending-fields",
      category: "data_quality",
      severity: "info",
      title: "Campos pendientes",
      message: "Existen datos por completar que pueden afectar resultados y análisis histórico.",
      evidence: [
        `${metrics.dataQuality.pendingFields} campos pendientes.`,
        `${metrics.dataQuality.missingResult} sesiones sin resultado completo.`,
      ],
      recommendation: "Completar primero las sesiones más recientes o de mayor carga.",
    });
  }

  if (metrics.dataQuality.runningWithoutShoes > 0) {
    addInsight({
      id: "running-shoes-missing",
      category: "data_quality",
      severity: "info",
      title: "Zapatillas sin registrar",
      message: "Hay sesiones running con distancia pero sin modelo de zapatilla.",
      evidence: [`${metrics.dataQuality.runningWithoutShoes} sesiones running sin zapatilla.`],
      recommendation: "Añadir zapatilla para controlar desgaste y contexto de ritmos.",
    });
  }

  if (insights.length === 0 && metrics.sessions > 0) {
    addInsight({
      id: "normal-period",
      category: "consistency",
      severity: "positive",
      title: "Periodo estable",
      message: "No aparecen señales deterministas de subida brusca, concentración extrema o calidad de datos crítica.",
      evidence: [
        `${metrics.sessions} sesiones analizadas.`,
        `Duración: ${formatDuration(metrics.durationMinutes)}.`,
        `RPE medio: ${formatRpe(metrics.averageRpe)}.`,
      ],
      recommendation: "Mantener el registro y revisar la siguiente decisión según objetivo del bloque.",
    });
  }

  return insights.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}

function buildSummary(
  period: DashboardPeriod,
  metrics: AggregateMetrics,
  insights: DataInsight[],
  activeWeeks: number,
): DataAnalysisSummary {
  const warnings = insights.filter((insight) => insight.severity === "warning" || insight.severity === "critical");
  const positives = insights.filter((insight) => insight.severity === "positive");
  const recommendations = insights
    .map((insight) => insight.recommendation)
    .filter((recommendation): recommendation is string => Boolean(recommendation))
    .slice(0, 4);
  const dominantDiscipline = getDominantDiscipline(metrics.disciplineCounts);
  const dominantLabel = dominantDiscipline
    ? dominantDiscipline[0] === "secondary_activity"
      ? "actividad secundaria"
      : formatTrainingType(dominantDiscipline[0])
    : "sin disciplina dominante";
  const runDetail = `${formatKm(metrics.running.structuredMeters, { forceKm: true })} estructurado y ${formatKm(metrics.running.mixedMeters, { forceKm: true })} mixto`;

  let status: DataAnalysisSummary["status"] = "normal";

  if (metrics.sessions < 2 || activeWeeks < 3) {
    status = "insuficiente";
  } else if (warnings.some((insight) => insight.severity === "critical")) {
    status = "alta_carga";
  } else if (warnings.length > 0) {
    status = "vigilar";
  } else if (metrics.sessions <= 1 || (metrics.durationMinutes <= 60 && metrics.fatigueCost <= 80)) {
    status = "baja_carga";
  }

  let headline = "Carga estable sin señales críticas.";

  if (status === "insuficiente") {
    headline = "Datos insuficientes para una lectura sólida.";
  } else if (status === "alta_carga") {
    headline = getDisciplineCount(metrics.disciplineCounts, "hyrox") >= 2
      ? "Semana intensa concentrada en HYROX."
      : "Carga alta con señales que conviene vigilar.";
  } else if (insights.some((insight) => insight.id === "low-volume-high-intensity")) {
    headline = "Carga baja con intensidad alta.";
  } else if (insights.some((insight) => insight.id === "mixed-running-only")) {
    headline = "Carrera acumulada sin running estructurado.";
  } else if (status === "baja_carga") {
    headline = "Carga baja del periodo.";
  } else if (status === "vigilar") {
    headline = warnings[0]?.title ?? "Señales a vigilar.";
  } else if (positives.length > 0) {
    headline = positives[0].title;
  }

  const periodLabel: Record<DashboardPeriod, string> = {
    week: "semana",
    month: "mes",
    year: "año",
    all: "histórico",
  };
  const summary = `Lectura del ${periodLabel[period]} con ${metrics.sessions} sesiones, ${formatDuration(metrics.durationMinutes)}, ${formatKm(metrics.running.totalRunExposureMeters, { forceKm: true })} de carrera total (${runDetail}) y RPE medio ${formatRpe(metrics.averageRpe)}. Disciplina dominante: ${dominantLabel}.`;

  return {
    status,
    headline,
    summary,
    topSignals: insights.slice(0, 3),
    warnings,
    positives,
    recommendations,
  };
}

export function getTrainingDataInsights(
  sessions: TrainingSession[],
  options: DataInsightsOptions = {},
): TrainingDataInsightsResult {
  const period = options.period ?? "week";
  const referenceDate = resolvePeriodReferenceDate(period, getLatestDate(sessions));
  const periodSessions = period === "all" ? sessions : filterSessionsByPeriod(sessions, period);
  const current = aggregateSessions(periodSessions);
  const trends = getWeeklyTrendMetrics(sessions);
  const activeWeeks = getActiveWeeks(trends);
  const insights = buildInsights(period, current, trends, activeWeeks);
  const summary = buildSummary(period, current, insights, activeWeeks);

  return {
    summary,
    insights,
    debugMetrics: options.includeDebugMetrics
      ? {
          period,
          periodSessions: periodSessions.length,
          activeWeeks,
          current,
          trendChanges: {
            duration: trends.duration.changePercent,
            fatigue: trends.load.changePercent,
            impact: trends.impact.changePercent,
            run: trends.runExposure.total.changePercent,
            externalLoad: trends.externalLoad.changePercent,
            referenceDate: referenceDate ? Number(referenceDate) : null,
          },
        }
      : undefined,
  };
}
