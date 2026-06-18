export type GoalProfile =
  | "recomposition"
  | "running_base"
  | "hyrox_build"
  | "strength_maintenance"
  | "deload"
  | "custom";

export type GoalStatus =
  | "active"
  | "paused"
  | "completed"
  | "archived";

export type GoalTargetRange = {
  min?: number;
  target?: number;
  max?: number;
  unit?: string;
};

export type GoalBlockTargets = {
  weekly?: {
    structuredRunSessions?: GoalTargetRange;
    structuredRunKm?: GoalTargetRange;
    totalRunExposureKm?: GoalTargetRange;
    hyroxSessions?: GoalTargetRange;
    strengthSessions?: GoalTargetRange;
    mobilityDays?: GoalTargetRange;
    highIntensitySessions?: GoalTargetRange;
    averageRpe?: GoalTargetRange;
    totalDurationMinutes?: GoalTargetRange;
  };
  body?: {
    weightTrend?: "down" | "stable" | "up" | "any";
    waistTrend?: "down" | "stable" | "up" | "any";
  };
  recovery?: {
    minSleepHours?: number;
    maxRestingHrDelta?: number;
  };
  watch?: {
    muscles?: string[];
    notes?: string[];
  };
};

export type GoalBlock = {
  id: string;
  userId: string;
  title: string;
  profile: GoalProfile;
  status: GoalStatus;
  startDate: string;
  endDate: string | null;
  targets: GoalBlockTargets;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GoalEvaluationStatus =
  | "on_track"
  | "under_target"
  | "over_target"
  | "risk"
  | "insufficient_data"
  | "neutral";

export type GoalEvaluationItem = {
  id: string;
  label: string;
  currentValue: number | null;
  targetLabel: string;
  status: GoalEvaluationStatus;
  severity: "positive" | "info" | "warning" | "critical";
  explanation: string;
  recommendation?: string;
};

export type GoalEvaluation = {
  goal: GoalBlock | null;
  periodLabel: string;
  overallStatus: GoalEvaluationStatus;
  summary: string;
  items: GoalEvaluationItem[];
  recommendedDecision: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
  } | null;
};

export type GoalProgressStatus =
  | "improving"
  | "stable"
  | "worsening"
  | "on_track"
  | "off_track"
  | "insufficient_data"
  | "neutral";

export type GoalProgressSignal = {
  id: string;
  label: string;
  category:
    | "body"
    | "training"
    | "running"
    | "strength"
    | "mobility"
    | "recovery"
    | "data_quality"
    | "planning";
  direction: "positive" | "negative" | "neutral";
  severity: "info" | "positive" | "warning" | "critical";
  valueLabel?: string;
  targetLabel?: string;
  evidence: string;
  checkInRelevance: "low" | "medium" | "high";
};

export type GoalProgressSummary = {
  goalId: string | null;
  goalTitle: string | null;
  periodLabel: string;
  overallStatus: GoalProgressStatus;
  summary: string;
  progressItems: GoalProgressSignal[];
  positiveSignals: GoalProgressSignal[];
  negativeSignals: GoalProgressSignal[];
  insufficientData: GoalProgressSignal[];
  checkInContext: string;
};

export type GoalBlockInput = {
  title: string;
  profile: GoalProfile;
  status?: GoalStatus;
  startDate: string;
  endDate?: string | null;
  targets?: GoalBlockTargets;
  notes?: string | null;
};

const profiles: GoalProfile[] = [
  "recomposition",
  "running_base",
  "hyrox_build",
  "strength_maintenance",
  "deload",
  "custom",
];

const statuses: GoalStatus[] = ["active", "paused", "completed", "archived"];
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isGoalProfile(value: unknown): value is GoalProfile {
  return typeof value === "string" && profiles.includes(value as GoalProfile);
}

