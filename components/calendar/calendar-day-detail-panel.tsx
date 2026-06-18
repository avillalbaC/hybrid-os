import Link from "next/link";
import { Card } from "@/components/ui/card";
import { DisciplineBadge } from "@/components/calendar/discipline-badge";
import { formatDayShort } from "@/lib/date/local-date";
import { formatDuration, formatKm, formatRpe } from "@/lib/utils/format";
import type { CalendarDay } from "@/types/calendar";

const intensityLabels: Record<CalendarDay["intensity"], string> = {
  none: "Sin carga",
  low: "Suave",
  moderate: "Moderada",
  high: "Alta",
  very_high: "Muy alta",
};

export function CalendarDayDetailPanel({ day }: { day: CalendarDay | null }) {
  if (!day) {
    return (
      <Card>
        <p className="text-sm font-semibold text-[var(--foreground)]">Selecciona un día.</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">El detalle aparecerá aquí sin permitir edición desde el calendario.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Día seleccionado</p>
          <h3 className="mt-2 text-2xl font-black capitalize tracking-tight">{formatDayShort(day.date)}</h3>
        </div>
        <span className="inline-flex w-fit rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-2.5 py-1.5 font-mono text-xs font-black uppercase text-[var(--muted-strong)]">
          {intensityLabels[day.intensity]}
        </span>
      </div>

      <dl className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Duración</dt>
          <dd className="mt-1 font-mono text-lg font-black">{formatDuration(day.totalDurationMinutes, { emptyLabel: "0 min" })}</dd>
        </div>
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">RPE medio</dt>
          <dd className="mt-1 font-mono text-lg font-black">{formatRpe(day.averageRpe)}</dd>
        </div>
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Carrera</dt>
          <dd className="mt-1 font-mono text-lg font-black">{formatKm(day.totalRunMeters, { forceKm: true })}</dd>
        </div>
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Prioridades</dt>
          <dd className="mt-1 font-mono text-lg font-black">{day.prioritiesCompleted}/{day.prioritiesTotal}</dd>
        </div>
      </dl>

      <div className="mt-4 space-y-3">
        {day.sessions.length > 0 ? (
          day.sessions.map((session) => (
            <article key={session.id} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <DisciplineBadge discipline={session.type} />
                <Link href={`/training/${session.id}`} className="font-bold text-[var(--foreground)] transition hover:text-[var(--accent-strong)]">
                  {session.title}
                </Link>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">
                {formatDuration(session.durationMinutes)} · RPE {session.rpe ?? "-"} · {formatKm(session.runningDistanceMeters, { forceKm: true })}
              </p>
              {session.resultLabel ? <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{session.resultLabel}</p> : null}
            </article>
          ))
        ) : day.mobilityDone ? (
          <p className="rounded-md border border-lime-300/20 bg-lime-300/10 p-3 text-sm leading-6 text-lime-100">
            Movilidad registrada{day.mobilityMinutes ? ` · ${day.mobilityMinutes} min` : ""}.
          </p>
        ) : (
          <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm leading-6 text-[var(--muted)]">
            Sin entrenamiento registrado.
          </p>
        )}
      </div>

      {day.dailyNote ? (
        <div className="mt-4 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Nota rápida</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">{day.dailyNote}</p>
        </div>
      ) : null}
    </Card>
  );
}
