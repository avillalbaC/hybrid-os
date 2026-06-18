import { isPureRunningSession } from "@/lib/domain/training/session-kind";
import { createEmptyMuscleSummary, muscleNames } from "@/lib/selectors/training";
import type { BodyCheck } from "@/types/body";
import type { NutritionCheck } from "@/types/nutrition";
import type {
  DataQuality,
  DateConfidence,
  DateRule,
  HybridOSAppInput,
  HybridOSAppInputVersion,
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
  receivedValue?: unknown;
  allowedValues?: string[];
  suggestion?: string;
  code?: "required" | "enum" | "type" | "range" | "json";
};

export type ValidationResult<T> = {
  ok: boolean;
  value?: T;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
};

export type ImportIssue = {
  severity: "error" | "warning";
  path: string;
  message: string;
  receivedValue?: unknown;
  normalizedValue?: unknown;
  allowedValues?: string[];
  suggestion?: string;
};

export type NormalizationChange = {
  path: string;
  before: unknown;
  after: unknown;
  message: string;
};

export type NormalizeHybridOSInputResult = {
  normalizedInput: unknown;
  warnings: ValidationIssue[];
  changes: NormalizationChange[];
};

export type ImportValidationResult = {
  valid: boolean;
  errors: ImportIssue[];
  warnings: ImportIssue[];
  normalizationChanges: ImportIssue[];
  parsed?: HybridOSAppInput[];
  repairedText?: string;
  normalizedText?: string;
  autoRepaired?: boolean;
  repairFixes?: string[];
  rawParseError?: string;
};

export type JsonRepairResult = {
  repairedText: string;
  changed: boolean;
  fixes: string[];
};

export type ZodIssueLike = {
  path: Array<string | number>;
  message: string;
  code?: string;
  options?: string[];
};

export const trainingSessionTypes: TrainingSessionType[] = [
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

export const appInputVersions: HybridOSAppInputVersion[] = ["1.0", "1.1"];

export const trainingSubtypes: TrainingSubtype[] = [
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

export const movementPatterns: MovementPattern[] = [
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

export const muscleRoles: MuscleRole[] = ["primary", "secondary", "stabilizer"];
export const dateConfidences: DateConfidence[] = ["exact", "inferred", "unknown"];
export const dateRules: DateRule[] = ["today_explicit", "yesterday_from_check", "manual", "inferred"];
export const sessionStatuses: SessionStatus[] = ["completed", "partial", "planned", "cancelled"];
export const dataQualities: DataQuality[] = ["high", "partial", "low"];
export const blockFormats: TrainingBlock["format"][] = ["sets", "emom", "amrap", "for_time", "intervals", "hyrox", "running", "accessory", "mobility", "other"];
export const resultTypes: TrainingResult["type"][] = ["time", "rounds_reps", "load", "distance", "calories", "cap", "partial", "none"];
export const intensities: Array<NonNullable<TrainingExercise["intensity"]>> = ["low", "moderate", "high", "max"];
export const pendingFields: PendingField[] = [
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
const repairableTextValueKeys = [
  "score",
  "notes",
  "importNotes",
  "feeling",
  "injuryNotes",
  "title",
  "objective",
  "location",
  "rawText",
  "blockResult",
  "name",
  "canonicalName",
];

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
    errors.push({
      path: `${path}.${field}`,
      message: "Campo crítico obligatorio ausente.",
      suggestion: "Añade el campo con un valor válido del contrato.",
      code: "required",
    });
  }
}

function optionalStringOrNull(value: unknown) {
  return value === null || typeof value === "string";
}

function enumSuggestion(path: string, value: unknown, allowed: string[]) {
  const field = path.split(".").at(-1) ?? "campo";

  if (field === "dataQuality" && typeof value === "string" && value.includes("_")) {
    return `Usa ${allowed.map((item) => `"${item}"`).join(", ")} y mueve la explicación larga a importNotes.`;
  }

  return `Usa uno de estos valores: ${allowed.map((item) => `"${item}"`).join(", ")}.`;
}

function validateEnum<T extends string>(value: unknown, allowed: T[], path: string, errors: ValidationIssue[]): value is T {
  if (typeof value === "string" && allowed.includes(value as T)) {
    return true;
  }

  errors.push({
    path,
    message: "Valor no permitido.",
    receivedValue: value,
    allowedValues: allowed,
    suggestion: enumSuggestion(path, value, allowed),
    code: "enum",
  });
  return false;
}

function cloneJsonValue(value: unknown) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value)) as unknown;
}

function formatNormalizationValue(value: unknown) {
  return typeof value === "string" ? `"${value}"` : JSON.stringify(value);
}

function normalizePathPattern(path: string) {
  return path
    .replace(/\[\d+\]/g, "[]")
    .replace(/\.?\d+\./g, ".[].")
    .replace(/\.\d+$/g, ".[]")
    .replace(/\.\[\]/g, "[]")
    .replace(/^\[\]\./, "");
}

function recordNormalization(
  changes: NormalizationChange[],
  warnings: ValidationIssue[],
  path: string,
  before: unknown,
  after: unknown,
  message: string,
) {
  if (Object.is(before, after)) {
    return;
  }

  changes.push({ path, before, after, message });
  warnings.push({
    path,
    message,
    receivedValue: before,
    suggestion: `${formatNormalizationValue(before)} -> ${formatNormalizationValue(after)}`,
    code: "type",
  });
}

function parseSafeNumericString(value: string) {
  const trimmed = value.trim();

  if (/^-?\d+,\d+$/.test(trimmed)) {
    return Number(trimmed.replace(",", "."));
  }

  if (/^-?\d+\.\d+$/.test(trimmed)) {
    if (/^-?\d{1,3}\.\d{3}$/.test(trimmed)) {
      return null;
    }

    return Number(trimmed);
  }

  if (/^-?\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  return null;
}

function normalizeDateValue(value: unknown) {
  const text = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";

  if (!/^\d{8}$/.test(text)) {
    return null;
  }

  const year = Number(text.slice(0, 4));
  const month = Number(text.slice(4, 6));
  const day = Number(text.slice(6, 8));
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    return null;
  }

  return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
}

function normalizeBooleanValue(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true" || normalized === "yes") return true;
  if (normalized === "false" || normalized === "no") return false;
  return null;
}

