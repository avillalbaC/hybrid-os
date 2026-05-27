import { hybridOSHistoricalSeedV1 as historicalAppInputs } from "./hybridOSHistoricalSeed_v1_2026-05-26";
import { createEmptyMuscleSummary, muscleNames } from "@/lib/selectors/training";
import type {
  DataQuality,
  DateConfidence,
  DateRule,
  HybridOSAppInput,
  MovementPattern,
  MuscleLoad,
  MuscleName,
  MuscleRole,
  PendingField,
  SessionMetrics,
  SessionStatus,
  TrainingBlock,
  TrainingExercise,
  TrainingResult,
  TrainingSession,
  TrainingSessionType,
  TrainingSubtype,
} from "@/types/training";

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeToken(value: unknown) {
  return stringValue(value).toLowerCase().trim().replace(/\s+/g, "_").replace(/-/g, "_");
}

function firstNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const match = value.replace(",", ".").match(/\d+(?:\.\d+)?/);
  return match ? Number.parseFloat(match[0]) : null;
}

function distanceMeters(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const amount = firstNumber(value);
  if (amount === null) return null;
  return /km/i.test(value) ? Math.round(amount * 1000) : Math.round(amount);
}

function durationSeconds(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const parts = value.split(":").map((part) => Number.parseInt(part, 10));
  if (parts.length === 2 && parts.every(Number.isFinite)) return parts[0] * 60 + parts[1];
  if (parts.length === 3 && parts.every(Number.isFinite)) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  const amount = firstNumber(value);
  if (amount === null) return null;
  return /min|'/i.test(value) ? Math.round(amount * 60) : Math.round(amount);
}

function loadKg(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const numbers = value.replace(",", ".").match(/\d+(?:\.\d+)?/g);
  if (!numbers || numbers.length === 0) return null;
  const parsed = numbers.map((item) => Number.parseFloat(item)).filter(Number.isFinite);
  return parsed.length > 0 ? Math.max(...parsed) : null;
}

function normalizeTrainingType(value: unknown): TrainingSessionType {
  const type = normalizeToken(value);
  const aliases: Record<string, TrainingSessionType> = {
    crossfit: "crossfit",
    hyrox: "hyrox",
    running: "running",
    run: "running",
    strength: "fuerza",
    fuerza: "fuerza",
    weightlifting: "halterofilia",
    halterofilia: "halterofilia",
    gymnastics: "gimnasticos",
    gimnasticos: "gimnasticos",
    mobility: "movilidad",
    movilidad: "movilidad",
    actividad_funcional: "actividad_funcional",
    mixed: "mixed",
    other: "mixed",
  };

  return aliases[type] ?? "mixed";
}

function normalizeSubtype(value: string): TrainingSubtype | null {
  const subtype = normalizeToken(value);
  const aliases: Record<string, TrainingSubtype> = {
    pairs: "pairs",
    team: "team",
    individual: "individual",
    engine: "engine",
    motor: "engine",
    metcon: "mixed_modal",
    mixed: "mixed_modal",
    mixed_modal: "mixed_modal",
    strength: "strength",
    fuerza: "strength",
    gymnastics: "gymnastics",
    gymnastic: "gymnastics",
    gimnasticos: "gymnastics",
    weightlifting: "weightlifting",
    halterofilia: "weightlifting",
    olympic_lift: "olympic_lift",
    running: "running",
    run: "running",
    zone_2: "z2",
    z2: "z2",
    intervals: "intervals",
    for_time: "for_time",
    amrap: "amrap",
    emom: "emom",
    sets: "sets",
    accessory: "accessory",
    mobility: "mobility",
    movilidad: "mobility",
    lower: "lower_body",
    lower_body: "lower_body",
    upper: "upper_body",
    upper_body: "upper_body",
    core: "core",
    full_body: "full_body",
    technical: "technical",
    technique: "technical",
  };

  return aliases[subtype] ?? null;
}

function normalizeMovementPattern(value: unknown): MovementPattern {
  const pattern = normalizeToken(value);
  const aliases: Record<string, MovementPattern> = {
    squat: "squat",
    hinge: "hinge",
    lunge: "lunge",
    push: "push",
    pull: "pull",
    carry: "carry",
    run: "run",
    running: "run",
    cyclical: "run",
    jump: "jump",
    erg: "erg",
    row: "erg",
    ski: "erg",
    bike: "erg",
    core: "core",
    core_flexion: "core",
    olympic_lift: "olympic_lift",
    gymnastics: "gymnastics",
    mobility: "mobility",
  };

  return aliases[pattern] ?? "mixed";
}

