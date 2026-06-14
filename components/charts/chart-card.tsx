import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SkeletonBlock } from "@/components/ui/skeleton";

type ChartStatus = {
  label: string;
  tone?: "accent" | "warning" | "neutral";
};

type ChartMetaItem = {
  label: string;
  value: string;
};

export function ChartCard({
  children,
  className = "",
  compact = false,
  currentValue,
  description,
  emptyLabel = "Sin datos suficientes",
  footer,
  isEmpty,
  isLoading,
  meta,
  status,
  title,
  unit,
}: {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  currentValue?: string;
  description?: string;
  emptyLabel?: string;
  footer?: React.ReactNode;
  isEmpty?: boolean;
  isLoading?: boolean;
  meta?: ChartMetaItem[];
  status?: ChartStatus;
  title: string;
  unit?: string;
}) {
  return (
    <Card className={`${compact ? "p-4" : ""} ${className}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-black tracking-tight text-[var(--foreground)]">{title}</h3>
          {description ? <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          {status ? <Badge tone={status.tone ?? "neutral"}>{status.label}</Badge> : null}
          {unit ? (
            <span className="inline-flex w-fit rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-2.5 py-1.5 font-mono text-xs font-black text-[var(--muted-strong)]">
              {unit}
            </span>
          ) : null}
        </div>
      </div>
      {currentValue || (meta && meta.length > 0) ? (
        <dl className={`mt-4 grid gap-2 ${meta && meta.length > 1 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {currentValue ? (
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Actual</dt>
              <dd className="mt-1 font-mono text-xl font-black text-[var(--foreground)]">{currentValue}</dd>
            </div>
          ) : null}
          {meta?.map((item) => (
            <div key={item.label} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{item.label}</dt>
              <dd className="mt-1 font-mono text-sm font-black text-[var(--foreground)]">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {isLoading ? (
        <div className="mt-5" aria-label={`${title}: calculando`}>
          <SkeletonBlock className={`${compact ? "h-28" : "h-36"} w-full`} />
        </div>
      ) : isEmpty ? (
        <div className="mt-5 flex min-h-28 items-center justify-center rounded-md border border-dashed border-[var(--line-strong)] bg-[rgba(244,247,244,0.025)] p-4 text-sm font-semibold text-[var(--muted)]">
          {emptyLabel}
        </div>
      ) : (
        <div className={compact ? "mt-4" : "mt-5"}>{children}</div>
      )}
      {!isLoading && footer ? <div className="mt-4 text-sm leading-6 text-[var(--muted-strong)]">{footer}</div> : null}
    </Card>
  );
}
