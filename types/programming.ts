export type ProgrammingSessionStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "partially_completed"
  | "skipped";

export type ProgrammingBlockStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "skipped";

export type ProgrammingSessionType =
  | "gimnasticos"
  | "running"
  | "fuerza"
  | "halterofilia"
  | "crossfit"
  | "hyrox"
  | "movilidad"
  | "mixed"
  | "other";

export type ProgrammingNextSessionDecision =
  | "mantener"
  | "subir"
  | "bajar"
  | "cancelar";

export type ProgrammingBlock = {
  id: string;
  order: number;
  title: string;
  durationMinutes: number | null;
  status: ProgrammingBlockStatus;
  focus: string | null;
  items: string[];
  notes: string | null;
  maxVolume: string[];
  dontDo: string[];
};

export type ProgrammingFinalLog = {
  actualDurationMinutes: number;
  technicalRpe: number;
  discomfort: string | null;
  finalNote: string | null;
  nextSessionDecision: ProgrammingNextSessionDecision;
};

export type ProgrammingSession = {
  id: string;
  userId: string;
  title: string;
  type: ProgrammingSessionType;
  scheduledDate: string;
  estimatedDurationMinutes: number | null;
  status: ProgrammingSessionStatus;
  source: string;
  blocks: ProgrammingBlock[];
  finalLog: ProgrammingFinalLog | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProgrammingSessionInput = {
  title: string;
  type: ProgrammingSessionType;
  scheduledDate: string;
  estimatedDurationMinutes?: number | null;
  status?: ProgrammingSessionStatus;
  source?: string;
  blocks: ProgrammingBlock[];
};

export type ProgrammingSessionPatch = {
  status?: ProgrammingSessionStatus;
  blocks?: ProgrammingBlock[];
  finalLog?: ProgrammingFinalLog | null;
  startedAt?: string | null;
  completedAt?: string | null;
};

export const programmingSessionStatuses: ProgrammingSessionStatus[] = [
  "planned",
  "in_progress",
  "completed",
  "partially_completed",
  "skipped",
];

export const programmingBlockStatuses: ProgrammingBlockStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "skipped",
];

export const programmingSessionTypes: ProgrammingSessionType[] = [
  "gimnasticos",
  "running",
  "fuerza",
  "halterofilia",
  "crossfit",
  "hyrox",
  "movilidad",
  "mixed",
  "other",
];

export const programmingNextSessionDecisions: ProgrammingNextSessionDecision[] = [
  "mantener",
  "subir",
  "bajar",
  "cancelar",
];

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}T/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRequiredString(value: unknown, field: string): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { ok: false, error: `${field} is required.` };
  }

  return { ok: true, value: value.trim() };
}

function normalizeOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeOptionalStringArray(value: unknown, field: string): { ok: true; value: string[] } | { ok: false; error: string } {
  if (value === undefined || value === null) {
    return { ok: true, value: [] };
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return { ok: false, error: `${field} must be an array of strings.` };
  }

  return {
    ok: true,
    value: value.map((item) => item.trim()).filter(Boolean),
  };
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

function normalizeRequiredInteger(value: unknown, field: string): { ok: true; value: number } | { ok: false; error: string } {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return { ok: false, error: `${field} must be a non-negative integer.` };
  }

  return { ok: true, value };
}

function normalizeRequiredNumber(value: unknown, field: string): { ok: true; value: number } | { ok: false; error: string } {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return { ok: false, error: `${field} must be a non-negative number.` };
  }

  return { ok: true, value };
}

export function isProgrammingSessionStatus(value: unknown): value is ProgrammingSessionStatus {
  return typeof value === "string" && programmingSessionStatuses.includes(value as ProgrammingSessionStatus);
}

export function isProgrammingBlockStatus(value: unknown): value is ProgrammingBlockStatus {
  return typeof value === "string" && programmingBlockStatuses.includes(value as ProgrammingBlockStatus);
}

function normalizeProgrammingBlock(input: unknown, index: number): { ok: true; value: ProgrammingBlock } | { ok: false; error: string } {
  if (!isObject(input)) {
    return { ok: false, error: `blocks[${index}] must be an object.` };
  }

  const id = normalizeRequiredString(input.id, `blocks[${index}].id`);
  if (!id.ok) {
    return id;
  }

  const title = normalizeRequiredString(input.title, `blocks[${index}].title`);
  if (!title.ok) {
    return title;
  }

  const order = normalizeRequiredInteger(input.order, `blocks[${index}].order`);
  if (!order.ok) {
    return order;
  }

  const durationMinutes = normalizeOptionalInteger(input.durationMinutes, `blocks[${index}].durationMinutes`);
  if (!durationMinutes.ok) {
    return durationMinutes;
  }

  if (input.status !== undefined && !isProgrammingBlockStatus(input.status)) {
    return { ok: false, error: `blocks[${index}].status is invalid.` };
  }

  const items = normalizeOptionalStringArray(input.items, `blocks[${index}].items`);
  if (!items.ok) {
    return items;
  }

  const maxVolume = normalizeOptionalStringArray(input.maxVolume, `blocks[${index}].maxVolume`);
  if (!maxVolume.ok) {
    return maxVolume;
  }

  const dontDo = normalizeOptionalStringArray(input.dontDo, `blocks[${index}].dontDo`);
  if (!dontDo.ok) {
    return dontDo;
  }

  return {
    ok: true,
    value: {
      id: id.value,
      order: order.value,
      title: title.value,
      durationMinutes: durationMinutes.value,
      status: (input.status as ProgrammingBlockStatus | undefined) ?? "pending",
      focus: normalizeOptionalString(input.focus),
      items: items.value,
      notes: normalizeOptionalString(input.notes),
      maxVolume: maxVolume.value,
      dontDo: dontDo.value,
    },
  };
}