const safeStringPathPatterns = new Set([
  "trainingSession.title",
  "trainingSession.notes",
  "trainingSession.objective",
  "trainingSession.rawText",
  "trainingSession.location",
  "trainingSession.feeling",
  "trainingSession.injuryNotes",
  "trainingSession.importNotes",
  "trainingSession.result.score",
  "trainingSession.result.notes",
  "trainingSession.blocks[].name",
  "trainingSession.blocks[].notes",
  "trainingSession.blocks[].blockResult",
  "trainingSession.blocks[].exercises[].name",
  "trainingSession.blocks[].exercises[].canonicalName",
  "trainingSession.blocks[].exercises[].notes",
  "bodyCheck.notes",
  "nutritionCheck.notes",
]);

const nullableStringPathPatterns = new Set([
  "trainingSession.notes",
  "trainingSession.objective",
  "trainingSession.location",
  "trainingSession.feeling",
  "trainingSession.injuryNotes",
  "trainingSession.importNotes",
  "trainingSession.result.score",
  "trainingSession.result.notes",
  "trainingSession.blocks[].notes",
  "trainingSession.blocks[].blockResult",
  "trainingSession.blocks[].exercises[].notes",
  "trainingSession.equipment.shoes",
  "bodyCheck.notes",
  "nutritionCheck.notes",
]);

const numberPathPatterns = new Set([
  "trainingSession.durationMinutes",
  "trainingSession.rpe",
  "trainingSession.result.timeSeconds",
  "trainingSession.result.capMinutes",
  "trainingSession.sessionMetrics.totalRunMeters",
  "trainingSession.sessionMetrics.totalBikeMeters",
  "trainingSession.sessionMetrics.totalRowMeters",
  "trainingSession.sessionMetrics.totalSkiMeters",
  "trainingSession.sessionMetrics.totalCalories",
  "trainingSession.sessionMetrics.totalExternalLoadKg",
  "trainingSession.sessionMetrics.totalBarbellReps",
  "trainingSession.sessionMetrics.totalDumbbellReps",
  "trainingSession.sessionMetrics.totalKettlebellReps",
  "trainingSession.sessionMetrics.totalGymnasticsReps",
  "trainingSession.sessionMetrics.hardSetsEstimate",
  "trainingSession.sessionMetrics.impactScore",
  "trainingSession.sessionMetrics.cardioLoad",
  "trainingSession.sessionMetrics.strengthLoad",
  "trainingSession.sessionMetrics.technicalLoad",
  "trainingSession.sessionMetrics.fatigueCost",
  "trainingSession.sessionMuscleSummary.quadriceps",
  "trainingSession.sessionMuscleSummary.hamstrings",
  "trainingSession.sessionMuscleSummary.glutes",
  "trainingSession.sessionMuscleSummary.calves",
  "trainingSession.sessionMuscleSummary.hipFlexors",
  "trainingSession.sessionMuscleSummary.adductors",
  "trainingSession.sessionMuscleSummary.core",
  "trainingSession.sessionMuscleSummary.lowerBack",
  "trainingSession.sessionMuscleSummary.lats",
  "trainingSession.sessionMuscleSummary.upperBack",
  "trainingSession.sessionMuscleSummary.traps",
  "trainingSession.sessionMuscleSummary.shoulders",
  "trainingSession.sessionMuscleSummary.chest",
  "trainingSession.sessionMuscleSummary.triceps",
  "trainingSession.sessionMuscleSummary.biceps",
  "trainingSession.sessionMuscleSummary.forearms",
  "trainingSession.blocks[].roundsPlanned",
  "trainingSession.blocks[].roundsCompleted",
  "trainingSession.blocks[].timeCapMinutes",
  "trainingSession.blocks[].restSeconds",
  "trainingSession.blocks[].exercises[].sets",
  "trainingSession.blocks[].exercises[].reps",
  "trainingSession.blocks[].exercises[].distanceMeters",
  "trainingSession.blocks[].exercises[].durationSeconds",
  "trainingSession.blocks[].exercises[].calories",
  "trainingSession.blocks[].exercises[].loadKg",
  "trainingSession.blocks[].exercises[].muscleLoad[].load",
  "bodyCheck.weightKg",
  "bodyCheck.waistCm",
  "bodyCheck.steps",
  "bodyCheck.sleepHours",
  "bodyCheck.energy",
  "bodyCheck.hunger",
  "nutritionCheck.targetCalories",
  "nutritionCheck.estimatedCalories",
  "nutritionCheck.targetProteinGrams",
  "nutritionCheck.estimatedProteinGrams",
  "nutritionCheck.waterLiters",
  "nutritionCheck.adherencePercent",
]);

const integerPathPatterns = new Set([
  "trainingSession.durationMinutes",
  "trainingSession.rpe",
]);

const stringArrayPathPatterns = new Set([
  "trainingSession.tags",
  "trainingSession.subtypes",
  "trainingSession.pendingFields",
  "trainingSession.soreness",
  "bodyCheck.pendingFields",
  "nutritionCheck.pendingFields",
]);

const booleanPathPatterns = new Set([
  "trainingSession.result.completedAsPlanned",
  "trainingSession.blocks[].exercises[].completed",
  "trainingSession.blocks[].exercises[].synch",
  "trainingSession.blocks[].exercises[].sharedWork",
  "trainingSession.blocks[].exercises[].unilateral",
]);

const datePathPatterns = new Set([
  "trainingSession.date",
  "trainingSession.reportedAt",
  "bodyCheck.date",
  "nutritionCheck.date",
]);

function normalizeValueAtPath(value: unknown, path: string, changes: NormalizationChange[], warnings: ValidationIssue[]) {
  const normalizedPath = normalizePathPattern(path);
  let nextValue = value;

  if (nullableStringPathPatterns.has(normalizedPath) && value === "") {
    recordNormalization(changes, warnings, path, value, null, "Campo vacío convertido a null.");
    return null;
  }

  if (datePathPatterns.has(normalizedPath)) {
    const normalizedDate = normalizeDateValue(value);

    if (normalizedDate) {
      recordNormalization(changes, warnings, path, value, normalizedDate, "Fecha numérica normalizada a YYYY-MM-DD.");
      return normalizedDate;
    }
  }

  if (safeStringPathPatterns.has(normalizedPath) && (typeof value === "number" || typeof value === "boolean")) {
    nextValue = String(value);
    recordNormalization(changes, warnings, path, value, nextValue, "Valor convertido a string en un campo seguro.");
    return nextValue;
  }

  if (stringArrayPathPatterns.has(normalizedPath) && typeof value === "string") {
    nextValue = value.trim().length > 0 ? [value] : [];
    recordNormalization(changes, warnings, path, value, nextValue, "String convertido a array de strings.");
    return nextValue;
  }

  if (numberPathPatterns.has(normalizedPath) && typeof value === "string") {
    const parsedNumber = parseSafeNumericString(value);

    if (parsedNumber !== null && Number.isFinite(parsedNumber)) {
      nextValue = parsedNumber;
      recordNormalization(changes, warnings, path, value, nextValue, "String numérica convertida a number.");
    }
  }

  if (integerPathPatterns.has(normalizedPath) && typeof nextValue === "number" && Number.isFinite(nextValue) && !Number.isInteger(nextValue)) {
    const rounded = Math.round(nextValue);
    recordNormalization(changes, warnings, path, nextValue, rounded, "Decimal redondeado al entero requerido para Supabase.");
    return rounded;
  }

  if (booleanPathPatterns.has(normalizedPath)) {
    const parsedBoolean = normalizeBooleanValue(value);

    if (parsedBoolean !== null) {
      recordNormalization(changes, warnings, path, value, parsedBoolean, "String convertido a boolean.");
      return parsedBoolean;
    }
  }

  return nextValue;
}

