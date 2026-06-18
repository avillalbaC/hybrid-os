import { TrainingCalendarDayCell } from "@/components/calendar/training-calendar-day-cell";
import type { CalendarDay } from "@/types/calendar";

const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

export function TrainingCalendarGrid({
  days,
  onSelectDate,
}: {
  days: CalendarDay[];
  onSelectDate: (date: string) => void;
}) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-3">
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {weekDays.map((day) => (
          <div key={day} className="px-1 py-2 text-center text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--muted)]">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <TrainingCalendarDayCell key={day.date} day={day} onSelect={onSelectDate} />
        ))}
      </div>
    </section>
  );
}
