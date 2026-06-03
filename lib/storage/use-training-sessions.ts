"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearTrainingSessions,
  deleteRemoteTrainingSession,
  deleteTrainingSession,
  downloadTrainingSessionsBackup,
  getDeletedTrainingSessionIds,
  getRemoteTrainingSessions,
  getTrainingSessions,
  markTrainingSessionDeleted,
  mergeTrainingSessions,
  replaceTrainingSessions,
  saveRemoteTrainingSession,
  saveTrainingSession,
  unmarkTrainingSessionDeleted,
} from "@/lib/storage/training-storage";
import type { TrainingSession } from "@/types/training";

export type TrainingSessionsSource = "loading" | "remote" | "seed-fallback";
export type TrainingSessionWithSync = TrainingSession & {
  pendingSync?: boolean;
  dataSource?: "remote" | "seed" | "local-pending";
};

function markSessionsSource(sessions: TrainingSession[], dataSource: NonNullable<TrainingSessionWithSync["dataSource"]>) {
  return sessions.map((session) => ({
    ...session,
    dataSource,
    pendingSync: dataSource === "local-pending",
  }));
}

export function useTrainingSessions(seedSessions: TrainingSession[]) {
  const [storedSessions, setStoredSessions] = useState<TrainingSession[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [remoteSessions, setRemoteSessions] = useState<TrainingSession[] | null>(null);
  const [source, setSource] = useState<TrainingSessionsSource>("loading");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  const refreshStoredSessions = useCallback(() => {
    setStoredSessions(getTrainingSessions());
    setDeletedIds(getDeletedTrainingSessionIds());
    setHasHydrated(true);
  }, []);

  const loadRemoteSessions = useCallback(async () => {
    setSource("loading");
    setRemoteError(null);

    const localSessions = getTrainingSessions();
    const result = await getRemoteTrainingSessions();

    if (!result.ok) {
      setRemoteSessions(null);
      setSource("seed-fallback");
      setRemoteError(result.message);
      setSyncMessage("Fallback seed: Supabase no está disponible. Las sesiones locales quedan como pendientes.");
      return;
    }

    setRemoteSessions(result.sessions);
    setSource(result.sessions.length > 0 ? "remote" : "seed-fallback");
    setRemoteError(null);
    setSyncMessage(result.sessions.length > 0 ? null : "Fallback seed: Supabase no tiene entrenamientos todavía.");

    if (localSessions.length === 0) {
      return;
    }

    try {
      const migratedSessions = await Promise.all(localSessions.map((session) => saveRemoteTrainingSession(session)));
      setRemoteSessions((currentSessions) =>
        mergeTrainingSessions(currentSessions ?? result.sessions, migratedSessions, getDeletedTrainingSessionIds()),
      );
      setStoredSessions(clearTrainingSessions());
      setSyncMessage(`${migratedSessions.length} sesiones locales migradas a la base de datos.`);
    } catch {
      setSyncMessage("Hay sesiones locales pendientes de migrar a la base de datos.");
    }
  }, []);

  useEffect(() => {
    refreshStoredSessions();

    window.addEventListener("storage", refreshStoredSessions);
    window.addEventListener("hybrid-os:training-sessions-updated", refreshStoredSessions);
    window.addEventListener("hybrid-os:remote-training-sessions-updated", loadRemoteSessions);

    return () => {
      window.removeEventListener("storage", refreshStoredSessions);
      window.removeEventListener("hybrid-os:training-sessions-updated", refreshStoredSessions);
      window.removeEventListener("hybrid-os:remote-training-sessions-updated", loadRemoteSessions);
    };
  }, [loadRemoteSessions, refreshStoredSessions]);

  useEffect(() => {
    void loadRemoteSessions();
  }, [loadRemoteSessions]);

  const sessions = useMemo(() => {
    if (source === "loading") {
      return [];
    }

    if (remoteSessions && remoteSessions.length > 0) {
      return mergeTrainingSessions(
        markSessionsSource(remoteSessions, "remote"),
        markSessionsSource(storedSessions, "local-pending"),
        deletedIds,
      );
    }

    return mergeTrainingSessions(
      markSessionsSource(seedSessions, "seed"),
      markSessionsSource(storedSessions, "local-pending"),
      deletedIds,
    );
  }, [deletedIds, remoteSessions, seedSessions, source, storedSessions]);

  const isLoading = source === "loading";
  const isSettled = !isLoading;
  const isReady = isSettled;
  const hasData = sessions.length > 0;

  return {
    sessions,
    storedSessions,
    pendingSessions: storedSessions,
    deletedIds,
    remoteSessions,
    source,
    syncMessage,
    remoteError,
    error: remoteError,
    isLoading,
    isReady,
    isSettled,
    hasData,
    hasHydrated,
    async saveSession(session: TrainingSession) {
      try {
        const savedSession = await saveRemoteTrainingSession(session);
        setRemoteSessions((currentSessions) => mergeTrainingSessions(currentSessions ?? [], [savedSession]));
        setStoredSessions(deleteTrainingSession(savedSession.id));
        unmarkTrainingSessionDeleted(savedSession.id);
        setDeletedIds(getDeletedTrainingSessionIds());
        setSource("remote");
        setSyncMessage("Sesión guardada en la base de datos.");
        return { ok: true, remote: true };
      } catch {
        setStoredSessions(saveTrainingSession(session));
        setSource((currentSource) => (currentSource === "remote" ? currentSource : "seed-fallback"));
        setSyncMessage("No se pudo guardar en la base de datos. La sesión queda guardada localmente.");
        return { ok: true, remote: false };
      }
    },
    async deleteSession(id: string) {
      markTrainingSessionDeleted(id);
      setDeletedIds(getDeletedTrainingSessionIds());
      setStoredSessions(deleteTrainingSession(id));

      try {
        await deleteRemoteTrainingSession(id);
        setRemoteSessions((currentSessions) => (currentSessions ?? []).filter((session) => session.id !== id));
        setSyncMessage("Sesión eliminada.");
      } catch {
        setSyncMessage("Sesión ocultada localmente. Revisa Supabase y elimínala de nuevo cuando la base de datos esté disponible.");
      }
    },
    replaceSessions(nextSessions: TrainingSession[]) {
      setStoredSessions(replaceTrainingSessions(nextSessions));
    },
    exportBackup() {
      downloadTrainingSessionsBackup(sessions);
    },
  };
}
