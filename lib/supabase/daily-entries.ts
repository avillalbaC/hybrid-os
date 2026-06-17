import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeDailyPriorities, type DailyEntry, type DailyEntryInput, type DailyEntrySource } from "@/types/daily";

const TABLE_NAME = "daily_entries";

type DailyEntryRow = {
  id: string;
  user_id: string;
  entry_date: string;
  priorities: unknown;
  mobility_done: boolean;
  mobility_minutes: number | null;
  mobility_focus: string[] | null;
  daily_note: string | null;
  source: string;
  created_at: string;
  updated_at: string;
};

type DailyEntryDebugRow = {
  id: string;
  user_id: string;
  entry_date: string;
};

const dailyEntrySelect = "id, user_id, entry_date, priorities, mobility_done, mobility_minutes, mobility_focus, daily_note, source, created_at, updated_at";

export type DailyEntryDatabaseErrorDetail = {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
};

export class DailyEntryDatabaseError extends Error {
  detail: DailyEntryDatabaseErrorDetail;

  constructor(error: DailyEntryDatabaseErrorDetail) {
    super(error.message);
    this.name = "DailyEntryDatabaseError";
    this.detail = error;
  }
}

function toDatabaseError(error: { code?: string; message: string; details?: string | null; hint?: string | null }) {
  return new DailyEntryDatabaseError({
    code: error.code,
    message: error.message,
    details: error.details ?? undefined,
    hint: error.hint ?? undefined,
  });
}

function logDailyEntryQuery({
  action,
  userId,
  date,
  dataIsNull,
  prioritiesCount,
  projectRef,
  client,
  error,
}: {
  action: "load" | "save";
  userId: string;
  date: string;
  dataIsNull?: boolean;
  prioritiesCount?: number;
  projectRef?: string | null;
  client?: "admin";
  error?: DailyEntryDatabaseErrorDetail | null;
}) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.info("[daily-entry]", {
    action,
    userId,
    date,
    dataIsNull,
    prioritiesCount,
    projectRef,
    client,
    supabaseErrorCode: error?.code,
    supabaseErrorMessage: error?.message,
  });
}

function getSupabaseProjectRef() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  try {
    return new URL(supabaseUrl).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

async function logDailyEntryDateDiagnostics(date: string) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, user_id, entry_date")
    .eq("entry_date", date)
    .limit(5);

  console.info("[daily-entry:diagnostic]", {
    date,
    projectRef: getSupabaseProjectRef(),
    rows: (data ?? []).map((row) => {
      const debugRow = row as DailyEntryDebugRow;

      return {
        id: debugRow.id,
        userId: debugRow.user_id,
        entryDate: debugRow.entry_date,
      };
    }),
    errorCode: error?.code,
    errorMessage: error?.message,
  });
}

function toSource(value: string): DailyEntrySource {
  if (value === "import" || value === "parser") {
    return value;
  }

  return "manual";
}

function fromRow(row: DailyEntryRow): DailyEntry {
  return {
    id: row.id,
    userId: row.user_id,
    entryDate: row.entry_date,
    priorities: normalizeDailyPriorities(row.priorities),
    mobilityDone: row.mobility_done,
    mobilityMinutes: row.mobility_minutes,
    mobilityFocus: row.mobility_focus ?? [],
    dailyNote: row.daily_note,
    source: toSource(row.source),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(userId: string, input: DailyEntryInput) {
  return {
    user_id: userId,
    entry_date: input.entryDate,
    priorities: normalizeDailyPriorities(input.priorities),
    mobility_done: input.mobilityDone,
    mobility_minutes: input.mobilityMinutes ?? null,
    mobility_focus: input.mobilityFocus ?? [],
    daily_note: input.dailyNote ?? null,
    source: "manual",
  };
}

export function isDailyEntriesDatabaseConfigured() {
  return getSupabaseAdminClient() !== null;
}

export async function getDailyEntryByDate(userId: string, date: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(dailyEntrySelect)
    .eq("user_id", userId)
    .eq("entry_date", date)
    .maybeSingle();

  if (error) {
    const databaseError = toDatabaseError(error);
    logDailyEntryQuery({ action: "load", userId, date, projectRef: getSupabaseProjectRef(), client: "admin", error: databaseError.detail });
    throw databaseError;
  }

  if (data === null) {
    await logDailyEntryDateDiagnostics(date);
  }

  logDailyEntryQuery({
    action: "load",
    userId,
    date,
    dataIsNull: data === null,
    prioritiesCount: data ? normalizeDailyPriorities((data as DailyEntryRow).priorities).length : 0,
    projectRef: getSupabaseProjectRef(),
    client: "admin",
  });

  return data ? fromRow(data as DailyEntryRow) : null;
}

export async function getDailyEntriesRange(userId: string, startDate: string, endDate: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(dailyEntrySelect)
    .eq("user_id", userId)
    .gte("entry_date", startDate)
    .lte("entry_date", endDate)
    .order("entry_date", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => fromRow(row as DailyEntryRow));
}

export async function upsertDailyEntry(userId: string, input: DailyEntryInput) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(toRow(userId, input), { onConflict: "user_id,entry_date" })
    .select(dailyEntrySelect)
    .single();

  if (error) {
    const databaseError = toDatabaseError(error);
    logDailyEntryQuery({ action: "save", userId, date: input.entryDate, projectRef: getSupabaseProjectRef(), client: "admin", error: databaseError.detail });
    throw databaseError;
  }

  logDailyEntryQuery({
    action: "save",
    userId,
    date: input.entryDate,
    dataIsNull: data === null,
    prioritiesCount: data ? normalizeDailyPriorities((data as DailyEntryRow).priorities).length : 0,
    projectRef: getSupabaseProjectRef(),
    client: "admin",
  });

  return fromRow(data as DailyEntryRow);
}

export async function deleteDailyEntry(userId: string, date: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("user_id", userId)
    .eq("entry_date", date);

  if (error) {
    throw error;
  }
}
