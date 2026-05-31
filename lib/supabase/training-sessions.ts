import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { BodyCheck } from "@/types/body";
import type { NutritionCheck } from "@/types/nutrition";
import type { SessionMuscleSummary, TrainingSession } from "@/types/training";

const TABLE_NAME = "training_sessions";

type OwnedRow = {
  id: string;
  user_id: string | null;
};

type TrainingSessionRow = {
  id: string;
  user_id?: string | null;
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

function toRow(session: TrainingSession, userId?: string): TrainingSessionRow {
  const row: TrainingSessionRow = {
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

  if (userId) {
    row.user_id = userId;
  }

  return row;
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

async function assertRowBelongsToUser(tableName: string, id: string, userId?: string) {
  if (!userId) {
    return;
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(tableName)
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const row = data as OwnedRow | null;

  if (row && row.user_id !== userId) {
    throw new Error("Cannot modify a row owned by another user.");
  }
}

export async function listRemoteTrainingSessions(userId?: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  let query = supabase
    .from(TABLE_NAME)
    .select("id, user_id, session_date, title, type, source, data_quality, running_distance_meters, duration_minutes, rpe, session_muscle_summary, payload");

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.order("session_date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => fromRow(row as TrainingSessionRow));
}

export async function listRemoteBodyChecks(userId?: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  let query = supabase
    .from("body_checks")
    .select("payload");

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.order("check_date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => row.payload as BodyCheck);
}

export async function listRemoteNutritionChecks(userId?: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  let query = supabase
    .from("nutrition_checks")
    .select("payload");

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.order("check_date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => row.payload as NutritionCheck);
}

export async function getRemoteTrainingSessionById(id: string, userId?: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  let query = supabase
    .from(TABLE_NAME)
    .select("id")
    .eq("id", id);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function upsertRemoteTrainingSession(session: TrainingSession, userId?: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  await assertRowBelongsToUser(TABLE_NAME, session.id, userId);

  const { error } = await supabase.from(TABLE_NAME).upsert(toRow(session, userId), {
    onConflict: "id",
  });

  if (error) {
    throw error;
  }

  return session;
}

export async function insertRemoteTrainingSession(session: TrainingSession, userId?: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.from(TABLE_NAME).insert(toRow(session, userId));

  if (error) {
    throw error;
  }

  return session;
}

export async function insertRawImport(rawPayload: unknown, trainingSessionId: string, userId?: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const row = {
    training_session_id: trainingSessionId,
    import_type: "appInput",
    raw_payload: rawPayload,
    ...(userId ? { user_id: userId } : {}),
  };

  const { error } = await supabase.from("raw_imports").insert(row);

  if (error) {
    throw error;
  }
}

export async function replaceTrainingExercises(session: TrainingSession, userId?: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  let deleteQuery = supabase
    .from("training_exercises")
    .delete()
    .eq("training_session_id", session.id);

  if (userId) {
    deleteQuery = deleteQuery.eq("user_id", userId);
  }

  const { error: deleteError } = await deleteQuery;

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
      ...(userId ? { user_id: userId } : {}),
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

export async function insertTrainingExercises(session: TrainingSession, userId?: string) {
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
      ...(userId ? { user_id: userId } : {}),
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

export async function upsertBodyCheck(bodyCheck: BodyCheck, userId?: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  await assertRowBelongsToUser("body_checks", bodyCheck.id, userId);

  const { error } = await supabase.from("body_checks").upsert(
    {
      id: bodyCheck.id,
      check_date: bodyCheck.date,
      weight_kg: bodyCheck.weightKg,
      waist_cm: bodyCheck.waistCm,
      payload: bodyCheck,
      updated_at: new Date().toISOString(),
      ...(userId ? { user_id: userId } : {}),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }
}

export async function upsertNutritionCheck(nutritionCheck: NutritionCheck, userId?: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  await assertRowBelongsToUser("nutrition_checks", nutritionCheck.id, userId);

  const { error } = await supabase.from("nutrition_checks").upsert(
    {
      id: nutritionCheck.id,
      check_date: nutritionCheck.date,
      day_type: nutritionCheck.dayType,
      adherence_percent: nutritionCheck.adherencePercent,
      payload: nutritionCheck,
      updated_at: new Date().toISOString(),
      ...(userId ? { user_id: userId } : {}),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }
}

export async function deleteRemoteTrainingSession(id: string, userId?: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  let query = supabase.from(TABLE_NAME).delete().eq("id", id);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}
