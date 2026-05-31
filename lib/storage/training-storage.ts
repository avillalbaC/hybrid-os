import type { HybridOSAppInput, TrainingSession } from "@/types/training";

const STORAGE_KEY = "hybrid-os.training-sessions";
const DELETED_IDS_STORAGE_KEY = "hybrid-os.deleted-training-session-ids";
const SCHEMA_VERSION = 1;

export type TrainingSessionsEnvelope = {
  schemaVersion: number;
  updatedAt: string;
  sessions: TrainingSession[];
};

export type RemoteTrainingSessionsResult =
  | { ok: true; sessions: TrainingSession[] }
  | { ok: false; status: number; message: string };

function createEnvelope(sessions: TrainingSession[]): TrainingSessionsEnvelope {
  return {
    schemaVersion: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    sessions,
  };
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isStoredEnvelope(value: unknown): value is TrainingSessionsEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    "schemaVersion" in value &&
    "sessions" in value &&
    Array.isArray((value as TrainingSessionsEnvelope).sessions)
  );
}

function readEnvelope(): TrainingSessionsEnvelope {
  if (!canUseLocalStorage()) {
    return createEnvelope([]);
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return createEnvelope([]);
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!isStoredEnvelope(parsed) || parsed.schemaVersion !== SCHEMA_VERSION) {
      return createEnvelope([]);
    }

    return parsed;
  } catch {
    return createEnvelope([]);
  }
}

function writeEnvelope(sessions: TrainingSession[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(createEnvelope(sessions)));
  window.dispatchEvent(new Event("hybrid-os:training-sessions-updated"));
}

function readDeletedIds() {
  if (!canUseLocalStorage()) {
    return [];
  }

  const rawValue = window.localStorage.getItem(DELETED_IDS_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeDeletedIds(ids: string[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(DELETED_IDS_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))));
  window.dispatchEvent(new Event("hybrid-os:training-sessions-updated"));
}

export function getTrainingSessions(): TrainingSession[] {
  return readEnvelope().sessions;
}

export function saveTrainingSession(session: TrainingSession): TrainingSession[] {
  const sessions = getTrainingSessions();
  const nextSessions = [session, ...sessions.filter((item) => item.id !== session.id)];
  writeEnvelope(nextSessions);
  return nextSessions;
}

export function deleteTrainingSession(id: string): TrainingSession[] {
  const nextSessions = getTrainingSessions().filter((session) => session.id !== id);
  writeEnvelope(nextSessions);
  return nextSessions;
}

export function getDeletedTrainingSessionIds() {
  return readDeletedIds();
}

export function markTrainingSessionDeleted(id: string) {
  writeDeletedIds([...readDeletedIds(), id]);
}

export function unmarkTrainingSessionDeleted(id: string) {
  writeDeletedIds(readDeletedIds().filter((deletedId) => deletedId !== id));
}

export function replaceTrainingSessions(sessions: TrainingSession[]): TrainingSession[] {
  writeEnvelope(sessions);
  return sessions;
}

export function clearTrainingSessions(): TrainingSession[] {
  writeEnvelope([]);
  return [];
}

export function mergeTrainingSessions(seedSessions: TrainingSession[], storedSessions: TrainingSession[], deletedIds: string[] = []) {
  const sessionsById = new Map<string, TrainingSession>();
  const deletedIdSet = new Set(deletedIds);

  seedSessions.forEach((session) => {
    if (!deletedIdSet.has(session.id)) {
      sessionsById.set(session.id, session);
    }
  });
  storedSessions.forEach((session) => {
    if (!deletedIdSet.has(session.id)) {
      sessionsById.set(session.id, session);
    }
  });

  return Array.from(sessionsById.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getRemoteTrainingSessions(): Promise<RemoteTrainingSessionsResult> {
  try {
    const response = await fetch("/api/training-sessions", {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: "No se pudieron cargar los entrenamientos remotos.",
      };
    }

    const payload = (await response.json()) as { sessions?: TrainingSession[] };
    return {
      ok: true,
      sessions: Array.isArray(payload.sessions) ? payload.sessions : [],
    };
  } catch {
    return {
      ok: false,
      status: 0,
      message: "No se pudo conectar con la API de entrenamientos.",
    };
  }
}

export async function saveRemoteTrainingSession(session: TrainingSession) {
  const response = await fetch(`/api/training-sessions/${encodeURIComponent(session.id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(session),
  });

  if (!response.ok) {
    throw new Error("Could not save remote training session.");
  }

  const payload = (await response.json()) as { session?: TrainingSession };
  return payload.session ?? session;
}

export type RemoteAppInputImportResult = {
  ok: true;
  savedSessionIds: string[];
  savedExercises: number;
  savedBodyCheckIds: string[];
  savedNutritionCheckIds: string[];
};

export type RemoteAppInputImportErrorDetail = {
  id?: string;
  phase?: string;
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

export class RemoteAppInputImportError extends Error {
  status: number;
  duplicateIds: string[];
  details: RemoteAppInputImportErrorDetail[];
  issues: unknown;

  constructor(
    message: string,
    options: {
      status: number;
      duplicateIds?: string[];
      details?: RemoteAppInputImportErrorDetail[];
      issues?: unknown;
    },
  ) {
    super(message);
    this.name = "RemoteAppInputImportError";
    this.status = options.status;
    this.duplicateIds = options.duplicateIds ?? [];
    this.details = options.details ?? [];
    this.issues = options.issues;
  }
}

export async function saveRemoteAppInputs(inputs: HybridOSAppInput[]): Promise<RemoteAppInputImportResult> {
  const response = await fetch("/api/imports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as {
      error?: string;
      message?: string;
      duplicateIds?: string[];
      details?: RemoteAppInputImportErrorDetail[];
      issues?: unknown;
    };

    throw new RemoteAppInputImportError(
      payload.message ?? payload.error ?? "No se pudo guardar el appInput en Supabase.",
      {
        status: response.status,
        duplicateIds: payload.duplicateIds,
        details: payload.details,
        issues: payload.issues,
      },
    );
  }

  const payload = (await response.json()) as RemoteAppInputImportResult;
  window.dispatchEvent(new Event("hybrid-os:remote-training-sessions-updated"));
  return payload;
}

export async function deleteRemoteTrainingSession(id: string) {
  const response = await fetch(`/api/training-sessions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Could not delete remote training session.");
  }
}

export function downloadTrainingSessionsBackup(sessions: TrainingSession[]) {
  const backup = {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    sessions,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `hybrid-os-training-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
