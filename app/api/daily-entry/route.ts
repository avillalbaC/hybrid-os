import { NextResponse } from "next/server";
import { requireAllowedUser } from "@/lib/auth/require-allowed-user";
import {
  DailyEntryDatabaseError,
  getDailyEntryByDate,
  isDailyEntriesDatabaseConfigured,
  upsertDailyEntry,
} from "@/lib/supabase/daily-entries";
import { normalizeDailyEntryInput } from "@/types/daily";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isDateParam(value: string) {
  return datePattern.test(value);
}

function isDevelopment() {
  return process.env.NODE_ENV !== "production";
}

function getTechnicalDetail(error: unknown) {
  if (!isDevelopment()) {
    return undefined;
  }

  if (error instanceof DailyEntryDatabaseError) {
    return {
      code: error.detail.code,
      message: error.detail.message,
      details: error.detail.details,
      hint: error.detail.hint,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "Unknown error." };
}

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store, max-age=0");

  return NextResponse.json(body, {
    ...init,
    headers,
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

function logDailyEntryRequest(action: "GET" | "PUT", date: string, user: { id: string; email?: string | null }) {
  if (!isDevelopment()) {
    return;
  }

  console.info("[daily-entry:route]", {
    action,
    date,
    userId: user.id,
    userEmail: user.email,
    projectRef: getSupabaseProjectRef(),
    client: "admin",
  });
}

export async function GET(request: Request) {
  const auth = await requireAllowedUser();

  if (!auth.ok) {
    return auth.response;
  }

  if (!isDailyEntriesDatabaseConfigured()) {
    return jsonNoStore({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? getTodayDate();

  if (!isDateParam(date)) {
    return jsonNoStore({ error: "date must use YYYY-MM-DD." }, { status: 400 });
  }

  logDailyEntryRequest("GET", date, auth.user);

  try {
    const entry = await getDailyEntryByDate(auth.user.id, date);
    return jsonNoStore({ entry });
  } catch (error) {
    return jsonNoStore(
      {
        error: "Could not load daily entry.",
        detail: getTechnicalDetail(error),
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const auth = await requireAllowedUser();

  if (!auth.ok) {
    return auth.response;
  }

  if (!isDailyEntriesDatabaseConfigured()) {
    return jsonNoStore({ error: "Supabase is not configured." }, { status: 503 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = normalizeDailyEntryInput(body);

  if (!result.ok) {
    return jsonNoStore({ error: result.error }, { status: 400 });
  }

  logDailyEntryRequest("PUT", result.value.entryDate, auth.user);

  try {
    const entry = await upsertDailyEntry(auth.user.id, result.value);
    return jsonNoStore({ entry });
  } catch (error) {
    return jsonNoStore(
      {
        error: "Could not save daily entry.",
        detail: getTechnicalDetail(error),
      },
      { status: 500 },
    );
  }
}