function normalizeRecordValues(value: unknown, path: string, changes: NormalizationChange[], warnings: ValidationIssue[]): unknown {
  if (Array.isArray(value)) {
    return value.map((item, index) => normalizeRecordValues(item, path ? `${path}.${index}` : `${index}`, changes, warnings));
  }

  if (!isRecord(value)) {
    return normalizeValueAtPath(value, path, changes, warnings);
  }

  const result: Record<string, unknown> = {};

  Object.entries(value).forEach(([key, childValue]) => {
    const childPath = path ? `${path}.${key}` : key;
    result[key] = normalizeRecordValues(childValue, childPath, changes, warnings);
  });

  return result;
}

export function normalizeHybridOSInput(input: unknown): NormalizeHybridOSInputResult {
  const warnings: ValidationIssue[] = [];
  const changes: NormalizationChange[] = [];
  const clonedInput = cloneJsonValue(input);
  const normalizedInput = normalizeRecordValues(clonedInput, "", changes, warnings);

  if (changes.length > 0) {
    warnings.unshift({
      path: "normalization",
      message: "Se normalizaron algunos campos antes de guardar.",
      suggestion: "Revisa la sección de normalizaciones aplicadas antes de importar.",
      code: "type",
    });
  }

  return {
    normalizedInput,
    warnings,
    changes,
  };
}

function validateStringArray(value: unknown, path: string, errors: ValidationIssue[]) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    errors.push({
      path,
      message: "Debe ser un array de strings.",
      receivedValue: value,
      suggestion: "Usa una lista JSON. Ejemplo: [\"engine\", \"running\"].",
      code: "type",
    });
    return false;
  }

  return true;
}

function validateNumberRange(value: unknown, path: string, min: number, max: number, errors: ValidationIssue[]) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    errors.push({
      path,
      message: `Debe ser un número entre ${min} y ${max}.`,
      receivedValue: value,
      suggestion: `Usa un número sin unidades entre ${min} y ${max}.`,
      code: "range",
    });
    return false;
  }

  return true;
}

function validateMuscleSummary(value: unknown, path: string, errors: ValidationIssue[]) {
  if (!isRecord(value)) {
    errors.push({ path, message: "Debe ser un objeto de carga muscular por grupo.", receivedValue: value, code: "type" });
    return;
  }

  muscleNames.forEach((muscle) => {
    validateNumberRange(value[muscle], `${path}.${muscle}`, 0, 100, errors);
  });
}

function validateMetrics(value: unknown, path: string, errors: ValidationIssue[]) {
  if (!isRecord(value)) {
    errors.push({ path, message: "Debe ser un objeto de métricas de sesión.", receivedValue: value, code: "type" });
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
      errors.push({
        path: `${path}.${field}`,
        message: "Debe ser número o null.",
        receivedValue: value[field],
        suggestion: "No uses texto ni unidades. Si no lo sabes, usa null.",
        code: "type",
      });
    }
  });
}

function validateExercise(value: unknown, path: string, errors: ValidationIssue[]) {
  if (!isRecord(value)) {
    errors.push({ path, message: "Cada ejercicio debe ser un objeto.", receivedValue: value, code: "type" });
    return;
  }

  ["name", "canonicalName"].forEach((field) => {
    if (!isString(value[field])) {
      errors.push({ path: `${path}.${field}`, message: "Debe ser un string obligatorio.", receivedValue: value[field], code: "required" });
    }
  });

  ["sets", "reps", "distanceMeters", "durationSeconds", "calories", "loadKg"].forEach((field) => {
    if (value[field] !== undefined && !isNumberOrNull(value[field])) {
      errors.push({
        path: `${path}.${field}`,
        message: "Debe ser número o null. No usar texto con unidades.",
        receivedValue: value[field],
        suggestion: "Convierte el valor a número puro o usa null si falta el dato.",
        code: "type",
      });
    }
  });

  validateEnum(value.movementPattern, movementPatterns, `${path}.movementPattern`, errors);

  if (value.intensity !== null && !validateEnum(value.intensity, intensities, `${path}.intensity`, errors)) {
    return;
  }

  if (!Array.isArray(value.muscleLoad)) {
    errors.push({ path: `${path}.muscleLoad`, message: "Debe ser un array.", receivedValue: value.muscleLoad, code: "type" });
    return;
  }

  value.muscleLoad.forEach((entry, index) => {
    if (!isRecord(entry)) {
      errors.push({ path: `${path}.muscleLoad.${index}`, message: "Cada carga muscular debe ser un objeto.", receivedValue: entry, code: "type" });
      return;
    }

    validateEnum(entry.muscle, muscleNames, `${path}.muscleLoad.${index}.muscle`, errors);
    validateEnum(entry.role, muscleRoles, `${path}.muscleLoad.${index}.role`, errors);
    validateNumberRange(entry.load, `${path}.muscleLoad.${index}.load`, 0, 100, errors);
  });
}

function validateBlock(value: unknown, path: string, errors: ValidationIssue[]) {
  if (!isRecord(value)) {
    errors.push({ path, message: "Cada bloque debe ser un objeto.", receivedValue: value, code: "type" });
    return;
  }

  ["id", "name"].forEach((field) => {
    if (!isString(value[field])) {
      errors.push({ path: `${path}.${field}`, message: "Debe ser un string obligatorio.", receivedValue: value[field], code: "required" });
    }
  });
  validateEnum(value.format, blockFormats, `${path}.format`, errors);

  if (!Array.isArray(value.exercises)) {
    errors.push({ path: `${path}.exercises`, message: "Debe ser un array.", receivedValue: value.exercises, code: "type" });
    return;
  }

  value.exercises.forEach((exercise, index) => validateExercise(exercise, `${path}.exercises.${index}`, errors));
}

