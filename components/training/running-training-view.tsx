"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonBlock } from "@/components/ui/skeleton";
import {
  getCurrentRunningPeriods,
  getRunningContextTotals,
  getRunningShoeVolumes,
  getRunningSessionRows,
  groupRunningByCalendarWeek,
  summarizeRunning,
} from "@/lib/domain/training/running";
import { useTrainingSessions } from "@/lib/storage/use-training-sessions";
import { formatDate, formatTrainingType } from "@/lib/utils/format";
import type { TrainingSession } from "@/types/training";

function formatKm(meters: number) {
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(minutes: number | null) {
  if (!minutes) {
    return "Sin dato";
  }

  const roundedMinutes = Math.round(minutes);
  const hours = Math.floor(roundedMinutes / 60);
  const remainingMinutes = roundedMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  return `${hours} h ${String(remainingMinutes).padStart(2, "0")} min`;
}

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
  const contextTotals = getRunningContextTotals(runningRows);
  const shoeVolumes = getRunningShoeVolumes(runningRows);
  const weeklySummaries = groupRunningByCalendarWeek(runningRows, 12);
  const maxWeeklyMeters = Math.max(...weeklySummaries.map((week) => week.runMeters), 1);
  const isMetricsLoading = isLoading || !isReady;
  const weekKmState = isMetricsLoading ? "loading" : periods.week.runMeters > 0 ? "ready" : "empty";
  const monthKmState = isMetricsLoading ? "loading" : periods.month.runMeters > 0 ? "ready" : "empty";
  const sessionsState = isMetricsLoading ? "loading" : historicalStats.sessions > 0 ? "ready" : "empty";
  const durationState = isMetricsLoading ? "loading" : historicalStats.durationMinutes && historicalStats.durationMinutes > 0 ? "ready" : "empty";
  const rpeState = isMetricsLoading ? "loading" : historicalStats.averageRpe ? "ready" : "empty";

  return (
    <>
      <PageHeader
        eyebrow="Running"
        title="Evolución de carrera"
        description="Kilómetros, sesiones, duración y ritmo de sesiones con type running. HYROX, CrossFit y actividades secundarias quedan fuera de este análisis."
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
          label="Km semana actual"
          value={formatKm(periods.week.runMeters)}
          detail="Lunes-domingo"
          delta={formatDelta(periods.week.runMeters, periods.previousWeek.runMeters, formatKm)}
          deltaTone={getDeltaTone(periods.week.runMeters, periods.previousWeek.runMeters)}
          tone="strong"
          state={weekKmState}
        />
        <MetricCard label="Km mes actual" value={formatKm(periods.month.runMeters)} detail="Mes natural" tone="strong" state={monthKmState} />
        <MetricCard label="Sesiones running" value={`${historicalStats.sessions}`} detail="Histórico con carrera" state={sessionsState} />
        <MetricCard label="Duración running" value={formatDuration(historicalStats.durationMinutes)} detail="Histórico con dato" state={durationState} />
        <MetricCard label="RPE medio running" value={historicalStats.averageRpe ? `${historicalStats.averageRpe}` : "Sin dato"} detail="Sesiones con RPE" state={rpeState} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-5">
          <Card>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Comparación semanal</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">Semana actual frente a la semana calendario anterior.</p>
              </div>
              <Badge tone="neutral">lunes-domingo</Badge>
            </div>
            {isMetricsLoading ? (
              <ComparisonSkeleton />
            ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ComparisonCard label="Km" current={periods.week.runMeters} previous={periods.previousWeek.runMeters} formatter={formatKm} />
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
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-[var(--line)] text-[0.68rem] uppercase tracking-[0.18em] text-[var(--muted)]">
                    <tr>
                      <th className="py-3 pr-4 font-bold">Fecha</th>
                      <th className="px-4 py-3 font-bold">Título</th>
                      <th className="px-4 py-3 font-bold">Distancia</th>
                      <th className="px-4 py-3 font-bold">Duración</th>
                      <th className="px-4 py-3 font-bold">Ritmo</th>
                      <th className="px-4 py-3 font-bold">FC media</th>
                      <th className="py-3 pl-4 font-bold">RPE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {runningRows.map((row) => (
                      <tr key={row.session.id} className="align-top">
                        <td className="py-4 pr-4 text-[var(--muted-strong)]">{formatDate(row.session.date)}</td>
                        <td className="px-4 py-4">
                          <Link href={`/training/${row.session.id}`} className="font-semibold text-[var(--foreground)] transition hover:text-[var(--accent-strong)]">
                            {row.session.title}
                          </Link>
                          <p className="mt-1 text-xs text-[var(--muted)]">{formatTrainingType(row.session.type)}</p>
                        </td>
                        <td className="px-4 py-4 font-mono font-black">{formatKm(row.runMeters)}</td>
                        <td className="px-4 py-4 text-[var(--muted-strong)]">{formatDuration(row.durationMinutes)}</td>
                        <td className="px-4 py-4 text-[var(--muted-strong)]">{formatPace(row.paceSecondsPerKm)}</td>
                        <td className="px-4 py-4 text-[var(--muted-strong)]">{row.averageHeartRate ? `${row.averageHeartRate} bpm` : "Sin dato"}</td>
                        <td className="py-4 pl-4 text-[var(--muted-strong)]">{row.session.rpe ?? "Sin dato"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <h3 className="text-lg font-semibold">Alcance del análisis</h3>
            {isMetricsLoading ? (
              <div className="mt-4 space-y-3" aria-label="Tipo de carrera calculando">
                <SkeletonBlock className="h-12 w-full" />
                <SkeletonBlock className="h-12 w-full" />
                <SkeletonBlock className="h-12 w-full" />
              </div>
            ) : historicalStats.runMeters === 0 ? (
              <div className="mt-4">
                <EmptyState title="Sin distribución" description="La separación se activa cuando existe distancia de carrera en las sesiones." />
              </div>
            ) : (
              <dl className="mt-4 space-y-3">
                <StatLine label="Incluido: type running" value={formatKm(contextTotals.pure)} />
                <StatLine label="Excluido: HYROX/CrossFit" value={formatKm(contextTotals["hyrox-crossfit"])} />
                <StatLine label="Excluido: secundarios/mixtos" value={formatKm(contextTotals.mixed)} />
              </dl>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">Km por semana</h3>
            {isMetricsLoading ? (
              <div className="mt-5 space-y-4" aria-label="Tendencia semanal calculando">
                <SkeletonBlock className="h-8 w-full" />
                <SkeletonBlock className="h-8 w-full" />
                <SkeletonBlock className="h-8 w-full" />
              </div>
            ) : weeklySummaries.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="Sin tendencia semanal" description="Aparecerá una barra por cada semana calendario con metros de carrera." />
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {weeklySummaries.map((week) => (
                  <div key={week.weekKey}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-mono font-black text-[var(--foreground)]">{week.weekKey}</span>
                      <span className="text-[var(--muted)]">
                        {formatKm(week.runMeters)} · {week.sessions} sesiones
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
                  <StatLine key={entry.shoes} label={entry.shoes} value={`${formatKm(entry.runMeters)} · ${entry.sessions} sesiones`} />
                ))}
              </dl>
            )}
          </Card>
        </aside>
      </section>
    </>
  );
}
