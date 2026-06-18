import { hasChartData } from "@/components/charts/chart-utils";

export type StackedRunPoint = {
  key: string;
  label: string;
  metaLabel?: string;
  isCurrentWeek?: boolean;
  structuredRunMeters: number;
  mixedRunMeters: number;
};

export function StackedRunBars({
  data,
  emptyLabel = "Sin datos suficientes",
  formatter,
  compact = false,
}: {
  data: StackedRunPoint[];
  emptyLabel?: string;
  formatter: (value: number) => string;
  compact?: boolean;
}) {
  const totals = data.map((item) => item.structuredRunMeters + item.mixedRunMeters);

  if (data.length === 0 || !hasChartData(totals)) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed border-[var(--line-strong)] bg-[rgba(244,247,244,0.025)] p-4 text-sm font-semibold text-[var(--muted)]">
        {emptyLabel}
      </div>
    );
  }

  const maxValue = Math.max(...totals, 1);

  return (
    <div>
      <div className={`flex ${compact ? "h-24" : "h-36"} items-end gap-2 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.018)] p-3`}>
        {data.map((item) => {
          const total = item.structuredRunMeters + item.mixedRunMeters;
          const height = Math.max(8, Math.round((total / maxValue) * 100));
          const structuredPercent = total > 0 ? (item.structuredRunMeters / total) * 100 : 0;
          const mixedPercent = 100 - structuredPercent;
          const title = `${item.isCurrentWeek ? "Esta semana · " : ""}${item.label}${item.metaLabel ? ` · ${item.metaLabel}` : ""}: ${formatter(total)} · ${formatter(item.structuredRunMeters)} running · ${formatter(item.mixedRunMeters)} mixto`;

          return (
            <div key={item.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div
                className={`flex w-full max-w-10 flex-col-reverse overflow-hidden rounded-sm border bg-[rgba(244,247,244,0.05)] ${item.isCurrentWeek ? "border-[var(--accent-border-strong)] ring-1 ring-[var(--accent)]" : "border-[rgba(244,247,244,0.1)]"}`}
                style={{ height: `${height}%` }}
                title={title}
              >
                <span className="block bg-[linear-gradient(180deg,var(--accent),var(--accent-strong))]" style={{ height: `${structuredPercent}%` }} />
                <span className="block bg-[rgba(240,196,107,0.78)]" style={{ height: `${mixedPercent}%` }} />
              </div>
              <span className={`w-full truncate text-center text-[0.62rem] font-bold ${item.isCurrentWeek ? "text-[var(--accent-strong)]" : "text-[var(--muted)]"}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[var(--accent)]" /> Running estructurado</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[rgba(240,196,107,0.78)]" /> Carrera mixta</span>
      </div>
    </div>
  );
}
