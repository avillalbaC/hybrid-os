"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  formatCompactProgrammingDate,
  formatProgrammingDate,
  getProgrammingProgress,
  programmingStatusLabels,
  programmingTypeLabels,
} from "@/components/programming/programming-format";
import { normalizeProgrammingSessionInput } from "@/types/programming";
import type { ProgrammingSession } from "@/types/programming";

const emptyJson = `{
  "title": "Gimnásticos técnica estricta",
  "type": "gimnasticos",
  "scheduledDate": "2026-06-22",
  "estimatedDurationMinutes": 45,
  "blocks": [
    {
      "id": "warmup",
      "order": 1,
      "title": "Calentamiento",
      "durationMinutes": 10,
      "status": "pending",
      "focus": "Activación escapular y línea corporal",
      "items": [
        "2 rondas",
        "8 scap pull-ups",
        "8 hollow rocks"
      ],
      "notes": "Sin fatiga",
      "maxVolume": [],
      "dontDo": []
    }
  ]
}`;

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function sortUpcoming(sessions: ProgrammingSession[]) {
  return [...sessions].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate) || a.createdAt.localeCompare(b.createdAt));
}

function sortRecent(sessions: ProgrammingSession[]) {
  return [...sessions].sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate) || b.createdAt.localeCompare(a.createdAt));
}

