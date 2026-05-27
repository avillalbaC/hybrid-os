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

export type TrainingSessionsSource = "loading" | "remote" | "local-fallback";

export function useTrainingSessions(seedSessions: TrainingSession[]) {
  const [storedSessions, setStoredSessions] = useState<TrainingSession[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [remoteSessions, setRemoteSessions] = useState<TrainingSession[] | null>(null);
  const [source, setSource] = useState<TrainingSessionsSource>("loading");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  const refreshStoredSessions = useCallback(() => {
    setStoredSessions(getTrainingSessions());
    setDeletedIds(getDeletedTrainingSessionIds());
    setHasHydrated(true);
  }, []);

  const loadRemoteSessions = useCallback(async () => {
    const localSessions = getTrainingSessions();
    const result = await getRemoteTrainingSessions();

    if (!result.ok) {
      setRemoteSessions(null);
      setSource("local-fallback");
      setSyncMessage("Usando datos locales: la base de datos no está disponible.");
      return;
    }

    setRemoteSessions(result.sessions);
    setSource("remote");
    setSyncMessage(null);

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
    if (remoteSessions && remoteSessions.length > 0) {
      return mergeTrainingSessions(remoteSessions, storedSessions, deletedIds);
    }

    return mergeTrainingSessions(seedSessions, storedSessions, deletedIds);
  }, [deletedIds, remoteSessions, seedSessions, storedSessions]);

  return {
    sessions,
    storedSessions,
    pendingSessions: storedSessions,
    deletedIds,
    remoteSessions,
    source,
    syncMessage,
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
        setSource((currentSource) => (currentSource === "remote" ? currentSource : "local-fallback"));
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
