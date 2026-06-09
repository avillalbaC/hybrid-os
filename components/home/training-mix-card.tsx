import { Card } from "@/components/ui/card";
import { SkeletonBlock } from "@/components/ui/skeleton";
import Link from "next/link";
import type { TrainingMixRow, TrainingMixTrend } from "@/lib/domain/training/training-mix";

const trendLabels: Record<TrainingMixTrend, string> = {
  above: "Sobre ritmo",
  below: "Bajo ritmo",
  range: "En ritmo",
};

const trendClasses: Record<TrainingMixTrend, string> = {
  above: "border-[var(--accent-secondary-border)] bg-[var(--accent-secondary-soft)] text-[var(--accent-secondary-text)]",
  below: "border-[rgba(240,196,107,0.34)] bg-[var(--warning-soft)] text-[var(--warning)]",
  range: "border-[var(--line)] bg-[rgba(244,247,244,0.04)] text-[var(--muted-strong)]",
};

function getBarWidth(row: TrainingMixRow) {
  const baseline = Math.max(row.monthWeeklyAverage, row.yearWeeklyAverage, 1);
  return `${Math.min(100, Math.round((row.weekSessions / baseline) * 100))}%`;
}

function formatAverage(value: number) {
  return value.toFixed(1);
}

export function TrainingMixCard({
  rows,
  density = "detailed",
  actionHref,
  actionLabel = "Ver detalle",
  state = "ready",
}: {
  rows: TrainingMixRow[];
  density?: "compact" | "detailed";
  actionHref?: string;
  actionLabel?: string;
  state?: "loading" | "ready" | "empty";
}) {
  const isCompact = density === "compact";
  const visibleRows = isCompact ? rows.slice(0, 6) : rows;

  return (
    <Card className={isCompact ? "p-4" : ""}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Training Mix</p>
          <h3 className={`mt-2 font-black tracking-tight ${isCompact ? "text-xl" : "text-2xl"}`}>Resumen semanal</h3>
        </div>
        {actionHref ? (
          <Link href={actionHref} className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
            {actionLabel}
          </Link>
        ) : (
          <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
            Sesiones de la semana actual frente al ritmo esperado para el día.
          </p>
        )}
      </div>

      {state === "loading" ? (
        <div className={`mt-5 grid gap-3 ${isCompact ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`} aria-label="Training Mix calculando">
          {Array.from({ length: isCompact ? 4 : 6 }).map((_, index) => (
            <div key={index} className={`rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] ${isCompact ? "p-3" : "p-4"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="w-full">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="mt-2 h-3 w-20" />
                </div>
                <SkeletonBlock className="h-7 w-20 shrink-0" />
              </div>
              <SkeletonBlock className="mt-4 h-8 w-16" />
              <SkeletonBlock className="mt-4 h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : state === "empty" || visibleRows.length === 0 ? (
        <div className="mt-5 rounded-md border border-dashed border-[var(--line-strong)] bg-[rgba(244,247,244,0.025)] p-5 text-sm leading-6 text-[var(--muted)]">
          Sin sesiones en este periodo.
        </div>
      ) : (
      <div className={`mt-5 grid gap-3 ${isCompact ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>
        {visibleRows.map((row) => (
          <article key={row.modality} className={`rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] ${isCompact ? "p-3" : "p-4"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-black tracking-tight text-[var(--foreground)]">{row.label}</h4>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Esta semana</p>
              </div>
              <span className={`shrink-0 rounded-md border px-2 py-1 text-xs font-black ${trendClasses[row.trend]}`}>
                {trendLabels[row.trend]}
              </span>
            </div>

            <div className="mt-4 flex items-end gap-3">
              <p className={`font-mono font-black leading-none text-[var(--foreground)] ${isCompact ? "text-3xl" : "text-4xl"}`}>{row.weekSessions}</p>
              <p className="pb-1 text-sm font-semibold text-[var(--muted)]">sesiones</p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(244,247,244,0.08)]">
              <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: getBarWidth(row) }} />
            </div>

            {isCompact ? null : (
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md border border-[var(--line)] p-2">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Ritmo esperado</p>
                  <p className="mt-1 font-mono font-black">{row.expectedWeekSessions === null ? "Sin referencia" : formatAverage(row.expectedWeekSessions)}</p>
                </div>
                <div className="rounded-md border border-[var(--line)] p-2">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Referencia</p>
                  <p className="mt-1 font-mono font-black">{formatAverage(Math.max(row.monthWeeklyAverage, row.yearWeeklyAverage))}</p>
                </div>
              </div>
            )}
            <p className="mt-3 text-xs font-semibold text-[var(--muted-strong)]">{row.paceLabel}</p>
          </article>
        ))}
      </div>
      )}
    </Card>
  );
}