function normalizeMuscleName(value: unknown): MuscleName | null {
  const aliases: Record<string, MuscleName> = {
    quadriceps: "quadriceps",
    hamstrings: "hamstrings",
    glutes: "glutes",
    calves: "calves",
    hipflexors: "hipFlexors",
    hip_flexors: "hipFlexors",
    adductors: "adductors",
    core: "core",
    lowerback: "lowerBack",
    lower_back: "lowerBack",
    lats: "lats",
    upperback: "upperBack",
    upper_back: "upperBack",
    traps: "traps",
    shoulders: "shoulders",
    chest: "chest",
    triceps: "triceps",
    biceps: "biceps",
    forearms: "forearms",
    hips: "hipFlexors",
  };

  return aliases[normalizeToken(value)] ?? null;
}

function normalizeMuscleRole(value: unknown): MuscleRole {
  return value === "primary" || value === "secondary" || value === "stabilizer" ? value : "secondary";
}

function normalizeMuscleLoad(value: unknown): MuscleLoad[] {
  if (!Array.isArray(value)) return [];

  return value.filter(isRecord).flatMap((entry) => {
    const muscle = normalizeMuscleName(entry.muscle);
    if (!muscle) return [];
    const oldScore = numberOrNull(entry.loadScore);
    const newScore = numberOrNull(entry.load);
    return [{ muscle, role: normalizeMuscleRole(entry.role), load: Math.min(100, Math.max(0, newScore ?? oldScore ?? 0)) }];
  });
}

function normalizeBlockFormat(value: unknown): TrainingBlock["format"] {
  const format = normalizeToken(value);
  if (format.includes("emom")) return "emom";
  if (format.includes("amrap")) return "amrap";
  if (format.includes("for_time")) return "for_time";
  if (format.includes("interval")) return "intervals";
  if (format.includes("hyrox")) return "hyrox";
  if (format.includes("run")) return "running";
  if (format.includes("mobility")) return "mobility";
  if (format.includes("accessory")) return "accessory";
  if (format.includes("set") || /^\d+_?set/.test(format)) return "sets";
  return "other";
}

function normalizeExercise(value: unknown): TrainingExercise | null {
  if (!isRecord(value)) return null;

  const name = stringValue(value.name, "Ejercicio sin nombre");
  const reps = numberOrNull(value.reps) ?? firstNumber(value.reps);
  const calories = numberOrNull(value.calories) ?? firstNumber(value.calories);

  return {
    name,
    canonicalName: stringValue(value.canonicalName, name),
    sets: numberOrNull(value.sets),
    reps,
    distanceMeters: numberOrNull(value.distanceMeters) ?? distanceMeters(value.distance),
    durationSeconds: numberOrNull(value.durationSeconds) ?? durationSeconds(value.time),
    calories,
    loadKg: numberOrNull(value.loadKg) ?? loadKg(value.load),
    completed: typeof value.completed === "boolean" ? value.completed : undefined,
    synch: typeof value.synch === "boolean" ? value.synch : undefined,
    sharedWork: typeof value.sharedWork === "boolean" ? value.sharedWork : undefined,
    unilateral: typeof value.unilateral === "boolean" ? value.unilateral : undefined,
    movementPattern: normalizeMovementPattern(value.movementPattern),
    intensity: null,
    muscleLoad: normalizeMuscleLoad(value.muscleLoad),
    notes: nullableString(value.notes),
  };
}

function normalizeBlock(value: unknown, index: number): TrainingBlock | null {
  if (!isRecord(value)) return null;

  return {
    id: stringValue(value.id, `block-${index + 1}`),
    name: stringValue(value.name, "Bloque sin nombre"),
    format: normalizeBlockFormat(value.format),
    roundsPlanned: numberOrNull(value.roundsPlanned) ?? numberOrNull(value.rounds),
    roundsCompleted: numberOrNull(value.roundsCompleted),
    timeCapMinutes: numberOrNull(value.timeCapMinutes) ?? firstNumber(value.timeCap),
    restSeconds: numberOrNull(value.restSeconds) ?? durationSeconds(value.rest),
    exercises: Array.isArray(value.exercises)
      ? value.exercises.map(normalizeExercise).filter((exercise): exercise is TrainingExercise => Boolean(exercise))
      : [],
    blockResult: nullableString(value.blockResult),
    notes: nullableString(value.notes),
  };
}

