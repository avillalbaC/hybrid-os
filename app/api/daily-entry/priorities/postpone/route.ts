import { NextResponse } from "next/server";
import { requireAllowedUser } from "@/lib/auth/require-allowed-user";
import {
  DailyEntryDatabaseError,
  getDailyEntryByDate,
  isDailyEntriesDatabaseConfigured,
  upsertDailyEntry,
} from "@/lib/supabase/daily-entries";
import {
  createDailyPriorityId,
  getPriorityStatus,
  normalizeDailyPriorities,
  type DailyEntry,
  type DailyPriority,
} from "@/types/daily";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

type PostponePriorityBody = {
  fromDate: string;
  toDate: string;
  priorityId: string;
};

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

function parseBody(body: unknown): { ok: true; value: PostponePriorityBody } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid postpone payload." };
  }

  const payload = body as Record<string, unknown>;
  const fromDate = typeof payload.fromDate === "string" ? payload.fromDate : "";
  const toDate = typeof payload.toDate === "string" ? payload.toDate : "";
  const priorityId = typeof payload.priorityId === "string" ? payload.priorityId.trim() : "";

  if (!datePattern.test(fromDate) || !datePattern.test(toDate)) {
    return { ok: false, error: "fromDate and toDate must use YYYY-MM-DD." };
  }

  if (fromDate === toDate) {
    return { ok: false, error: "toDate must be different from fromDate." };
  }

  if (!priorityId) {
    return { ok: false, error: "priorityId is required." };
  }

  return {
    ok: true,
    value: {
      fromDate,
      toDate,
      priorityId,
    },
  };
}

function createEntryInputFromDailyEntry(entry: DailyEntry, priorities: DailyPriority[]) {
  return {
    entryDate: entry.entryDate,
    priorities,
    mobilityDone: entry.mobilityDone,
    mobilityMinutes: entry.mobilityMinutes,
    mobilityFocus: entry.mobilityFocus,
    dailyNote: entry.dailyNote,
  };
}

function hasPostponedDuplicate(priorities: DailyPriority[], priority: DailyPriority, fromDate: string) {
  const targetText = priority.text.trim().toLowerCase();

  return priorities.some((candidate) =>
    getPriorityStatus(candidate) === "pending" &&
    candidate.text.trim().toLowerCase() === targetText &&
    candidate.postponedFromDate === fromDate,
  );
}

export async function POST(request: Request) {
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

  const result = parseBody(body);

  if (!result.ok) {
    return jsonNoStore({ error: result.error }, { status: 400 });
  }

  const { fromDate, toDate, priorityId } = result.value;

  try {
    const fromEntry = await getDailyEntryByDate(auth.user.id, fromDate);

    if (!fromEntry) {
      return jsonNoStore({ error: "Daily entry not found." }, { status: 404 });
    }

    const fromPriorities = normalizeDailyPriorities(fromEntry.priorities);
    const priorityToPostpone = fromPriorities.find((priority) => priority.id === priorityId);

    if (!priorityToPostpone) {
      return jsonNoStore({ error: "Priority not found." }, { status: 404 });
    }

    const now = new Date().toISOString();
    const postponedFromPriorities = fromPriorities.map((priority) =>
      priority.id === priorityId
        ? {
          ...priority,
          done: false,
          status: "postponed" as const,
          postponedToDate: toDate,
          updatedAt: now,
        }
        : priority,
    );

    const currentToEntry = await getDailyEntryByDate(auth.user.id, toDate);
    const currentToPriorities = normalizeDailyPriorities(currentToEntry?.priorities ?? []);
    const nextToPriorities = hasPostponedDuplicate(currentToPriorities, priorityToPostpone, fromDate)
      ? currentToPriorities
      : [
        ...currentToPriorities,
        {
          id: createDailyPriorityId("priority"),
          text: priorityToPostpone.text,
          done: false,
          status: "pending" as const,
          postponedFromDate: fromDate,
          originalPriorityId: priorityId,
          createdAt: now,
          updatedAt: now,
        },
      ];

    const savedFromEntry = await upsertDailyEntry(
      auth.user.id,
      createEntryInputFromDailyEntry(fromEntry, postponedFromPriorities),
    );

    const savedToEntry = await upsertDailyEntry(auth.user.id, {
      entryDate: toDate,
      priorities: nextToPriorities,
      mobilityDone: currentToEntry?.mobilityDone ?? false,
      mobilityMinutes: currentToEntry?.mobilityMinutes ?? null,
      mobilityFocus: currentToEntry?.mobilityFocus ?? [],
      dailyNote: currentToEntry?.dailyNote ?? null,
    });

    return jsonNoStore({
      fromEntry: savedFromEntry,
      toEntry: savedToEntry,
    });
  } catch (error) {
    return jsonNoStore(
      {
        error: "Could not postpone priority.",
        detail: getTechnicalDetail(error),
      },
      { status: 500 },
    );
  }
}
