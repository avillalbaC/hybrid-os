"use client";

import { PeriodReportCard } from "@/components/analysis/period-report-card";
import { CalendarHeatmap } from "@/components/charts/calendar-heatmap";
import { ChartCard } from "@/components/charts/chart-card";
import { HorizontalRankingChart } from "@/components/charts/horizontal-ranking-chart";
import { StackedRunBars } from "@/components/charts/stacked-run-bars";
import { StackedWeeklyBars } from "@/components/charts/stacked-weekly-bars";
import { WeeklyBarChart } from "@/components/charts/weekly-bar-chart";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import {
  buildDisciplineDistributionData,
  buildIntensityDistributionData,
  buildTrainingConsistencyData,
} from "@/lib/analytics/analysis-chart-data";
import { getWeeklyChartData } from "@/lib/analytics/chart-data";
import { getWeeklyReports } from "@/lib/analytics/period-reports";
import {
  buildWeeklyAnalysisReport,
  getDefaultWeeklyAnalysisMode,
  getWeeklyAnalysisRange,
  getWeeklyAnalysisRangeOptions,
  type WeeklyAnalysisMode,
  type WeeklyAnalysisReport,
} from "@/lib/analytics/weekly-analysis";
import { formatDuration, formatKm, formatRpe } from "@/lib/utils/format";
import { useEffect, useMemo, useState } from "react";
import type { PlannedSession } from "@/types/planning";
import type { ProgrammingSession } from "@/types/programming";
import type { TrainingSession } from "@/types/training";

function ReportSkeleton() {
  return (
    <Card>
      <SkeletonBlock className="h-6 w-40" />
      <SkeletonBlock className="mt-4 h-7 w-2/3" />
      <div className="mt-4">
        <SkeletonText lines={3} />
      </div>
    </Card>
  );
}

function MetricTile({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
      <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</dt>
      <dd className="mt-2 font-mono text-xl font-black text-[var(--foreground)]">{value}</dd>
      {detail ? <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{detail}</p> : null}
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-3">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">{eyebrow}</p>
      <h3 className="mt-1 text-xl font-black tracking-tight text-[var(--foreground)]">{title}</h3>
      {description ? <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
    </div>
  );
}

function useWeeklyAnalysisPlanning(rangeStart: string, rangeEnd: string) {
  const [plannedSessions, setPlannedSessions] = useState<PlannedSession[]>([]);
  const [programmingSessions, setProgrammingSessions] = useState<ProgrammingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPlanning() {
      setIsLoading(true);

      try {
        const [plannedResponse, programmingResponse] = await Promise.all([
          fetch(`/api/planned-sessions?start=${rangeStart}&end=${rangeEnd}`, { cache: "no-store", signal: controller.signal }),
          fetch("/api/programming-sessions", { cache: "no-store", signal: controller.signal }),
        ]);
        const plannedPayload = plannedResponse.ok ? ((await plannedResponse.json()) as { plannedSessions?: PlannedSession[] }) : {};
        const programmingPayload = programmingResponse.ok ? ((await programmingResponse.json()) as { programmingSessions?: ProgrammingSession[] }) : {};

        setPlannedSessions(plannedPayload.plannedSessions ?? []);
        setProgrammingSessions(programmingPayload.programmingSessions ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setPlannedSessions([]);
          setProgrammingSessions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadPlanning();

    return () => {
      controller.abort();
    };
  }, [rangeEnd, rangeStart]);

  return { plannedSessions, programmingSessions, isLoading };
}

function WeeklyModeSelector({
  mode,
  onChange,
}: {
  mode: WeeklyAnalysisMode;
  onChange: (mode: WeeklyAnalysisMode) => void;
}) {
  const options = getWeeklyAnalysisRangeOptions();

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option.mode}
          type="button"
          onClick={() => onChange(option.mode)}
          className={`rounded-md border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
            mode === option.mode
              ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--foreground)]"
              : "border-[var(--line)] bg-[rgba(244,247,244,0.025)] text-[var(--muted-strong)] hover:border-[var(--accent-border)]"
          }`}
        >
          <span className="block text-sm font-black">{option.statusLabel}</span>
          <span className="mt-1 block text-xs font-semibold text-[var(--muted)]">{option.selectedWeekLabel}</span>
        </button>
      ))}
    </div>
  );
}