export function normalizeProgrammingBlocks(input: unknown): { ok: true; value: ProgrammingBlock[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) {
    return { ok: false, error: "blocks must be an array." };
  }

  const blocks: ProgrammingBlock[] = [];
  const ids = new Set<string>();

  for (const [index, blockInput] of input.entries()) {
    const block = normalizeProgrammingBlock(blockInput, index);

    if (!block.ok) {
      return block;
    }

    if (ids.has(block.value.id)) {
      return { ok: false, error: `blocks[${index}].id must be unique.` };
    }

    ids.add(block.value.id);
    blocks.push(block.value);
  }

  return {
    ok: true,
    value: blocks.sort((a, b) => a.order - b.order),
  };
}

export function normalizeProgrammingFinalLog(input: unknown): { ok: true; value: ProgrammingFinalLog } | { ok: false; error: string } {
  if (!isObject(input)) {
    return { ok: false, error: "finalLog must be an object." };
  }

  const actualDurationMinutes = normalizeRequiredInteger(input.actualDurationMinutes, "finalLog.actualDurationMinutes");
  if (!actualDurationMinutes.ok) {
    return actualDurationMinutes;
  }

  const technicalRpe = normalizeRequiredNumber(input.technicalRpe, "finalLog.technicalRpe");
  if (!technicalRpe.ok) {
    return technicalRpe;
  }

  if (technicalRpe.value > 10) {
    return { ok: false, error: "finalLog.technicalRpe must be between 0 and 10." };
  }

  if (typeof input.nextSessionDecision !== "string" || !programmingNextSessionDecisions.includes(input.nextSessionDecision as ProgrammingNextSessionDecision)) {
    return { ok: false, error: "finalLog.nextSessionDecision is invalid." };
  }

  return {
    ok: true,
    value: {
      actualDurationMinutes: actualDurationMinutes.value,
      technicalRpe: technicalRpe.value,
      discomfort: normalizeOptionalString(input.discomfort),
      finalNote: normalizeOptionalString(input.finalNote),
      nextSessionDecision: input.nextSessionDecision as ProgrammingNextSessionDecision,
    },
  };
}

export function normalizeProgrammingSessionInput(input: unknown): { ok: true; value: ProgrammingSessionInput } | { ok: false; error: string } {
  if (!isObject(input)) {
    return { ok: false, error: "Invalid programming session payload." };
  }

  const title = normalizeRequiredString(input.title, "title");
  if (!title.ok) {
    return title;
  }

  if (typeof input.scheduledDate !== "string" || !datePattern.test(input.scheduledDate)) {
    return { ok: false, error: "scheduledDate must use YYYY-MM-DD." };
  }

  if (typeof input.type !== "string" || !programmingSessionTypes.includes(input.type as ProgrammingSessionType)) {
    return { ok: false, error: "type is invalid." };
  }

  if (input.status !== undefined && !isProgrammingSessionStatus(input.status)) {
    return { ok: false, error: "status is invalid." };
  }

  const estimatedDurationMinutes = normalizeOptionalInteger(input.estimatedDurationMinutes, "estimatedDurationMinutes");
  if (!estimatedDurationMinutes.ok) {
    return estimatedDurationMinutes;
  }

  const blocks = normalizeProgrammingBlocks(input.blocks);
  if (!blocks.ok) {
    return blocks;
  }

  return {
    ok: true,
    value: {
      title: title.value,
      type: input.type as ProgrammingSessionType,
      scheduledDate: input.scheduledDate,
      estimatedDurationMinutes: estimatedDurationMinutes.value,
      status: (input.status as ProgrammingSessionStatus | undefined) ?? "planned",
      source: normalizeOptionalString(input.source) ?? "manual",
      blocks: blocks.value,
    },
  };
}

export function normalizeProgrammingSessionPatch(input: unknown): { ok: true; value: ProgrammingSessionPatch } | { ok: false; error: string } {
  if (!isObject(input)) {
    return { ok: false, error: "Invalid programming session patch." };
  }

  const value: ProgrammingSessionPatch = {};

  if (input.status !== undefined) {
    if (!isProgrammingSessionStatus(input.status)) {
      return { ok: false, error: "status is invalid." };
    }

    value.status = input.status;
  }

  if (input.blocks !== undefined) {
    const blocks = normalizeProgrammingBlocks(input.blocks);

    if (!blocks.ok) {
      return blocks;
    }

    value.blocks = blocks.value;
  }

  if (input.finalLog !== undefined) {
    if (input.finalLog === null) {
      value.finalLog = null;
    } else {
      const finalLog = normalizeProgrammingFinalLog(input.finalLog);

      if (!finalLog.ok) {
        return finalLog;
      }

      value.finalLog = finalLog.value;
    }
  }

  if (input.startedAt !== undefined) {
    if (input.startedAt !== null && (typeof input.startedAt !== "string" || !isoDatePattern.test(input.startedAt))) {
      return { ok: false, error: "startedAt must be an ISO datetime or null." };
    }

    value.startedAt = input.startedAt;
  }

  if (input.completedAt !== undefined) {
    if (input.completedAt !== null && (typeof input.completedAt !== "string" || !isoDatePattern.test(input.completedAt))) {
      return { ok: false, error: "completedAt must be an ISO datetime or null." };
    }

    value.completedAt = input.completedAt;
  }

  if (Object.keys(value).length === 0) {
    return { ok: false, error: "Patch must include at least one supported field." };
  }

  return { ok: true, value };
}