function validateResult(value: unknown, path: string, errors: ValidationIssue[]) {
  if (value === null) {
    return;
  }

  if (!isRecord(value)) {
    errors.push({ path, message: "Debe ser un objeto o null.", receivedValue: value, code: "type" });
    return;
  }

  validateEnum(value.type, resultTypes, `${path}.type`, errors);
  if (!optionalStringOrNull(value.score)) {
    errors.push({ path: `${path}.score`, message: "Debe ser string o null.", receivedValue: value.score, code: "type" });
  }
}

function validateEquipment(value: unknown, path: string, errors: ValidationIssue[]) {
  if (!isRecord(value)) {
    errors.push({ path, message: "equipment debe ser un objeto si existe.", receivedValue: value, code: "type" });
    return;
  }

  if (value.shoes !== undefined && !optionalStringOrNull(value.shoes)) {
    errors.push({
      path: `${path}.shoes`,
      message: "Debe ser string o null.",
      receivedValue: value.shoes,
      suggestion: "Usa el modelo de zapatilla como texto o null si no se conoce.",
      code: "type",
    });
  }
}

function validateBodyCheck(value: unknown, path: string, errors: ValidationIssue[], warnings: ValidationIssue[]): value is BodyCheck {
  if (!isRecord(value)) {
    errors.push({ path, message: "bodyCheck debe ser un objeto.", receivedValue: value, code: "type" });
    return false;
  }

  ["id", "date"].forEach((field) => {
    if (!isString(value[field])) {
      errors.push({ path: `${path}.${field}`, message: "Debe ser un string obligatorio.", receivedValue: value[field], code: "required" });
    }
  });

  ["weightKg", "waistCm", "steps", "sleepHours", "energy", "hunger"].forEach((field) => {
    if (typeof value[field] !== "number" || !Number.isFinite(value[field])) {
      errors.push({ path: `${path}.${field}`, message: "Debe ser un número.", receivedValue: value[field], code: "type" });
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
    errors.push({ path, message: "nutritionCheck debe ser un objeto.", receivedValue: value, code: "type" });
    return false;
  }

  ["id", "date"].forEach((field) => {
    if (!isString(value[field])) {
      errors.push({ path: `${path}.${field}`, message: "Debe ser un string obligatorio.", receivedValue: value[field], code: "required" });
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
      errors.push({ path: `${path}.${field}`, message: "Debe ser un número.", receivedValue: value[field], code: "type" });
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
    return { ok: false, errors: [{ path: "trainingSession", message: "Debe ser un objeto.", receivedValue: session, code: "type" }], warnings };
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
    errors.push({ path: "trainingSession.subtypes", message: "Debe ser un array.", receivedValue: session.subtypes, code: "type" });
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
    errors.push({ path: "trainingSession.pendingFields", message: "Debe ser un array.", receivedValue: session.pendingFields, code: "type" });
  } else {
    session.pendingFields.forEach((field, index) => validateEnum(field, pendingFields, `trainingSession.pendingFields.${index}`, errors));
  }

  if (!Array.isArray(session.blocks)) {
    errors.push({ path: "trainingSession.blocks", message: "Debe ser un array.", receivedValue: session.blocks, code: "type" });
  } else {
    session.blocks.forEach((block, index) => validateBlock(block, `trainingSession.blocks.${index}`, errors));
  }

  validateResult(session.result, "trainingSession.result", errors);
  validateMetrics(session.sessionMetrics, "trainingSession.sessionMetrics", errors);
  if (session.equipment !== undefined) validateEquipment(session.equipment, "trainingSession.equipment", errors);
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
    return { ok: false, errors: [{ path: "root", message: "El JSON debe ser un objeto raíz.", receivedValue: input, code: "type" }], warnings };
  }

  requireField(input, "appInputVersion", "root", errors);
  requireField(input, "generatedBy", "root", errors);
  requireField(input, "generatedAt", "root", errors);
  requireField(input, "trainingSession", "root", errors);

  if (!appInputVersions.includes(input.appInputVersion as HybridOSAppInputVersion)) {
    errors.push({ path: "appInputVersion", message: "Debe ser 1.0 o 1.1.", receivedValue: input.appInputVersion, allowedValues: appInputVersions, code: "enum" });
  }

  if (input.generatedBy !== "gpt") {
    errors.push({ path: "generatedBy", message: "Debe ser gpt.", receivedValue: input.generatedBy, allowedValues: ["gpt"], code: "enum" });
  }

  if (!isString(input.generatedAt)) {
    errors.push({ path: "generatedAt", message: "Debe ser una fecha ISO en string.", receivedValue: input.generatedAt, code: "type" });
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
      errors: [{
        path: "json",
        message: "JSON inválido. Revisa comas, llaves, comillas y formato general.",
        suggestion: "Valida que todas las claves usen comillas dobles y que no haya comas sobrantes.",
        code: "json",
      }],
      warnings: [],
    };
  }
}

function applyRepairStep(
  currentText: string,
  nextText: string,
  fixes: string[],
  fixMessage: string,
) {
  if (nextText === currentText) {
    return currentText;
  }

  if (!fixes.includes(fixMessage)) {
    fixes.push(fixMessage);
  }

  return nextText;
}

function transformOutsideQuotedText(text: string, transform: (chunk: string) => string) {
  let result = "";
  let outsideChunk = "";
  let quote: "\"" | "'" | null = null;
  let escaped = false;

  for (const char of text) {
    if (quote) {
      result += char;

      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === "\"" || char === "'") {
      result += transform(outsideChunk);
      outsideChunk = "";
      quote = char;
      result += char;
      continue;
    }

    outsideChunk += char;
  }

  return result + transform(outsideChunk);
}

function stripSurroundingText(text: string, fixes: string[]) {
  const firstObjectBrace = text.indexOf("{");
  const lastObjectBrace = text.lastIndexOf("}");
  const firstArrayBracket = text.indexOf("[");
  const lastArrayBracket = text.lastIndexOf("]");
  const hasObject = firstObjectBrace >= 0 && lastObjectBrace > firstObjectBrace;
  const hasArray = firstArrayBracket >= 0 && lastArrayBracket > firstArrayBracket;

  const shouldUseObject =
    hasObject &&
    (!hasArray || firstObjectBrace < firstArrayBracket || lastObjectBrace > lastArrayBracket);
  const start = shouldUseObject ? firstObjectBrace : firstArrayBracket;
  const end = shouldUseObject ? lastObjectBrace : lastArrayBracket;

  if (start < 0 || end <= start || (start === 0 && end === text.length - 1)) {
    return text;
  }

  return applyRepairStep(text, text.slice(start, end + 1), fixes, "Se recortó texto fuera del objeto JSON.");
}

function isSimpleJsonLiteral(value: string) {
  return value === "null" || value === "true" || value === "false" || /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value);
}

function findUnquotedTextValueEnd(text: string, startIndex: number) {
  let index = startIndex;

  while (index < text.length) {
    const char = text[index];

    if (char === "}" || char === "]") {
      return index;
    }

    if (char === ",") {
      const rest = text.slice(index + 1);

      if (/^\s*(?:"[A-Za-z_$][A-Za-z0-9_$-]*"|[A-Za-z_$][A-Za-z0-9_$-]*)\s*:/.test(rest)) {
        return index;
      }
    }

    index += 1;
  }

  return index;
}

function quoteKnownTextValues(text: string) {
  const keyPattern = repairableTextValueKeys.map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const keyRegex = new RegExp(`"(${keyPattern})"\\s*:`, "g");
  let result = "";
  let cursor = 0;

  while (keyRegex.exec(text) !== null) {
    const valueStart = keyRegex.lastIndex;
    const leadingWhitespace = text.slice(valueStart).match(/^\s*/)?.[0] ?? "";
    const trimmedValueStart = valueStart + leadingWhitespace.length;
    const firstValueChar = text[trimmedValueStart];

    if (
      firstValueChar === undefined ||
      firstValueChar === "\"" ||
      firstValueChar === "{" ||
      firstValueChar === "["
    ) {
      continue;
    }

    const valueEnd = findUnquotedTextValueEnd(text, trimmedValueStart);
    const rawValue = text.slice(trimmedValueStart, valueEnd).trim();

    if (!rawValue || isSimpleJsonLiteral(rawValue)) {
      continue;
    }

    result += text.slice(cursor, trimmedValueStart);
    result += JSON.stringify(rawValue);
    cursor = valueEnd;
    keyRegex.lastIndex = valueEnd;
  }

  if (cursor === 0) {
    return text;
  }

  return result + text.slice(cursor);
}

export function repairJsonText(input: string): JsonRepairResult {
  const fixes: string[] = [];
  let repairedText = input;

  repairedText = applyRepairStep(
    repairedText,
    repairedText.replace(/^\uFEFF/, "").replace(/[\u200B-\u200D\u2060]/g, ""),
    fixes,
    "Se eliminaron caracteres invisibles.",
  );

  repairedText = applyRepairStep(repairedText, repairedText.trim(), fixes, "Se recortaron espacios iniciales o finales.");

  const beforeMarkdown = repairedText;
  repairedText = beforeMarkdown
    .replace(/^\s*```(?:json|JSON)?\s*[\r\n]?/, "")
    .replace(/[\r\n]?\s*```\s*$/, "");

  if (repairedText !== beforeMarkdown && !fixes.includes("Se eliminaron bloques markdown.")) {
    fixes.push("Se eliminaron bloques markdown.");
  }

  repairedText = stripSurroundingText(repairedText, fixes);

  repairedText = applyRepairStep(
    repairedText,
    repairedText.replace(/[“”]/g, "\"").replace(/[‘’]/g, "'"),
    fixes,
    "Se normalizaron comillas tipográficas.",
  );

  repairedText = applyRepairStep(
    repairedText,
    transformOutsideQuotedText(
      repairedText,
      (chunk) => chunk.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$-]*)(\s*:)/g, "$1\"$2\"$3"),
    ),
    fixes,
    "Se añadieron comillas dobles a claves sin comillas.",
  );

  repairedText = applyRepairStep(
    repairedText,
    transformOutsideQuotedText(repairedText, (chunk) => chunk.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\r\n]*/g, "")),
    fixes,
    "Se eliminaron comentarios incompatibles con JSON.",
  );

  repairedText = applyRepairStep(
    repairedText,
    repairedText
      .replace(/'([^']+)'\s*:/g, "\"$1\":")
      .replace(/:\s*'([^']*)'/g, ": \"$1\"")
      .replace(/,\s*'([^']*)'/g, ", \"$1\"")
      .replace(/\[\s*'([^']*)'/g, "[\"$1\""),
    fixes,
    "Se convirtieron comillas simples compatibles con JSON.",
  );

  repairedText = applyRepairStep(
    repairedText,
    quoteKnownTextValues(repairedText),
    fixes,
    "Se añadieron comillas a valores textuales sin comillas.",
  );

  repairedText = applyRepairStep(
    repairedText,
    transformOutsideQuotedText(repairedText, (chunk) => chunk.replace(/,\s*([}\]])/g, "$1")),
    fixes,
    "Se eliminaron comas sobrantes.",
  );

  return {
    repairedText,
    changed: repairedText !== input,
    fixes,
  };
}

