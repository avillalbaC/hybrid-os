"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChartCard } from "@/components/charts/chart-card";
import { CheckInContextCard } from "@/components/check-in/check-in-context-card";
import { StackedRunBars } from "@/components/charts/stacked-run-bars";
import { formatTrendValue, getTrendStatusTone, trendStatusLabels } from "@/components/charts/trend-card-chart";
import { WeeklyBarChart } from "@/components/charts/weekly-bar-chart";
import { MetricCard } from "@/components/ui/metric-card";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { KeyTrendsPreview } from "@/components/dashboard/key-trends-preview";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { PeriodDecisionSummary } from "@/components/dashboard/period-decision-summary";
import { RecommendedDecisionCard } from "@/components/dashboard/recommended-decision-card";
import { DisciplinesOverview } from "@/components/dashboard/disciplines-overview";
import { ReportsPreview } from "@/components/dashboard/reports-preview";
import { getWeeklyChartData } from "@/lib/analytics/chart-data";
import { getTrainingDataInsights } from "@/lib/analytics/data-insights";
import { getWeeklyTrendMetrics } from "@/lib/analytics/trends";
import { calculateDashboardMetrics } from "@/lib/domain/dashboard/metrics";
import { filterSessionsByPeriod } from "@/lib/domain/dashboard/periods";
import { secondaryActivityKindLabels, summarizeSecondaryActivities, type SecondaryActivitySummary } from "@/lib/domain/training/secondary-activity";
import { useActiveGoalEvaluation } from "@/lib/goals/use-active-goal-evaluation";
import { useWeeklyPlanning } from "@/lib/planning/use-weekly-planning";
import { useDashboardData } from "@/lib/storage/use-dashboard-data";
import { formatDuration, formatLoadKg } from "@/lib/utils/format";
import type { DashboardPeriod } from "@/lib/domain/dashboard/periods";
import type { RunningBreakdown } from "@/lib/domain/training/run-exposure";
import type { BodyCheck } from "@/types/body";
import type { NutritionCheck } from "@/types/nutrition";
import type { TrainingSession } from "@/types/training";

function formatKm(meters: number) {
  return meters > 0 ? `${(meters / 1000).toFixed(1)} km` : "-";
}

function formatKmValue(meters: number) {
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatRunningBreakdown(breakdown: RunningBreakdown) {
  return `${formatKmValue(breakdown.structuredMeters)} running estructurado · ${formatKmValue(breakdown.mixedMeters)} mixto`;
}

function ComplementaryVolumeCard({
  isLoading,
  summary,
}: {
  isLoading?: boolean;
  summary: SecondaryActivitySummary;
}) {
  const topKinds = summary.topKinds.slice(0, 3).map((kind) => secondaryActivityKindLabels[kind]).join(" · ");

  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Volumen complementario</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Actividad secundaria</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">Suma duración, distancia, carga muscular y fatiga sin entrar en Running Analytics.</p>
        </div>
        <Link href="/training?filter=secondary" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Ver filtro
        </Link>
      </div>
      {isLoading ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-4" aria-label="Volumen complementario calculando">
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-16" />
        </div>
      ) : (
        <>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Sesiones</dt>
              <dd className="mt-1 font-mono text-xl font-black">{summary.sessions}</dd>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Duración</dt>
              <dd className="mt-1 font-mono text-xl font-black">{formatDuration(summary.durationMinutes)}</dd>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Distancia</dt>
              <dd className="mt-1 font-mono text-xl font-black">{formatKm(summary.distanceMeters)}</dd>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Carga / fatiga</dt>
              <dd className="mt-1 font-mono text-xl font-black">{summary.muscleLoad} / {summary.fatigueCost}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-[var(--muted-strong)]">{topKinds || "Sin tipos secundarios en este periodo."}</p>
        </>
      )}
    </Card>
  );
}

