export type CalendarHeatmapDay = {
  date: string;
  label: string;
  sessions: number;
  durationMinutes: number;
  fatigueCost: number;
  level: 0 | 1 | 2 | 3 | 4;
};

function getLevelClass(level: CalendarHeatmapDay["level"]) {
  return {
    0: "bg-[rgba(244,247,244,0.035)]",
    1: "bg-[rgba(106,245,202,0.24)]",
    2: "bg-[rgba(106,245,202,0.42)]",
    3: "bg-[rgba(240,196,107,0.58)]",
    4: "bg-[rgba(255,138,138,0.68)]",
  }[level];
}

export function CalendarHeatmap({
  data,
  emptyLabel = "Sin sesiones registradas en el rango.",
}: {
  data: CalendarHeatmapDay[];
  emptyLabel?: string;
}) {
  if (data.length === 0 || data.every((day) => day.sessions === 0)) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed border-[var(--line-strong)] bg-[rgba(244,247,244,0.025)] p-4 text-sm font-semibold text-[var(--muted)]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.018)] p-3 [scrollbar-width:thin]">
        {data.map((day) => (
          <span
            key={day.date}
            aria-label={`${day.date}: ${day.sessions} sesiones, ${day.durationMinutes} min, fatiga ${day.fatigueCost}`}
            className={`h-4 w-4 rounded-sm border border-[rgba(244,247,244,0.08)] sm:h-5 sm:w-5 ${getLevelClass(day.level)}`}
            title={`${day.label}: ${day.sessions} sesiones · ${day.durationMinutes} min · fatiga ${day.fatigueCost}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--muted)]">
        <span>Baja</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={`h-3 w-3 rounded-sm border border-[rgba(244,247,244,0.08)] ${getLevelClass(level as CalendarHeatmapDay["level"])}`} />
        ))}
        <span>Alta</span>
      </div>
    </div>
  );
}
