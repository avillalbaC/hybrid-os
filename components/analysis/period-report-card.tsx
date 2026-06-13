import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDuration, formatKm, formatLoadKg, formatMuscleName, formatRpe } from "@/lib/utils/format";
import type { PeriodReport } from "@/lib/analytics/period-reports";

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
      <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 font-mono text-sm font-black text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export function PeriodReportCard({ report }: { report: PeriodReport }) {
  const topInsights = report.keyInsights.slice(0, 2);
  const topRecommendation = report.recommendations[0];

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={report.isClosed ? "accent" : "neutral"}>{report.isClosed ? "Cerrado" : "En curso"}</Badge>
            <Badge>{report.label}</Badge>
          </div>
          <h4 className="mt-3 text-xl font-black tracking-tight text-[var(--foreground)]">{report.headline}</h4>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">{report.conclusion}</p>
        </div>
      </div>

      <dl className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <MetricPill label="Sesiones" value={`${report.metrics.sessions}`} />
        <MetricPill label="Duración" value={formatDuration(report.metrics.durationMinutes, { emptyLabel: "0 min" })} />
        <MetricPill label="Carrera total" value={formatKm(report.metrics.totalRunMeters, { forceKm: true })} />
        <MetricPill label="RPE medio" value={formatRpe(report.metrics.averageRpe)} />
        <MetricPill label="Running estructurado" value={formatKm(report.metrics.structuredRunMeters, { forceKm: true })} />
        <MetricPill label="Carrera mixta" value={formatKm(report.metrics.mixedRunMeters, { forceKm: true })} />
        <MetricPill label="Fatiga / impacto" value={`${report.metrics.fatigueCost} / ${report.metrics.impactScore}`} />
        <MetricPill label="Peso movido" value={formatLoadKg(report.metrics.totalExternalLoadKg)} />
      </dl>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Distribución</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {report.disciplineBreakdown.length > 0 ? (
              report.disciplineBreakdown.map((item) => (
                <Badge key={item.label}>{item.label}: {item.value}</Badge>
              ))
            ) : (
              <span className="text-sm text-[var(--muted)]">Sin sesiones</span>
            )}
          </div>
        </div>

        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Carga muscular</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">
            {report.topMuscles.length > 0
              ? report.topMuscles.slice(0, 3).map((item) => `${formatMuscleName(item.muscle)} ${item.load}`).join(" · ")
              : "Sin carga muscular registrada."}
          </p>
        </div>

        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Prioridad siguiente</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--foreground)]">{topRecommendation ?? "Sin recomendación determinista."}</p>
        </div>
      </div>

      {topInsights.length > 0 ? (
        <div className="mt-4 grid gap-2 lg:grid-cols-2">
          {topInsights.map((insight) => (
            <div key={insight.id} className="rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-3 text-sm leading-6 text-[var(--muted-strong)]">
              <p className="font-semibold text-[var(--foreground)]">{insight.title}</p>
              <p className="mt-1">{insight.evidence[0] ?? insight.message}</p>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