function WatchSignalsCard({
  analysis,
  isLoading,
}: {
  analysis: ReturnType<typeof getTrainingDataInsights>;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Qué vigilar</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Riesgos principales</h3>
        </div>
        <Link href="/analysis" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Ver detalle
        </Link>
      </div>
      <div className="mt-4 grid gap-3">
        {isLoading ? (
          <>
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-20 w-full" />
          </>
        ) : analysis.summary.warnings.length > 0 ? (
          analysis.summary.warnings.slice(0, 3).map((warning) => (
            <div key={warning.id} className="rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-3">
              <p className="text-sm font-bold text-[var(--foreground)]">{warning.title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">
                {(warning.evidence.length > 1 ? warning.evidence.slice(0, 2).join(" ") : warning.evidence[0]) ?? warning.message}
              </p>
            </div>
          ))
        ) : (
          <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm leading-6 text-[var(--muted)]">
            Sin riesgos principales con los umbrales actuales.
          </p>
        )}
      </div>
    </Card>
  );
}

function GoalReadingCard({
  title,
  summary,
  positiveSignal,
  negativeSignal,
  isLoading,
}: {
  title: string | null;
  summary: string;
  positiveSignal: string | null;
  negativeSignal: string | null;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Lectura según objetivo</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">{title ? `Objetivo: ${title}` : "Sin objetivo activo"}</h3>
        </div>
        <Link href="/goals" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Ver objetivos
        </Link>
      </div>
      {isLoading ? (
        <div className="mt-4">
          <SkeletonBlock className="h-20 w-full" />
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm leading-6 text-[var(--muted-strong)]">{summary}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <p className="rounded-md border border-[rgba(34,211,238,0.18)] bg-[var(--accent-faint)] p-3 text-sm leading-6 text-[var(--muted-strong)]">
              <span className="block font-bold text-[var(--foreground)]">Señal a favor</span>
              {positiveSignal ?? "Sin señal positiva clara."}
            </p>
            <p className="rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-3 text-sm leading-6 text-[var(--muted-strong)]">
              <span className="block font-bold text-[var(--foreground)]">Señal en contra</span>
              {negativeSignal ?? "Sin señal negativa clara."}
            </p>
          </div>
        </>
      )}
    </Card>
  );
}

function PlanningReadingCard({
  adherence,
  deviation,
  isLoading,
}: {
  adherence: number | null;
  deviation: { title: string; description: string } | null;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Planificado vs realizado</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">
            {adherence === null ? "Sin plan semanal" : `${adherence}% de adherencia semanal`}
          </h3>
        </div>
        <Link href="/goals" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Ver plan
        </Link>
      </div>
      {isLoading ? (
        <div className="mt-4">
          <SkeletonBlock className="h-20 w-full" />
        </div>
      ) : deviation ? (
        <p className="mt-4 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-3 text-sm leading-6 text-[var(--muted-strong)]">
          <span className="font-semibold text-[var(--foreground)]">{deviation.title}:</span> {deviation.description}
        </p>
      ) : (
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">No hay desviaciones relevantes entre plan y realidad.</p>
      )}
    </Card>
  );
}

export function DashboardView({
  sessions,
  bodyChecks,
  nutritionChecks,
}: {
  sessions: TrainingSession[];
  bodyChecks: BodyCheck[];
  nutritionChecks: NutritionCheck[];
}) {
  const [period, setPeriod] = useState<DashboardPeriod>("week");
  const [isPeriodPending, setIsPeriodPending] = useState(false);
  const {
    sessions: dashboardSessions,
    bodyChecks: dashboardBodyChecks,
    nutritionChecks: dashboardNutritionChecks,
    source,
    message: syncMessage,
    isLoading,
    isReady,
  } = useDashboardData({
    seedSessions: sessions,
    seedBodyChecks: bodyChecks,
    seedNutritionChecks: nutritionChecks,
  });
  const metrics = useMemo(
    () => calculateDashboardMetrics(dashboardSessions, dashboardBodyChecks, dashboardNutritionChecks, period),
    [dashboardBodyChecks, dashboardNutritionChecks, dashboardSessions, period],
  );
  const weeklyPlanning = useWeeklyPlanning();
  const goalContext = useActiveGoalEvaluation(dashboardSessions, {
    bodyChecks: dashboardBodyChecks,
    nutritionChecks: dashboardNutritionChecks,
    plannedSessions: weeklyPlanning.plannedSessions,
  });
  const trends = useMemo(() => getWeeklyTrendMetrics(dashboardSessions), [dashboardSessions]);
  const weeklyChartData = useMemo(() => getWeeklyChartData(dashboardSessions).slice(-8), [dashboardSessions]);
  const dataAnalysis = useMemo(() => getTrainingDataInsights(dashboardSessions, { period }), [dashboardSessions, period]);
  const periodSessions = useMemo(() => filterSessionsByPeriod(dashboardSessions, period), [dashboardSessions, period]);
  const secondaryActivitySummary = useMemo(() => summarizeSecondaryActivities(periodSessions), [periodSessions]);
  const fatigueCost = useMemo(
    () => periodSessions.reduce((total, session) => total + session.sessionMetrics.fatigueCost, 0),
    [periodSessions],
  );
  const isMetricsLoading = isLoading || !isReady || isPeriodPending;
  const goalPositiveSignal = goalContext.progress.positiveSignals[0]?.evidence ?? null;
  const goalNegativeSignal = goalContext.progress.negativeSignals[0]?.evidence ?? null;
  const sessionsState = isMetricsLoading ? "loading" : "ready";
  const runningState = isMetricsLoading ? "loading" : "ready";
  const durationState = isMetricsLoading ? "loading" : "ready";
  const rpeState = isMetricsLoading ? "loading" : metrics.averageRpe.value !== null ? "ready" : "empty";
  const fatigueState = isMetricsLoading ? "loading" : periodSessions.length > 0 ? "ready" : "empty";
  const getTrendMeta = (trend: typeof trends.duration) => [
    {
      label: "Media reciente",
      value: formatTrendValue(trend, trend.recentAverage),
    },
    {
      label: "Cambio",
      value: trend.changePercent === null ? "Sin referencia" : `${trend.changePercent > 0 ? "+" : ""}${trend.changePercent}%`,
    },
  ];
  const handlePeriodChange = (nextPeriod: DashboardPeriod) => {
    if (nextPeriod === period) {
      return;
    }

    setIsPeriodPending(true);
    setPeriod(nextPeriod);
  };

  useEffect(() => {
    if (!isPeriodPending || isLoading || !isReady) {
      return;
    }

    const frame = window.requestAnimationFrame(() => setIsPeriodPending(false));

    return () => window.cancelAnimationFrame(frame);
  }, [isLoading, isPeriodPending, isReady, period]);

  return (
    <>
      <section className="mb-8 overflow-hidden rounded-md border border-[var(--line)] bg-[linear-gradient(135deg,var(--accent-hero),rgba(21,27,24,0.98)_38%,rgba(12,16,15,0.98))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)] sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Análisis del periodo</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-[var(--foreground)] sm:text-6xl">
              {metrics.periodTitle}.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted-strong)]">
              Métricas, comparativas y tendencias para entender el periodo con más detalle que la vista diaria.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={source === "remote" ? "accent" : source === "seed-fallback" ? "warning" : "neutral"}>
                {source === "remote" ? "Datos reales" : source === "seed-fallback" ? "Fallback seed" : "sincronizando"}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:items-center lg:justify-end">
            <PeriodSelector value={period} onChange={handlePeriodChange} />
            <Link
              href="/training/import"
              className="inline-flex items-center justify-center rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-3 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
            >
              Importar JSON
            </Link>
          </div>
        </div>
      </section>
      {syncMessage ? (
        <p className="mb-5 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-sm text-[var(--muted-strong)]">
          {syncMessage}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Sesiones"
          value={metrics.sessions.formattedValue}
          detail={metrics.periodDetail}
          delta={metrics.sessions.deltaLabel}
          deltaTone={metrics.sessions.deltaTone}
          secondaryDelta={metrics.sessions.previousDeltaLabel}
          secondaryDeltaTone={metrics.sessions.previousDeltaTone}
          comparison={metrics.sessions.comparisonDisplay}
          tone="strong"
          state={sessionsState}
          sparklineData={weeklyChartData.map((week) => week.sessions)}
        />
        <MetricCard
          label="Carrera total"
          value={metrics.runningKm.formattedValue}
          detail={formatRunningBreakdown(metrics.runningBreakdown)}
          delta={metrics.runningKm.deltaLabel}
          deltaTone={metrics.runningKm.deltaTone}
          secondaryDelta={metrics.runningKm.previousDeltaLabel}
          secondaryDeltaTone={metrics.runningKm.previousDeltaTone}
          comparison={metrics.runningKm.comparisonDisplay}
          tone="strong"
          state={runningState}
          sparklineData={weeklyChartData.map((week) => week.totalRunMeters)}
        />
        <MetricCard
          label="Duración total"
          value={metrics.durationMinutes.formattedValue}
          detail={`Carga acumulada · ${metrics.periodDetail}`}
          delta={metrics.durationMinutes.deltaLabel}
          deltaTone={metrics.durationMinutes.deltaTone}
          secondaryDelta={metrics.durationMinutes.previousDeltaLabel}
          secondaryDeltaTone={metrics.durationMinutes.previousDeltaTone}
          comparison={metrics.durationMinutes.comparisonDisplay}
          state={durationState}
          sparklineData={weeklyChartData.map((week) => week.durationMinutes)}
        />
        <MetricCard
          label="RPE medio"
          value={metrics.averageRpe.formattedValue}
          detail="Intensidad percibida"
          delta={metrics.averageRpe.deltaLabel}
          deltaTone={metrics.averageRpe.deltaTone}
          state={rpeState}
          sparklineData={weeklyChartData.map((week) => week.averageRpe ?? 0)}
        />
        <MetricCard
          label="Fatiga"
          value={`${fatigueCost}`}
          detail="Coste acumulado del periodo"
          delta={dataAnalysis.summary.status === "alta_carga" ? "Alta carga" : dataAnalysis.summary.status === "vigilar" ? "Vigilar" : "Controlada"}
          deltaTone={dataAnalysis.summary.status === "normal" ? "neutral" : "negative"}
          state={fatigueState}
          sparklineData={weeklyChartData.map((week) => week.fatigueCost)}
        />
      </section>

      <section id="evolucion-clave" className="mt-8 scroll-mt-24">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Evolución clave</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">Últimas semanas</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Carrera, duración, fatiga y peso movido para leer el periodo con contexto visual.</p>
          </div>
          <Link href="/analysis" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
            Ver profundidad
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          <ChartCard
            title="Carrera total"
            description="Running estructurado frente a carrera en sesiones mixtas."
            unit="km"
            compact
            currentValue={formatTrendValue(trends.runExposure.total, trends.runExposure.total.currentValue)}
            meta={getTrendMeta(trends.runExposure.total)}
            status={{ label: trendStatusLabels[trends.runExposure.total.status], tone: getTrendStatusTone(trends.runExposure.total.status) }}
            isLoading={isMetricsLoading}
            footer={trends.runExposure.total.message}
          >
            <StackedRunBars
              data={weeklyChartData.map((week) => ({
                key: week.weekKey,
                label: week.label,
                structuredRunMeters: week.structuredRunMeters,
                mixedRunMeters: week.mixedRunMeters,
              }))}
              compact
              formatter={(value) => formatKmValue(value)}
            />
          </ChartCard>
          <ChartCard
            title="Duración"
            description="Minutos acumulados por semana calendario."
            unit="tiempo"
            compact
            currentValue={formatTrendValue(trends.duration, trends.duration.currentValue)}
            meta={getTrendMeta(trends.duration)}
            status={{ label: trendStatusLabels[trends.duration.status], tone: getTrendStatusTone(trends.duration.status) }}
            isLoading={isMetricsLoading}
            footer={trends.duration.message}
          >
            <WeeklyBarChart
              data={weeklyChartData.map((week) => ({ key: week.weekKey, label: week.label, value: week.durationMinutes }))}
              compact
              formatter={(value) => formatDuration(value, { emptyLabel: "0 min" })}
            />
          </ChartCard>
          <ChartCard
            title="Fatiga semanal"
            description="Coste acumulado según sessionMetrics.fatigueCost."
            unit="pts"
            compact
            currentValue={formatTrendValue(trends.load, trends.load.currentValue)}
            meta={getTrendMeta(trends.load)}
            status={{ label: trendStatusLabels[trends.load.status], tone: getTrendStatusTone(trends.load.status) }}
            isLoading={isMetricsLoading}
            footer={trends.load.message}
          >
            <WeeklyBarChart
              data={weeklyChartData.map((week) => ({ key: week.weekKey, label: week.label, value: week.fatigueCost }))}
              compact
              formatter={(value) => `${Math.round(value)} pts`}
              tone={trends.load.status === "subida_brusca" ? "warning" : "accent"}
            />
          </ChartCard>
          <ChartCard
            title="Peso movido"
            description="Carga externa estimada por semana."
            unit="kg/t"
            compact
            currentValue={formatTrendValue(trends.externalLoad, trends.externalLoad.currentValue)}
            meta={getTrendMeta(trends.externalLoad)}
            status={{ label: trendStatusLabels[trends.externalLoad.status], tone: getTrendStatusTone(trends.externalLoad.status) }}
            isLoading={isMetricsLoading}
            footer={trends.externalLoad.message}
          >
            <WeeklyBarChart
              data={weeklyChartData.map((week) => ({ key: week.weekKey, label: week.label, value: week.totalExternalLoadKg }))}
              compact
              formatter={formatLoadKg}
              tone="secondary"
            />
          </ChartCard>
        </div>
      </section>

      <section className="mt-8">
        <PeriodDecisionSummary analysis={dataAnalysis} isLoading={isMetricsLoading} />
      </section>

      <section className="mt-8">
        <GoalReadingCard
          title={goalContext.activeGoal?.title ?? null}
          summary={goalContext.progress.summary}
          positiveSignal={goalPositiveSignal}
          negativeSignal={goalNegativeSignal}
          isLoading={goalContext.isLoading || isMetricsLoading}
        />
      </section>

      <section className="mt-8">
        <CheckInContextCard
          context={goalContext.progress.checkInContextData}
          text={goalContext.progress.checkInContext}
          compactText={goalContext.progress.compactCheckInContext}
          compact
          showDetails={false}
          detailHref="/analysis"
          title="Contexto de la semana"
        />
      </section>

      <section className="mt-8">
        <PlanningReadingCard
          adherence={weeklyPlanning.summary.adherencePercentage}
          deviation={weeklyPlanning.summary.deviations[0] ?? null}
          isLoading={weeklyPlanning.isLoading}
        />
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <WatchSignalsCard analysis={dataAnalysis} isLoading={isMetricsLoading} />
        <RecommendedDecisionCard analysis={dataAnalysis} isLoading={isMetricsLoading} />
      </section>

      <section className="mt-8">
        <KeyTrendsPreview trends={trends} isLoading={isMetricsLoading} />
      </section>

      <section className="mt-8">
        <ReportsPreview sessions={dashboardSessions} isLoading={isMetricsLoading} />
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Distribución del periodo</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight">Disciplinas</h3>
            </div>
            <Link href="/analysis" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
              Ver análisis
            </Link>
          </div>
          <DisciplinesOverview sessions={dashboardSessions} isLoading={isMetricsLoading} />
        </div>
        <ComplementaryVolumeCard summary={secondaryActivitySummary} isLoading={isMetricsLoading} />
      </section>
    </>
  );
}
