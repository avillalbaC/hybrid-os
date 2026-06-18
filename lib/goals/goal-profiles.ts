import type { GoalBlockTargets, GoalProfile } from "@/types/goals";

export type GoalProfileMeta = {
  profile: GoalProfile;
  title: string;
  description: string;
};

const profileMeta: Record<GoalProfile, GoalProfileMeta> = {
  recomposition: {
    profile: "recomposition",
    title: "Recomposición / definición",
    description: "Reducir grasa sin perder rendimiento.",
  },
  running_base: {
    profile: "running_base",
    title: "Base de running",
    description: "Construir volumen aeróbico controlado.",
  },
  hyrox_build: {
    profile: "hyrox_build",
    title: "Construcción HYROX",
    description: "Mejorar tolerancia a carrera comprometida, ergómetros y estaciones.",
  },
  strength_maintenance: {
    profile: "strength_maintenance",
    title: "Mantenimiento de fuerza",
    description: "Mantener fuerza y masa muscular limitando fatiga de impacto.",
  },
  deload: {
    profile: "deload",
    title: "Descarga / recuperación",
    description: "Reducir carga, impacto e intensidad para recuperar.",
  },
  custom: {
    profile: "custom",
    title: "Objetivo personalizado",
    description: "Bloque propio con targets ajustados manualmente.",
  },
};

const profileDefaults: Record<GoalProfile, GoalBlockTargets> = {
  recomposition: {
    weekly: {
      structuredRunSessions: { min: 1, target: 2, max: 3, unit: "sesiones" },
      structuredRunKm: { min: 8, target: 12, max: 20, unit: "km" },
      totalRunExposureKm: { max: 28, unit: "km" },
      strengthSessions: { min: 1, target: 2, unit: "sesiones" },
      mobilityDays: { min: 3, target: 4, unit: "días" },
      highIntensitySessions: { max: 3, unit: "sesiones" },
      averageRpe: { max: 7.5, unit: "RPE" },
      totalDurationMinutes: { min: 180, target: 300, max: 480, unit: "min" },
    },
    body: {
      weightTrend: "down",
      waistTrend: "down",
    },
    watch: {
      muscles: ["calves", "shoulders", "lowerBack", "hipFlexors"],
    },
  },
  running_base: {
    weekly: {
      structuredRunSessions: { min: 2, target: 3, max: 4, unit: "sesiones" },
      structuredRunKm: { min: 15, target: 22, max: 32, unit: "km" },
      totalRunExposureKm: { max: 38, unit: "km" },
      strengthSessions: { min: 1, target: 2, unit: "sesiones" },
      mobilityDays: { min: 3, target: 4, unit: "días" },
      highIntensitySessions: { max: 2, unit: "sesiones" },
      averageRpe: { max: 7, unit: "RPE" },
      totalDurationMinutes: { min: 240, target: 360, max: 540, unit: "min" },
    },
    watch: {
      muscles: ["calves", "hamstrings", "hipFlexors", "lowerBack"],
    },
  },
  hyrox_build: {
    weekly: {
      structuredRunSessions: { min: 1, target: 2, max: 3, unit: "sesiones" },
      totalRunExposureKm: { min: 12, target: 22, max: 35, unit: "km" },
      hyroxSessions: { min: 1, target: 2, max: 3, unit: "sesiones" },
      strengthSessions: { min: 1, target: 2, unit: "sesiones" },
      mobilityDays: { min: 3, target: 4, unit: "días" },
      highIntensitySessions: { max: 3, unit: "sesiones" },
      averageRpe: { max: 7.8, unit: "RPE" },
      totalDurationMinutes: { min: 240, target: 390, max: 600, unit: "min" },
    },
    watch: {
      muscles: ["calves", "quadriceps", "glutes", "shoulders", "lowerBack"],
    },
  },
  strength_maintenance: {
    weekly: {
      structuredRunSessions: { min: 1, target: 2, max: 2, unit: "sesiones" },
      structuredRunKm: { min: 6, target: 10, max: 16, unit: "km" },
      totalRunExposureKm: { max: 24, unit: "km" },
      strengthSessions: { min: 2, target: 3, unit: "sesiones" },
      mobilityDays: { min: 3, target: 4, unit: "días" },
      highIntensitySessions: { max: 2, unit: "sesiones" },
      averageRpe: { max: 7.5, unit: "RPE" },
      totalDurationMinutes: { min: 180, target: 300, max: 480, unit: "min" },
    },
    watch: {
      muscles: ["lowerBack", "shoulders", "hipFlexors"],
    },
  },
  deload: {
    weekly: {
      structuredRunSessions: { min: 0, target: 1, max: 2, unit: "sesiones" },
      structuredRunKm: { max: 10, unit: "km" },
      totalRunExposureKm: { max: 16, unit: "km" },
      hyroxSessions: { max: 1, unit: "sesiones" },
      strengthSessions: { min: 0, target: 1, max: 2, unit: "sesiones" },
      mobilityDays: { min: 4, target: 5, unit: "días" },
      highIntensitySessions: { max: 1, unit: "sesiones" },
      averageRpe: { max: 6.5, unit: "RPE" },
      totalDurationMinutes: { min: 120, target: 210, max: 330, unit: "min" },
    },
    watch: {
      muscles: ["calves", "shoulders", "lowerBack", "hipFlexors"],
    },
  },
  custom: {
    weekly: {},
    watch: {
      notes: ["Define targets semanales cuando el bloque necesite más precisión."],
    },
  },
};

export const goalProfileOrder: GoalProfile[] = [
  "recomposition",
  "running_base",
  "hyrox_build",
  "strength_maintenance",
  "deload",
  "custom",
];

export function getGoalProfileMeta(profile: GoalProfile) {
  return profileMeta[profile];
}

export function getAllGoalProfileMeta() {
  return goalProfileOrder.map((profile) => profileMeta[profile]);
}

export function getGoalProfileDefaults(profile: GoalProfile): GoalBlockTargets {
  return JSON.parse(JSON.stringify(profileDefaults[profile])) as GoalBlockTargets;
}
