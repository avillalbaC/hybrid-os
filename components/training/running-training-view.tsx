"use client";

import { useMemo } from "react";
import Link from "next/link";
import { RunningDataInsightCard } from "@/components/analytics/data-insights-panel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { getTrainingDataInsights } from "@/lib/analytics/data-insights";
import {
  getLatestDate,
  getPeriodRange,
  getPreviousPeriodRange,
  isDateInRange,
  resolvePeriodReferenceDate,
  type PeriodRange,
} from "@/lib/domain/dashboard/periods";
import { getRunningBreakdown } from "@/lib/domain/training/run-exposure";
import {
  getCurrentRunningPeriods,
  getRunningShoeVolumes,
  getRunningSessionRows,
  groupRunningByCalendarWeek,
  summarizeRunning,
} from "@/lib/domain/training/running";
import { useTrainingSessions } from "@/lib/storage/use-training-sessions";
import { formatDate, formatDuration, formatHeartRate, formatKm, formatRpe, formatTrainingType } from "@/lib/utils/format";
import type { TrainingSession } from "@/types/training";

function formatPace(secondsPerKm: number | null) {
  if (!secondsPerKm) {
    return "Sin dato";
  }

  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = secondsPerKm % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}/km`;
}

function formatDelta(current: number, previous: number, formatter: (value: number) => string) {
  const delta = current - previous;

  if (delta === 0) {
    return "igual que semana anterior";
  }

  const prefix = delta > 0 ? "+" : "-";
  return `${prefix}${formatter(Math.abs(delta))} vs semana anterior`;
}

function getDeltaTone(current: number, previous: number) {
  if (current > previous) {
    return "positive";
  }

  if (current < previous) {
    return "negative";
  }

  return "neutral";
}

function filterSessionsByRange(sessions: TrainingSession[], range: PeriodRange | null) {
  return range ? sessions.filter((session) => isDateInRange(session.date, range)) : sessions;
}

function ComparisonCard({
  label,
  current,
  previous,
  formatter,
}: {
  label: string;
  current: number;
  previous: number;
  formatter: (value: number) => string;
}) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-4">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 font-mono text-2xl font-black text-[var(--foreground)]">{formatter(current)}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{formatDelta(current, previous, formatter)}</p>
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
      <dt className="text-sm text-[var(--muted)]">{label}</dt>
      <dd className="font-mono text-sm font-black text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md border border-dashed border-[var(--line-strong)] bg-[rgba(244,247,244,0.025)] p-6 text-center">
      <p className="font-semibold text-[var(--foreground)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
    </div>
  );
}

function ComparisonSkeleton() {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-3" aria-label="Comparación semanal calculando">
      <SkeletonBlock className="h-28" />
      <SkeletonBlock className="h-28" />
      <SkeletonBlock className="h-28" />
    </div>
  );
}

function RunningTableSkeleton() {
  return (
    <div className="mt-4 space-y-3" aria-label="Sesiones running calculando">
      <SkeletonBlock className="h-14 w-full" />
      <SkeletonBlock className="h-14 w-full" />
      <SkeletonBlock className="h-14 w-full" />
    </div>
  );
}

export function RunningTrainingView({ seedSessions }: { seedSessions: TrainingSession[] }) {
  const { sessions, pendingSessions, source, syncMessage, isLoading, isReady } = useTrainingSessions(seedSessions);
  const runningRows = getRunningSessionRows(sessions);
  const periods = getCurrentRunningPeriods(runningRows);
  const historicalStats = summarizeRunning(runningRows);
  const shoeVolumes = getRunningShoeVolumes(runningRows);
  const weeklySummaries = groupRunningByCalendarWeek(runningRows, 12);
  const dataAnalysis = useMemo(() => getTrainingDataInsights(sessions, { period: "week" }), [sessions]);
  const latestTrainingDate = getLatestDate(sessions);
  const weekReferenceDate = resolvePeriodReferenceDate("week", latestTrainingDate);
  const monthReferenceDate = resolvePeriodReferenceDate("month", latestTrainingDate);
  const currentWeekExposure = getRunningBreakdown(filterSessionsByRange(sessions, getPeriodRange("week", weekReferenceDate)));
  const previousWeekExposure = getRunningBreakdown(filterSessionsByRange(sessions, getPreviousPeriodRange("week", weekReferenceDate)));
  const currentMonthExposure = getRunningBreakdown(filterSessionsByRange(sessions, getPeriodRange("month", monthReferenceDate)));
  const allExposure = getRunningBreakdown(sessions);
  const maxWeeklyMeters = Math.max(...weeklySummaries.map((week) => week.runMeters), 1);
  const isMetricsLoading = isLoading || !isReady;
  const weekKmState = isMetricsLoading ? "loading" : currentWeekExposure.totalRunExposureMeters > 0 ? "ready" : "empty";
  const monthKmState = isMetricsLoading ? "loading" : currentMonthExposure.totalRunExposureMeters > 0 ? "ready" : "empty";
  const sessionsState = isMetricsLoading ? "loading" : historicalStats.sessions > 0 ? "ready" : "empty";
  const durationState = isMetricsLoading ? "loading" : historicalStats.durationMinutes && historicalStats.durationMinutes > 0 ? "ready" : "empty";
  const rpeState = isMetricsLoading ? "loading" : historicalStats.averageRpe ? "ready" : "empty";

  return (
    <>
      <PageHeader
        eyebrow="Running"
        title="Evolución de carrera"
        description="Volumen total de carrera separado de métricas específicas de running estructurado. Ritmo, FC, Z2 y zapatillas siguen usando solo type running."
      />

      <section className="mb-5 flex flex-wrap gap-2">
        <Badge tone={source === "remote" ? "accent" : source === "seed-fallback" ? "warning" : "neutral"}>
          {source === "remote" ? "Datos Supabase" : source === "seed-fallback" ? "Fallback seed" : "sincronizando"}
        </Badge>
        {pendingSessions.length > 0 ? <Badge tone="warning">Pendientes locales {pendingSessions.length}</Badge> : null}
      </section>
      {syncMessage ? <p className="mb-5 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-sm text-[var(--muted-strong)]">{syncMessage}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Esta semana"
          value={formatKm(currentWeekExposure.totalRunExposureMeters, { forceKm: true })}
          detail={`${formatKm(currentWeekExposure.structuredMeters, { forceKm: true })} running · ${formatKm(currentWeekExposure.mixedMeters, { forceKm: true })} mixto`}
          delta={formatDelta(currentWeekExposure.totalRunExposureMeters, previousWeekExposure.totalRunExposureMeters, (value) => formatKm(value, { forceKm: true }))}
          deltaTone={getDeltaTone(currentWeekExposure.totalRunExposureMeters, previousWeekExposure.totalRunExposureMeters)}
          tone="strong"
          state={weekKmState}
        />
        <MetricCard
          label="Este mes"
          value={formatKm(currentMonthExposure.totalRunExposureMeters, { forceKm: true })}
          detail="Volumen total de impacto"
          tone="strong"
          state={monthKmState}
        />
        <MetricCard label="Sesiones running" value={`${historicalStats.sessions}`} detail="Solo type running" state={sessionsState} />
        <MetricCard label="Duración running" value={formatDuration(historicalStats.durationMinutes)} detail="Histórico con dato" state={durationState} />
        <MetricCard label="RPE medio running" value={formatRpe(historicalStats.averageRpe)} detail="Sesiones con RPE" state={rpeState} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-5">
          <Card>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Comparación semanal running estructurado</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">Solo sesiones type running frente a la semana calendario anterior.</p>
              </div>
              <Badge tone="neutral">lunes-domingo</Badge>
            </div>
            {isMetricsLoading ? (
              <ComparisonSkeleton />
            ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ComparisonCard label="Km running estructurado" current={periods.week.runMeters} previous={periods.previousWeek.runMeters} formatter={(value) => formatKm(value, { forceKm: true })} />
              <ComparisonCard label="Sesiones" current={periods.week.sessions} previous={periods.previousWeek.sessions} formatter={(value) => `${value}`} />
              <ComparisonCard
                label="Duración"
                current={periods.week.durationMinutes}
                previous={periods.previousWeek.durationMinutes}
                formatter={(value) => formatDuration(value)}
              />
            </div>
            )}
          </Card>

          <Card>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Sesiones running</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">Solo sesiones registradas como type running.</p>
              </div>
              <Badge tone="accent">{runningRows.length} sesiones</Badge>
            </div>

            {isMetricsLoading ? (
              <RunningTableSkeleton />
            ) : runningRows.length === 0 ? (
              <div className="mt-5">
                <EmptyState title="Sin sesiones de running" description="Cuando haya sesiones type running, aparecerán aquí con ritmo, duración, FC media y RPE." />
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-md border border-[var(--line)]">
                <div className="hidden grid-cols-[90px_minmax(0,1.5fr)_90px_120px_90px_100px_70px] gap-3 border-b border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-3 py-3 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)] lg:grid">
                  <span>Fecha</span>
                  <span>Título</span>
                  <span>Distancia</span>
                  <span>Duración</span>
                  <span>Ritmo</span>
                  <span>FC media</span>
                  <span>RPE</span>
                </div>
                <div className="divide-y divide-[var(--line)]">
                  {runningRows.map((row) => (
                    <article key={row.session.id} className="grid gap-3 bg-[rgba(244,247,244,0.018)] px-3 py-4 text-sm lg:grid-cols-[90px_minmax(0,1.5fr)_90px_120px_90px_100px_70px] lg:items-center">
                      <p className="font-mono text-xs font-black uppercase tracking-[0.12em] text-[var(--accent)] lg:text-[var(--muted-strong)]">{formatDate(row.session.date)}</p>
                      <div className="min-w-0">
                        <Link href={`/training/${row.session.id}`} className="block truncate font-semibold text-[var(--foreground)] transition hover:text-[var(--accent-strong)]">
                          {row.session.title}
                        </Link>
                        <p className="mt-1 text-xs text-[var(--muted)]">{formatTrainingType(row.session.type)}</p>
                      </div>
                      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:contents">
                        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-2 lg:border-0 lg:bg-transparent lg:p-0">
                          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)] lg:sr-only">Distancia</dt>
                          <dd className="mt-1 font-mono font-black lg:mt-0">{formatKm(row.runMeters, { forceKm: true })}</dd>
                        </div>
                        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-2 lg:border-0 lg:bg-transparent lg:p-0">
                          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)] lg:sr-only">Duración</dt>
                          <dd className="mt-1 text-[var(--muted-strong)] lg:mt-0">{formatDuration(row.durationMinutes)}</dd>
                        </div>
                        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-2 lg:border-0 lg:bg-transparent lg:p-0">
                          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)] lg:sr-only">Ritmo</dt>
                          <dd className="mt-1 text-[var(--muted-strong)] lg:mt-0">{formatPace(row.paceSecondsPerKm)}</dd>
                        </div>
                        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-2 lg:border-0 lg:bg-transparent lg:p-0">
                          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)] lg:sr-only">FC media</dt>
                          <dd className="mt-1 text-[var(--muted-strong)] lg:mt-0">{formatHeartRate(row.averageHeartRate)}</dd>
                        </div>
                        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-2 lg:border-0 lg:bg-transparent lg:p-0">
                          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)] lg:sr-only">RPE</dt>
                          <dd className="mt-1 text-[var(--muted-strong)] lg:mt-0">{formatRpe(row.session.rpe)}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        <aside className="space-y-5">
          <RunningDataInsightCard analysis={dataAnalysis} isLoading={isMetricsLoading} />

          <Card>
            <h3 className="text-lg font-semibold">Volumen de carrera histórico</h3>
            {isMetricsLoading ? (
              <div className="mt-4 space-y-3" aria-label="Tipo de carrera calculando">
                <SkeletonBlock className="h-12 w-full" />
                <SkeletonBlock className="h-12 w-full" />
                <SkeletonBlock className="h-12 w-full" />
              </div>
            ) : allExposure.totalRunExposureMeters === 0 ? (
              <div className="mt-4">
                <EmptyState title="Sin distribución" description="La separación se activa cuando existe distancia de carrera en las sesiones." />
              </div>
            ) : (
              <dl className="mt-4 space-y-3">
                <StatLine label="Histórico total" value={formatKm(allExposure.totalRunExposureMeters, { forceKm: true })} />
                <StatLine label="Running estructurado" value={formatKm(allExposure.structuredMeters, { forceKm: true })} />
                <StatLine label="Carrera en sesiones mixtas" value={formatKm(allExposure.mixedMeters, { forceKm: true })} />
              </dl>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">Running estructurado por semana</h3>
            {isMetricsLoading ? (
              <div className="mt-5 space-y-4" aria-label="Tendencia semanal calculando">
                <SkeletonBlock className="h-8 w-full" />
                <SkeletonBlock className="h-8 w-full" />
                <SkeletonBlock className="h-8 w-full" />
              </div>
            ) : weeklySummaries.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="Sin tendencia semanal" description="Aparecerá una barra por cada semana calendario con metros de running estructurado." />
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {weeklySummaries.map((week) => (
                  <div key={week.weekKey}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-mono font-black text-[var(--foreground)]">{week.weekKey}</span>
                      <span className="text-[var(--muted)]">
                        {formatKm(week.runMeters, { forceKm: true })} · {week.sessions} sesiones
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[rgba(244,247,244,0.08)]">
                      <div
                        className="h-2 rounded-full bg-[var(--accent)]"
                        style={{ width: `${Math.max(6, (week.runMeters / maxWeeklyMeters) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">Volumen por zapatilla</h3>
            {isMetricsLoading ? (
              <div className="mt-4 space-y-3" aria-label="Volumen por zapatilla calculando">
                <SkeletonBlock className="h-12 w-full" />
                <SkeletonBlock className="h-12 w-full" />
              </div>
            ) : shoeVolumes.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="Sin sesiones de running puro" description="El volumen por modelo solo suma sesiones con type running." />
              </div>
            ) : (
              <dl className="mt-4 space-y-3">
                {shoeVolumes.map((entry) => (
                  <StatLine key={entry.shoes} label={entry.shoes} value={`${formatKm(entry.runMeters, { forceKm: true })} · ${entry.sessions} sesiones`} />
                ))}
              </dl>
            )}
          </Card>
        </aside>
      </section>
    </>
  );
}
