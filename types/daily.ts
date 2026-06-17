export type DailyPriority = {
  id: string;
  text: string;
  done: boolean;
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

export function createEmptyDailyPriorities(): DailyPriority[] {
  return Array.from({ length: DAILY_PRIORITY_LIMIT }, (_, index) => ({
    id: `priority-${index + 1}`,
    text: "",
    done: false,
  }));
}

export function normalizeDailyPriorities(priorities: unknown): DailyPriority[] {
  if (!Array.isArray(priorities)) {
    return [];
  }

  return priorities
    .filter(isObject)
    .map((priority, index) => ({
      id: typeof priority.id === "string" && priority.id.trim().length > 0
        ? priority.id.trim()
        : `priority-${index + 1}`,
      text: typeof priority.text === "string" ? priority.text.trim() : "",
      done: normalizeDailyPriorityDone(priority.done),
    }))
    .filter((priority) => priority.text.length > 0)
    .slice(0, DAILY_PRIORITY_LIMIT);
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
