import { createEmptyMuscleSummary, muscleNames } from "@/lib/selectors/training";
import type { BodyCheck } from "@/types/body";
import type { NutritionCheck } from "@/types/nutrition";
import type {
  DataQuality,
  DateConfidence,
  DateRule,
  HybridOSAppInput,
  MovementPattern,
  MuscleRole,
  PendingField,
  SessionStatus,
  TrainingBlock,
  TrainingExercise,
  TrainingResult,
  TrainingSession,
  TrainingSessionType,
  TrainingSubtype,
} from "@/types/training";

export type ValidationIssue = {
  path: string;
  message: string;
};

export type ValidationResult<T> = {
  ok: boolean;
  value?: T;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
};

const trainingSessionTypes: TrainingSessionType[] = [
  "crossfit",
  "hyrox",
  "halterofilia",
  "gimnasticos",
  "running",
  "fuerza",
  "movilidad",
  "actividad_funcional",
  "mixed",
];

const trainingSubtypes: TrainingSubtype[] = [
  "pairs",
  "team",
  "individual",
  "engine",
  "mixed_modal",
  "strength",
  "gymnastics",
  "weightlifting",
  "olympic_lift",
  "running",
  "z2",
  "intervals",
  "for_time",
  "amrap",
  "emom",
  "sets",
  "accessory",
  "mobility",
  "lower_body",
  "upper_body",
  "core",
  "full_body",
  "technical",
];

const movementPatterns: MovementPattern[] = [
  "squat",
  "hinge",
  "lunge",
  "push",
  "pull",
  "carry",
  "run",
  "jump",
  "erg",
  "core",
  "olympic_lift",
  "gymnastics",
  "mobility",
  "mixed",
];

const muscleRoles: MuscleRole[] = ["primary", "secondary", "stabilizer"];
const dateConfidences: DateConfidence[] = ["exact", "inferred", "unknown"];
const dateRules: DateRule[] = ["today_explicit", "yesterday_from_check", "manual", "inferred"];
const sessionStatuses: SessionStatus[] = ["completed", "partial", "planned", "cancelled"];
const dataQualities: DataQuality[] = ["high", "partial", "low"];
const blockFormats: TrainingBlock["format"][] = ["sets", "emom", "amrap", "for_time", "intervals", "hyrox", "running", "accessory", "mobility", "other"];
const resultTypes: TrainingResult["type"][] = ["time", "rounds_reps", "load", "distance", "calories", "cap", "partial", "none"];
const intensities: Array<NonNullable<TrainingExercise["intensity"]>> = ["low", "moderate", "high", "max"];
const pendingFields: PendingField[] = [
  "RPE exacto",
  "Duración exacta",
  "Tiempo exacto",
  "Resultado exacto",
  "Reparto individual",
  "Carga exacta",
  "Repeticiones exactas",
  "Distancia exacta",
  "Molestias durante/después",
  "Escalado/variantes",
  "Fecha exacta",
  "Otro",
];
const nutritionDayTypes: NutritionCheck["dayType"][] = ["training", "rest", "high-carb", "low-carb"];
const digestionTypes: NutritionCheck["digestion"][] = ["good", "normal", "heavy"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNumberOrNull(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function requireField(record: Record<string, unknown>, field: string, path: string, errors: ValidationIssue[]) {
  if (!(field in record) || record[field] === undefined || record[field] === null || record[field] === "") {
    errors.push({ path: `${path}.${field}`, message: "Campo crítico obligatorio ausente." });
  }
}

function optionalStringOrNull(value: unknown) {
  return value === null || typeof value === "string";
}

function validateEnum<T extends string>(value: unknown, allowed: T[], path: string, errors: ValidationIssue[]): value is T {
  if (typeof value === "string" && allowed.includes(value as T)) {
    return true;
  }

  errors.push({ path, message: `Valor no permitido: ${String(value)}.` });
  return false;
}

function validateStringArray(value: unknown, path: string, errors: ValidationIssue[]) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    errors.push({ path, message: "Debe ser un array de strings." });
    return false;
  }

  return true;
}

function validateNumberRange(value: unknown, path: string, min: number, max: number, errors: ValidationIssue[]) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    errors.push({ path, message: `Debe ser un número entre ${min} y ${max}.` });
    return false;
  }

  return true;
}

