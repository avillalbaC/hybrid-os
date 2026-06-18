import { Card } from "@/components/ui/card";
import { DisciplineBadge, disciplineConfig } from "@/components/calendar/discipline-badge";
import type { CalendarDiscipline, CalendarMonthSummary } from "@/types/calendar";

export function DisciplineMonthBreakdown({ summary }: { summary: CalendarMonthSummary }) {
  const rows = Object.entries(summary.disciplineCounts)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a) as Array<[CalendarDiscipline, number]>;
  const maxCount = Math.max(...rows.map(([, count]) => count), 1);

  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Distribución del mes</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Sesiones por disciplina</h3>
        </div>
        <p className="text-sm font-semibold text-[var(--muted)]">{summary.sessionsCount} sesiones</p>
      </div>

      <div className="mt-4 space-y-3">
        {rows.length > 0 ? rows.map(([discipline, count]) => (
          <div key={discipline}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <DisciplineBadge discipline={discipline} />
                <span className="text-sm font-bold text-[var(--foreground)]">{disciplineConfig[discipline].label}</span>
              </div>
              <span className="font-mono text-sm font-black text-[var(--muted-strong)]">{count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[rgba(244,247,244,0.06)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-secondary))]"
                style={{ width: `${Math.max(8, (count / maxCount) * 100)}%` }}
              />
            </div>
          </div>
        )) : (
          <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm leading-6 text-[var(--muted)]">
            Sin sesiones en este mes.
          </p>
        )}
      </div>
    </Card>
  );
}
