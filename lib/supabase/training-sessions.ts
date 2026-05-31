import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { BodyCheck } from "@/types/body";
import type { NutritionCheck } from "@/types/nutrition";
import type { SessionMuscleSummary, TrainingSession } from "@/types/training";

const TABLE_NAME = "training_sessions";

type TrainingSessionRow = {
  id: string;
  session_date: string;
  title: string;
  type: string;
  source: string;
  data_quality: string;
  running_distance_meters: number;
  duration_minutes: number | null;
  rpe: number | null;
  session_muscle_summary: SessionMuscleSummary;
  payload: TrainingSession;
  created_at?: string;
  updated_at?: string;
};

function toRow(session: TrainingSession): TrainingSessionRow {
  return {
    id: session.id,
    session_date: session.date,
    title: session.title,
    type: session.type,
    source: session.source,
    data_quality: session.dataQuality,
    running_distance_meters: session.sessionMetrics.totalRunMeters,
    duration_minutes: session.durationMinutes,
    rpe: session.rpe,
    session_muscle_summary: session.sessionMuscleSummary,
    payload: session,
    updated_at: new Date().toISOString(),
  };
}

function fromRow(row: TrainingSessionRow): TrainingSession {
  return {
    ...row.payload,
    durationMinutes: row.duration_minutes,
    rpe: row.rpe,
    sessionMetrics: {
      ...row.payload.sessionMetrics,
      totalRunMeters: row.running_distance_meters,
    },
    sessionMuscleSummary: row.session_muscle_summary,
  };
}

export function isTrainingSessionsDatabaseConfigured() {
  return getSupabaseAdminClient() !== null;
}

export async function listRemoteTrainingSessions() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, session_date, title, type, source, data_quality, running_distance_meters, duration_minutes, rpe, session_muscle_summary, payload")
    .order("session_date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => fromRow(row as TrainingSessionRow));
}

export async function listRemoteBodyChecks() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("body_checks")
    .select("payload")
    .order("check_date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => row.payload as BodyCheck);
}

export async function listRemoteNutritionChecks() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("nutrition_checks")
    .select("payload")
    .order("check_date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => row.payload as NutritionCheck);
}

export async function getRemoteTrainingSessionById(id: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function upsertRemoteTrainingSession(session: TrainingSession) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from(TABLE_NAME).upsert(toRow(session), {
    onConflict: "id",
  });

  if (error) {
    throw error;
  }

  return session;
}

export async function insertRemoteTrainingSession(session: TrainingSession) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from(TABLE_NAME).insert(toRow(session));

  if (error) {
    throw error;
  }

  return session;
}

export async function insertRawImport(rawPayload: unknown, trainingSessionId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("raw_imports").insert({
    training_session_id: trainingSessionId,
    import_type: "appInput",
    raw_payload: rawPayload,
  });

  if (error) {
    throw error;
  }
}

export async function replaceTrainingExercises(session: TrainingSession) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error: deleteError } = await supabase
    .from("training_exercises")
    .delete()
    .eq("training_session_id", session.id);

  if (deleteError) {
    throw deleteError;
  }

  const rows = session.blocks.flatMap((block) =>
    block.exercises.map((exercise, index) => ({
      id: `${session.id}:${block.id}:${index}`,
      training_session_id: session.id,
      block_id: block.id,
      block_name: block.name,
      exercise_index: index,
      name: exercise.name,
      canonical_name: exercise.canonicalName,
      movement_pattern: exercise.movementPattern,
      payload: exercise,
      updated_at: new Date().toISOString(),
    })),
  );

  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase.from("training_exercises").upsert(rows, {
    onConflict: "id",
  });

  if (error) {
    throw error;
  }
}

export async function insertTrainingExercises(session: TrainingSession) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const rows = session.blocks.flatMap((block) =>
    block.exercises.map((exercise, index) => ({
      id: `${session.id}:${block.id}:${index}`,
      training_session_id: session.id,
      block_id: block.id,
      block_name: block.name,
      exercise_index: index,
      name: exercise.name,
      canonical_name: exercise.canonicalName,
      movement_pattern: exercise.movementPattern,
      payload: exercise,
      updated_at: new Date().toISOString(),
    })),
  );

  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase.from("training_exercises").insert(rows);

  if (error) {
    throw error;
  }
}

export async function upsertBodyCheck(bodyCheck: BodyCheck) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("body_checks").upsert(
    {
      id: bodyCheck.id,
      check_date: bodyCheck.date,
      weight_kg: bodyCheck.weightKg,
      waist_cm: bodyCheck.waistCm,
      payload: bodyCheck,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }
}

export async function upsertNutritionCheck(nutritionCheck: NutritionCheck) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from("nutrition_checks").upsert(
    {
      id: nutritionCheck.id,
      check_date: nutritionCheck.date,
      day_type: nutritionCheck.dayType,
      adherence_percent: nutritionCheck.adherencePercent,
      payload: nutritionCheck,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }
}

export async function deleteRemoteTrainingSession(id: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

  if (error) {
    throw error;
  }
}