function normalizeSessionMuscleSummary(value: unknown, blocks: TrainingBlock[]) {
  const summary = createEmptyMuscleSummary();

  if (isRecord(value)) {
    muscleNames.forEach((muscle) => {
      summary[muscle] = Math.min(100, Math.max(0, numberOrNull(value[muscle]) ?? 0));
    });
    return summary;
  }

  if (Array.isArray(value)) {
    normalizeMuscleLoad(value).forEach((entry) => {
      summary[entry.muscle] = Math.min(100, Math.max(summary[entry.muscle], entry.load));
    });
    return summary;
  }

  blocks.forEach((block) => {
    block.exercises.forEach((exercise) => {
      exercise.muscleLoad.forEach((entry) => {
        summary[entry.muscle] = Math.min(100, Math.max(summary[entry.muscle], entry.load));
      });
    });
  });

  return summary;
}

function normalizePendingField(value: string): PendingField {
  const field = normalizeToken(value);
  if (field.includes("rpe")) return "RPE exacto";
  if (field.includes("duracion")) return "Duración exacta";
  if (field.includes("tiempo")) return "Tiempo exacto";
  if (field.includes("resultado") || field.includes("round")) return "Resultado exacto";
  if (field.includes("reparto")) return "Reparto individual";
  if (field.includes("carga") || field.includes("load")) return "Carga exacta";
  if (field.includes("rep")) return "Repeticiones exactas";
  if (field.includes("distancia")) return "Distancia exacta";
  if (field.includes("molest")) return "Molestias durante/después";
  if (field.includes("scale") || field.includes("variante")) return "Escalado/variantes";
  if (field.includes("fecha")) return "Fecha exacta";
  return "Otro";
}

function normalizeMetrics(raw: RawRecord, blocks: TrainingBlock[]): SessionMetrics {
  const rawMetrics = isRecord(raw.sessionMetrics) ? raw.sessionMetrics : {};
  const exercises = blocks.flatMap((block) => block.exercises);
  const totalRunMeters =
    numberOrNull(rawMetrics.totalRunMeters) ??
    exercises
      .filter((exercise) => exercise.movementPattern === "run")
      .reduce((total, exercise) => total + (exercise.distanceMeters ?? 0), 0);

  return {
    totalRunMeters,
    totalBikeMeters: numberOrNull(rawMetrics.totalBikeMeters) ?? 0,
    totalRowMeters: numberOrNull(rawMetrics.totalRowMeters) ?? 0,
    totalSkiMeters: numberOrNull(rawMetrics.totalSkiMeters) ?? 0,
    totalCalories: numberOrNull(rawMetrics.totalCalories),
    totalExternalLoadKg: numberOrNull(rawMetrics.totalExternalLoadKg),
    totalBarbellReps: numberOrNull(rawMetrics.totalBarbellReps) ?? 0,
    totalDumbbellReps: numberOrNull(rawMetrics.totalDumbbellReps) ?? 0,
    totalKettlebellReps: numberOrNull(rawMetrics.totalKettlebellReps) ?? 0,
    totalGymnasticsReps: numberOrNull(rawMetrics.totalGymnasticsReps) ?? 0,
    hardSetsEstimate: numberOrNull(rawMetrics.hardSetsEstimate),
    impactScore: numberOrNull(rawMetrics.impactScore) ?? Math.min(100, Math.round((numberOrNull(raw.rpe) ?? 5) * 8)),
    cardioLoad: numberOrNull(rawMetrics.cardioLoad) ?? (totalRunMeters > 0 ? 60 : 30),
    strengthLoad: numberOrNull(rawMetrics.strengthLoad) ?? (exercises.some((exercise) => exercise.loadKg) ? 55 : 25),
    technicalLoad: numberOrNull(rawMetrics.technicalLoad) ?? 30,
    fatigueCost: numberOrNull(rawMetrics.fatigueCost) ?? Math.min(100, Math.round((numberOrNull(raw.rpe) ?? 5) * 9)),
  };
}

