import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { replaceTrainingExercises } from "@/lib/supabase/training-sessions";
import { coercePartialSession, validateHybridOSAppInput, type ValidationIssue } from "@/lib/validation/hybrid-os-input";
import type { HybridOSAppInput, MovementPattern, TrainingSession } from "@/types/training";

type ReplacementPhase =
  | "read_input"
  | "validate_input"
  | "check_session"
  | "diagnose"
  | "training_sessions"
  | "training_exercises"
  | "raw_imports";

const updatedColumns = [
  "session_date",
  "title",
  "type",
  "source",
  "status",
  "data_quality",
  "duration_minutes",
  "rpe",
  "running_distance_meters",
  "session_muscle_summary",
  "movement_patterns",
  "tags",
  "payload",
  "updated_at",
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

function serializeError(error: unknown, phase: ReplacementPhase) {
  if (!error || typeof error !== "object") {
    return {
      phase,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  return {
    phase,
    message: "message" in error && typeof error.message === "string" ? error.message : "Unknown replacement error.",
    code: "code" in error && typeof error.code === "string" ? error.code : undefined,
    details: "details" in error && typeof error.details === "string" ? error.details : undefined,
    hint: "hint" in error && typeof error.hint === "string" ? error.hint : undefined,
  };
}

async function runPhase<T>(phase: ReplacementPhase, operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    throw serializeError(error, phase);
  }
}

function readInputFile(filePath: string) {
  const absolutePath = resolve(process.cwd(), filePath);
  const rawJson = readFileSync(absolutePath, "utf8");

  return JSON.parse(rawJson) as unknown;
}

function formatValidationIssues(issues: ValidationIssue[]) {
  return issues.map((issue) => `${issue.path}: ${issue.message}`);
}

function parseAppInput(filePath: string): HybridOSAppInput {
  const parsed = readInputFile(filePath);
  const validation = validateHybridOSAppInput(parsed);

  if (!validation.ok || !validation.value) {
    throw {
      phase: "validate_input",
      message: "Invalid HybridOSAppInput.",
      details: formatValidationIssues(validation.errors).join("\n"),
    };
  }

  return validation.value;
}

function uniqueMovementPatterns(session: TrainingSession): MovementPattern[] {
  return Array.from(
    new Set(
      session.blocks.flatMap((block) => block.exercises.map((exercise) => exercise.movementPattern)),
    ),
  );
}

function toTrainingSessionUpdate(session: TrainingSession) {
  return {
    session_date: session.date,
    title: session.title,
    type: session.type,
    source: session.source,
    status: session.status,
    data_quality: session.dataQuality,
    duration_minutes: session.durationMinutes,
    rpe: session.rpe,
    running_distance_meters: session.sessionMetrics.totalRunMeters,
    session_muscle_summary: session.sessionMuscleSummary,
    movement_patterns: uniqueMovementPatterns(session),
    tags: session.tags,
    payload: session,
    updated_at: new Date().toISOString(),
  };
}

async function getExistingSession(id: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const { data, error } = await supabase
    .from("training_sessions")
    .select("id, payload")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function countRows(table: string, column: string, value: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(column, value);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function updateTrainingSession(session: TrainingSession) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const { error } = await supabase
    .from("training_sessions")
    .update(toTrainingSessionUpdate(session))
    .eq("id", session.id);

  if (error) {
    throw error;
  }
}

async function insertManualReplacementRawImport(input: HybridOSAppInput) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const { error } = await supabase.from("raw_imports").insert({
    training_session_id: input.trainingSession.id,
    import_type: "manual-replacement",
    raw_payload: input,
  });

  if (error) {
    throw error;
  }
}

async function diagnose(input: HybridOSAppInput) {
  const session = input.trainingSession;
  const existingSession = await runPhase("check_session", () => getExistingSession(session.id));
  const [rawImportsCount, trainingExercisesCount] = await runPhase("diagnose", () =>
    Promise.all([
      countRows("raw_imports", "training_session_id", session.id),
      countRows("training_exercises", "training_session_id", session.id),
    ]),
  );

  return {
    sessionId: session.id,
    sessionExists: Boolean(existingSession),
    rawImportsCount,
    hasRawImports: rawImportsCount > 0,
    trainingExercisesCount,
    updatedColumns,
    nextRawImportType: "manual-replacement",
    replacementExerciseCount: session.blocks.reduce((total, block) => total + block.exercises.length, 0),
    writes: false,
  };
}

async function replaceExistingSession(input: HybridOSAppInput) {
  const session = coercePartialSession(input.trainingSession);
  const existingSession = await runPhase("check_session", () => getExistingSession(session.id));

  if (!existingSession) {
    throw {
      phase: "check_session",
      message: `Training session does not exist: ${session.id}`,
    };
  }

  await runPhase("training_sessions", () => updateTrainingSession(session));
  await runPhase("training_exercises", () => replaceTrainingExercises(session));
  await runPhase("raw_imports", () => insertManualReplacementRawImport({ ...input, trainingSession: session }));

  return {
    ok: true,
    sessionId: session.id,
    updatedColumns,
    replacedExercises: session.blocks.reduce((total, block) => total + block.exercises.length, 0),
    rawImportType: "manual-replacement",
  };
}

async function main() {
  loadLocalEnv();

  const filePath = process.argv.find((argument) => argument.endsWith(".json"));
  const diagnoseOnly = process.argv.includes("--diagnose-only");

  if (!filePath) {
    throw {
      phase: "read_input",
      message: "Missing JSON file path. Usage: npm run session:replace -- ./imports/session.json",
    };
  }

  const input = parseAppInput(filePath);
  const result = diagnoseOnly ? await diagnose(input) : await replaceExistingSession(input);

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify(serializeError(error, "read_input"), null, 2));
  process.exit(1);
});
