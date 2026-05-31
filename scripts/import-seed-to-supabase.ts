import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { saveAppInputs } from "@/lib/imports/save-app-input";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isTrainingSessionsDatabaseConfigured } from "@/lib/supabase/training-sessions";
import { historicalTrainingAppInputs } from "@/src/data/seed/realTrainingSessions";

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#") || !trimmedLine.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmedLine.split("=");
    const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function serializeDiagnosticError(error: unknown) {
  if (!error || typeof error !== "object") {
    return error instanceof Error ? { message: error.message } : { message: String(error) };
  }

  return {
    message: "message" in error && typeof error.message === "string" ? error.message : "Unknown diagnostic error.",
    code: "code" in error && typeof error.code === "string" ? error.code : undefined,
    details: "details" in error && typeof error.details === "string" ? error.details : undefined,
    hint: "hint" in error && typeof error.hint === "string" ? error.hint : undefined,
  };
}

async function countTable(table: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });

  return {
    table,
    exists: !error,
    count: count ?? 0,
    error: error ? serializeDiagnosticError(error) : null,
  };
}

async function findRawImportsWithoutSessions() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const seedIds = historicalTrainingAppInputs.map((input) => input.trainingSession.id);
  const { data: rawImports, error: rawImportsError } = await supabase
    .from("raw_imports")
    .select("training_session_id")
    .in("training_session_id", seedIds);

  if (rawImportsError) {
    return {
      count: null,
      ids: [],
      error: serializeDiagnosticError(rawImportsError),
    };
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from("training_sessions")
    .select("id")
    .in("id", seedIds);

  if (sessionsError) {
    return {
      count: null,
      ids: [],
      error: serializeDiagnosticError(sessionsError),
    };
  }

  const sessionIds = new Set((sessions ?? []).map((session) => session.id).filter(Boolean));
  const rawImportIds = (rawImports ?? [])
    .map((rawImport) => rawImport.training_session_id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  const orphanIds = Array.from(new Set(rawImportIds.filter((id) => !sessionIds.has(id))));

  return {
    count: orphanIds.length,
    ids: orphanIds,
    error: null,
  };
}

async function readSupabaseDiagnostics() {
  const tableCounts = await Promise.all([
    countTable("training_sessions"),
    countTable("raw_imports"),
    countTable("training_exercises"),
    countTable("body_checks"),
    countTable("nutrition_checks"),
  ]);
  const rawImportsWithoutSessions = await findRawImportsWithoutSessions();

  return {
    tableCounts,
    rawImportsWithoutSessions,
  };
}

async function main() {
  loadLocalEnv();

  if (!isTrainingSessionsDatabaseConfigured()) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const diagnostics = await readSupabaseDiagnostics();
  console.log("Supabase read-only diagnostic report");
  console.log(JSON.stringify(diagnostics, null, 2));

  if (process.argv.includes("--diagnose-only")) {
    return;
  }

  const result = await saveAppInputs(historicalTrainingAppInputs, {
    duplicateMode: "skip",
    sourceLabel: "historical-seed-import",
  });

  console.log("Historical seed import report");
  console.log(JSON.stringify(
    {
      totalFound: result.totalFound,
      imported: result.imported,
      skippedDuplicate: result.skippedDuplicate.length,
      skippedInvalidStatusCount: result.skippedInvalidStatus.length,
      errors: result.errors.length,
      importedIds: result.importedIds,
      skippedDuplicateIds: result.skippedDuplicate,
      skippedInvalidStatus: result.skippedInvalidStatus,
      errorDetails: result.errors,
      savedExercises: result.savedExercises,
      savedBodyCheckIds: result.savedBodyCheckIds,
      savedNutritionCheckIds: result.savedNutritionCheckIds,
    },
    null,
    2,
  ));

  if (result.errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