function normalizeResult(value: unknown): TrainingResult | null {
  if (!isRecord(value)) return null;
  const type = stringValue(value.type);
  const allowed: TrainingResult["type"][] = ["time", "rounds_reps", "load", "distance", "calories", "cap", "partial", "none"];

  return {
    type: allowed.includes(type as TrainingResult["type"]) ? (type as TrainingResult["type"]) : "partial",
    score: nullableString(value.score),
    timeSeconds: numberOrNull(value.timeSeconds),
    capMinutes: numberOrNull(value.capMinutes),
    completedAsPlanned: typeof value.completedAsPlanned === "boolean" ? value.completedAsPlanned : null,
    notes: nullableString(value.notes),
  };
}

function normalizeStatus(value: unknown): SessionStatus {
  return value === "completed" || value === "partial" || value === "planned" || value === "cancelled" ? value : "completed";
}

function normalizeDataQuality(value: unknown): DataQuality {
  return value === "high" || value === "partial" || value === "low" ? value : "partial";
}

function normalizeDateConfidence(value: unknown): DateConfidence {
  return value === "exact" || value === "inferred" || value === "unknown" ? value : "inferred";
}

function normalizeDateRule(value: unknown): DateRule {
  return value === "today_explicit" || value === "yesterday_from_check" || value === "manual" || value === "inferred" ? value : "inferred";
}

function normalizeTrainingSession(value: unknown): TrainingSession | null {
  if (!isRecord(value)) return null;

  const blocks = Array.isArray(value.blocks)
    ? value.blocks.map(normalizeBlock).filter((block): block is TrainingBlock => Boolean(block))
    : [];
  const subtypes = stringArray(value.subtypes)
    .map(normalizeSubtype)
    .filter((subtype): subtype is TrainingSubtype => Boolean(subtype));
  const pendingFields = stringArray(value.pendingFields).map(normalizePendingField);
  const session: TrainingSession = {
    id: stringValue(value.id, crypto.randomUUID()),
    date: stringValue(value.date),
    reportedAt: stringValue(value.reportedAt, stringValue(value.date)),
    dateConfidence: normalizeDateConfidence(value.dateConfidence),
    dateRule: normalizeDateRule(value.dateRule),
    source: "import",
    status: normalizeStatus(value.status),
    title: stringValue(value.title, "Entrenamiento sin título"),
    type: normalizeTrainingType(value.type),
    subtypes,
    durationMinutes: numberOrNull(value.durationMinutes),
    rpe: numberOrNull(value.rpe),
    location: nullableString(value.location),
    objective: nullableString(value.objective),
    rawText: stringValue(value.rawText, stringValue(value.notes, stringValue(value.title, "Seed histórico sin texto original disponible."))),
    blocks,
    result: normalizeResult(value.result),
    sessionMetrics: normalizeMetrics(value, blocks),
    sessionMuscleSummary: normalizeSessionMuscleSummary(value.sessionMuscleSummary, blocks),
    tags: stringArray(value.tags),
    soreness: stringArray(value.soreness),
    injuryNotes: nullableString(value.injuryNotes),
    feeling: nullableString(value.feeling) ?? (typeof value.feeling === "number" ? `${value.feeling}/10` : null),
    notes: nullableString(value.notes),
    pendingFields,
    dataQuality: pendingFields.length > 0 ? "partial" : normalizeDataQuality(value.dataQuality),
    importNotes: nullableString(value.importNotes) ?? "Migrado desde seed histórico al contrato HybridOSAppInput v1.0.",
  };

  return session;
}

function normalizeAppInput(value: unknown, index: number): HybridOSAppInput | null {
  if (!isRecord(value)) return null;
  const session = normalizeTrainingSession(value.trainingSession);
  if (!session) return null;

  return {
    appInputVersion: "1.0",
    generatedBy: "gpt",
    generatedAt: stringValue(value.generatedAt, "2026-05-26T00:00:00+02:00"),
    trainingSession: {
      ...session,
      id: session.id || `historical-session-${index + 1}`,
    },
  };
}

export const historicalTrainingAppInputs: HybridOSAppInput[] = historicalAppInputs
  .map(normalizeAppInput)
  .filter((input): input is HybridOSAppInput => Boolean(input));

export const realTrainingSessions: TrainingSession[] = historicalTrainingAppInputs.map((input) => input.trainingSession);
