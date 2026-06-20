import { DisciplineBadge } from "@/components/calendar/discipline-badge";
import { getCalendarDayActivityVisual } from "@/lib/calendar/day-activity-style";
import type { CalendarDay, CalendarDayIntensity } from "@/types/calendar";

const intensityClass: Record<CalendarDayIntensity, string> = {
  none: "border-[var(--line)] bg-[rgba(244,247,244,0.014)]",
  low: "border-emerald-300/18 bg-emerald-300/[0.035]",
  moderate: "border-cyan-300/22 bg-cyan-300/[0.045]",
  high: "border-amber-300/28 bg-amber-300/[0.07]",
  very_high: "border-orange-300/36 bg-orange-300/[0.09]",
};

const intensityDotClass: Record<CalendarDayIntensity, string> = {
  none: "bg-[var(--line-strong)]",
  low: "bg-emerald-300",
  moderate: "bg-cyan-300",
  high: "bg-amber-300",
  very_high: "bg-orange-300",
};

export function TrainingCalendarDayCell({
  day,
  onSelect,
}: {
  day: CalendarDay;
  onSelect: (date: string) => void;
}) {
  const visibleDisciplines = day.disciplines.slice(0, 3);
  const hiddenDisciplines = Math.max(day.disciplines.length - visibleDisciplines.length, 0);
  const activityVisual = getCalendarDayActivityVisual(day);
  const buttonStyle = activityVisual.borderColor && !day.isSelected
    ? { borderColor: activityVisual.borderColor }
    : undefined;

  return (
    <button
      type="button"
      onClick={() => onSelect(day.date)}
      aria-pressed={day.isSelected}
      aria-label={`${day.date}${day.hasTraining ? `, ${day.sessions.length} sesiones` : ", sin entrenamiento"}${
        activityVisual.label ? `, ${activityVisual.label}` : ""
      }`}
      title={activityVisual.label ?? undefined}
      style={buttonStyle}
      className={`relative min-h-[6.2rem] overflow-hidden rounded-md border p-2 text-left transition hover:border-[var(--accent-border)] hover:bg-[var(--accent-faint)] focus-visible:border-[var(--accent-border-strong)] sm:min-h-[7.3rem] ${
        intensityClass[day.intensity]
      } ${day.isCurrentMonth ? "" : "opacity-45"} ${
        day.isToday ? "ring-1 ring-[var(--accent-border-strong)]" : ""
      } ${day.isSelected ? "border-[var(--accent-border-strong)] bg-[var(--accent-soft)] shadow-[inset_0_0_0_1px_var(--accent-border)]" : ""}`}
    >
      {activityVisual.backgroundStyle ? (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition ${day.isSelected ? "opacity-80" : "opacity-100"}`}
          style={activityVisual.backgroundStyle}
        />
      ) : null}

      <div className="relative z-10 flex items-start justify-between gap-2">
        <span className={`font-mono text-sm font-black ${day.isToday ? "text-[var(--accent-strong)]" : "text-[var(--foreground)]"}`}>
          {day.dayOfMonth}
        </span>
        <span className={`mt-1 size-2 rounded-full ${intensityDotClass[day.intensity]}`} />
      </div>

      <div className="relative z-10 mt-2 flex min-h-[1.4rem] flex-wrap gap-1">
        {visibleDisciplines.map((discipline) => (
          <DisciplineBadge key={discipline} discipline={discipline} compact />
        ))}
        {hiddenDisciplines > 0 ? (
          <span className="inline-flex items-center rounded border border-[var(--line)] bg-[rgba(244,247,244,0.04)] px-1.5 py-0.5 font-mono text-[0.52rem] font-black text-[var(--muted-strong)]">
            +{hiddenDisciplines}
          </span>
        ) : null}
      </div>

      <div className="relative z-10 mt-2 flex flex-wrap items-center gap-1.5 text-[0.64rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-strong)]">
        {day.sessions.length > 1 ? <span>{day.sessions.length} sesiones</span> : null}
        {day.mobilityDone ? <span className="text-orange-100">MOB</span> : null}
        {day.totalRunMeters > 0 ? <span>{(day.totalRunMeters / 1000).toFixed(1)} km</span> : null}
      </div>
    </button>
  );
}