function validateMuscleSummary(value: unknown, path: string, errors: ValidationIssue[]) {
  if (!isRecord(value)) {
    errors.push({ path, message: "Debe ser un objeto de carga muscular por grupo." });
    return;
  }

  muscleNames.forEach((muscle) => {
    validateNumberRange(value[muscle], `${path}.${muscle}`, 0, 100, errors);
  });
}

function validateMetrics(value: unknown, path: string, errors: ValidationIssue[]) {
  if (!isRecord(value)) {
    errors.push({ path, message: "Debe ser un objeto de métricas de sesión." });
    return;
  }

  [
    "totalRunMeters",
    "totalBikeMeters",
    "totalRowMeters",
    "totalSkiMeters",
    "totalBarbellReps",
    "totalDumbbellReps",
    "totalKettlebellReps",
    "totalGymnasticsReps",
  ].forEach((field) => validateNumberRange(value[field], `${path}.${field}`, 0, Number.MAX_SAFE_INTEGER, errors));

  ["impactScore", "cardioLoad", "strengthLoad", "technicalLoad", "fatigueCost"].forEach((field) =>
    validateNumberRange(value[field], `${path}.${field}`, 0, 100, errors),
  );

  ["totalCalories", "totalExternalLoadKg", "hardSetsEstimate"].forEach((field) => {
    if (!isNumberOrNull(value[field])) {
      errors.push({ path: `${path}.${field}`, message: "Debe ser número o null." });
    }
  });
}

function validateExercise(value: unknown, path: string, errors: ValidationIssue[]) {
  if (!isRecord(value)) {
    errors.push({ path, message: "Cada ejercicio debe ser un objeto." });
    return;
  }

  ["name", "canonicalName"].forEach((field) => {
    if (!isString(value[field])) {
      errors.push({ path: `${path}.${field}`, message: "Debe ser un string obligatorio." });
    }
  });

  ["sets", "reps", "distanceMeters", "durationSeconds", "calories", "loadKg"].forEach((field) => {
    if (value[field] !== undefined && !isNumberOrNull(value[field])) {
      errors.push({ path: `${path}.${field}`, message: "Debe ser número o null. No usar texto con unidades." });
    }
  });

  validateEnum(value.movementPattern, movementPatterns, `${path}.movementPattern`, errors);

  if (value.intensity !== null && !validateEnum(value.intensity, intensities, `${path}.intensity`, errors)) {
    return;
  }

  if (!Array.isArray(value.muscleLoad)) {
    errors.push({ path: `${path}.muscleLoad`, message: "Debe ser un array." });
    return;
  }

  value.muscleLoad.forEach((entry, index) => {
    if (!isRecord(entry)) {
      errors.push({ path: `${path}.muscleLoad.${index}`, message: "Cada carga muscular debe ser un objeto." });
      return;
    }

    validateEnum(entry.muscle, muscleNames, `${path}.muscleLoad.${index}.muscle`, errors);
    validateEnum(entry.role, muscleRoles, `${path}.muscleLoad.${index}.role`, errors);
    validateNumberRange(entry.load, `${path}.muscleLoad.${index}.load`, 0, 100, errors);
  });
}

function validateBlock(value: unknown, path: string, errors: ValidationIssue[]) {
  if (!isRecord(value)) {
    errors.push({ path, message: "Cada bloque debe ser un objeto." });
    return;
  }

  ["id", "name"].forEach((field) => {
    if (!isString(value[field])) {
      errors.push({ path: `${path}.${field}`, message: "Debe ser un string obligatorio." });
    }
  });
  validateEnum(value.format, blockFormats, `${path}.format`, errors);

  if (!Array.isArray(value.exercises)) {
    errors.push({ path: `${path}.exercises`, message: "Debe ser un array." });
    return;
  }

  value.exercises.forEach((exercise, index) => validateExercise(exercise, `${path}.exercises.${index}`, errors));
}

function validateResult(value: unknown, path: string, errors: ValidationIssue[]) {
  if (value === null) {
    return;
  }

  if (!isRecord(value)) {
    errors.push({ path, message: "Debe ser un objeto o null." });
    return;
  }

  validateEnum(value.type, resultTypes, `${path}.type`, errors);
  if (!optionalStringOrNull(value.score)) {
    errors.push({ path: `${path}.score`, message: "Debe ser string o null." });
  }
}

