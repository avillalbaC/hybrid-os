import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import type { PlannedSession, WeeklyPlanSummary } from "@/types/planning";

function getNextPlannedSession(plannedSessions: PlannedSession[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return plannedSessions
    .filter((session) => session.status === "planned" && new Date(`${session.plannedDate}T00:00:00`).getTime() >= today.getTime())
    .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))[0] ?? null;
}

export function WeeklyPlanCard({
  plannedSessions,
  summary,
  isLoading,
  compact = false,
}: {
  plannedSessions: PlannedSession[];
  summary: WeeklyPlanSummary;
  isLoading?: boolean;
  compact?: boolean;
}) {
  const nextPlannedSession = getNextPlannedSession(plannedSessions);
  const pendingSessions = plannedSessions.filter((session) => session.status === "planned").length;

  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Plan de la semana</p>
          <h3 className={`${compact ? "text-xl" : "text-2xl"} mt-2 font-black tracking-tight`}>
            {summary.adherencePercentage === null ? "Sin adherencia todavía" : `${summary.adherencePercentage}% de adherencia`}
          </h3>
        </div>
        <Link href="/goals" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Ver plan
        </Link>
      </div>
      {isLoading ? (
        <div className="mt-4">
          <SkeletonText lines={3} />
        </div>
      ) : (
        <>
          <dl className="mt-4 grid gap-2 sm:grid-cols-4">
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Planificadas</dt>
              <dd className="mt-1 font-mono text-xl font-black">{summary.plannedSessions}</dd>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Completadas</dt>
              <dd className="mt-1 font-mono text-xl font-black">{summary.completedPlannedSessions}</dd>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Pendientes</dt>
              <dd className="mt-1 font-mono text-xl font-black">{pendingSessions}</dd>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Extra</dt>
              <dd className="mt-1 font-mono text-xl font-black">{summary.unplannedCompletedSessions}</dd>
            </div>
          </dl>
          {nextPlannedSession ? (
            <p className="mt-4 text-sm leading-6 text-[var(--muted-strong)]">
              Próximo: <span className="font-semibold text-[var(--foreground)]">{nextPlannedSession.title}</span> · {nextPlannedSession.plannedDate}
            </p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Sin próxima sesión planificada pendiente esta semana.</p>
          )}
          {summary.deviations[0] ? (
            <p className="mt-3 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-3 text-sm leading-6 text-[var(--muted-strong)]">
              <span className="font-semibold text-[var(--foreground)]">{summary.deviations[0].title}:</span> {summary.deviations[0].description}
            </p>
          ) : null}
        </>
      )}
      {isLoading ? <SkeletonBlock className="mt-4 h-16" /> : null}
    </Card>
  );
}
