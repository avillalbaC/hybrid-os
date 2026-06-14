import { clampPercent, getChartToneClass, type ChartTone } from "@/components/charts/chart-utils";

export type RankingChartItem = {
  key: string;
  label: string;
  value: number;
  percentage?: number;
  detail?: string;
};

export function HorizontalRankingChart({
  emptyLabel = "Sin datos suficientes",
  formatter,
  items,
  tone = "accent",
}: {
  emptyLabel?: string;
  formatter: (value: number) => string;
  items: RankingChartItem[];
  tone?: ChartTone;
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);
  const visibleItems = items.filter((item) => item.value > 0);

  if (visibleItems.length === 0) {
    return (
      <div className="flex min-h-28 items-center justify-center rounded-md border border-dashed border-[var(--line-strong)] bg-[rgba(244,247,244,0.025)] p-4 text-sm font-semibold text-[var(--muted)]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleItems.map((item, index) => {
        const width = clampPercent(item.percentage ?? (item.value / maxValue) * 100);

        return (
          <div key={item.key}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-semibold text-[var(--foreground)]">
                <span className="mr-2 font-mono text-xs text-[var(--muted)]">{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </span>
              <span className="shrink-0 font-mono font-black text-[var(--accent-strong)]">{formatter(item.value)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full border border-[var(--line)] bg-[rgba(244,247,244,0.05)]">
              <span className={`block h-full rounded-full ${getChartToneClass(tone)}`} style={{ width: `${Math.max(5, width)}%` }} />
            </div>
            {item.detail ? <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.detail}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
