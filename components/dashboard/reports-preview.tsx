import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { getMonthlyReports, getWeeklyReports, type PeriodReport } from "@/lib/analytics/period-reports";
import { formatDuration, formatKm, formatRpe } from "@/lib/utils/format";
import type { TrainingSession } from "@/types/training";

function PreviewReport({ report }: { report: PeriodReport }) {
  return (
    <article className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={report.isClosed ? "accent" : "neutral"}>{report.isClosed ? "Cerrado" : "En curso"}</Badge>
        <Badge>{report.label}</Badge>
      </div>
      <h4 className="mt-3 text-lg font-black tracking-tight">{report.headline}</h4>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Sesiones</dt>
          <dd className="mt-1 font-mono font-black">{report.metrics.sessions}</dd>
        </div>
        <div>
          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Duración</dt>
          <dd className="mt-1 font-mono font-black">{formatDuration(report.metrics.durationMinutes, { emptyLabel: "0 min" })}</dd>
        </div>
        <div>
          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">RPE</dt>
          <dd className="mt-1 font-mono font-black">{formatRpe(report.metrics.averageRpe)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm leading-6 text-[var(--muted-strong)]">
        {formatKm(report.metrics.totalRunMeters, { forceKm: true })} carrera total. {report.conclusion}
      </p>
    </article>
  );
}

export function ReportsPreview({
  sessions,
  isLoading,
}: {
  sessions: TrainingSession[];
  isLoading?: boolean;
}) {
  const latestClosedWeek = getWeeklyReports(sessions, { limit: 1, includeOpen: false })[0] ?? getWeeklyReports(sessions, { limit: 1 })[0];
  const latestClosedMonth = getMonthlyReports(sessions, { limit: 1, includeOpen: false })[0] ?? getMonthlyReports(sessions, { limit: 1 })[0];
  const reports = [latestClosedWeek, latestClosedMonth].filter((report): report is PeriodReport => Boolean(report));

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Preview de informes</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Últimos cierres</h3>
        </div>
        <Link href="/analysis" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Ver informes
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-3 lg:grid-cols-2" aria-label="Informes calculando">
          <SkeletonBlock className="h-44" />
          <SkeletonBlock className="h-44" />
        </div>
      ) : reports.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {reports.map((report) => (
            <PreviewReport key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4 text-sm leading-6 text-[var(--muted)]">
          Sin semanas o meses suficientes para generar informes.
        </p>
      )}
    </Card>
  );
}
