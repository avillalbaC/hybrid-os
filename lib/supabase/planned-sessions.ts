import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PlannedSession, PlannedSessionInput, PlannedSessionStatus, PlannedSessionType } from "@/types/planning";

const TABLE_NAME = "planned_sessions";

type PlannedSessionRow = {
  id: string;
  user_id: string;
  goal_block_id: string | null;
  planned_date: string;
  title: string;
  type: PlannedSessionType;
  subtypes: string[] | null;
  status: PlannedSessionStatus;
  priority: PlannedSession["priority"];
  planned_duration_minutes: number | null;
  planned_distance_meters: number | null;
  planned_rpe: number | null;
  focus: string[] | null;
  notes: string | null;
  source: PlannedSession["source"];
  matched_training_session_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

const plannedSessionSelect = [
  "id",
  "user_id",
  "goal_block_id",
  "planned_date",
  "title",
  "type",
  "subtypes",
  "status",
  "priority",
  "planned_duration_minutes",
  "planned_distance_meters",
  "planned_rpe",
  "focus",
  "notes",
  "source",
  "matched_training_session_id",
  "completed_at",
  "created_at",
  "updated_at",
].join(", ");

function fromRow(row: PlannedSessionRow): PlannedSession {
  return {
    id: row.id,
    userId: row.user_id,
    goalBlockId: row.goal_block_id,
    plannedDate: row.planned_date,
    title: row.title,
    type: row.type,
    subtypes: row.subtypes ?? [],
    status: row.status,
    priority: row.priority,
    plannedDurationMinutes: row.planned_duration_minutes,
    plannedDistanceMeters: row.planned_distance_meters,
    plannedRpe: row.planned_rpe,
    focus: row.focus ?? [],
    notes: row.notes,
    source: row.source,
    matchedTrainingSessionId: row.matched_training_session_id,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toInsertRow(userId: string, input: PlannedSessionInput) {
  const now = new Date().toISOString();

  return {
    user_id: userId,
    goal_block_id: input.goalBlockId ?? null,
    planned_date: input.plannedDate,
    title: input.title,
    type: input.type,
    subtypes: input.subtypes ?? [],
    status: input.status ?? "planned",
    priority: input.priority ?? "normal",
    planned_duration_minutes: input.plannedDurationMinutes ?? null,
    planned_distance_meters: input.plannedDistanceMeters ?? null,
    planned_rpe: input.plannedRpe ?? null,
    focus: input.focus ?? [],
    notes: input.notes ?? null,
    source: "manual",
    completed_at: input.status === "completed" ? now : null,
  };
}

function toUpdateRow(input: Partial<PlannedSessionInput>) {
  const row: Partial<PlannedSessionRow> = {};

  if (input.goalBlockId !== undefined) {
    row.goal_block_id = input.goalBlockId;
  }

  if (input.plannedDate !== undefined) {
    row.planned_date = input.plannedDate;
  }

  if (input.title !== undefined) {
    row.title = input.title;
  }

  if (input.type !== undefined) {
    row.type = input.type;
  }

  if (input.subtypes !== undefined) {
    row.subtypes = input.subtypes;
  }

  if (input.status !== undefined) {
    row.status = input.status;
    row.completed_at = input.status === "completed" ? new Date().toISOString() : null;
  }

  if (input.priority !== undefined) {
    row.priority = input.priority;
  }

  if (input.plannedDurationMinutes !== undefined) {
    row.planned_duration_minutes = input.plannedDurationMinutes;
  }

  if (input.plannedDistanceMeters !== undefined) {
    row.planned_distance_meters = input.plannedDistanceMeters;
  }

  if (input.plannedRpe !== undefined) {
    row.planned_rpe = input.plannedRpe;
  }

  if (input.focus !== undefined) {
    row.focus = input.focus;
  }

  if (input.notes !== undefined) {
    row.notes = input.notes;
  }

  return row;
}

export function isPlannedSessionsDatabaseConfigured() {
  return getSupabaseAdminClient() !== null;
}

export async function getPlannedSessionsRange(userId: string, startDate: string, endDate: string, goalBlockId?: string | null) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  let query = supabase
    .from(TABLE_NAME)
    .select(plannedSessionSelect)
    .eq("user_id", userId)
    .gte("planned_date", startDate)
    .lte("planned_date", endDate);

  if (goalBlockId) {
    query = query.eq("goal_block_id", goalBlockId);
  }

  const { data, error } = await query
    .order("planned_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as PlannedSessionRow[]).map(fromRow);
}

export async function getPlannedSessionById(userId: string, id: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(plannedSessionSelect)
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? fromRow(data as unknown as PlannedSessionRow) : null;
}

export async function createPlannedSession(userId: string, input: PlannedSessionInput) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(toInsertRow(userId, input))
    .select(plannedSessionSelect)
    .single();

  if (error) {
    throw error;
  }

  return fromRow(data as unknown as PlannedSessionRow);
}

export async function updatePlannedSession(userId: string, id: string, input: Partial<PlannedSessionInput>) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(toUpdateRow(input))
    .eq("user_id", userId)
    .eq("id", id)
    .select(plannedSessionSelect)
    .single();

  if (error) {
    throw error;
  }

  return fromRow(data as unknown as PlannedSessionRow);
}

export async function deletePlannedSession(userId: string, id: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("user_id", userId)
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function markPlannedSessionStatus(userId: string, id: string, status: PlannedSessionStatus) {
  return updatePlannedSession(userId, id, { status });
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentWeekBounds() {
  const now = new Date();
  const start = new Date(now);
  const day = start.getDay() || 7;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (day - 1));

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    startDate: getLocalDateKey(start),
    endDate: getLocalDateKey(end),
  };
}

export async function getCurrentWeekPlannedSessions(userId: string) {
  const { startDate, endDate } = getCurrentWeekBounds();
  return getPlannedSessionsRange(userId, startDate, endDate);
}
