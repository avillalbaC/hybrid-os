import { NextResponse } from "next/server";
import { requireAllowedUser } from "@/lib/auth/require-allowed-user";
import { addDaysToDateKey } from "@/lib/date/local-date";
import { getDailyEntryByDate, isDailyEntriesDatabaseConfigured } from "@/lib/supabase/daily-entries";
import { getPriorityStatus, normalizeDailyPriorities, type DailyPriority } from "@/types/daily";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store, max-age=0");

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

function isPendingReviewPriority(priority: DailyPriority) {
  return priority.text.trim().length > 0 && getPriorityStatus(priority) === "pending";
}

function hasTodayDuplicate(todayPriorities: DailyPriority[], yesterdayPriority: DailyPriority, yesterdayDate: string) {
  const targetText = yesterdayPriority.text.trim();

  return todayPriorities.some((priority) =>
    getPriorityStatus(priority) === "pending" &&
    priority.text.trim() === targetText &&
    (priority.postponedFromDate === yesterdayDate || priority.text.trim() === targetText),
  );
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
  const date = searchParams.get("date") ?? "";

  if (!datePattern.test(date)) {
    return jsonNoStore({ error: "date must use YYYY-MM-DD." }, { status: 400 });
  }

  const yesterdayDate = addDaysToDateKey(date, -1);

  try {
    const [yesterdayEntry, todayEntry] = await Promise.all([
      getDailyEntryByDate(auth.user.id, yesterdayDate),
      getDailyEntryByDate(auth.user.id, date),
    ]);
    const todayPriorities = normalizeDailyPriorities(todayEntry?.priorities ?? []);
    const pendingPriorities = normalizeDailyPriorities(yesterdayEntry?.priorities ?? [])
      .filter(isPendingReviewPriority)
      .filter((priority) => !hasTodayDuplicate(todayPriorities, priority, yesterdayDate))
      .map((priority) => ({
        id: priority.id,
        text: priority.text,
        status: "pending" as const,
      }));

    return jsonNoStore({
      date,
      yesterdayDate,
      pendingPriorities,
    });
  } catch {
    return jsonNoStore({ error: "Could not load pending review." }, { status: 500 });
  }
}
