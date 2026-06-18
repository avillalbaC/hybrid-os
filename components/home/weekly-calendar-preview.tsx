import Link from "next/link";
import { DisciplineBadge } from "@/components/calendar/discipline-badge";
import { Card } from "@/components/ui/card";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { formatDuration, formatKm } from "@/lib/utils/format";
import type { CalendarDay } from "@/types/calendar";

const weekDayLabels = ["L", "M", "X", "J", "V", "S", "D"];

const intensityClass: Record<CalendarDay["intensity"], string> = {
  none: "border-[var(--line)] bg-[rgba(244,247,244,0.018)]",
  low: "border-emerald-300/18 bg-emerald-300/[0.035]",
  moderate: "border-cyan-300/22 bg-cyan-300/[0.045]",
  high: "border-amber-300/28 bg-amber-300/[0.07]",
  very_high: "border-orange-300/36 bg-orange-300/[0.09]",
};

function WeeklyDayPreview({ day }: { day: CalendarDay }) {
  const visibleDisciplines = day.disciplines.slice(0, 2);
  const hiddenDisciplines = Math.max(day.disciplines.length - visibleDisciplines.length, 0);

  return (
    <Link
      href={`/calendar?date=${day.date}`}
      aria-label={`${day.date}${day.hasTraining ? `, ${day.sessions.length} sesiones` : ", sin entrenamiento"}`}
      className={`min-h-[5.7rem] rounded-md border p-2 transition hover:border-[var(--accent-border)] hover:bg-[var(--accent-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
        intensityClass[day.intensity]
      } ${day.isToday ? "ring-1 ring-[var(--accent-border-strong)]" : ""}`}
    >
      <div className="flex items-start justify-between gap-1">
        <span className={`font-mono text-sm font-black ${day.isToday ? "text-[var(--accent-strong)]" : "text-[var(--foreground)]"}`}>
          {day.dayOfMonth}
        </span>
        {day.sessions.length > 1 ? (
          <span className="rounded border border-[var(--line)] px-1 font-mono text-[0.58rem] font-black text-[var(--muted-strong)]">
            {day.sessions.length}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex min-h-[1.2rem] flex-wrap gap-1">
        {visibleDisciplines.map((discipline) => (
          <DisciplineBadge key={discipline} discipline={discipline} compact />
        ))}
        {hiddenDisciplines > 0 ? (
          <span className="inline-flex items-center rounded border border-[var(--line)] bg-[rgba(244,247,244,0.04)] px-1 py-0.5 font-mono text-[0.5rem] font-black text-[var(--muted-strong)]">
            +{hiddenDisciplines}
          </span>
        ) : null}
      </div>

      <div className="mt-2 space-y-0.5 text-[0.62rem] font-bold uppercase tracking-[0.06em] text-[var(--muted)]">
        {day.mobilityDone ? <p className="text-lime-100">Movilidad</p> : null}
        {day.totalRunMeters > 0 ? <p>{formatKm(day.totalRunMeters, { forceKm: true })}</p> : null}
        {day.hasTraining && day.totalRunMeters <= 0 ? <p>{formatDuration(day.totalDurationMinutes, { compact: true, emptyLabel: "" })}</p> : null}
      </div>
    </Link>
  );
}

export function WeeklyCalendarPreview({
  days,
  weekLabel,
  isLoading,
  dailyEntriesError,
}: {
  days: CalendarDay[];
  weekLabel: string;
  isLoading?: boolean;
  dailyEntriesError?: string | null;
}) {
  const activeDays = days.filter((day) => day.hasTraining).length;
  const movementDays = days.filter((day) => day.hasMovement).length;
  const sessionsCount = days.reduce((total, day) => total + day.sessions.length, 0);

  return (
    <Card className="border-[rgba(34,211,238,0.16)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Esta semana</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Calendario semanal</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{weekLabel}</p>
        </div>
        <Link href="/calendar" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Ver calendario
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4 grid grid-cols-7 gap-1.5" aria-label="Calendario semanal cargando">
          {Array.from({ length: 7 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDayLabels.map((label) => (
              <div key={label} className="text-center text-[0.58rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                {label}
              </div>
            ))}
            {days.map((day) => (
              <WeeklyDayPreview key={day.date} day={day} />
            ))}
          </div>
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
            <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-2">
              <span className="font-mono font-black text-[var(--foreground)]">{activeDays}/7</span>{" "}
              <span className="text-[var(--muted)]">días entrenados</span>
            </p>
            <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-2">
              <span className="font-mono font-black text-[var(--foreground)]">{movementDays}/7</span>{" "}
              <span className="text-[var(--muted)]">días con movimiento</span>
            </p>
            <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-2">
              <span className="font-mono font-black text-[var(--foreground)]">{sessionsCount}</span>{" "}
              <span className="text-[var(--muted)]">sesiones</span>
            </p>
          </div>
        </>
      )}

      {dailyEntriesError ? (
        <p className="mt-3 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-3 text-sm text-[var(--warning)]">
          No se pudo cargar movilidad semanal. Se muestran las sesiones registradas.
        </p>
      ) : null}
    </Card>
  );
}