function validateBodyCheck(value: unknown, path: string, errors: ValidationIssue[], warnings: ValidationIssue[]): value is BodyCheck {
  if (!isRecord(value)) {
    errors.push({ path, message: "bodyCheck debe ser un objeto." });
    return false;
  }

  ["id", "date"].forEach((field) => {
    if (!isString(value[field])) {
      errors.push({ path: `${path}.${field}`, message: "Debe ser un string obligatorio." });
    }
  });

  ["weightKg", "waistCm", "steps", "sleepHours", "energy", "hunger"].forEach((field) => {
    if (typeof value[field] !== "number" || !Number.isFinite(value[field])) {
      errors.push({ path: `${path}.${field}`, message: "Debe ser un número." });
    }
  });

  if (value.notes !== undefined && typeof value.notes !== "string") {
    warnings.push({ path: `${path}.notes`, message: "notes debería ser string si existe." });
  }

  if (!validateStringArray(value.pendingFields, `${path}.pendingFields`, errors)) {
    warnings.push({ path: `${path}.pendingFields`, message: "Campos pendientes incompletos." });
  }

  return true;
}

function validateNutritionCheck(value: unknown, path: string, errors: ValidationIssue[], warnings: ValidationIssue[]): value is NutritionCheck {
  if (!isRecord(value)) {
    errors.push({ path, message: "nutritionCheck debe ser un objeto." });
    return false;
  }

  ["id", "date"].forEach((field) => {
    if (!isString(value[field])) {
      errors.push({ path: `${path}.${field}`, message: "Debe ser un string obligatorio." });
    }
  });

  [
    "targetCalories",
    "estimatedCalories",
    "targetProteinGrams",
    "estimatedProteinGrams",
    "waterLiters",
    "adherencePercent",
  ].forEach((field) => {
    if (typeof value[field] !== "number" || !Number.isFinite(value[field])) {
      errors.push({ path: `${path}.${field}`, message: "Debe ser un número." });
    }
  });

  validateEnum(value.digestion, digestionTypes, `${path}.digestion`, errors);
  validateEnum(value.dayType, nutritionDayTypes, `${path}.dayType`, errors);

  if (value.notes !== undefined && typeof value.notes !== "string") {
    warnings.push({ path: `${path}.notes`, message: "notes debería ser string si existe." });
  }

  if (!validateStringArray(value.pendingFields, `${path}.pendingFields`, errors)) {
    warnings.push({ path: `${path}.pendingFields`, message: "Campos pendientes incompletos." });
  }

  return true;
}

export function validateTrainingSession(session: unknown): ValidationResult<TrainingSession> {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (!isRecord(session)) {
    return { ok: false, errors: [{ path: "trainingSession", message: "Debe ser un objeto." }], warnings };
  }

  [
    "id",
    "date",
    "reportedAt",
    "dateConfidence",
    "dateRule",
    "type",
    "status",
    "title",
    "rawText",
    "blocks",
    "sessionMetrics",
    "sessionMuscleSummary",
    "dataQuality",
  ].forEach((field) => requireField(session, field, "trainingSession", errors));

  validateEnum(session.dateConfidence, dateConfidences, "trainingSession.dateConfidence", errors);
  validateEnum(session.dateRule, dateRules, "trainingSession.dateRule", errors);
  validateEnum(session.type, trainingSessionTypes, "trainingSession.type", errors);
  validateEnum(session.status, sessionStatuses, "trainingSession.status", errors);
  validateEnum(session.dataQuality, dataQualities, "trainingSession.dataQuality", errors);

  if (session.source !== undefined) {
    validateEnum(session.source, ["chatgpt", "manual", "import"], "trainingSession.source", errors);
  }

  if (!Array.isArray(session.subtypes)) {
    errors.push({ path: "trainingSession.subtypes", message: "Debe ser un array." });
  } else {
    session.subtypes.forEach((subtype, index) => validateEnum(subtype, trainingSubtypes, `trainingSession.subtypes.${index}`, errors));
  }

  if (!isNumberOrNull(session.durationMinutes)) {
    warnings.push({ path: "trainingSession.durationMinutes", message: "Duración secundaria ausente o no numérica; importar como parcial." });
  }

  if (!isNumberOrNull(session.rpe)) {
    warnings.push({ path: "trainingSession.rpe", message: "RPE secundario ausente o no numérico; importar como parcial." });
  }

  if (!validateStringArray(session.tags, "trainingSession.tags", errors)) {
    warnings.push({ path: "trainingSession.tags", message: "Tags incompletos." });
  }
  validateStringArray(session.soreness, "trainingSession.soreness", errors);

  if (!Array.isArray(session.pendingFields)) {
    errors.push({ path: "trainingSession.pendingFields", message: "Debe ser un array." });
  } else {
    session.pendingFields.forEach((field, index) => validateEnum(field, pendingFields, `trainingSession.pendingFields.${index}`, errors));
  }

  if (!Array.isArray(session.blocks)) {
    errors.push({ path: "trainingSession.blocks", message: "Debe ser un array." });
  } else {
    session.blocks.forEach((block, index) => validateBlock(block, `trainingSession.blocks.${index}`, errors));
  }

  validateResult(session.result, "trainingSession.result", errors);
  validateMetrics(session.sessionMetrics, "trainingSession.sessionMetrics", errors);
  validateMuscleSummary(session.sessionMuscleSummary, "trainingSession.sessionMuscleSummary", errors);

  if (!optionalStringOrNull(session.location)) warnings.push({ path: "trainingSession.location", message: "Ubicación pendiente." });
  if (!optionalStringOrNull(session.objective)) warnings.push({ path: "trainingSession.objective", message: "Objetivo pendiente." });
  if (!optionalStringOrNull(session.injuryNotes)) warnings.push({ path: "trainingSession.injuryNotes", message: "Molestias pendientes." });

  return {
    ok: errors.length === 0,
    value: errors.length === 0 ? (session as TrainingSession) : undefined,
    errors,
    warnings,
  };
}

