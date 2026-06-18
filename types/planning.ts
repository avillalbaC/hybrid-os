export type PlannedSessionType =
  | "crossfit"
  | "hyrox"
  | "halterofilia"
  | "gimnasticos"
  | "running"
  | "fuerza"
  | "movilidad"
  | "actividad_funcional"
  | "mixed"
  | "descanso";

export type PlannedSessionStatus =
  | "planned"
  | "completed"
  | "skipped"
  | "moved"
  | "cancelled";

export type PlannedSessionPriority =
  | "low"
  | "normal"
  | "high";

export type PlannedSessionSource =
  | "manual"
  | "template"
  | "import"
  | "suggestion";

export type PlannedSession = {
  id: string;
  userId: string;
  goalBlockId: string | null;
  plannedDate: string;
  title: string;
  type: PlannedSessionType;
  subtypes: string[];
  status: PlannedSessionStatus;
  priority: PlannedSessionPriority;
  plannedDurationMinutes: number | null;
  plannedDistanceMeters: number | null;
  plannedRpe: number | null;
  focus: string[];
  notes: string | null;
  source: PlannedSessionSource;
  matchedTrainingSessionId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlannedSessionInput = {
  goalBlockId?: string | null;
  plannedDate: string;
  title: string;
  type: PlannedSessionType;
  subtypes?: string[];
  status?: PlannedSessionStatus;
  priority?: PlannedSessionPriority;
  plannedDurationMinutes?: number | null;
  plannedDistanceMeters?: number | null;
  plannedRpe?: number | null;
  focus?: string[];
  notes?: string | null;
};

export type WeeklyPlanDeviation = {
  id: string;
  severity: "info" | "positive" | "warning" | "critical";
  title: string;
  description: string;
  recommendation?: string;
};

export type WeeklyPlanSummary = {
  weekStart: string;
  weekEnd: string;
  plannedSessions: number;
  completedPlannedSessions: number;
  skippedSessions: number;
  unplannedCompletedSessions: number;
  plannedByType: Record<string, number>;
  completedByType: Record<string, number>;
  adherencePercentage: number | null;
  deviations: WeeklyPlanDeviation[];
};

export const plannedSessionTypes: PlannedSessionType[] = [
  "crossfit",
  "hyrox",
  "halterofilia",
  "gimnasticos",
  "running",
  "fuerza",
  "movilidad",
  "actividad_funcional",
  "mixed",
  "descanso",
];

export const plannedSessionStatuses: PlannedSessionStatus[] = [
  "planned",
  "completed",
  "skipped",
  "moved",
  "cancelled",
];

export const plannedSessionPriorities: PlannedSessionPriority[] = [
  "low",
  "normal",
  "high",
];

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(new Set(value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)));
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeOptionalInteger(value: unknown, field: string): { ok: true; value: number | null } | { ok: false; error: string } {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: null };
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return { ok: false, error: `${field} must be a non-negative integer.` };
  }

  return { ok: true, value };
}

function normalizeOptionalNumber(value: unknown, field: string): { ok: true; value: number | null } | { ok: false; error: string } {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: null };
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return { ok: false, error: `${field} must be a non-negative number.` };
  }

  return { ok: true, value };
}

export function isPlannedSessionStatus(value: unknown): value is PlannedSessionStatus {
  return typeof value === "string" && plannedSessionStatuses.includes(value as PlannedSessionStatus);
}

