import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { insertTrainingExercises } from "@/lib/supabase/training-sessions";
import type { TrainingSession } from "@/types/training";

type BackfillPhase =
  | "parse_args"
  | "check_tables"
  | "load_session"
  | "diagnose"
  | "training_sessions"
  | "training_exercises"
  | "raw_imports";

const requiredTables = [
  "training_sessions",
  "raw_imports",
  "training_exercises",
  "body_checks",
  "nutrition_checks",
] as const;

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
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

function serializeError(error: unknown, phase: BackfillPhase) {
  if (!error || typeof error !== "object") {
    return {
      phase,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  return {
    phase,
    message: "message" in error && typeof error.message === "string" ? error.message : "Unknown backfill error.",
    code: "code" in error && typeof error.code === "string" ? error.code : undefined,
    details: "details" in error && typeof error.details === "string" ? error.details : undefined,
    hint: "hint" in error && typeof error.hint === "string" ? error.hint : undefined,
  };
}

async function runPhase<T>(phase: BackfillPhase, operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    throw serializeError(error, phase);
  }
}

function parseId() {
  const idFlagIndex = process.argv.indexOf("--id");
  const id = idFlagIndex >= 0 ? process.argv[idFlagIndex + 1] : undefined;

  if (!id) {
    throw {
      phase: "parse_args",
      message: "Missing --id. Usage: npm run backfill:sessions -- --id running-2026-05-26-pm",
    };
  }

  return id;
}

function getSupabaseOrThrow() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  return supabase;
}

async function countTable(table: string) {
  const supabase = getSupabaseOrThrow();
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });

  return {
    table,
    exists: !error,
    count: count ?? null,
    error: error ? serializeError(error, "check_tables") : null,
  };
}

async function checkRequiredTables() {
  return Promise.all(requiredTables.map((table) => countTable(table)));
}

async function loadTrainingSession(id: string) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from("training_sessions")
    .select(
      "id, duration_minutes, rpe, running_distance_meters, session_muscle_summary, payload",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as {
    id: string;
    duration_minutes: number | null;
    rpe: number | null;
    running_distance_meters: number | null;
    session_muscle_summary: Record<string, number> | null;
    payload: TrainingSession | null;
  } | null;
}

async function countRows(table: string, column: string, value: string) {
  const supabase = getSupabaseOrThrow();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(column, value);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

function isEmptyObject(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length === 0;
}

function getNullableAnalyticUpdates(row: NonNullable<Awaited<ReturnType<typeof loadTrainingSession>>>) {
  const payload = row.payload;

  if (!payload) {
    return {};
  }

  return {
    ...(row.duration_minutes === null ? { duration_minutes: payload.durationMinutes } : {}),
    ...(row.rpe === null ? { rpe: payload.rpe } : {}),
    ...(row.running_distance_meters === null ? { running_distance_meters: payload.sessionMetrics.totalRunMeters } : {}),
    ...(row.session_muscle_summary === null || isEmptyObject(row.session_muscle_summary)
      ? { session_muscle_summary: payload.sessionMuscleSummary }
      : {}),
  };
}

async function updateNullableAnalytics(id: string, updates: Record<string, unknown>) {
  const updateKeys = Object.keys(updates);

  if (updateKeys.length === 0) {
    return [];
  }

  const supabase = getSupabaseOrThrow();
  const { error } = await supabase
    .from("training_sessions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw error;
  }

  return updateKeys;
}

async function insertRawImportFromPayload(id: string, payload: TrainingSession) {
  const supabase = getSupabaseOrThrow();
  const { error } = await supabase.from("raw_imports").insert({
    training_session_id: id,
    import_type: "backfill-from-session-payload",
    raw_payload: {
      appInputVersion: "1.0",
      generatedBy: "gpt",
      generatedAt: new Date().toISOString(),
      trainingSession: payload,
    },
  });

  if (error) {
    throw error;
  }
}

async function diagnose(id: string) {
  const tableChecks = await runPhase("check_tables", checkRequiredTables);
  const row = await runPhase("load_session", () => loadTrainingSession(id));

  if (!row) {
    return {
      id,
      sessionExists: false,
      tableChecks,
      writes: false,
    };
  }

  const [rawImportsCount, trainingExercisesCount] = await runPhase("diagnose", () =>
    Promise.all([
      countRows("raw_imports", "training_session_id", id),
      countRows("training_exercises", "training_session_id", id),
    ]),
  );
  const analyticUpdates = getNullableAnalyticUpdates(row);
  const exerciseCountFromPayload =
    row.payload?.blocks.reduce((total, block) => total + block.exercises.length, 0) ?? 0;

  return {
    id,
    sessionExists: true,
    tableChecks,
    hasPayload: Boolean(row.payload),
    rawImportsCount,
    wouldCreateRawImport: rawImportsCount === 0,
    trainingExercisesCount,
    exerciseCountFromPayload,
    wouldCreateTrainingExercises: trainingExercisesCount === 0 && exerciseCountFromPayload > 0,
    nullableAnalyticColumnsToUpdate: Object.keys(analyticUpdates),
    writes: false,
  };
}

async function backfill(id: string) {
  const diagnostic = await diagnose(id);

  if (!("sessionExists" in diagnostic) || !diagnostic.sessionExists) {
    throw {
      phase: "load_session",
      message: `Training session does not exist: ${id}`,
    };
  }

  const row = await runPhase("load_session", () => loadTrainingSession(id));

  if (!row?.payload) {
    throw {
      phase: "load_session",
      message: `Training session has no payload: ${id}`,
    };
  }

  const analyticsUpdated = await runPhase("training_sessions", () =>
    updateNullableAnalytics(id, getNullableAnalyticUpdates(row)),
  );
  const exercisesBefore = await runPhase("diagnose", () => countRows("training_exercises", "training_session_id", id));
  let exercisesCreated = 0;

  if (exercisesBefore === 0 && row.payload.blocks.some((block) => block.exercises.length > 0)) {
    await runPhase("training_exercises", () => insertTrainingExercises(row.payload as TrainingSession));
    exercisesCreated = row.payload.blocks.reduce((total, block) => total + block.exercises.length, 0);
  }

  const rawImportsBefore = await runPhase("diagnose", () => countRows("raw_imports", "training_session_id", id));
  let rawImportCreated = false;

  if (rawImportsBefore === 0) {
    await runPhase("raw_imports", () => insertRawImportFromPayload(id, row.payload as TrainingSession));
    rawImportCreated = true;
  }

  return {
    ok: true,
    id,
    rawImportCreated,
    exercisesCreated,
    analyticsUpdated,
  };
}

async function main() {
  loadLocalEnv();

  const id = parseId();
  const diagnoseOnly = process.argv.includes("--diagnose-only");
  const result = diagnoseOnly ? await diagnose(id) : await backfill(id);

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify(serializeError(error, "parse_args"), null, 2));
  process.exit(1);
});
