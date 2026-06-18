import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { HorizontalRankingChart } from "@/components/charts/horizontal-ranking-chart";
import { StackedRunBars } from "@/components/charts/stacked-run-bars";
import { WeeklyBarChart } from "@/components/charts/weekly-bar-chart";
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

export function PeriodReportCard({
  defaultOpen = true,
  report,
}: {
  defaultOpen?: boolean;
  report: PeriodReport;
}) {
  const topInsights = report.keyInsights.slice(0, 2);
  const topContext = topInsights[0]?.evidence[0] ?? report.conclusion;

  return (
    <Card>
      <details open={defaultOpen} className="group">
        <summary className="cursor-pointer list-none rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={report.isClosed ? "accent" : "neutral"}>{report.isClosed ? "Cerrado" : "En curso"}</Badge>
                <Badge>{report.label}</Badge>
                {report.metaLabel ? <Badge tone="neutral">{report.metaLabel}</Badge> : null}
              </div>
              <h4 className="mt-3 text-xl font-black tracking-tight text-[var(--foreground)]">{report.headline}</h4>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">{report.conclusion}</p>
            </div>
            <span className="mt-1 inline-flex rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-3 py-2 text-sm font-bold text-[var(--foreground)]">
              <span className="group-open:hidden">Ver detalle</span>
              <span className="hidden group-open:inline">Ocultar detalle</span>
            </span>
          </div>
          <dl className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <MetricPill label="Sesiones" value={`${report.metrics.sessions}`} />
            <MetricPill label="Duración" value={formatDuration(report.metrics.durationMinutes, { emptyLabel: "0 min" })} />
            <MetricPill label="Carrera total" value={formatKm(report.metrics.totalRunMeters, { forceKm: true })} />
            <MetricPill label="RPE medio" value={formatRpe(report.metrics.averageRpe)} />
          </dl>
          {topContext ? (
            <p className="mt-3 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm font-semibold leading-6 text-[var(--foreground)]">
              {topContext}
            </p>
          ) : null}
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.02)] p-3">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Carga visual</p>
              <div className="mt-3">
                <WeeklyBarChart
                  data={[
                    { key: "Ses", label: "Sesiones", value: report.metrics.sessions },
                    { key: "Dur", label: "Duración", value: report.metrics.durationMinutes },
                    { key: "Fat", label: "Fatiga", value: report.metrics.fatigueCost },
                    { key: "Kg", label: "Peso", value: report.metrics.totalExternalLoadKg },
                  ]}
                  formatter={(value) => `${Math.round(value)}`}
                  tone="accent"
                />
              </div>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.02)] p-3 lg:col-span-2">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Carrera del periodo</p>
              <div className="mt-3">
                <StackedRunBars
                  data={[
                    {
                      key: report.periodKey,
                      label: report.label,
                      metaLabel: report.metaLabel,
                      isCurrentWeek: report.type === "week" && !report.isClosed,
                      structuredRunMeters: report.metrics.structuredRunMeters,
                      mixedRunMeters: report.metrics.mixedRunMeters,
                    },
                  ]}
                  formatter={(value) => formatKm(value, { forceKm: true })}
                />
              </div>
            </div>
          </div>
        </summary>

        <dl className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <MetricPill label="Running estructurado" value={formatKm(report.metrics.structuredRunMeters, { forceKm: true })} />
          <MetricPill label="Carrera mixta" value={formatKm(report.metrics.mixedRunMeters, { forceKm: true })} />
          <MetricPill label="Fatiga / impacto" value={`${report.metrics.fatigueCost} / ${report.metrics.impactScore}`} />
          <MetricPill label="Peso movido" value={formatLoadKg(report.metrics.totalExternalLoadKg)} />
        </dl>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Distribución</p>
            <div className="mt-3">
              <HorizontalRankingChart
                emptyLabel="Sin sesiones"
                formatter={(value) => `${value}`}
                items={report.disciplineBreakdown.map((item) => ({
                  key: item.label,
                  label: item.label,
                  value: item.value,
                }))}
                tone="secondary"
              />
            </div>
          </div>

          <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Carga muscular</p>
            <div className="mt-3">
              <HorizontalRankingChart
                emptyLabel="Sin carga muscular registrada."
                formatter={(value) => `${value}`}
                items={report.topMuscles.map((item) => ({
                  key: item.muscle,
                  label: formatMuscleName(item.muscle),
                  value: item.load,
                }))}
              />
            </div>
          </div>

          <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Contexto del cierre</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--foreground)]">{topContext ?? "Sin contexto determinista."}</p>
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
      </details>
    </Card>
  );
}
