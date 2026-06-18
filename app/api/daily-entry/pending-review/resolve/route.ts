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

type ResolveAction = "carry_over" | "complete" | "discard" | "postpone";

type ResolvePendingReviewBody = {
  fromDate: string;
  toDate: string;
  actions: Array<{
    priorityId: string;
    action: ResolveAction;
    toDate?: string;
  }>;
};

type ResolveWarning = {
  code: "priority_not_found" | "priority_not_pending" | "duplicate_possible";
  priorityId: string;
  text?: string;
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

function parseBody(body: unknown): { ok: true; value: ResolvePendingReviewBody } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid pending review payload." };
  }

  const payload = body as Record<string, unknown>;
  const fromDate = typeof payload.fromDate === "string" ? payload.fromDate : "";
  const toDate = typeof payload.toDate === "string" ? payload.toDate : "";
  const actions = Array.isArray(payload.actions) ? payload.actions : [];

  if (!datePattern.test(fromDate) || !datePattern.test(toDate)) {
    return { ok: false, error: "fromDate and toDate must use YYYY-MM-DD." };
  }

  if (fromDate === toDate) {
    return { ok: false, error: "toDate must be different from fromDate." };
  }

  if (actions.length === 0) {
    return { ok: false, error: "actions must include at least one item." };
  }

  const parsedActions = actions.map((item) => {
    const actionItem = typeof item === "object" && item !== null ? item as Record<string, unknown> : {};

    const action = actionItem.action === "carry_over" ||
      actionItem.action === "complete" ||
      actionItem.action === "discard" ||
      actionItem.action === "postpone"
      ? actionItem.action
      : null;
    const actionToDate = typeof actionItem.toDate === "string" ? actionItem.toDate : undefined;

    return {
      priorityId: typeof actionItem.priorityId === "string" ? actionItem.priorityId.trim() : "",
      action,
      toDate: actionToDate,
    };
  });

  if (parsedActions.some((item) => !item.priorityId || !item.action)) {
    return { ok: false, error: "Each action needs priorityId and a valid action." };
  }

  if (parsedActions.some((item) => item.action === "postpone" && (!item.toDate || !datePattern.test(item.toDate) || item.toDate === fromDate))) {
    return { ok: false, error: "Postpone actions need a valid toDate different from fromDate." };
  }

  return {
    ok: true,
    value: {
      fromDate,
      toDate,
      actions: parsedActions as ResolvePendingReviewBody["actions"],
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

function hasCarryOverDuplicate(priorities: DailyPriority[], priority: DailyPriority, fromDate: string) {
  const targetText = priority.text.trim();

  return priorities.some((candidate) =>
    getPriorityStatus(candidate) === "pending" &&
    candidate.text.trim() === targetText &&
    (candidate.postponedFromDate === fromDate || candidate.text.trim() === targetText),
  );
}

function createPendingCopy(priority: DailyPriority, fromDate: string, now: string) {
  return {
    id: createDailyPriorityId("priority"),
    text: priority.text,
    status: "pending" as const,
    done: false,
    postponedFromDate: fromDate,
    originalPriorityId: priority.id,
    createdAt: now,
    updatedAt: now,
  };
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

  const { fromDate, toDate, actions } = result.value;

  try {
    const fromEntry = await getDailyEntryByDate(auth.user.id, fromDate);

    if (!fromEntry) {
      return jsonNoStore({ error: "Daily entry not found." }, { status: 404 });
    }

    const now = new Date().toISOString();
    const targetDateSet = new Set(actions.map((action) => action.action === "postpone" && action.toDate ? action.toDate : toDate));
    const targetEntries = new Map<string, DailyEntry | null>();
    const targetPriorities = new Map<string, DailyPriority[]>();
    const actionByPriorityId = new Map(actions.map((action) => [action.priorityId, action]));
    const warnings: ResolveWarning[] = [];
    const carriedOver: DailyPriority[] = [];
    const discarded: DailyPriority[] = [];

    await Promise.all(
      Array.from(targetDateSet).map(async (targetDate) => {
        const entry = await getDailyEntryByDate(auth.user.id, targetDate);
        targetEntries.set(targetDate, entry);
        targetPriorities.set(targetDate, normalizeDailyPriorities(entry?.priorities ?? []));
      }),
    );

    const fromPriorities = normalizeDailyPriorities(fromEntry.priorities).map((priority) => {
      const action = actionByPriorityId.get(priority.id);

      if (!action) {
        return priority;
      }

      if (getPriorityStatus(priority) !== "pending") {
        warnings.push({ code: "priority_not_pending", priorityId: priority.id, text: priority.text });
        return priority;
      }

      if (action.action === "complete") {
        return {
          ...priority,
          status: "completed" as const,
          done: true,
          updatedAt: now,
        };
      }

      if (action.action === "discard") {
        const discardedPriority = {
          ...priority,
          status: "discarded" as const,
          done: false,
          updatedAt: now,
        };

        discarded.push(discardedPriority);
        return discardedPriority;
      }

      const targetDate = action.action === "postpone" && action.toDate ? action.toDate : toDate;
      const postponedPriority = {
        ...priority,
        status: "postponed" as const,
        done: false,
        postponedToDate: targetDate,
        updatedAt: now,
      };
      const currentTargetPriorities = targetPriorities.get(targetDate) ?? [];

      if (hasCarryOverDuplicate(currentTargetPriorities, priority, fromDate)) {
        warnings.push({ code: "duplicate_possible", priorityId: priority.id, text: priority.text });
      } else {
        const carriedPriority = createPendingCopy(priority, fromDate, now);

        targetPriorities.set(targetDate, [...currentTargetPriorities, carriedPriority]);
        carriedOver.push(carriedPriority);
      }

      return postponedPriority;
    });

    for (const action of actions) {
      if (!fromPriorities.some((priority) => priority.id === action.priorityId)) {
        warnings.push({ code: "priority_not_found", priorityId: action.priorityId });
      }
    }

    const savedFromEntry = await upsertDailyEntry(
      auth.user.id,
      createEntryInputFromDailyEntry(fromEntry, fromPriorities),
    );
    const savedTargetEntries = new Map<string, DailyEntry | null>();

    for (const [targetDate, priorities] of targetPriorities.entries()) {
      const originalEntry = targetEntries.get(targetDate) ?? null;
      const originalPriorities = normalizeDailyPriorities(originalEntry?.priorities ?? []);
      const changed = priorities.length !== originalPriorities.length ||
        priorities.some((priority, index) => priority.id !== originalPriorities[index]?.id);

      if (!changed) {
        savedTargetEntries.set(targetDate, originalEntry);
        continue;
      }

      const savedEntry = await upsertDailyEntry(auth.user.id, {
        entryDate: targetDate,
        priorities,
        mobilityDone: originalEntry?.mobilityDone ?? false,
        mobilityMinutes: originalEntry?.mobilityMinutes ?? null,
        mobilityFocus: originalEntry?.mobilityFocus ?? [],
        dailyNote: originalEntry?.dailyNote ?? null,
      });

      savedTargetEntries.set(targetDate, savedEntry);
    }

    return jsonNoStore({
      fromEntry: savedFromEntry,
      toEntry: savedTargetEntries.get(toDate) ?? targetEntries.get(toDate) ?? null,
      targetEntries: Array.from(savedTargetEntries.entries()).map(([entryDate, entry]) => ({ entryDate, entry })),
      carriedOver,
      discarded,
      warnings,
    });
  } catch (error) {
    return jsonNoStore(
      {
        error: "Could not resolve pending review.",
        detail: getTechnicalDetail(error),
      },
      { status: 500 },
    );
  }
}