function SessionCard({
  session,
  isDeleting,
  onDelete,
}: {
  session: ProgrammingSession;
  isDeleting: boolean;
  onDelete: (session: ProgrammingSession) => void;
}) {
  const progress = getProgrammingProgress(session.blocks);

  return (
    <article className="rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs font-black uppercase tracking-[0.12em] text-[var(--accent)]">
            {formatCompactProgrammingDate(session.scheduledDate)}
          </p>
          <h3 className="mt-2 text-lg font-black text-[var(--foreground)]">{session.title}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="accent">{programmingTypeLabels[session.type]}</Badge>
            <Badge>{programmingStatusLabels[session.status]}</Badge>
            <Badge>{session.estimatedDurationMinutes ? `${session.estimatedDurationMinutes} min` : "Sin duración"}</Badge>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/programming/${session.id}`}
            className="inline-flex min-h-9 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent-strong)]"
          >
            Abrir
          </Link>
          <button
            type="button"
            onClick={() => onDelete(session)}
            disabled={isDeleting}
            className="inline-flex min-h-9 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--muted-strong)] transition hover:border-[rgba(240,196,107,0.45)] hover:text-[var(--warning)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          <span>Progreso</span>
          <span>{progress.completed}/{progress.total} bloques</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[rgba(244,247,244,0.08)]" aria-hidden="true">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-secondary))]" style={{ width: `${progress.percentage}%` }} />
        </div>
      </div>
    </article>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <p className="text-sm leading-6 text-[var(--muted-strong)]">{children}</p>
    </Card>
  );
}

export function ProgrammingView() {
  const [sessions, setSessions] = useState<ProgrammingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [jsonValue, setJsonValue] = useState(emptyJson);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  async function loadSessions() {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/programming-sessions", { cache: "no-store" });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "No se pudieron cargar las programaciones.");
      }

      setSessions(body.programmingSessions ?? []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "No se pudieron cargar las programaciones.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  const { upcomingSessions, recentSessions } = useMemo(() => {
    const today = getTodayKey();
    const upcoming = sessions.filter((session) => session.scheduledDate >= today && session.status !== "completed" && session.status !== "skipped");
    const recent = sessions.filter((session) => !upcoming.includes(session));

    return {
      upcomingSessions: sortUpcoming(upcoming).slice(0, 12),
      recentSessions: sortRecent(recent).slice(0, 12),
    };
  }, [sessions]);

  async function handleImport() {
    setImportError(null);
    setImportMessage(null);

    let parsed: unknown;

    try {
      parsed = JSON.parse(jsonValue);
    } catch {
      setImportError("El JSON no es válido. Revisa comillas, llaves y comas finales.");
      return;
    }

    const validation = normalizeProgrammingSessionInput(parsed);

    if (!validation.ok) {
      setImportError(validation.error);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/programming-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.value),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "No se pudo importar la programación.");
      }

      setSessions((current) => [body.programmingSession, ...current]);
      setImportMessage("Programación importada correctamente.");
      setIsImporterOpen(false);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "No se pudo importar la programación.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteSession(session: ProgrammingSession) {
    if (!window.confirm("¿Eliminar esta programación? Esta acción no crea ni borra entrenamientos reales.")) {
      return;
    }

    setDeletingSessionId(session.id);
    setLoadError(null);
    setImportMessage(null);

    try {
      const response = await fetch(`/api/programming-sessions/${session.id}`, {
        method: "DELETE",
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "No se pudo eliminar la programación.");
      }

      setSessions((current) => current.filter((item) => item.id !== session.id));
      setImportMessage("Programación eliminada correctamente.");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "No se pudo eliminar la programación.");
    } finally {
      setDeletingSessionId(null);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Programaciones"
        title="Programaciones"
        description="Sesiones propuestas para ejecutar por bloques."
        action={
          <button
            type="button"
            onClick={() => setIsImporterOpen((value) => !value)}
            className="inline-flex rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
          >
            Importar JSON
          </button>
        }
      />

      {loadError ? (
        <Card className="mb-5 border-[rgba(240,196,107,0.32)]">
          <p className="text-sm font-semibold text-[var(--warning)]">{loadError}</p>
        </Card>
      ) : null}

      {importMessage ? (
        <p className="mb-5 rounded-md border border-[var(--accent-border)] bg-[var(--accent-soft)] p-3 text-sm font-semibold text-[var(--accent-strong)]">
          {importMessage}
        </p>
      ) : null}

      {isImporterOpen ? (
        <Card className="mb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-black">Importar programación JSON</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Pega una sesión programada. Se valida antes de guardar.</p>
            </div>
            <button
              type="button"
              onClick={() => setJsonValue(emptyJson)}
              className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-xs font-bold text-[var(--muted-strong)] transition hover:border-[var(--accent-border)] hover:text-[var(--foreground)]"
            >
              Restaurar ejemplo
            </button>
          </div>
          <label className="mt-4 block text-sm font-semibold">
            JSON de sesión
            <textarea
              value={jsonValue}
              onChange={(event) => setJsonValue(event.target.value)}
              rows={18}
              spellCheck={false}
              className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 font-mono text-xs leading-5 text-[var(--code-text)] outline-none transition focus:border-[var(--accent-border-strong)]"
            />
          </label>
          {importError ? (
            <p className="mt-3 rounded-md border border-[rgba(240,196,107,0.32)] bg-[var(--warning-soft)] p-3 text-sm font-semibold text-[var(--warning)]">
              {importError}
            </p>
          ) : null}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleImport}
              disabled={isSaving}
              className="rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Guardando..." : "Validar y guardar"}
            </button>
            <button
              type="button"
              onClick={() => setIsImporterOpen(false)}
              className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
            >
              Cancelar
            </button>
          </div>
        </Card>
      ) : null}

      {isLoading ? (
        <Card>
          <p className="text-lg font-semibold">Cargando programaciones.</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Consultando Supabase y preparando próximas sesiones.</p>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Próximas sesiones</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Pendientes o en curso desde hoy.</p>
              </div>
              <Badge tone="accent">{upcomingSessions.length}</Badge>
            </div>
            <div className="grid gap-3">
              {upcomingSessions.length > 0 ? upcomingSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isDeleting={deletingSessionId === session.id}
                  onDelete={handleDeleteSession}
                />
              )) : (
                <EmptyState>No hay sesiones programadas próximas. Importa una sesión JSON para empezar.</EmptyState>
              )}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Recientes</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Completadas, saltadas o fechas pasadas.</p>
              </div>
              <Badge>{recentSessions.length}</Badge>
            </div>
            <div className="grid gap-3">
              {recentSessions.length > 0 ? recentSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isDeleting={deletingSessionId === session.id}
                  onDelete={handleDeleteSession}
                />
              )) : (
                <EmptyState>Cuando completes, saltes o dejes atrás una programación aparecerá aquí.</EmptyState>
              )}
            </div>
          </section>
        </div>
      )}

      {!isLoading && sessions.length > 0 ? (
        <p className="mt-6 text-xs font-semibold text-[var(--muted)]">
          Última carga: {formatProgrammingDate(getTodayKey())}. Esta vista no crea entrenamientos reales.
        </p>
      ) : null}
    </>
  );
}
