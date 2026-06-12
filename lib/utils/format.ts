export function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

export function formatLongDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatKm(meters: number | null | undefined, options: { forceKm?: boolean; emptyLabel?: string } = {}) {
  if (meters === null || meters === undefined) {
    return options.emptyLabel ?? "0 m";
  }

  const value = meters ?? 0;
  return options.forceKm || value >= 1000 ? `${(value / 1000).toFixed(1)} km` : `${Math.round(value)} m`;
}

export function formatMeters(meters: number | null | undefined) {
  if (meters === null || meters === undefined) {
    return "Sin dato";
  }

  return `${Math.round(meters).toLocaleString("es-ES")} m`;
}

export function formatDuration(minutes: number | null | undefined, options: { compact?: boolean; emptyLabel?: string } = {}) {
  const emptyLabel = options.emptyLabel ?? "Sin dato";

  if (minutes === null || minutes === undefined) {
    return emptyLabel;
  }

  const roundedMinutes = Math.round(minutes);

  if (roundedMinutes <= 0) {
    return emptyLabel;
  }

  if (options.compact && roundedMinutes >= 120) {
    return `${(roundedMinutes / 60).toFixed(1)} h`;
  }

  if (roundedMinutes < 60) {
    return `${roundedMinutes} min`;
  }

  const hours = Math.floor(roundedMinutes / 60);
  const remainingMinutes = roundedMinutes % 60;

  return remainingMinutes > 0 ? `${hours} h ${remainingMinutes} min` : `${hours} h`;
}

export function formatLoadKg(kg: number | null | undefined) {
  if (kg === null || kg === undefined) {
    return "Sin dato";
  }

  return kg >= 1000 ? `${(kg / 1000).toFixed(1)} t` : `${Math.round(kg).toLocaleString("es-ES")} kg`;
}

export function formatRpe(rpe: number | null | undefined) {
  return typeof rpe === "number" && rpe > 0 ? `${rpe}/10` : "Sin dato";
}

export function formatHeartRate(bpm: number | null | undefined) {
  return typeof bpm === "number" && bpm > 0 ? `${Math.round(bpm)} bpm` : "Sin dato";
}

export function formatCalories(kcal: number | null | undefined) {
  return typeof kcal === "number" && kcal > 0 ? `${Math.round(kcal).toLocaleString("es-ES")} kcal` : "Sin dato";
}

export function formatTrainingType(type: string) {
  const labels: Record<string, string> = {
    crossfit: "CrossFit",
    hyrox: "HYROX",
    halterofilia: "Halterofilia",
    gimnasticos: "Gimnásticos",
    running: "Running",
    fuerza: "Fuerza",
    strength: "Fuerza",
    weightlifting: "Halterofilia",
    gymnastics: "Gimnásticos",
    movilidad: "Movilidad",
    mobility: "Movilidad",
    actividad_funcional: "Actividad funcional",
    mixed: "Mixto",
  };

  return labels[type] ?? type;
}

export function formatMuscleName(muscle: string) {
  const labels: Record<string, string> = {
    biceps: "Bíceps",
    calves: "Gemelos",
    chest: "Pectoral",
    core: "Core",
    glutes: "Glúteos",
    hamstrings: "Isquios",
    hipFlexors: "Flexores de cadera",
    hips: "Cadera",
    lats: "Dorsales",
    lowerBack: "Lumbar",
    quadriceps: "Cuádriceps",
    shoulders: "Hombros",
    traps: "Trapecios",
    triceps: "Tríceps",
    forearms: "Antebrazos",
    "upper back": "Espalda alta",
    upperBack: "Espalda alta",
  };

  return labels[muscle] ?? muscle;
}

export function formatMuscleRole(role: string) {
  const labels: Record<string, string> = {
    primary: "principal",
    secondary: "secundario",
    stabilizer: "estabilizador",
  };

  return labels[role] ?? role;
}

export function formatGoalStatus(status: string) {
  const labels: Record<string, string> = {
    active: "Activo",
    paused: "Pausado",
    completed: "Completado",
  };

  return labels[status] ?? status;
}

export function formatDataQuality(quality: string) {
  const labels: Record<string, string> = {
    high: "alta calidad",
    medium: "calidad media",
    partial: "parcial",
    low: "baja calidad",
  };

  return labels[quality] ?? quality;
}

export function formatDayType(dayType: string) {
  const labels: Record<string, string> = {
    training: "Entrenamiento",
    rest: "Descanso",
    "high-carb": "Alto en hidratos",
    "low-carb": "Bajo en hidratos",
  };

  return labels[dayType] ?? dayType;
}

export function formatDigestion(digestion: string) {
  const labels: Record<string, string> = {
    good: "buena",
    normal: "normal",
    heavy: "pesada",
  };

  return labels[digestion] ?? digestion;
}

export function formatTag(tag: string) {
  const labels: Record<string, string> = {
    engine: "Motor",
    gymnastics: "Gimnásticos",
    "high-intensity": "Alta intensidad",
    "lower-body": "Tren inferior",
    metcon: "Metcon",
    "compromised running": "Running con fatiga",
    hiking: "Senderismo",
    padel: "Pádel",
    "racket-sport": "Deporte de raqueta",
    recovery: "Recuperación",
    route: "Ruta",
    "secondary-activity": "Actividad secundaria",
    sled: "Trineo",
    strength: "Fuerza",
    technique: "Técnica",
    upper: "Tren superior",
    walking: "Walking",
    "zone-2": "Zona 2",
  };

  return labels[tag] ?? tag;
}
