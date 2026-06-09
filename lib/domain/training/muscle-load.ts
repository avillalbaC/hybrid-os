import { calculateSessionMuscleSummary, createEmptyMuscleSummary, muscleNames } from "@/lib/selectors/training";
import type { MuscleName, SessionMuscleSummary, TrainingSession } from "@/types/training";

export type MuscleLoadTotal = {
  muscle: MuscleName;
  load: number;
  percentOfMax: number;
};

export type MuscleGroupKey =
  | "lowerBody"
  | "upperBody"
  | "core"
  | "push"
  | "pull"
  | "anteriorChain"
  | "posteriorChain"
  | "kneeDominant"
  | "hipDominant";

export type MuscleGroupTotal = {
  key: MuscleGroupKey;
  label: string;
  muscles: MuscleName[];
  load: number;
  percentOfTotal: number;
};

export type MuscleImbalanceAlert = {
  level: "info" | "vigilar" | "alerta";
  title: string;
  detail: string;
};

export type MuscleImbalanceContext = {
  runningDistanceMeters?: number;
};

export const supportedMuscles: MuscleName[] = muscleNames;

export const muscleGroupDefinitions: Record<MuscleGroupKey, { label: string; muscles: MuscleName[] }> = {
  lowerBody: {
    label: "Tren inferior",
    muscles: ["quadriceps", "hamstrings", "glutes", "calves", "hipFlexors", "adductors"],
  },
  upperBody: {
    label: "Tren superior",
    muscles: ["lats", "upperBack", "traps", "shoulders", "chest", "triceps", "biceps", "forearms"],
  },
  core: {
    label: "Core",
    muscles: ["core", "lowerBack"],
  },
  push: {
    label: "Empuje",
    muscles: ["chest", "shoulders", "triceps", "quadriceps"],
  },
  pull: {
    label: "Tracción",
    muscles: ["lats", "upperBack", "traps", "biceps", "forearms", "hamstrings", "glutes"],
  },
  anteriorChain: {
    label: "Cadena anterior",
    muscles: ["quadriceps", "hipFlexors", "adductors", "core", "chest", "shoulders", "triceps"],
  },
  posteriorChain: {
    label: "Cadena posterior",
    muscles: ["hamstrings", "glutes", "calves", "lowerBack", "lats", "upperBack", "traps"],
  },
  kneeDominant: {
    label: "Rodilla dominante",
    muscles: ["quadriceps", "calves", "adductors"],
  },
  hipDominant: {
    label: "Cadera dominante",
    muscles: ["glutes", "hamstrings", "lowerBack", "hipFlexors"],
  },
};

function getSummaryTotal(muscleSummary: SessionMuscleSummary) {
  return supportedMuscles.reduce((total, muscle) => total + (muscleSummary[muscle] ?? 0), 0);
}

function getSummaryMax(muscleSummary: SessionMuscleSummary) {
  return Math.max(...supportedMuscles.map((muscle) => muscleSummary[muscle] ?? 0), 0);
}

function getPercent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function getGroupLoad(muscleSummary: SessionMuscleSummary, muscles: MuscleName[]) {
  return muscles.reduce((total, muscle) => total + (muscleSummary[muscle] ?? 0), 0);
}

export function getSessionMuscleSummary(session: TrainingSession): SessionMuscleSummary {
  const summaryTotal = supportedMuscles.reduce((total, muscle) => total + (session.sessionMuscleSummary[muscle] ?? 0), 0);
  return summaryTotal > 0 ? session.sessionMuscleSummary : calculateSessionMuscleSummary(session);
}

export function calculateMuscleSummary(sessions: TrainingSession[]): SessionMuscleSummary {
  const summary = createEmptyMuscleSummary();

  sessions.forEach((session) => {
    const sessionSummary = getSessionMuscleSummary(session);

    supportedMuscles.forEach((muscle) => {
      summary[muscle] += sessionSummary[muscle] ?? 0;
    });
  });

  return summary;
}

export function getTopMuscles(muscleSummary: SessionMuscleSummary, limit = 5): MuscleLoadTotal[] {
  const maxLoad = Math.max(getSummaryMax(muscleSummary), 1);

  return supportedMuscles
    .map((muscle) => ({
      muscle,
      load: muscleSummary[muscle] ?? 0,
      percentOfMax: getPercent(muscleSummary[muscle] ?? 0, maxLoad),
    }))
    .filter((item) => item.load > 0)
    .sort((a, b) => b.load - a.load)
    .slice(0, limit);
}

export function getUnderusedMuscles(muscleSummary: SessionMuscleSummary, limit = 5): MuscleLoadTotal[] {
  const total = getSummaryTotal(muscleSummary);
  const maxLoad = getSummaryMax(muscleSummary);

  if (total <= 0 || maxLoad <= 0) {
    return [];
  }

  const threshold = maxLoad * 0.2;

  return supportedMuscles
    .map((muscle) => ({
      muscle,
      load: muscleSummary[muscle] ?? 0,
      percentOfMax: getPercent(muscleSummary[muscle] ?? 0, maxLoad),
    }))
    .filter((item) => item.load === 0 || item.load < threshold)
    .sort((a, b) => a.load - b.load || a.muscle.localeCompare(b.muscle))
    .slice(0, limit);
}

