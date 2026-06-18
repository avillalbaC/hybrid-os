import { getChartToneClass, getMaxValue, hasChartData, type ChartTone } from "@/components/charts/chart-utils";

export type WeeklyBarPoint = {
  key: string;
  label: string;
  metaLabel?: string;
  isCurrentWeek?: boolean;
  value: number;
};

export function WeeklyBarChart({
  data,
  emptyLabel = "Sin datos suficientes",
  formatter,
  compact = false,
  tone = "accent",
}: {
  data: WeeklyBarPoint[];
  emptyLabel?: string;
  formatter: (value: number) => string;
  compact?: boolean;
  tone?: ChartTone;
}) {
  if (data.length === 0 || !hasChartData(data.map((item) => item.value))) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed border-[var(--line-strong)] bg-[rgba(244,247,244,0.025)] p-4 text-sm font-semibold text-[var(--muted)]">
        {emptyLabel}
      </div>
    );
  }

  const maxValue = getMaxValue(data.map((item) => item.value));

  return (
    <div className="min-w-0">
      <div className={`flex ${compact ? "h-24" : "h-36"} items-end gap-2 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.018)] p-3`}>
        {data.map((item) => {
          const height = Math.max(7, Math.round((item.value / maxValue) * 100));
          const displayLabel = item.label;
          const metaLabel = item.metaLabel ? ` · ${item.metaLabel}` : "";
          const title = `${item.isCurrentWeek ? "Esta semana · " : ""}${displayLabel}${metaLabel}: ${formatter(item.value)}`;

          return (
            <div key={item.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div className="flex h-full w-full items-end justify-center">
                <span
                  title={title}
                  className={`block w-full max-w-10 rounded-sm border ${item.isCurrentWeek ? "border-[var(--accent-border-strong)] ring-1 ring-[var(--accent)]" : "border-[rgba(244,247,244,0.08)]"} ${getChartToneClass(tone)}`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className={`w-full truncate text-center text-[0.62rem] font-bold ${item.isCurrentWeek ? "text-[var(--accent-strong)]" : "text-[var(--muted)]"}`}>
                {displayLabel}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
        {data.slice(-2).map((item) => (
          <span key={item.key} className="font-semibold">
            {item.isCurrentWeek ? "Actual · " : ""}{item.label}{item.metaLabel ? ` · ${item.metaLabel}` : ""}: {formatter(item.value)}
          </span>
        ))}
      </div>
    </div>
  );
}
