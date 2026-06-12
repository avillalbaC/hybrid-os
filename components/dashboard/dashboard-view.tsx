"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardDataInsights } from "@/components/analytics/data-insights-panel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { MuscleLoadList } from "@/components/muscle-load/muscle-load-list";
import { TrainingSessionCard } from "@/components/training/training-session-card";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { DisciplinesOverview } from "@/components/dashboard/disciplines-overview";
import { TrendsSection } from "@/components/dashboard/trends-section";
import { getTrainingDataInsights } from "@/lib/analytics/data-insights";
import { getWeeklyTrendMetrics } from "@/lib/analytics/trends";
import { calculateDashboardMetrics } from "@/lib/domain/dashboard/metrics";
import { filterSessionsByPeriod } from "@/lib/domain/dashboard/periods";
import { getLatestWeekSessions } from "@/lib/domain/training/analysis";
import { secondaryActivityKindLabels, summarizeSecondaryActivities, type SecondaryActivitySummary } from "@/lib/domain/training/secondary-activity";
import { compareWeeks } from "@/lib/selectors/training";
import { useDashboardData } from "@/lib/storage/use-dashboard-data";
import { formatDuration } from "@/lib/utils/format";
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
  const trends = useMemo(() => getWeeklyTrendMetrics(dashboardSessions), [dashboardSessions]);
  const dataAnalysis = useMemo(() => getTrainingDataInsights(dashboardSessions, { period }), [dashboardSessions, period]);
  const periodSessions = useMemo(() => filterSessionsByPeriod(dashboardSessions, period), [dashboardSessions, period]);
  const secondaryActivitySummary = useMemo(() => summarizeSecondaryActivities(periodSessions), [periodSessions]);
  const weeklyComparison = useMemo(() => {
    const { currentWeekSessions, previousWeekSessions } = getLatestWeekSessions(dashboardSessions);

    return compareWeeks(currentWeekSessions, previousWeekSessions);
  }, [dashboardSessions]);
  const isMetricsLoading = isLoading || !isReady || isPeriodPending;
  const sessionsState = isMetricsLoading ? "loading" : "ready";
  const runningState = isMetricsLoading ? "loading" : "ready";
  const durationState = isMetricsLoading ? "loading" : "ready";
  const rpeState = isMetricsLoading ? "loading" : metrics.averageRpe.value !== null ? "ready" : "empty";
  const metricValueState = (value: number | null) => (isMetricsLoading ? "loading" : value !== null ? "ready" : "empty");
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
                {source === "remote" ? "Datos Supabase" : source === "seed-fallback" ? "Fallback seed" : "sincronizando"}
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Sesiones completadas"
          value={metrics.sessions.formattedValue}
          detail={metrics.periodDetail}
          delta={metrics.sessions.deltaLabel}
          deltaTone={metrics.sessions.deltaTone}
          secondaryDelta={metrics.sessions.previousDeltaLabel}
          secondaryDeltaTone={metrics.sessions.previousDeltaTone}
          comparison={metrics.sessions.comparisonDisplay}
          tone="strong"
          state={sessionsState}
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
        />
        <MetricCard
          label="RPE medio"
          value={metrics.averageRpe.formattedValue}
          detail="Intensidad percibida"
          delta={metrics.averageRpe.deltaLabel}
          deltaTone={metrics.averageRpe.deltaTone}
          state={rpeState}
        />
        <MetricCard
          label="Peso actual"
          value={metrics.weightKg.formattedValue}
          detail="Último registro corporal"
          delta={metrics.weightKg.deltaLabel}
          deltaTone={metrics.weightKg.deltaTone}
          state={metricValueState(metrics.weightKg.value)}
        />
        <MetricCard
          label="Cintura actual"
          value={metrics.waistCm.formattedValue}
          detail="Último registro corporal"
          delta={metrics.waistCm.deltaLabel}
          deltaTone={metrics.waistCm.deltaTone}
          state={metricValueState(metrics.waistCm.value)}
        />
        <MetricCard
          label="Adherencia nutricional"
          value={metrics.nutritionAdherence.formattedValue}
          detail="Media del periodo"
          delta={metrics.nutritionAdherence.deltaLabel}
          deltaTone={metrics.nutritionAdherence.deltaTone}
          state={metricValueState(metrics.nutritionAdherence.value)}
        />
        <MetricCard
          label="Sueño"
          value={metrics.sleepHours.formattedValue}
          detail="Último registro corporal"
          delta={metrics.sleepHours.deltaLabel}
          deltaTone={metrics.sleepHours.deltaTone}
          state={metricValueState(metrics.sleepHours.value)}
        />
      </section>

      <section className="mt-8">
        <DashboardDataInsights analysis={dataAnalysis} isLoading={isMetricsLoading} />
      </section>

      <section className="mt-8">
        <ComplementaryVolumeCard summary={secondaryActivitySummary} isLoading={isMetricsLoading} />
      </section>

      <section className="mt-8">
        <TrendsSection trends={trends} isLoading={isMetricsLoading} />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Detalle por disciplina</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">Tendencias y distribución</h3>
          </div>
          <Link href="/training/running" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
            Ver running
          </Link>
        </div>
        <DisciplinesOverview sessions={dashboardSessions} isLoading={isMetricsLoading} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Actividad del periodo</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight">Entrenamientos relevantes</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{metrics.periodDetail}</p>
            </div>
            <Link href="/training" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
              Ver log
            </Link>
          </div>
          <div className="grid gap-4">
            {isMetricsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.22)]" aria-label="Entrenamiento calculando">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="mt-3 h-6 w-3/4" />
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <SkeletonBlock className="h-12" />
                    <SkeletonBlock className="h-12" />
                    <SkeletonBlock className="h-12" />
                  </div>
                </div>
              ))
            ) : metrics.recentSessions.length > 0 ? (
              metrics.recentSessions.map((session) => (
                <TrainingSessionCard key={session.id} session={session} />
              ))
            ) : (
              <div className="rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-6 text-sm leading-6 text-[var(--muted)] shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
                Sin sesiones en este periodo.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5 lg:sticky lg:top-8 lg:self-start">
          <Card>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Qué vigilar</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">Señales del periodo</h3>
            <div className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted)]">
              {isMetricsLoading ? (
                <>
                  <SkeletonBlock className="h-16 w-full" />
                  <SkeletonBlock className="h-16 w-full" />
                </>
              ) : metrics.alerts.length > 0 ? (
                metrics.alerts.map((alert) => (
                  <p
                    key={alert.title}
                    className={`rounded-md border p-3 ${
                      alert.tone === "critical"
                        ? "border-[rgba(255,110,110,0.28)] bg-[rgba(255,110,110,0.08)]"
                        : "border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)]"
                    }`}
                  >
                    <span className={alert.tone === "critical" ? "font-semibold text-[#ff8a8a]" : "font-semibold text-[var(--warning)]"}>
                      {alert.title}:
                    </span>{" "}
                    {alert.detail}
                  </p>
                ))
              ) : (
                <p>Sin alertas con los datos actuales del periodo.</p>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Carga acumulada</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight">Músculos más cargados</h3>
              </div>
              <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] px-3 py-2 text-right font-mono text-xs font-black text-[var(--muted-strong)]">
                {metrics.muscleLoadDeltaLabel}
              </p>
            </div>
            {isMetricsLoading ? null : (
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Ranking técnico para decidir dónde empujar y dónde bajar exposición.
              </p>
            )}
            <div className="mt-5">
              {isMetricsLoading ? (
                <div className="space-y-3" aria-label="Carga muscular calculando">
                  <SkeletonBlock className="h-12 w-full" />
                  <SkeletonBlock className="h-12 w-full" />
                  <SkeletonBlock className="h-12 w-full" />
                </div>
              ) : metrics.topMuscles.length > 0 ? (
                <MuscleLoadList muscles={metrics.topMuscles} />
              ) : (
                <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4 text-sm leading-6 text-[var(--muted)]">
                  Sin datos del periodo.
                </div>
              )}
            </div>
            <Link href="/muscle-load" className="mt-4 inline-flex text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
              Abrir detalle muscular
            </Link>
          </Card>

          <Card>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Comparativa</p>
            {isMetricsLoading ? (
              <div className="mt-3" aria-label="Comparativa calculando">
                <SkeletonBlock className="h-8 w-40" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <SkeletonBlock className="h-16" />
                  <SkeletonBlock className="h-16" />
                  <SkeletonBlock className="h-16" />
                  <SkeletonBlock className="h-16" />
                </div>
              </div>
            ) : (
              <>
            <h3 className="mt-2 text-2xl font-black tracking-tight">{weeklyComparison.current.weekKey}</h3>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-3">
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Sesiones</dt>
                <dd className="mt-1 font-mono text-lg font-black">{weeklyComparison.current.sessions}</dd>
              </div>
              <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-3">
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Carrera total</dt>
                <dd className="mt-1 font-mono text-lg font-black">{(weeklyComparison.current.runMeters / 1000).toFixed(1)} km</dd>
              </div>
              <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-3">
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Duración</dt>
                <dd className="mt-1 font-mono text-lg font-black">{formatDuration(weeklyComparison.current.durationMinutes)}</dd>
              </div>
              <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-3">
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Fatiga</dt>
                <dd className="mt-1 font-mono text-lg font-black">{weeklyComparison.current.fatigueCost}</dd>
              </div>
            </dl>
            <div className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted)]">
              {weeklyComparison.alerts.length > 0 ? (
                weeklyComparison.alerts.map((alert) => (
                  <p key={alert.title} className="rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-3">
                    <span className="font-semibold text-[var(--warning)]">{alert.title}:</span> {alert.recommendation}
                  </p>
                ))
              ) : (
                <p>Sin alertas semanales con los datos actuales.</p>
              )}
            </div>
              </>
            )}
          </Card>
        </div>
      </section>
    </>
  );
}