function WeeklySummaryBlock({ report }: { report: WeeklyAnalysisReport }) {
  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={report.range.isClosed ? "accent" : "neutral"}>{report.range.statusLabel}</Badge>
            <Badge>{report.range.selectedWeekLabel}</Badge>
          </div>
          <h3 className="mt-3 text-2xl font-black tracking-tight">Informe semanal</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-strong)]">
            {report.range.displayLabel}. Lectura de lo registrado, con comparación de planificación solo cuando existen datos de `planned_sessions` o `programming_sessions`.
          </p>
        </div>
        <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-3 py-2 text-sm font-semibold text-[var(--muted-strong)]">
          {report.range.selectedWeekStart} / {report.range.selectedWeekEnd}
        </p>
      </div>

      {report.range.selectedWeekMode === "current_week" && report.summary.sessions === 0 ? (
        <p className="mt-5 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4 text-sm leading-6 text-[var(--muted-strong)]">
          Sin sesiones registradas en la semana en curso.
        </p>
      ) : null}

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Sesiones totales" value={`${report.summary.sessions}`} />
        <MetricTile label="Días entrenados" value={`${report.summary.trainingDays}`} detail={`${report.summary.movementDays} días con movimiento`} />
        <MetricTile label="Duración total" value={formatDuration(report.summary.durationMinutes, { emptyLabel: "0 min" })} />
        <MetricTile label="RPE medio" value={formatRpe(report.summary.averageRpe)} />
        <MetricTile label="Carrera total" value={formatKm(report.summary.totalRunMeters, { forceKm: true })} />
        <MetricTile label="Running estructurado" value={formatKm(report.summary.structuredRunMeters, { forceKm: true })} />
        <MetricTile label="Carrera mixta" value={formatKm(report.summary.mixedRunMeters, { forceKm: true })} />
        <MetricTile
          label="Carga / fatiga"
          value={report.summary.fatigueCost === null ? "Sin dato" : `${report.summary.fatigueCost}`}
          detail={report.summary.muscleLoad === null ? "Carga muscular sin dato" : `Carga muscular ${report.summary.muscleLoad}`}
        />
      </dl>
    </Card>
  );
}

