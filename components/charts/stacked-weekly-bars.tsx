import { clampPercent, hasChartData, type ChartTone } from "@/components/charts/chart-utils";

export type StackedWeeklySegment = {
  key: string;
  label: string;
  value: number;
  tone?: ChartTone;
};

export type StackedWeeklyPoint = {
  key: string;
  label: string;
  metaLabel?: string;
  isCurrentWeek?: boolean;
  segments: StackedWeeklySegment[];
};

function getSegmentClass(tone: ChartTone = "accent") {
  return {
    accent: "bg-[linear-gradient(180deg,var(--accent),var(--accent-strong))]",
    secondary: "bg-[linear-gradient(180deg,var(--accent-secondary),var(--accent-secondary-text))]",
    warning: "bg-[rgba(240,196,107,0.82)]",
    danger: "bg-[rgba(255,138,138,0.74)]",
    neutral: "bg-[rgba(244,247,244,0.34)]",
  }[tone];
}

function getPointTotal(point: StackedWeeklyPoint) {
  return point.segments.reduce((total, segment) => total + Math.max(0, segment.value), 0);
}

export function StackedWeeklyBars({
  compact = false,
  data,
  emptyLabel = "Sin datos suficientes",
  formatter,
}: {
  compact?: boolean;
  data: StackedWeeklyPoint[];
  emptyLabel?: string;
  formatter: (value: number) => string;
}) {
  const totals = data.map(getPointTotal);

  if (data.length === 0 || !hasChartData(totals)) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed border-[var(--line-strong)] bg-[rgba(244,247,244,0.025)] p-4 text-sm font-semibold text-[var(--muted)]">
        {emptyLabel}
      </div>
    );
  }

  const maxValue = Math.max(...totals, 1);
  const legend = data
    .flatMap((point) => point.segments)
    .filter((segment) => segment.value > 0)
    .filter((segment, index, segments) => segments.findIndex((item) => item.key === segment.key) === index);

  return (
    <div>
      <div className={`flex ${compact ? "h-24" : "h-40"} items-end gap-2 overflow-hidden rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.018)] p-3`}>
        {data.map((point) => {
          const total = getPointTotal(point);
          const height = Math.max(8, Math.round((total / maxValue) * 100));
          const title = `${point.isCurrentWeek ? "Esta semana · " : ""}${point.label}${point.metaLabel ? ` · ${point.metaLabel}` : ""}: ${formatter(total)} · ${point.segments
            .filter((segment) => segment.value > 0)
            .map((segment) => `${segment.label} ${formatter(segment.value)}`)
            .join(" · ")}`;

          return (
            <div key={point.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div
                className={`flex w-full max-w-10 flex-col-reverse overflow-hidden rounded-sm border bg-[rgba(244,247,244,0.05)] ${point.isCurrentWeek ? "border-[var(--accent-border-strong)] ring-1 ring-[var(--accent)]" : "border-[rgba(244,247,244,0.1)]"}`}
                style={{ height: `${height}%` }}
                title={title}
              >
                {point.segments.filter((segment) => segment.value > 0).map((segment) => (
                  <span
                    key={segment.key}
                    className={`block ${getSegmentClass(segment.tone)}`}
                    style={{ height: `${clampPercent((segment.value / total) * 100)}%` }}
                  />
                ))}
              </div>
              <span className={`w-full truncate text-center text-[0.62rem] font-bold ${point.isCurrentWeek ? "text-[var(--accent-strong)]" : "text-[var(--muted)]"}`}>
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-[var(--muted)]">
        {legend.map((segment) => (
          <span key={segment.key} className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-sm ${getSegmentClass(segment.tone)}`} />
            {segment.label}
          </span>
        ))}
      </div>
    </div>
  );
}