export function normalizePlannedSessionInput(input: unknown): { ok: true; value: PlannedSessionInput } | { ok: false; error: string } {
  if (!isObject(input)) {
    return { ok: false, error: "Invalid planned session payload." };
  }

  if (typeof input.plannedDate !== "string" || !datePattern.test(input.plannedDate)) {
    return { ok: false, error: "plannedDate must use YYYY-MM-DD." };
  }

  if (typeof input.title !== "string" || input.title.trim().length === 0) {
    return { ok: false, error: "title is required." };
  }

  if (typeof input.type !== "string" || !plannedSessionTypes.includes(input.type as PlannedSessionType)) {
    return { ok: false, error: "type is invalid." };
  }

  if (input.status !== undefined && !isPlannedSessionStatus(input.status)) {
    return { ok: false, error: "status is invalid." };
  }

  if (input.priority !== undefined && (typeof input.priority !== "string" || !plannedSessionPriorities.includes(input.priority as PlannedSessionPriority))) {
    return { ok: false, error: "priority is invalid." };
  }

  const plannedDurationMinutes = normalizeOptionalInteger(input.plannedDurationMinutes, "plannedDurationMinutes");
  const plannedDistanceMeters = normalizeOptionalInteger(input.plannedDistanceMeters, "plannedDistanceMeters");
  const plannedRpe = normalizeOptionalNumber(input.plannedRpe, "plannedRpe");

  if (!plannedDurationMinutes.ok) {
    return plannedDurationMinutes;
  }

  if (!plannedDistanceMeters.ok) {
    return plannedDistanceMeters;
  }

  if (!plannedRpe.ok) {
    return plannedRpe;
  }

  if (plannedRpe.value !== null && plannedRpe.value > 10) {
    return { ok: false, error: "plannedRpe must be between 0 and 10." };
  }

  const goalBlockId = normalizeOptionalString(input.goalBlockId);

  return {
    ok: true,
    value: {
      goalBlockId,
      plannedDate: input.plannedDate,
      title: input.title.trim(),
      type: input.type as PlannedSessionType,
      subtypes: normalizeStringArray(input.subtypes),
      status: input.status as PlannedSessionStatus | undefined,
      priority: (input.priority as PlannedSessionPriority | undefined) ?? "normal",
      plannedDurationMinutes: plannedDurationMinutes.value,
      plannedDistanceMeters: plannedDistanceMeters.value,
      plannedRpe: plannedRpe.value,
      focus: normalizeStringArray(input.focus),
      notes: normalizeOptionalString(input.notes),
    },
  };
}

export function normalizePlannedSessionPatch(input: unknown): { ok: true; value: Partial<PlannedSessionInput> } | { ok: false; error: string } {
  if (!isObject(input)) {
    return { ok: false, error: "Invalid planned session payload." };
  }

  const value: Partial<PlannedSessionInput> = {};

  if (input.goalBlockId !== undefined) {
    value.goalBlockId = normalizeOptionalString(input.goalBlockId);
  }

  if (input.plannedDate !== undefined) {
    if (typeof input.plannedDate !== "string" || !datePattern.test(input.plannedDate)) {
      return { ok: false, error: "plannedDate must use YYYY-MM-DD." };
    }

    value.plannedDate = input.plannedDate;
  }

  if (input.title !== undefined) {
    if (typeof input.title !== "string" || input.title.trim().length === 0) {
      return { ok: false, error: "title is invalid." };
    }

    value.title = input.title.trim();
  }

  if (input.type !== undefined) {
    if (typeof input.type !== "string" || !plannedSessionTypes.includes(input.type as PlannedSessionType)) {
      return { ok: false, error: "type is invalid." };
    }

    value.type = input.type as PlannedSessionType;
  }

  if (input.subtypes !== undefined) {
    value.subtypes = normalizeStringArray(input.subtypes);
  }

  if (input.status !== undefined) {
    if (!isPlannedSessionStatus(input.status)) {
      return { ok: false, error: "status is invalid." };
    }

    value.status = input.status;
  }

  if (input.priority !== undefined) {
    if (typeof input.priority !== "string" || !plannedSessionPriorities.includes(input.priority as PlannedSessionPriority)) {
      return { ok: false, error: "priority is invalid." };
    }

    value.priority = input.priority as PlannedSessionPriority;
  }

  if (input.plannedDurationMinutes !== undefined) {
    const result = normalizeOptionalInteger(input.plannedDurationMinutes, "plannedDurationMinutes");

    if (!result.ok) {
      return result;
    }

    value.plannedDurationMinutes = result.value;
  }

  if (input.plannedDistanceMeters !== undefined) {
    const result = normalizeOptionalInteger(input.plannedDistanceMeters, "plannedDistanceMeters");

    if (!result.ok) {
      return result;
    }

    value.plannedDistanceMeters = result.value;
  }

  if (input.plannedRpe !== undefined) {
    const result = normalizeOptionalNumber(input.plannedRpe, "plannedRpe");

    if (!result.ok) {
      return result;
    }

    if (result.value !== null && result.value > 10) {
      return { ok: false, error: "plannedRpe must be between 0 and 10." };
    }

    value.plannedRpe = result.value;
  }

  if (input.focus !== undefined) {
    value.focus = normalizeStringArray(input.focus);
  }

  if (input.notes !== undefined) {
    value.notes = normalizeOptionalString(input.notes);
  }

  return { ok: true, value };
}