function formatJsonParseError(message: string, inputText: string) {
  const positionMatch = message.match(/position (\d+)/i);

  if (!positionMatch) {
    return {
      message: "El JSON no se puede interpretar. Revisa comillas, llaves y comas.",
      suggestion: "Revisa comillas, llaves y comas. El detalle técnico queda disponible para depuración.",
    };
  }

  const position = Number(positionMatch[1]);
  const textBeforePosition = inputText.slice(0, position);
  const line = textBeforePosition.split("\n").length;
  const lastLineBreak = textBeforePosition.lastIndexOf("\n");
  const column = position - lastLineBreak;

  return {
    message: `El JSON no se puede interpretar en línea ${line}, columna ${column}.`,
    suggestion: "Revisa esa zona del JSON: normalmente falta una coma, una comilla doble o sobra una coma final.",
  };
}

export function formatIssuePath(path: (string | number)[]): string {
  return path.reduce<string>((formattedPath, part) => {
    if (typeof part === "number") {
      return `${formattedPath}[${part}]`;
    }

    return formattedPath ? `${formattedPath}.${part}` : part;
  }, "");
}

export function getValueAtPath(obj: unknown, path: (string | number)[]): unknown {
  return path.reduce<unknown>((current, part) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof part === "number") {
      return Array.isArray(current) ? current[part] : undefined;
    }

    return isRecord(current) || Array.isArray(current) ? current[part as keyof typeof current] : undefined;
  }, obj);
}