function ExpectedBlock({ report, isPlanningLoading }: { report: WeeklyAnalysisReport; isPlanningLoading: boolean }) {
  return (
    <Card>
      <SectionHeading eyebrow="Planificación" title="Realizado vs esperado" />
      {isPlanningLoading ? (
        <SkeletonText lines={2} />
      ) : report.expected.hasExpectations ? (
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <dl className="grid gap-3 sm:grid-cols-2">
            <MetricTile label="Sesiones esperadas" value={`${report.expected.expectedSessions}`} detail={`${report.expected.plannedSessions} planificadas · ${report.expected.programmingSessions} programaciones`} />
            <MetricTile label="Completadas" value={`${report.expected.completedSessions}`} detail={report.expected.adherencePercentage === null ? undefined : `${report.expected.adherencePercentage}% cumplimiento`} />
            <MetricTile label="Pendientes" value={`${report.expected.pendingSessions}`} />
            <MetricTile label="Saltadas" value={`${report.expected.skippedSessions}`} />
          </dl>
          <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Cumplimiento por disciplina</p>
            <div className="mt-3 grid gap-2">
              {report.expected.byDiscipline.length > 0 ? report.expected.byDiscipline.map((item) => {
                const percent = item.expected > 0 ? Math.min(100, Math.round((item.completed / item.expected) * 100)) : 0;
                return (
                  <div key={item.key}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-[var(--foreground)]">{item.label}</span>
                      <span className="font-mono text-xs font-black text-[var(--muted-strong)]">{item.completed}/{item.expected}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[rgba(244,247,244,0.08)]">
                      <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              }) : (
                <p className="text-sm leading-6 text-[var(--muted)]">Sin disciplinas esperadas para esta semana.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4 text-sm leading-6 text-[var(--muted-strong)]">
          {report.expected.message}
        </p>
      )}
    </Card>
  );
}

function DisciplinesBlock({ report }: { report: WeeklyAnalysisReport }) {
  return (
    <Card>
      <SectionHeading eyebrow="Distribución" title="Entrenamientos por disciplina" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--muted)]">
              <th className="py-3 pr-3 font-bold">Disciplina</th>
              <th className="px-3 py-3 font-bold">Sesiones</th>
              <th className="px-3 py-3 font-bold">Duración</th>
              <th className="px-3 py-3 font-bold">RPE medio</th>
              <th className="py-3 pl-3 font-bold">Métrica clave</th>
            </tr>
          </thead>
          <tbody>
            {report.disciplines.map((item) => (
              <tr key={item.key} className="border-b border-[rgba(244,247,244,0.06)] last:border-0">
                <td className="py-3 pr-3 font-bold text-[var(--foreground)]">{item.label}</td>
                <td className="px-3 py-3 font-mono font-black text-[var(--foreground)]">{item.sessions}</td>
                <td className="px-3 py-3 text-[var(--muted-strong)]">{formatDuration(item.durationMinutes, { emptyLabel: "0 min" })}</td>
                <td className="px-3 py-3 text-[var(--muted-strong)]">{formatRpe(item.averageRpe)}</td>
                <td className="py-3 pl-3 text-[var(--muted-strong)]">{item.keyMetric}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ProgressBlock({ report }: { report: WeeklyAnalysisReport }) {
  return (
    <Card>
      <SectionHeading eyebrow="Comparables" title="Progreso y mejores datos" description="Solo se etiqueta mejora cuando existe una referencia equivalente por distancia, movimiento, título o métrica." />
      <div className="grid gap-3 lg:grid-cols-2">
        {report.progress.map((item) => (
          <div key={item.id} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
            <Badge tone={item.label === "Mejora frente a última referencia" ? "accent" : "neutral"}>{item.label}</Badge>
            <h4 className="mt-3 font-black text-[var(--foreground)]">{item.title}</h4>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">{item.detail}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{item.evidence}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function LoadIntensityBlock({ report }: { report: WeeklyAnalysisReport }) {
  const totalRpeBuckets = Math.max(report.loadIntensity.rpeBuckets.reduce((total, item) => total + item.value, 0), 1);

  return (
    <Card>
      <SectionHeading eyebrow="Carga" title="Carga e intensidad" />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Distribución RPE</p>
          <div className="mt-4 grid gap-3">
            {report.loadIntensity.rpeBuckets.map((bucket) => (
              <div key={bucket.key}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold text-[var(--foreground)]">{bucket.label}</span>
                  <span className="font-mono text-xs font-black text-[var(--muted-strong)]">{bucket.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[rgba(244,247,244,0.08)]">
                  <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.round((bucket.value / totalRpeBuckets) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Días más cargados</p>
          <div className="mt-4 grid gap-2">
            {report.loadIntensity.loadedDays.length > 0 ? report.loadIntensity.loadedDays.map((day) => (
              <div key={day.date} className="flex items-center justify-between gap-3 rounded border border-[var(--line)] bg-[rgba(244,247,244,0.02)] px-3 py-2">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">{day.label}</p>
                  <p className="text-xs text-[var(--muted)]">{day.detail}</p>
                </div>
                <p className="font-mono text-sm font-black text-[var(--foreground)]">{day.load}</p>
              </div>
            )) : (
              <p className="text-sm leading-6 text-[var(--muted)]">Sin carga diaria registrada.</p>
            )}
          </div>
        </div>

        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Carga muscular top 5</p>
          <div className="mt-3">
            <HorizontalRankingChart
              emptyLabel="Sin carga muscular registrada."
              formatter={(value) => `${Math.round(value)}`}
              items={report.loadIntensity.topMuscles.map((item) => ({ key: item.muscle, label: item.label, value: item.load }))}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{report.loadIntensity.runningReference.label}</p>
        </div>
      </div>
    </Card>
  );
}

function SignalsBlock({ report }: { report: WeeklyAnalysisReport }) {
  const columns = [
    { key: "positive" as const, title: "Señales positivas", empty: "Sin señales positivas suficientes." },
    { key: "review" as const, title: "Señales a revisar", empty: "Sin señales de revisión destacadas." },
    { key: "insufficient" as const, title: "Datos insuficientes", empty: "Sin huecos principales de datos." },
  ];

  return (
    <Card>
      <SectionHeading eyebrow="Contexto" title="Señales de la semana" description="Máximo tres señales por grupo, agrupadas por tema." />
      <div className="grid gap-3 lg:grid-cols-3">
        {columns.map((column) => {
          const items = report.signals[column.key];
          return (
            <div key={column.key} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
              <h4 className="font-black text-[var(--foreground)]">{column.title}</h4>
              <div className="mt-3 grid gap-2">
                {items.length > 0 ? items.map((item) => (
                  <p key={item} className="rounded border border-[rgba(244,247,244,0.06)] bg-[rgba(244,247,244,0.02)] p-3 text-sm leading-6 text-[var(--muted-strong)]">
                    {item}
                  </p>
                )) : (
                  <p className="text-sm leading-6 text-[var(--muted)]">{column.empty}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function WeeklyReportsSection({
  isLoading,
  sessions,
}: {
  isLoading?: boolean;
  sessions: TrainingSession[];
}) {
  const [mode, setMode] = useState<WeeklyAnalysisMode>(() => getDefaultWeeklyAnalysisMode());
  const selectedWeek = useMemo(() => getWeeklyAnalysisRange(mode), [mode]);
  const planning = useWeeklyAnalysisPlanning(selectedWeek.selectedWeekStart, selectedWeek.selectedWeekEnd);
  const weeklyReport = useMemo(
    () =>
      buildWeeklyAnalysisReport({
        sessions,
        plannedSessions: planning.plannedSessions,
        programmingSessions: planning.programmingSessions,
        mode,
        selectedWeek,
      }),
    [mode, planning.plannedSessions, planning.programmingSessions, selectedWeek, sessions],
  );
  const reports = getWeeklyReports(sessions, { limit: 8, includeOpen: true });
  const weeklyData = getWeeklyChartData(sessions).slice(-8);
  const disciplineStack = buildDisciplineDistributionData(sessions).slice(-8);
  const intensityStack = buildIntensityDistributionData(sessions).slice(-8);
  const consistencyData = buildTrainingConsistencyData(sessions, 84);

  return (
    <section>
      <div className="mb-4">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Informes semanales</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight">Semana</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {selectedWeek.displayLabel}. En lunes, la lectura principal usa por defecto la última semana cerrada.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          <ReportSkeleton />
          <ReportSkeleton />
        </div>
      ) : (
        <div className="grid gap-5">
          <WeeklyModeSelector mode={mode} onChange={setMode} />
          <WeeklySummaryBlock report={weeklyReport} />
          <ExpectedBlock report={weeklyReport} isPlanningLoading={planning.isLoading} />
          <DisciplinesBlock report={weeklyReport} />
          <ProgressBlock report={weeklyReport} />
          <LoadIntensityBlock report={weeklyReport} />
          <SignalsBlock report={weeklyReport} />

          <div className="pt-2">
            <SectionHeading
              eyebrow="Histórico visual"
              title="Gráficas de últimas semanas"
              description="Lectura comparativa reciente; el informe semanal queda arriba como cierre operativo."
            />
          </div>
          <div className="grid gap-5 xl:grid-cols-4">
            <ChartCard title="Duración semanal" description="Minutos por semana calendario." unit="tiempo">
              <WeeklyBarChart
                data={weeklyData.map((week) => ({ key: week.weekKey, label: week.label, metaLabel: week.metaLabel, isCurrentWeek: week.isCurrentWeek, value: week.durationMinutes }))}
                formatter={(value) => formatDuration(value, { emptyLabel: "0 min" })}
              />
            </ChartCard>
            <ChartCard title="Carrera semanal" description="Running estructurado separado de carrera mixta." unit="km">
              <StackedRunBars
                data={weeklyData.map((week) => ({
                  key: week.weekKey,
                  label: week.label,
                  metaLabel: week.metaLabel,
                  isCurrentWeek: week.isCurrentWeek,
                  structuredRunMeters: week.structuredRunMeters,
                  mixedRunMeters: week.mixedRunMeters,
                }))}
                formatter={(value) => formatKm(value, { forceKm: true })}
              />
            </ChartCard>
            <ChartCard title="Fatiga semanal" description="Coste acumulado por semana." unit="pts">
              <WeeklyBarChart
                data={weeklyData.map((week) => ({ key: week.weekKey, label: week.label, metaLabel: week.metaLabel, isCurrentWeek: week.isCurrentWeek, value: week.fatigueCost }))}
                formatter={(value) => `${Math.round(value)}`}
                tone="warning"
              />
            </ChartCard>
            <ChartCard title="RPE y peso" description="RPE medio visualizado como intensidad; peso en el informe de cada semana." unit="RPE">
              <WeeklyBarChart
                data={weeklyData.map((week) => ({ key: week.weekKey, label: week.label, metaLabel: week.metaLabel, isCurrentWeek: week.isCurrentWeek, value: week.averageRpe ?? 0 }))}
                formatter={(value) => formatRpe(value)}
                tone="secondary"
              />
            </ChartCard>
          </div>
          <div className="grid gap-5 xl:grid-cols-3">
            <ChartCard
              title="Distribución semanal"
              description="Sesiones por disciplina en cada semana."
              unit="sesiones"
              footer="Dato relevante para ver si la carga cambia por volumen o por tipo de estímulo."
            >
              <StackedWeeklyBars data={disciplineStack} formatter={(value) => `${Math.round(value)}`} />
            </ChartCard>
            <ChartCard
              title="Intensidad semanal"
              description="Sesiones por bucket de RPE: bajo, moderado, alto y sin dato."
              unit="sesiones"
              footer="Las semanas con más segmentos sin dato tienen lectura de intensidad menos completa."
            >
              <StackedWeeklyBars data={intensityStack} formatter={(value) => `${Math.round(value)}`} />
            </ChartCard>
            <ChartCard
              title="Consistencia de registro"
              description="Últimas 12 semanas por día, con intensidad visual según sesiones, duración y fatiga."
              unit="días"
              footer="La matriz muestra presencia de entrenamiento y densidad de carga registrada."
            >
              <CalendarHeatmap data={consistencyData} />
            </ChartCard>
          </div>

          {reports.length > 0 ? (
            reports.map((report) => (
              <PeriodReportCard key={report.id} report={report} defaultOpen={false} />
            ))
          ) : (
            <Card>
              <p className="text-sm leading-6 text-[var(--muted)]">Sin semanas suficientes para generar informes históricos.</p>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