export function validateHybridOSAppInput(input: unknown): ValidationResult<HybridOSAppInput> {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (!isRecord(input)) {
    return { ok: false, errors: [{ path: "root", message: "El JSON debe ser un objeto raíz." }], warnings };
  }

  requireField(input, "appInputVersion", "root", errors);
  requireField(input, "generatedBy", "root", errors);
  requireField(input, "generatedAt", "root", errors);
  requireField(input, "trainingSession", "root", errors);

  if (input.appInputVersion !== "1.0") {
    errors.push({ path: "appInputVersion", message: "Debe ser 1.0." });
  }

  if (input.generatedBy !== "gpt") {
    errors.push({ path: "generatedBy", message: "Debe ser gpt." });
  }

  if (!isString(input.generatedAt)) {
    errors.push({ path: "generatedAt", message: "Debe ser una fecha ISO en string." });
  }

  const sessionResult = validateTrainingSession(input.trainingSession);
  errors.push(...sessionResult.errors);
  warnings.push(...sessionResult.warnings);

  if (input.bodyCheck !== undefined) {
    validateBodyCheck(input.bodyCheck, "bodyCheck", errors, warnings);
  }

  if (input.nutritionCheck !== undefined) {
    validateNutritionCheck(input.nutritionCheck, "nutritionCheck", errors, warnings);
  }

  return {
    ok: errors.length === 0,
    value: errors.length === 0 ? (input as HybridOSAppInput) : undefined,
    errors,
    warnings,
  };
}

export function validateHistoricalSessions(sessions: unknown): ValidationResult<HybridOSAppInput[]> {
  const inputs = Array.isArray(sessions) ? sessions : [sessions];
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const validInputs: HybridOSAppInput[] = [];

  inputs.forEach((input, index) => {
    const result = validateHybridOSAppInput(input);
    errors.push(...result.errors.map((issue) => ({ ...issue, path: `${index}.${issue.path}` })));
    warnings.push(...result.warnings.map((issue) => ({ ...issue, path: `${index}.${issue.path}` })));
    if (result.value) validInputs.push(result.value);
  });

  return {
    ok: errors.length === 0,
    value: errors.length === 0 ? validInputs : undefined,
    errors,
    warnings,
  };
}

export function parseHybridOSJsonInput(rawJson: string): ValidationResult<HybridOSAppInput[]> {
  try {
    const parsed = JSON.parse(rawJson) as unknown;
    return validateHistoricalSessions(parsed);
  } catch {
    return {
      ok: false,
      errors: [{ path: "json", message: "JSON inválido. Revisa comas, llaves, comillas y formato general." }],
      warnings: [],
    };
  }
}

export function coercePartialSession(session: TrainingSession): TrainingSession {
  const hasWarnings =
    session.pendingFields.length > 0 ||
    session.durationMinutes === null ||
    session.rpe === null ||
    session.dateConfidence !== "exact";

  return {
    ...session,
    dataQuality: hasWarnings && session.dataQuality === "high" ? "partial" : session.dataQuality,
    sessionMuscleSummary: {
      ...createEmptyMuscleSummary(),
      ...session.sessionMuscleSummary,
    },
  };
}