function parseValidationPath(path: string): (string | number)[] {
  if (path === "json" || path === "root") {
    return [path];
  }

  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)
    .map((part) => (/^\d+$/.test(part) ? Number(part) : part));
}

export function normalizePathForEnum(path: string) {
  return path
    .replace(/\[\d+\]/g, "[]")
    .replace(/\.?\d+\./g, ".[].")
    .replace(/\.\d+$/g, ".[]");
}

export function getAllowedValuesForPath(path: string): string[] | undefined {
  const normalizedPath = normalizePathForEnum(path);

  const enumValuesByPath: Record<string, string[]> = {
    "trainingSession.type": trainingSessionTypes,
    "trainingSession.subtypes[]": trainingSubtypes,
    "trainingSession.dateConfidence": dateConfidences,
    "trainingSession.dateRule": dateRules,
    "trainingSession.status": sessionStatuses,
    "trainingSession.source": ["chatgpt", "manual", "import"],
    "trainingSession.blocks[].format": blockFormats,
    "trainingSession.blocks[].exercises[].movementPattern": movementPatterns,
    "trainingSession.blocks[].exercises[].intensity": intensities,
    "trainingSession.blocks[].exercises[].muscleLoad[].muscle": muscleNames,
    "trainingSession.blocks[].exercises[].muscleLoad[].role": muscleRoles,
    "trainingSession.result.type": resultTypes,
    "trainingSession.dataQuality": dataQualities,
    "trainingSession.pendingFields[]": pendingFields,
    "appInputVersion": appInputVersions,
  };

  return enumValuesByPath[normalizedPath];
}

export function getSuggestionForIssue(path: string, receivedValue: unknown): string | undefined {
  const normalizedPath = normalizePathForEnum(path);

  if (normalizedPath === "trainingSession.subtypes[]" && receivedValue === "hyrox") {
    return "Elimina \"hyrox\" de subtypes. HYROX debe ir en trainingSession.type, no en subtypes.";
  }

  if (normalizedPath === "trainingSession.subtypes[]" && receivedValue === "aerobic") {
    return "No uses \"aerobic\" como subtype. Usa \"engine\", \"running\" o \"z2\" si encaja. Si quieres conservar aerobic, ponlo en tags o notes.";
  }

  if (normalizedPath === "trainingSession.subtypes[]" && typeof receivedValue === "string" && /^z[3-9]\d*$/i.test(receivedValue)) {
    return "No uses zonas de intensidad como subtypes. Usa \"running\" o \"intervals\" y guarda la zona en tags o notes.";
  }

  if (normalizedPath === "trainingSession.subtypes[]" && receivedValue === "outdoor") {
    return "No uses \"outdoor\" como subtype. Guárdalo en tags o location si aplica.";
  }

  if (normalizedPath.includes("movementPattern")) {
    return "Revisa el patrón de movimiento. Usa solo uno de los movementPattern permitidos.";
  }

  if (normalizedPath.endsWith(".muscle")) {
    return "Usa solo músculos del contrato.";
  }

  if (normalizedPath.endsWith(".role")) {
    return "Usa solo roles permitidos: primary, secondary o stabilizer.";
  }

  if (normalizedPath === "trainingSession.pendingFields[]") {
    return "Usa solo los pendingFields permitidos.";
  }

  if (normalizedPath === "trainingSession.type") {
    return "Revisa el tipo principal de sesión. Si es una sesión combinada, usa \"mixed\".";
  }

  if (normalizedPath === "trainingSession.result.type" && receivedValue === "hyrox") {
    return "HYROX es un tipo de sesión, no un tipo de resultado. Usa time, partial o none según corresponda.";
  }

  if (normalizedPath === "trainingSession.result.type") {
    return "Revisa el tipo de resultado. Si no hay resultado, usa \"none\". Si el resultado es incompleto, usa \"partial\".";
  }

  return undefined;
}

export function mapZodIssuesToImportIssues(issues: ZodIssueLike[], originalObject: unknown): ImportIssue[] {
  return issues.map((issue) => {
    const path = formatIssuePath(issue.path);
    const receivedValue = getValueAtPath(originalObject, issue.path);
    const allowedValues = issue.options ?? getAllowedValuesForPath(path);
    const suggestion = getSuggestionForIssue(path, receivedValue);
    const message = allowedValues && issue.message.toLowerCase().includes("invalid")
      ? "Valor no permitido."
      : issue.message;

    return {
      severity: "error",
      path,
      message,
      receivedValue,
      allowedValues,
      suggestion,
    };
  });
}

function normalizeRootPath(path: string, sourceWasArray: boolean, inputIndex: number) {
  return sourceWasArray ? `${inputIndex}.${path}` : path;
}

function toImportIssue(
  issue: ValidationIssue,
  rootInput: unknown,
  options: { sourceWasArray: boolean; inputIndex: number; severity: ImportIssue["severity"] },
): ImportIssue {
  const rawPath = normalizeRootPath(issue.path, options.sourceWasArray, options.inputIndex);
  const issuePath = parseValidationPath(rawPath);
  const formattedPath = formatIssuePath(issuePath);
  const receivedValue = issue.receivedValue !== undefined ? issue.receivedValue : getValueAtPath(rootInput, issuePath);
  const allowedValues = issue.allowedValues ?? getAllowedValuesForPath(formattedPath);
  const suggestion = getSuggestionForIssue(formattedPath, receivedValue) ?? issue.suggestion;

  return {
    severity: options.severity,
    path: formattedPath,
    message: issue.message,
    receivedValue,
    allowedValues,
    suggestion,
  };
}

function normalizationChangeToImportIssue(change: NormalizationChange): ImportIssue {
  return {
    severity: "warning",
    path: change.path,
    message: change.message,
    receivedValue: change.before,
    normalizedValue: change.after,
    suggestion: `${formatNormalizationValue(change.before)} -> ${formatNormalizationValue(change.after)}`,
  };
}

function addWarning(warnings: ImportIssue[], issue: Omit<ImportIssue, "severity">) {
  warnings.push({ ...issue, severity: "warning" });
}

function isBlank(value: unknown) {
  return typeof value !== "string" || value.trim().length === 0;
}

function looksLikeGenericMachine(session: TrainingSession, blockIndex: number, exerciseIndex: number) {
  const exercise = session.blocks[blockIndex]?.exercises[exerciseIndex];
  const name = exercise?.name.trim().toLowerCase();
  const canonicalName = exercise?.canonicalName.trim().toLowerCase();
  const hasCalories = typeof exercise?.calories === "number" && exercise.calories > 0;

  return name === "machine" || canonicalName === "machine calories" || Boolean(name?.includes("machine")) || (hasCalories && (name === "machine" || canonicalName === "machine"));
}