export function calculateMuscleGroups(muscleSummary: SessionMuscleSummary): MuscleGroupTotal[] {
  const total = getSummaryTotal(muscleSummary);

  return Object.entries(muscleGroupDefinitions).map(([key, definition]) => {
    const load = getGroupLoad(muscleSummary, definition.muscles);

    return {
      key: key as MuscleGroupKey,
      label: definition.label,
      muscles: definition.muscles,
      load,
      percentOfTotal: getPercent(load, total),
    };
  });
}

export function detectMuscleImbalances(
  muscleSummary: SessionMuscleSummary,
  context: MuscleImbalanceContext = {},
): MuscleImbalanceAlert[] {
  const total = getSummaryTotal(muscleSummary);

  if (total <= 0) {
    return [];
  }

  const groups = calculateMuscleGroups(muscleSummary);
  const groupByKey = new Map(groups.map((group) => [group.key, group]));
  const alerts: MuscleImbalanceAlert[] = [];
  const lowerBody = groupByKey.get("lowerBody");
  const upperBody = groupByKey.get("upperBody");
  const push = groupByKey.get("push");
  const pull = groupByKey.get("pull");
  const maxLoad = getSummaryMax(muscleSummary);
  const lowThreshold = maxLoad * 0.2;
  const coreLumbarLoad = (muscleSummary.core ?? 0) + (muscleSummary.lowerBack ?? 0);

  if (lowerBody && lowerBody.percentOfTotal > 65) {
    alerts.push({
      level: "alerta",
      title: "Dominancia de tren inferior",
      detail: `${lowerBody.percentOfTotal}% de la carga total está en tren inferior.`,
    });
  } else if (lowerBody && lowerBody.percentOfTotal > 52) {
    alerts.push({
      level: "vigilar",
      title: "Sesgo hacia tren inferior",
      detail: `${lowerBody.percentOfTotal}% de la carga total está en tren inferior.`,
    });
  }

  if (upperBody && upperBody.percentOfTotal < 30) {
    alerts.push({
      level: "vigilar",
      title: "Tren superior bajo",
      detail: `${upperBody.percentOfTotal}% de la carga total está en tren superior.`,
    });
  }

  if (push && pull && pull.load > 0 && push.load < pull.load * 0.6) {
    alerts.push({
      level: "vigilar",
      title: "Empuje bajo respecto a tracción",
      detail: `${push.load} puntos de empuje frente a ${pull.load} de tracción.`,
    });
  } else if (push && pull && pull.load > push.load * 1.25) {
    alerts.push({
      level: "info",
      title: "Tracción por encima de empuje",
      detail: `${pull.load} puntos de tracción frente a ${push.load} de empuje.`,
    });
  }

  if (push && pull && push.load > 0 && pull.load < push.load * 0.6) {
    alerts.push({
      level: "vigilar",
      title: "Tracción baja respecto a empuje",
      detail: `${pull.load} puntos de tracción frente a ${push.load} de empuje.`,
    });
  }

  const topFive = getTopMuscles(muscleSummary, 5);
  if (topFive.some((item) => item.muscle === "calves")) {
    alerts.push({
      level: (context.runningDistanceMeters ?? 0) >= 5000 ? "vigilar" : "info",
      title: "Gemelos con carga alta",
      detail: (context.runningDistanceMeters ?? 0) >= 5000
        ? "Gemelos en top 5 con volumen alto de carrera en el periodo."
        : "Gemelos aparecen entre los músculos más cargados del periodo.",
    });
  }

  if (coreLumbarLoad >= total * 0.22 && coreLumbarLoad >= maxLoad * 0.8) {
    alerts.push({
      level: "vigilar",
      title: "Core/lumbar con carga elevada",
      detail: `${coreLumbarLoad} puntos acumulados entre core y lumbar.`,
    });
  }

  const concentratedMuscle = getTopMuscles(muscleSummary, 1)[0];
  if (concentratedMuscle && concentratedMuscle.load >= total * 0.18) {
    alerts.push({
      level: "info",
      title: "Carga concentrada",
      detail: `${concentratedMuscle.percentOfMax}% del máximo está en ${concentratedMuscle.muscle}.`,
    });
  }

  if (["chest", "triceps", "biceps"].every((muscle) => (muscleSummary[muscle as MuscleName] ?? 0) < lowThreshold)) {
    alerts.push({
      level: "info",
      title: "Trabajo de empuje/aislamiento superior bajo",
      detail: "Pecho, tríceps y bíceps están por debajo del 20% del músculo más cargado.",
    });
  }

  return alerts.slice(0, 4);
}

export function getMuscleLoadTotal(muscleSummary: SessionMuscleSummary) {
  return getSummaryTotal(muscleSummary);
}

export function getMuscleLoadMax(muscleSummary: SessionMuscleSummary) {
  return getSummaryMax(muscleSummary);
}

export function getMusclePercent(value: number, total: number) {
  return getPercent(value, total);
}
