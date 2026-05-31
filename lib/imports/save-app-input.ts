import {
  getRemoteTrainingSessionById,
  insertRemoteTrainingSession,
  insertRawImport,
  insertTrainingExercises,
  replaceTrainingExercises,
  upsertBodyCheck,
  upsertNutritionCheck,
  upsertRemoteTrainingSession,
} from "@/lib/supabase/training-sessions";
import { coercePartialSession, validateHistoricalSessions, type ValidationIssue } from "@/lib/validation/hybrid-os-input";
import type { HybridOSAppInput, SessionStatus, TrainingSession } from "@/types/training";

const importableStatuses: SessionStatus[] = ["completed", "partial"];

export type ImportPhase =
  | "duplicate_check"
  | "raw_imports"
  | "training_sessions"
  | "training_exercises"
  | "body_checks"
  | "nutrition_checks";

export type SerializedImportError = {
  phase: ImportPhase;
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

function hasProperty<T extends string>(value: unknown, property: T): value is Record<T, unknown> {
  return typeof value === "object" && value !== null && property in value;
}

function stringProperty(value: unknown, property: string) {
  if (!hasProperty(value, property)) {
    return undefined;
  }

  return typeof value[property] === "string" ? value[property] : undefined;
}

function serializeImportError(error: unknown, phase: ImportPhase): SerializedImportError {
  const code = stringProperty(error, "code");
  const rawMessage =
    error instanceof Error
      ? error.message
      : stringProperty(error, "message") ?? JSON.stringify(error) ?? "Unknown import error.";
  const message =
    phase === "raw_imports" && code === "23503"
      ? "No se pudo guardar raw_imports porque la sesión principal no existe. Revisa el orden de inserción o el id usado como FK."
      : rawMessage;

  return {
    phase,
    message,
    code,
    details: stringProperty(error, "details"),
    hint: stringProperty(error, "hint"),
  };
}

async function runImportPhase<T>(phase: ImportPhase, operation: () => Promise<T>) {
  try {
    console.info(`[Hybrid OS import] ${phase}: start`);
    const result = await operation();
    console.info(`[Hybrid OS import] ${phase}: ok`);
    return result;
  } catch (error) {
    console.error(`[Hybrid OS import] ${phase}: failed`, error);
    const serializedError = new Error(serializeImportError(error, phase).message);
    Object.assign(serializedError, serializeImportError(error, phase));
    throw serializedError;
  }
}

export type SaveAppInputsResult = {
  ok: true;
  totalFound: number;
  imported: number;
  skippedDuplicate: string[];
  skippedInvalidStatus: Array<{ id: string; status: SessionStatus }>;
  errors: Array<{ id: string } & SerializedImportError>;
  importedIds: string[];
  savedExercises: number;
  savedBodyCheckIds: string[];
  savedNutritionCheckIds: string[];
  validationWarnings: ValidationIssue[];
};

export type SaveAppInputsOptions = {
  duplicateMode?: "error" | "skip" | "upsert";
  sourceLabel?: string;
};

function withImportSource(input: HybridOSAppInput, sourceLabel?: string): HybridOSAppInput {
  if (!sourceLabel) {
    return input;
  }

  const session = input.trainingSession;
  const importNotes = [
    session.importNotes,
    `Imported from ${sourceLabel}. Original source: ${session.source}.`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    ...input,
    trainingSession: {
      ...session,
      importNotes,
    },
  };
}

function exerciseCount(session: TrainingSession) {
  return session.blocks.reduce((total, block) => total + block.exercises.length, 0);
}

export async function saveAppInputs(rawInputs: unknown, options: SaveAppInputsOptions = {}): Promise<SaveAppInputsResult> {
  console.info("[Hybrid OS import] validation: start");
  const validation = validateHistoricalSessions(rawInputs);

  if (!validation.ok || !validation.value) {
    console.error("[Hybrid OS import] validation: failed", validation.errors);
    const error = new Error("Invalid appInput.");
    Object.assign(error, { issues: validation.errors });
    throw error;
  }
  console.info("[Hybrid OS import] validation: ok");

  const result: SaveAppInputsResult = {
    ok: true,
    totalFound: validation.value.length,
    imported: 0,
    skippedDuplicate: [],
    skippedInvalidStatus: [],
    errors: [],
    importedIds: [],
    savedExercises: 0,
    savedBodyCheckIds: [],
    savedNutritionCheckIds: [],
    validationWarnings: validation.warnings,
  };

  for (const input of validation.value.map((item) => withImportSource(item, options.sourceLabel))) {
    const sessionId = input.trainingSession.id;

    if (!importableStatuses.includes(input.trainingSession.status)) {
      result.skippedInvalidStatus.push({ id: sessionId, status: input.trainingSession.status });
      continue;
    }

    try {
      const existingSession = await runImportPhase("duplicate_check", () => getRemoteTrainingSessionById(sessionId));
      const shouldUpsertSession = Boolean(existingSession) && options.duplicateMode === "upsert";

      if (existingSession) {
        if (options.duplicateMode === "skip") {
          result.skippedDuplicate.push(sessionId);
          continue;
        }

        if (!shouldUpsertSession) {
          const error = new Error("Training session already exists.");
          Object.assign(error, { duplicateIds: [sessionId] });
          throw error;
        }
      }

      const session = coercePartialSession(input.trainingSession);
      const savedBodyCheckIds: string[] = [];
      const savedNutritionCheckIds: string[] = [];

      const persistedSession = await runImportPhase("training_sessions", () =>
        shouldUpsertSession ? upsertRemoteTrainingSession(session) : insertRemoteTrainingSession(session),
      );
      const persistedSessionId = persistedSession.id;

      await runImportPhase("raw_imports", () => insertRawImport(input, persistedSessionId));
      console.info("[Hybrid OS import] metrics: ok");
      console.info("[Hybrid OS import] muscle_loads: ok");
      await runImportPhase("training_exercises", () =>
        shouldUpsertSession ? replaceTrainingExercises(session) : insertTrainingExercises(session),
      );

      if (input.bodyCheck) {
        const bodyCheck = input.bodyCheck;
        await runImportPhase("body_checks", () => upsertBodyCheck(bodyCheck));
        savedBodyCheckIds.push(bodyCheck.id);
      }

      if (input.nutritionCheck) {
        const nutritionCheck = input.nutritionCheck;
        await runImportPhase("nutrition_checks", () => upsertNutritionCheck(nutritionCheck));
        savedNutritionCheckIds.push(nutritionCheck.id);
      }

      result.imported += 1;
      result.importedIds.push(session.id);
      result.savedExercises += exerciseCount(session);
      result.savedBodyCheckIds.push(...savedBodyCheckIds);
      result.savedNutritionCheckIds.push(...savedNutritionCheckIds);
    } catch (error) {
      if (hasProperty(error, "duplicateIds")) {
        throw error;
      }

      result.errors.push({
        id: sessionId,
        ...serializeImportError(error, stringProperty(error, "phase") as ImportPhase | undefined ?? "training_sessions"),
      });
    }
  }

  return result;
}
