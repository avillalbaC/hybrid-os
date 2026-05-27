import {
  getRemoteTrainingSessionById,
  insertRemoteTrainingSession,
  insertRawImport,
  insertTrainingExercises,
  upsertBodyCheck,
  upsertNutritionCheck,
} from "@/lib/supabase/training-sessions";
import { coercePartialSession, validateHistoricalSessions, type ValidationIssue } from "@/lib/validation/hybrid-os-input";
import type { HybridOSAppInput, SessionStatus, TrainingSession } from "@/types/training";

const importableStatuses: SessionStatus[] = ["completed", "partial"];

function hasProperty<T extends string>(value: unknown, property: T): value is Record<T, unknown> {
  return typeof value === "object" && value !== null && property in value;
}

export type SaveAppInputsResult = {
  ok: true;
  totalFound: number;
  imported: number;
  skippedDuplicate: string[];
  skippedInvalidStatus: Array<{ id: string; status: SessionStatus }>;
  errors: Array<{ id: string; message: string }>;
  importedIds: string[];
  savedExercises: number;
  savedBodyCheckIds: string[];
  savedNutritionCheckIds: string[];
  validationWarnings: ValidationIssue[];
};

export type SaveAppInputsOptions = {
  duplicateMode?: "error" | "skip";
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
  const validation = validateHistoricalSessions(rawInputs);

  if (!validation.ok || !validation.value) {
    const error = new Error("Invalid appInput.");
    Object.assign(error, { issues: validation.errors });
    throw error;
  }

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
      const existingSession = await getRemoteTrainingSessionById(sessionId);

      if (existingSession) {
        if (options.duplicateMode === "skip") {
          result.skippedDuplicate.push(sessionId);
          continue;
        }

        const error = new Error("Training session already exists.");
        Object.assign(error, { duplicateIds: [sessionId] });
        throw error;
      }

      const session = coercePartialSession(input.trainingSession);

      await insertRawImport(input, session.id);
      await insertRemoteTrainingSession(session);
      await insertTrainingExercises(session);

      result.imported += 1;
      result.importedIds.push(session.id);
      result.savedExercises += exerciseCount(session);

      if (input.bodyCheck) {
        await upsertBodyCheck(input.bodyCheck);
        result.savedBodyCheckIds.push(input.bodyCheck.id);
      }

      if (input.nutritionCheck) {
        await upsertNutritionCheck(input.nutritionCheck);
        result.savedNutritionCheckIds.push(input.nutritionCheck.id);
      }
    } catch (error) {
      if (hasProperty(error, "duplicateIds")) {
        throw error;
      }

      result.errors.push({
        id: sessionId,
        message: error instanceof Error ? error.message : "Unknown import error.",
      });
    }
  }

  return result;
}
