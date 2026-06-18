export type DailyPriorityStatus = "pending" | "completed" | "discarded" | "postponed";

export type DailyPriority = {
  id: string;
  text: string;
  done?: boolean;
  status?: DailyPriorityStatus;
  postponedToDate?: string | null;
  postponedFromDate?: string | null;
  originalPriorityId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DailyEntrySource = "manual" | "import" | "parser";

export type DailyEntry = {
  id: string;
  userId: string;
  entryDate: string;
  priorities: DailyPriority[];
  mobilityDone: boolean;
  mobilityMinutes: number | null;
  mobilityFocus: string[];
  dailyNote: string | null;
  source: DailyEntrySource;
  createdAt: string;
  updatedAt: string;
};

export type DailyEntryInput = {
  entryDate: string;
  priorities: DailyPriority[];
  mobilityDone: boolean;
  mobilityMinutes?: number | null;
  mobilityFocus?: string[];
  dailyNote?: string | null;
};

export const DAILY_PRIORITY_LIMIT = 3;

export const DAILY_MOBILITY_FOCUS_OPTIONS = [
  "hombro",
  "cadera",
  "tobillo",
  "espalda",
  "core",
  "general",
] as const;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return true;
}

function normalizeDailyPriorityDone(done: unknown) {
  return done === true || done === "true";
}

function normalizeDailyPriorityStatus(priority: Record<string, unknown>): DailyPriorityStatus {
  if (
    priority.status === "pending" ||
    priority.status === "completed" ||
    priority.status === "discarded" ||
    priority.status === "postponed"
  ) {
    return priority.status;
  }

  return normalizeDailyPriorityDone(priority.done) ? "completed" : "pending";
}

function normalizeNullableString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function createDailyPriorityId(prefix = "priority") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getPriorityStatus(priority: DailyPriority): DailyPriorityStatus {
  if (priority.status) {
    return priority.status;
  }

  return priority.done === true ? "completed" : "pending";
}

export function isActivePriority(priority: DailyPriority) {
  return getPriorityStatus(priority) === "pending";
}

export function normalizeDailyPriority(raw: unknown, index: number): DailyPriority {
  const priority = isObject(raw) ? raw : {};
  const status = normalizeDailyPriorityStatus(priority);
  const id = typeof priority.id === "string" && priority.id.trim().length > 0
    ? priority.id.trim()
    : `priority-${index + 1}`;

  return {
    id,
    text: typeof priority.text === "string" ? priority.text.trim() : "",
    done: status === "completed",
    status,
    postponedToDate: normalizeNullableString(priority.postponedToDate),
    postponedFromDate: normalizeNullableString(priority.postponedFromDate),
    originalPriorityId: normalizeNullableString(priority.originalPriorityId),
    createdAt: normalizeNullableString(priority.createdAt) ?? undefined,
    updatedAt: normalizeNullableString(priority.updatedAt) ?? undefined,
  };
}

export function createEmptyDailyPriorities(): DailyPriority[] {
  return Array.from({ length: DAILY_PRIORITY_LIMIT }, (_, index) => ({
    id: `priority-${index + 1}`,
    text: "",
    done: false,
    status: "pending",
  }));
}

export function normalizeDailyPriorities(priorities: unknown): DailyPriority[] {
  if (!Array.isArray(priorities)) {
    return [];
  }

  return priorities
    .map((priority, index) => normalizeDailyPriority(priority, index))
    .filter((priority) => priority.text.length > 0)
    .map((priority) => ({
      ...priority,
      done: getPriorityStatus(priority) === "completed",
    }));
}

function createEmptyPrioritySlot(index: number, usedIds: Set<string>): DailyPriority {
  let id = `priority-${index + 1}`;

  if (usedIds.has(id)) {
    id = createDailyPriorityId("priority");
  }

  usedIds.add(id);

  return {
    id,
    text: "",
    done: false,
    status: "pending",
  };
}

export function toPrioritySlots(priorities: unknown): DailyPriority[] {
  const normalizedPriorities = normalizeDailyPriorities(priorities);
  const activePriorities = normalizedPriorities.filter(isActivePriority);
  const closedPriorities = normalizedPriorities.filter((priority) => !isActivePriority(priority));
  const usedIds = new Set(normalizedPriorities.map((priority) => priority.id));
  const activeSlots = Array.from({ length: DAILY_PRIORITY_LIMIT }, (_, index) =>
    activePriorities[index] ?? createEmptyPrioritySlot(index, usedIds),
  );

  return [...activeSlots, ...activePriorities.slice(DAILY_PRIORITY_LIMIT), ...closedPriorities];
}

export function normalizeDailyEntryInput(input: unknown): { ok: true; value: DailyEntryInput } | { ok: false; error: string } {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Invalid daily entry payload." };
  }

  const payload = input as Record<string, unknown>;

  if (typeof payload.entryDate !== "string" || !datePattern.test(payload.entryDate)) {
    return { ok: false, error: "entryDate must use YYYY-MM-DD." };
  }

  if (typeof payload.mobilityDone !== "boolean") {
    return { ok: false, error: "mobilityDone must be boolean." };
  }

  const mobilityMinutes = payload.mobilityMinutes;

  if (
    mobilityMinutes !== undefined &&
    mobilityMinutes !== null &&
    (typeof mobilityMinutes !== "number" || !Number.isInteger(mobilityMinutes) || mobilityMinutes < 0)
  ) {
    return { ok: false, error: "mobilityMinutes must be a non-negative integer." };
  }

  const mobilityFocus = payload.mobilityFocus;

  if (mobilityFocus !== undefined && (!Array.isArray(mobilityFocus) || !mobilityFocus.every((item) => typeof item === "string"))) {
    return { ok: false, error: "mobilityFocus must be an array of strings." };
  }

  if (payload.dailyNote !== undefined && payload.dailyNote !== null && typeof payload.dailyNote !== "string") {
    return { ok: false, error: "dailyNote must be a string." };
  }

  return {
    ok: true,
    value: {
      entryDate: payload.entryDate,
      priorities: normalizeDailyPriorities(payload.priorities),
      mobilityDone: payload.mobilityDone,
      mobilityMinutes: typeof mobilityMinutes === "number" ? mobilityMinutes : null,
      mobilityFocus: Array.isArray(mobilityFocus)
        ? Array.from(new Set(mobilityFocus.map((item) => item.trim()).filter(Boolean)))
        : [],
      dailyNote: typeof payload.dailyNote === "string" && payload.dailyNote.trim().length > 0
        ? payload.dailyNote.trim()
        : null,
    },
  };
}
