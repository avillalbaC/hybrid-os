import { getGoalProfileDefaults, getGoalProfileMeta } from "@/lib/goals/goal-profiles";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { GoalBlock, GoalBlockInput, GoalBlockTargets, GoalProfile, GoalStatus } from "@/types/goals";

const TABLE_NAME = "goal_blocks";

type GoalBlockRow = {
  id: string;
  user_id: string;
  title: string;
  profile: GoalProfile;
  status: GoalStatus;
  start_date: string;
  end_date: string | null;
  targets: GoalBlockTargets;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const goalBlockSelect = "id, user_id, title, profile, status, start_date, end_date, targets, notes, created_at, updated_at";

function fromRow(row: GoalBlockRow): GoalBlock {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    profile: row.profile,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    targets: row.targets ?? {},
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function resolveTargets(profile: GoalProfile, targets?: GoalBlockTargets) {
  if (targets && Object.keys(targets).length > 0) {
    return targets;
  }

  return getGoalProfileDefaults(profile);
}

function toInsertRow(userId: string, input: GoalBlockInput) {
  return {
    user_id: userId,
    title: input.title || getGoalProfileMeta(input.profile).title,
    profile: input.profile,
    status: input.status ?? "active",
    start_date: input.startDate,
    end_date: input.endDate ?? null,
    targets: resolveTargets(input.profile, input.targets),
    notes: input.notes ?? null,
  };
}

function toUpdateRow(input: Partial<GoalBlockInput>) {
  const row: Partial<GoalBlockRow> = {};

  if (input.title !== undefined) {
    row.title = input.title;
  }

  if (input.profile !== undefined) {
    row.profile = input.profile;
  }

  if (input.status !== undefined) {
    row.status = input.status;
  }

  if (input.startDate !== undefined) {
    row.start_date = input.startDate;
  }

  if (input.endDate !== undefined) {
    row.end_date = input.endDate;
  }

  if (input.targets !== undefined) {
    row.targets = resolveTargets(input.profile ?? "custom", input.targets);
  }

  if (input.notes !== undefined) {
    row.notes = input.notes;
  }

  return row;
}

export function isGoalBlocksDatabaseConfigured() {
  return getSupabaseAdminClient() !== null;
}

async function pauseOtherActiveGoalBlocks(userId: string, exceptGoalId?: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  let query = supabase
    .from(TABLE_NAME)
    .update({ status: "paused" satisfies GoalStatus })
    .eq("user_id", userId)
    .eq("status", "active");

  if (exceptGoalId) {
    query = query.neq("id", exceptGoalId);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}

export async function getActiveGoalBlock(userId: string): Promise<GoalBlock | null> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(goalBlockSelect)
    .eq("user_id", userId)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? fromRow(data as GoalBlockRow) : null;
}

export async function getGoalBlocks(userId: string): Promise<GoalBlock[]> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(goalBlockSelect)
    .eq("user_id", userId)
    .order("start_date", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => fromRow(row as GoalBlockRow));
}

export async function createGoalBlock(userId: string, input: GoalBlockInput): Promise<GoalBlock> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  if ((input.status ?? "active") === "active") {
    await pauseOtherActiveGoalBlocks(userId);
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(toInsertRow(userId, input))
    .select(goalBlockSelect)
    .single();

  if (error) {
    throw error;
  }

  return fromRow(data as GoalBlockRow);
}

export async function updateGoalBlock(userId: string, goalId: string, input: Partial<GoalBlockInput>): Promise<GoalBlock> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  if (input.status === "active") {
    await pauseOtherActiveGoalBlocks(userId, goalId);
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(toUpdateRow(input))
    .eq("user_id", userId)
    .eq("id", goalId)
    .select(goalBlockSelect)
    .single();

  if (error) {
    throw error;
  }

  return fromRow(data as GoalBlockRow);
}

export async function archiveGoalBlock(userId: string, goalId: string): Promise<GoalBlock> {
  return updateGoalBlock(userId, goalId, { status: "archived" });
}

export async function setActiveGoalBlock(userId: string, goalId: string): Promise<GoalBlock> {
  await pauseOtherActiveGoalBlocks(userId, goalId);
  return updateGoalBlock(userId, goalId, { status: "active" });
}

export async function upsertActiveGoalBlock(userId: string, input: GoalBlockInput): Promise<GoalBlock> {
  const activeGoal = await getActiveGoalBlock(userId);

  if (!activeGoal) {
    return createGoalBlock(userId, {
      ...input,
      status: "active",
    });
  }

  return updateGoalBlock(userId, activeGoal.id, {
    ...input,
    status: "active",
  });
}