function isGoalStatus(value: unknown): value is GoalStatus {
  return typeof value === "string" && statuses.includes(value as GoalStatus);
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeRange(value: unknown): GoalTargetRange | undefined {
  if (!isObject(value)) {
    return undefined;
  }

  const range: GoalTargetRange = {};

  for (const key of ["min", "target", "max"] as const) {
    if (typeof value[key] === "number" && Number.isFinite(value[key])) {
      range[key] = value[key];
    }
  }

  if (typeof value.unit === "string" && value.unit.trim().length > 0) {
    range.unit = value.unit.trim();
  }

  return Object.keys(range).length > 0 ? range : undefined;
}

function normalizeWeeklyTargets(value: unknown): GoalBlockTargets["weekly"] {
  if (!isObject(value)) {
    return undefined;
  }

  const weekly: NonNullable<GoalBlockTargets["weekly"]> = {};
  const keys = [
    "structuredRunSessions",
    "structuredRunKm",
    "totalRunExposureKm",
    "hyroxSessions",
    "strengthSessions",
    "mobilityDays",
    "highIntensitySessions",
    "averageRpe",
    "totalDurationMinutes",
  ] as const;

  for (const key of keys) {
    const range = normalizeRange(value[key]);

    if (range) {
      weekly[key] = range;
    }
  }

  return Object.keys(weekly).length > 0 ? weekly : undefined;
}

function normalizeTrend(value: unknown) {
  if (value === "down" || value === "stable" || value === "up" || value === "any") {
    return value;
  }

  return undefined;
}

function normalizeTargets(value: unknown): GoalBlockTargets {
  if (!isObject(value)) {
    return {};
  }

  const targets: GoalBlockTargets = {};
  const weekly = normalizeWeeklyTargets(value.weekly);

  if (weekly) {
    targets.weekly = weekly;
  }

  if (isObject(value.body)) {
    const weightTrend = normalizeTrend(value.body.weightTrend);
    const waistTrend = normalizeTrend(value.body.waistTrend);

    if (weightTrend || waistTrend) {
      targets.body = {
        ...(weightTrend ? { weightTrend } : {}),
        ...(waistTrend ? { waistTrend } : {}),
      };
    }
  }

  if (isObject(value.recovery)) {
    const recovery: NonNullable<GoalBlockTargets["recovery"]> = {};

    if (typeof value.recovery.minSleepHours === "number" && Number.isFinite(value.recovery.minSleepHours)) {
      recovery.minSleepHours = value.recovery.minSleepHours;
    }

    if (typeof value.recovery.maxRestingHrDelta === "number" && Number.isFinite(value.recovery.maxRestingHrDelta)) {
      recovery.maxRestingHrDelta = value.recovery.maxRestingHrDelta;
    }

    if (Object.keys(recovery).length > 0) {
      targets.recovery = recovery;
    }
  }

  if (isObject(value.watch)) {
    const muscles = Array.isArray(value.watch.muscles)
      ? Array.from(new Set(value.watch.muscles.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)))
      : [];
    const notes = Array.isArray(value.watch.notes)
      ? Array.from(new Set(value.watch.notes.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)))
      : [];

    if (muscles.length > 0 || notes.length > 0) {
      targets.watch = {
        ...(muscles.length > 0 ? { muscles } : {}),
        ...(notes.length > 0 ? { notes } : {}),
      };
    }
  }

  return targets;
}

export function normalizeGoalBlockInput(input: unknown): { ok: true; value: GoalBlockInput } | { ok: false; error: string } {
  if (!isObject(input)) {
    return { ok: false, error: "Invalid goal payload." };
  }

  if (typeof input.title !== "string" || input.title.trim().length === 0) {
    return { ok: false, error: "title is required." };
  }

  if (!isGoalProfile(input.profile)) {
    return { ok: false, error: "profile is invalid." };
  }

  if (input.status !== undefined && !isGoalStatus(input.status)) {
    return { ok: false, error: "status is invalid." };
  }

  if (typeof input.startDate !== "string" || !datePattern.test(input.startDate)) {
    return { ok: false, error: "startDate must use YYYY-MM-DD." };
  }

  const endDate = normalizeOptionalString(input.endDate);

  if (endDate !== null && !datePattern.test(endDate)) {
    return { ok: false, error: "endDate must use YYYY-MM-DD." };
  }

  if (endDate !== null && endDate < input.startDate) {
    return { ok: false, error: "endDate must be after startDate." };
  }

  return {
    ok: true,
    value: {
      title: input.title.trim(),
      profile: input.profile,
      status: input.status ?? "active",
      startDate: input.startDate,
      endDate,
      targets: normalizeTargets(input.targets),
      notes: normalizeOptionalString(input.notes),
    },
  };
}

export function normalizeActiveGoalInput(input: unknown): { ok: true; value: Partial<GoalBlockInput> } | { ok: false; error: string } {
  if (!isObject(input)) {
    return { ok: false, error: "Invalid goal payload." };
  }

  const value: Partial<GoalBlockInput> = {};

  if (input.title !== undefined) {
    if (typeof input.title !== "string" || input.title.trim().length === 0) {
      return { ok: false, error: "title is invalid." };
    }

    value.title = input.title.trim();
  }

  if (input.profile !== undefined) {
    if (!isGoalProfile(input.profile)) {
      return { ok: false, error: "profile is invalid." };
    }

    value.profile = input.profile;
  }

  if (input.startDate !== undefined) {
    if (typeof input.startDate !== "string" || !datePattern.test(input.startDate)) {
      return { ok: false, error: "startDate must use YYYY-MM-DD." };
    }

    value.startDate = input.startDate;
  }

  if (input.endDate !== undefined) {
    const endDate = normalizeOptionalString(input.endDate);

    if (endDate !== null && !datePattern.test(endDate)) {
      return { ok: false, error: "endDate must use YYYY-MM-DD." };
    }

    value.endDate = endDate;
  }

  if (input.targets !== undefined) {
    value.targets = normalizeTargets(input.targets);
  }

  if (input.notes !== undefined) {
    value.notes = normalizeOptionalString(input.notes);
  }

  return { ok: true, value };
}