function hasStrengthSignal(session: TrainingSession) {
  return (
    ["fuerza", "crossfit", "hyrox", "halterofilia"].includes(session.type) ||
    session.subtypes.some((subtype) => ["strength", "weightlifting", "lower_body", "upper_body", "full_body"].includes(subtype))
  );
}

function hasLoadedExercises(session: TrainingSession) {
  return session.blocks.some((block) => block.exercises.some((exercise) => typeof exercise.loadKg === "number" && exercise.loadKg > 0));
}

export function generateImportWarnings(input: HybridOSAppInput): ImportIssue[] {
  const warnings: ImportIssue[] = [];
  const session = input.trainingSession;

  if (session.durationMinutes === null) {
    addWarning(warnings, {
      path: "trainingSession.durationMinutes",
      message: "La duración de la sesión está vacía.",
      receivedValue: session.durationMinutes,
      suggestion: "Añade duración aproximada en minutos para mejorar el cálculo de carga.",
    });
  }

  if (session.rpe === null) {
    addWarning(warnings, {
      path: "trainingSession.rpe",
      message: "El RPE está vacío.",
      receivedValue: session.rpe,
      suggestion: "Añade RPE 0-10 para estimar mejor la carga interna.",
    });
  }

  if (session.result?.type === "none") {
    addWarning(warnings, {
      path: "trainingSession.result",
      message: "La sesión no tiene resultado registrado.",
      receivedValue: session.result,
      suggestion: "Añade tiempo, rondas, carga, distancia o marca resultado parcial si aplica.",
    });
  }

  if (session.dataQuality === "partial") {
    addWarning(warnings, {
      path: "trainingSession.dataQuality",
      message: "La calidad de datos es parcial.",
      receivedValue: session.dataQuality,
      suggestion: "Puedes importar la sesión, pero revisa campos pendientes si quieres mejorar la precisión del análisis.",
    });
  }

  if (session.dataQuality === "low") {
    addWarning(warnings, {
      path: "trainingSession.dataQuality",
      message: "La calidad de datos es baja.",
      receivedValue: session.dataQuality,
      suggestion: "Puedes importar la sesión, pero conviene revisar campos pendientes antes de usarla para análisis.",
    });
  }

  if (session.pendingFields.includes("Otro")) {
    addWarning(warnings, {
      path: "trainingSession.pendingFields",
      message: "Hay campos pendientes genéricos.",
      receivedValue: "Otro",
      allowedValues: pendingFields,
      suggestion: "Sustituye \"Otro\" por un campo más específico si es posible.",
    });
  }

  if (isPureRunningSession(session) && isBlank(session.equipment?.shoes)) {
    addWarning(warnings, {
      path: "trainingSession.equipment.shoes",
      message: "Zapatillas no indicadas. Esta sesión de running no podrá sumar volumen por modelo.",
      receivedValue: session.equipment?.shoes,
      suggestion: "Añade trainingSession.equipment.shoes si conoces el modelo. No lo añadas a pendingFields.",
    });
  }

  if (session.blocks.length === 0) {
    addWarning(warnings, {
      path: "trainingSession.blocks",
      message: "La sesión no tiene bloques de entrenamiento.",
      receivedValue: session.blocks,
      suggestion: "Añade al menos un bloque si quieres analizar ejercicios, carga muscular y métricas.",
    });
  }

  session.blocks.forEach((block, blockIndex) => {
    if (block.exercises.length === 0) {
      addWarning(warnings, {
        path: `trainingSession.blocks[${blockIndex}].exercises`,
        message: "El bloque no tiene ejercicios.",
        receivedValue: block.exercises,
        suggestion: "Añade ejercicios al bloque o elimina el bloque si no aporta información.",
      });
    }

    block.exercises.forEach((exercise, exerciseIndex) => {
      const exercisePath = `trainingSession.blocks[${blockIndex}].exercises[${exerciseIndex}]`;

      if (isBlank(exercise.canonicalName)) {
        addWarning(warnings, {
          path: `${exercisePath}.canonicalName`,
          message: "El ejercicio no tiene canonicalName.",
          receivedValue: exercise.canonicalName,
          suggestion: "Añade un canonicalName estable para mejorar agrupaciones y análisis históricos.",
        });
      }

      if (looksLikeGenericMachine(session, blockIndex, exerciseIndex)) {
        addWarning(warnings, {
          path: `${exercisePath}.name`,
          message: "La máquina no está especificada.",
          receivedValue: exercise.name,
          suggestion: "Cambia Machine por SkiErg, Row, BikeErg, Assault Bike u otra máquina concreta si lo sabes.",
        });
      }

      if (typeof exercise.calories === "number" && exercise.calories > 0 && looksLikeGenericMachine(session, blockIndex, exerciseIndex)) {
        addWarning(warnings, {
          path: `${exercisePath}.calories`,
          message: "Hay calorías registradas pero la máquina no está especificada.",
          receivedValue: exercise.calories,
          suggestion: "Especifica la máquina para mejorar el cálculo de carga y métricas por ergómetro.",
        });
      }

      exercise.muscleLoad.forEach((entry, loadIndex) => {
        if (entry.load < 0 || entry.load > 100) {
          addWarning(warnings, {
            path: `${exercisePath}.muscleLoad[${loadIndex}].load`,
            message: "El valor muscleLoad.load está fuera del rango 0-100.",
            receivedValue: entry.load,
            suggestion: "Ajusta el valor para que esté entre 0 y 100.",
          });
        }
      });
    });
  });

  if (session.subtypes.includes("running") && session.sessionMetrics.totalRunMeters === 0) {
    addWarning(warnings, {
      path: "trainingSession.sessionMetrics.totalRunMeters",
      message: "La sesión está marcada como running pero totalRunMeters es 0.",
      receivedValue: session.sessionMetrics.totalRunMeters,
      suggestion: "Revisa si falta sumar la distancia total de carrera.",
    });
  }

  const missingMuscles = muscleNames.filter((muscle) => session.sessionMuscleSummary[muscle] === undefined);
  if (missingMuscles.length > 0) {
    addWarning(warnings, {
      path: "trainingSession.sessionMuscleSummary",
      message: "El resumen muscular no incluye todos los músculos permitidos.",
      receivedValue: missingMuscles,
      suggestion: "Incluye todos los músculos del contrato, aunque algunos tengan valor 0.",
    });
  }

  muscleNames.forEach((muscle) => {
    const value = session.sessionMuscleSummary[muscle];

    if (value === undefined) {
      return;
    }

    if (typeof value !== "number" || value < 0 || value > 100) {
      addWarning(warnings, {
        path: `trainingSession.sessionMuscleSummary.${muscle}`,
        message: "El valor de carga muscular está fuera del rango 0-100.",
        receivedValue: value,
        suggestion: "Ajusta el valor para que esté entre 0 y 100.",
      });
    }
  });

  if (hasLoadedExercises(session) && session.sessionMetrics.totalExternalLoadKg === null) {
    addWarning(warnings, {
      path: "trainingSession.sessionMetrics.totalExternalLoadKg",
      message: "Hay cargas registradas pero totalExternalLoadKg está vacío.",
      receivedValue: session.sessionMetrics.totalExternalLoadKg,
      suggestion: "Calcula o estima la carga externa total si quieres mejorar el análisis de volumen.",
    });
  }

  if (hasStrengthSignal(session) && session.sessionMetrics.hardSetsEstimate === null) {
    addWarning(warnings, {
      path: "trainingSession.sessionMetrics.hardSetsEstimate",
      message: "La estimación de hard sets está vacía.",
      receivedValue: session.sessionMetrics.hardSetsEstimate,
      suggestion: "Añade una estimación si quieres mejorar el control de carga de fuerza.",
    });
  }

  ["impactScore", "cardioLoad", "strengthLoad", "technicalLoad", "fatigueCost"].forEach((metric) => {
    const value = session.sessionMetrics[metric as keyof TrainingSession["sessionMetrics"]];

    if (typeof value === "number" && (value < 0 || value > 100)) {
      addWarning(warnings, {
        path: `trainingSession.sessionMetrics.${metric}`,
        message: "La métrica está fuera del rango 0-100.",
        receivedValue: value,
        suggestion: "Ajusta el valor para que esté entre 0 y 100.",
      });
    }
  });

  if (session.dateConfidence === "unknown") {
    addWarning(warnings, {
      path: "trainingSession.dateConfidence",
      message: "La fecha de la sesión no es segura.",
      receivedValue: session.dateConfidence,
      allowedValues: dateConfidences,
      suggestion: "Revisa date y reportedAt antes de importar.",
    });
  }

  if (session.rawText.trim().length === 0) {
    addWarning(warnings, {
      path: "trainingSession.rawText",
      message: "No hay texto original de referencia.",
      receivedValue: session.rawText,
      suggestion: "Conservar rawText ayuda a auditar la importación si algo falla.",
    });
  }

  if (session.importNotes && /no especificad|faltan|desconocid|pendiente/i.test(session.importNotes)) {
    addWarning(warnings, {
      path: "trainingSession.importNotes",
      message: "Hay notas de importación que indican datos incompletos.",
      receivedValue: session.importNotes,
      suggestion: "Revisa importNotes antes de importar si quieres completar la sesión.",
    });
  }

  return warnings;
}

