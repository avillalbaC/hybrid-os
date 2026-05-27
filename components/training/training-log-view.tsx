"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { TrainingSessionCard } from "@/components/training/training-session-card";
import { getSessionsByType } from "@/lib/selectors/training";
import { useTrainingSessions } from "@/lib/storage/use-training-sessions";
import { formatTrainingType } from "@/lib/utils/format";
import type { TrainingSession } from "@/types/training";

export function TrainingLogView({ seedSessions }: { seedSessions: TrainingSession[] }) {
  const { sessions, storedSessions, remoteSessions, syncMessage, source, deleteSession, exportBackup } = useTrainingSessions(seedSessions);
  const sessionsByType = getSessionsByType(sessions);
  const storedIds = new Set(storedSessions.map((session) => session.id));
  const remoteIds = new Set((remoteSessions ?? []).map((session) => session.id));
  const getSyncStatus = (session: TrainingSession) => {
    if (storedIds.has(session.id)) return "pending" as const;
    if (remoteIds.has(session.id)) return "remote" as const;
    return "seed" as const;
  };

  return (
    <>
      <PageHeader
        eyebrow="Training log"
        title="Entrenamientos"
        description="Histórico de sesiones híbridas con filtros visuales por tipo y acceso al detalle."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/training/import"
              className="inline-flex rounded-md border border-[rgba(56,217,159,0.34)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[#06100c] transition hover:bg-[var(--accent-strong)]"
            >
              Importar JSON
            </Link>
            <button
              type="button"
              onClick={exportBackup}
              className="inline-flex rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[rgba(56,217,159,0.34)]"
            >
              Exportar backup
            </button>
          </div>
        }
      />

      <section className="mb-5 flex flex-wrap gap-2" aria-label="Filtros visuales por tipo">
        <Badge tone="accent">Todos {sessions.length}</Badge>
        <Badge tone={source === "remote" ? "accent" : source === "local-fallback" ? "warning" : "neutral"}>
          {source === "remote" ? "Supabase activo" : source === "local-fallback" ? "modo local" : "sincronizando"}
        </Badge>
        {storedSessions.length > 0 ? <Badge>{storedSessions.length} locales</Badge> : null}
        {Object.entries(sessionsByType).map(([type, count]) => (
          <Badge key={type}>{formatTrainingType(type)} {count}</Badge>
        ))}
      </section>
      {syncMessage ? (
        <p className="mb-5 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-sm text-[var(--muted-strong)]">
          {syncMessage}
        </p>
      ) : null}
      {storedSessions.length > 0 ? (
        <section className="mb-5 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-4">
          <p className="text-sm font-semibold text-[var(--warning)]">Sesiones pendientes de sincronizar</p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--muted-strong)]">
            {storedSessions.map((session) => (
              <li key={session.id}>{session.date} · {session.title}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        {sessions.map((session) => (
          <TrainingSessionCard key={session.id} session={session} syncStatus={getSyncStatus(session)} onDelete={deleteSession} />
        ))}
      </section>
    </>
  );
}
