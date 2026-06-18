"use client";

import { Badge } from "@/components/ui/badge";
import { formatDuration, formatKm } from "@/lib/utils/format";
import type { PlannedSession, PlannedSessionStatus } from "@/types/planning";
import { plannedSessionPriorityLabels, plannedSessionStatusLabels, plannedSessionTypeLabels } from "./planning-labels";

function getStatusTone(status: PlannedSessionStatus) {
  if (status === "completed") {
    return "accent" as const;
  }

  if (status === "skipped" || status === "cancelled") {
    return "warning" as const;
  }

  return "neutral" as const;
}

export function PlannedSessionCard({
  plannedSession,
  hasRealSession,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  plannedSession: PlannedSession;
  hasRealSession?: boolean;
  onEdit?: (plannedSession: PlannedSession) => void;
  onStatusChange?: (plannedSession: PlannedSession, status: PlannedSessionStatus) => void;
  onDelete?: (plannedSession: PlannedSession) => void;
}) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={getStatusTone(plannedSession.status)}>{plannedSessionStatusLabels[plannedSession.status]}</Badge>
            <Badge>{plannedSessionTypeLabels[plannedSession.type]}</Badge>
            {plannedSession.priority === "high" ? <Badge tone="warning">Prioridad alta</Badge> : null}
            {hasRealSession ? <Badge tone="accent">Realizada</Badge> : null}
          </div>
          <h4 className="mt-3 text-sm font-black text-[var(--foreground)]">{plannedSession.title}</h4>
          <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
            {plannedSessionPriorityLabels[plannedSession.priority]} · {plannedSession.plannedDate}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[var(--muted-strong)]">
        {plannedSession.plannedDurationMinutes !== null ? <span>{formatDuration(plannedSession.plannedDurationMinutes)}</span> : null}
        {plannedSession.plannedDistanceMeters !== null ? <span>{formatKm(plannedSession.plannedDistanceMeters, { forceKm: true })}</span> : null}
        {plannedSession.plannedRpe !== null ? <span>RPE {plannedSession.plannedRpe}/10</span> : null}
        {plannedSession.focus.length > 0 ? <span>{plannedSession.focus.join(" · ")}</span> : null}
      </div>
      {plannedSession.notes ? <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{plannedSession.notes}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {plannedSession.status !== "completed" ? (
          <button
            type="button"
            onClick={() => onStatusChange?.(plannedSession, "completed")}
            className="rounded-md border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-2 text-xs font-black text-[var(--accent-strong)] transition hover:bg-[var(--accent-faint)]"
          >
            Completar
          </button>
        ) : null}
        {plannedSession.status !== "skipped" ? (
          <button
            type="button"
            onClick={() => onStatusChange?.(plannedSession, "skipped")}
            className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-3 py-2 text-xs font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
          >
            Saltar
          </button>
        ) : null}
        {plannedSession.status !== "cancelled" ? (
          <button
            type="button"
            onClick={() => onStatusChange?.(plannedSession, "cancelled")}
            className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-3 py-2 text-xs font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
          >
            Cancelar
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onEdit?.(plannedSession)}
          className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-3 py-2 text-xs font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(plannedSession)}
          className="rounded-md border border-[rgba(255,110,110,0.26)] bg-[rgba(255,110,110,0.06)] px-3 py-2 text-xs font-bold text-[#ff9b9b] transition hover:border-[rgba(255,110,110,0.42)]"
        >
          Borrar
        </button>
      </div>
    </div>
  );
}