export function validateHybridOSImport(inputText: string): ImportValidationResult {
  let parsedJson: unknown;
  let repairedText: string | undefined;
  let normalizedText: string | undefined;
  let autoRepaired = false;
  let repairFixes: string[] = [];
  let rawParseError: string | undefined;

  try {
    parsedJson = JSON.parse(inputText) as unknown;
  } catch (originalParseError) {
    rawParseError = originalParseError instanceof Error ? originalParseError.message : String(originalParseError);
    const repairResult = repairJsonText(inputText);

    try {
      parsedJson = JSON.parse(repairResult.repairedText) as unknown;
      repairedText = repairResult.repairedText;
      autoRepaired = repairResult.changed;
      repairFixes = repairResult.fixes;
    } catch {
      const parseError = formatJsonParseError(rawParseError, inputText);

      return {
        valid: false,
        errors: [{
          severity: "error",
          path: "json",
          message: parseError.message,
          receivedValue: rawParseError,
          suggestion: parseError.suggestion,
        }],
        warnings: [],
        normalizationChanges: [],
        repairedText: repairResult.changed ? repairResult.repairedText : undefined,
        normalizedText: undefined,
        autoRepaired: false,
        repairFixes: repairResult.fixes,
        rawParseError,
      };
    }
  }

  const normalization = normalizeHybridOSInput(parsedJson);
  const normalizedJson = normalization.normalizedInput;
  const normalizationIssues = normalization.changes.map(normalizationChangeToImportIssue);
  const sourceWasArray = Array.isArray(normalizedJson);
  const inputs: unknown[] = sourceWasArray ? normalizedJson as unknown[] : [normalizedJson];
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const validInputs: HybridOSAppInput[] = [];

  if (normalization.changes.length > 0) {
    normalizedText = JSON.stringify(normalizedJson, null, 2);
    warnings.push({
      severity: "warning",
      path: "normalization",
      message: "Se normalizaron algunos campos antes de guardar.",
      suggestion: "Revisa la sección de normalizaciones aplicadas antes de guardar o simular.",
    });
  }

  if (autoRepaired) {
    warnings.push({
      severity: "warning",
      path: "json",
      message: "El JSON tenía errores de formato y fue reparado automáticamente.",
      suggestion: "Revisa los cambios y aplica el JSON reparado al input si todo es correcto.",
    });
  }

  inputs.forEach((input, inputIndex) => {
    const validation = validateHybridOSAppInput(input);
    const rootInput = sourceWasArray ? normalizedJson : input;

    errors.push(...validation.errors.map((issue) => toImportIssue(issue, rootInput, {
      sourceWasArray,
      inputIndex,
      severity: "error",
    })));

    if (validation.value) {
      validInputs.push(validation.value);
      warnings.push(...validation.warnings.map((issue) => toImportIssue(issue, rootInput, {
        sourceWasArray,
        inputIndex,
        severity: "warning",
      })));
      const generatedWarnings = generateImportWarnings(validation.value);
      warnings.push(...generatedWarnings.map((issue) => sourceWasArray
        ? { ...issue, path: formatIssuePath([inputIndex, ...parseValidationPath(issue.path)]) }
        : issue));
      return;
    }

    warnings.push(...validation.warnings.map((issue) => toImportIssue(issue, rootInput, {
      sourceWasArray,
      inputIndex,
      severity: "warning",
    })));
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalizationChanges: normalizationIssues,
    parsed: errors.length === 0 ? validInputs : undefined,
    repairedText,
    normalizedText,
    autoRepaired,
    repairFixes,
    rawParseError,
  };
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
