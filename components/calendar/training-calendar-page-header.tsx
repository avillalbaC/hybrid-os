import { PageHeader } from "@/components/ui/page-header";

export function TrainingCalendarPageHeader({
  monthLabel,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: {
  monthLabel: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}) {
  return (
    <PageHeader
      eyebrow="Calendario"
      title="Calendario"
      description="Tu referencia visual de sesiones, consistencia y adherencia."
      action={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPreviousMonth}
            aria-label="Mes anterior"
            className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 font-mono text-sm font-black text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
          >
            &lt;
          </button>
          <div className="min-w-[11rem] rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-3 py-2 text-center text-sm font-black capitalize text-[var(--foreground)]">
            {monthLabel}
          </div>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Mes siguiente"
            className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 font-mono text-sm font-black text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
          >
            &gt;
          </button>
          <button
            type="button"
            onClick={onToday}
            className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
          >
            Hoy
          </button>
        </div>
      }
    />
  );
}
