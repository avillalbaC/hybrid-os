import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ProgrammingBlock,
  ProgrammingFinalLog,
  ProgrammingSession,
  ProgrammingSessionInput,
  ProgrammingSessionPatch,
  ProgrammingSessionStatus,
  ProgrammingSessionType,
} from "@/types/programming";

const TABLE_NAME = "programming_sessions";

type ProgrammingSessionRow = {
  id: string;
  user_id: string;
  title: string;
  type: ProgrammingSessionType;
  scheduled_date: string;
  estimated_duration_minutes: number | null;
  status: ProgrammingSessionStatus;
  source: string;
  blocks: ProgrammingBlock[];
  final_log: ProgrammingFinalLog | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

const programmingSessionSelect = [
  "id",
  "user_id",
  "title",
  "type",
  "scheduled_date",
  "estimated_duration_minutes",
  "status",
  "source",
  "blocks",
  "final_log",
  "started_at",
  "completed_at",
  "created_at",
  "updated_at",
].join(", ");

function fromRow(row: ProgrammingSessionRow): ProgrammingSession {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    type: row.type,
    scheduledDate: row.scheduled_date,
    estimatedDurationMinutes: row.estimated_duration_minutes,
    status: row.status,
    source: row.source,
    blocks: row.blocks ?? [],
    finalLog: row.final_log,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toInsertRow(userId: string, input: ProgrammingSessionInput) {
  return {
    user_id: userId,
    title: input.title,
    type: input.type,
    scheduled_date: input.scheduledDate,
    estimated_duration_minutes: input.estimatedDurationMinutes ?? null,
    status: input.status ?? "planned",
    source: input.source ?? "manual",
    blocks: input.blocks,
    final_log: null,
    started_at: null,
    completed_at: null,
  };
}

function toUpdateRow(input: ProgrammingSessionPatch) {
  const row: Partial<ProgrammingSessionRow> = {};

  if (input.status !== undefined) {
    row.status = input.status;
  }

  if (input.blocks !== undefined) {
    row.blocks = input.blocks;
  }

  if (input.finalLog !== undefined) {
    row.final_log = input.finalLog;
  }

  if (input.startedAt !== undefined) {
    row.started_at = input.startedAt;
  }

  if (input.completedAt !== undefined) {
    row.completed_at = input.completedAt;
  }

  return row;
}

export function isProgrammingSessionsDatabaseConfigured() {
  return getSupabaseAdminClient() !== null;
}

export async function listProgrammingSessions(userId: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(programmingSessionSelect)
    .eq("user_id", userId)
    .order("scheduled_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as ProgrammingSessionRow[]).map(fromRow);
}

export async function getProgrammingSessionById(userId: string, id: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(programmingSessionSelect)
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? fromRow(data as unknown as ProgrammingSessionRow) : null;
}

export async function createProgrammingSession(userId: string, input: ProgrammingSessionInput) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(toInsertRow(userId, input))
    .select(programmingSessionSelect)
    .single();

  if (error) {
    throw error;
  }

  return fromRow(data as unknown as ProgrammingSessionRow);
}

export async function updateProgrammingSession(userId: string, id: string, input: ProgrammingSessionPatch) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(toUpdateRow(input))
    .eq("user_id", userId)
    .eq("id", id)
    .select(programmingSessionSelect)
    .single();

  if (error) {
    throw error;
  }

  return fromRow(data as unknown as ProgrammingSessionRow);
}

export async function deleteProgrammingSession(userId: string, id: string) {
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
