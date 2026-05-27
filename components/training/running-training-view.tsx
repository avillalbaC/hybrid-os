"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { getLatestWeekSessions, getRunningDistribution, getRunningSessions, groupRunningSessionsByWeek } from "@/lib/domain/training/analysis";
import { useTrainingSessions } from "@/lib/storage/use-training-sessions";
import { formatDate, formatTrainingType } from "@/lib/utils/format";
import type { TrainingSession } from "@/types/training";

export function RunningTrainingView({ seedSessions }: { seedSessions: TrainingSession[] }) {
  const { sessions, pendingSessions, source, syncMessage } = useTrainingSessions(seedSessions);
  const runningSessions = getRunningSessions(sessions);
  const runningWeeks = groupRunningSessionsByWeek(sessions);
  const { currentWeekKey, previousWeekKey } = getLatestWeekSessions(sessions);
  const currentWeekRunning = runningWeeks[currentWeekKey] ?? [];
  const previousWeekRunning = runningWeeks[previousWeekKey] ?? [];
  const currentMeters = currentWeekRunning.reduce((total, item) => total + item.runMeters, 0);
  const previousMeters = previousWeekRunning.reduce((total, item) => total + item.runMeters, 0);
  const distribution = getRunningDistribution(currentWeekRunning);

  return (
    <>
      <PageHeader
        eyebrow="Running"
        title="Detalle de carrera"
        description="Running puro, HYROX y sesiones mixtas con metros de carrera acumulados."
      />

      <section className="mb-5 flex flex-wrap gap-2">
        <Badge tone={source === "remote" ? "accent" : source === "seed-fallback" ? "warning" : "neutral"}>
          {source === "remote" ? "Datos Supabase" : source === "seed-fallback" ? "Fallback seed" : "sincronizando"}
        </Badge>
        {pendingSessions.length > 0 ? <Badge tone="warning">Pendientes locales {pendingSessions.length}</Badge> : null}
      </section>
      {syncMessage ? <p className="mb-5 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-sm text-[var(--muted-strong)]">{syncMessage}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Km semana" value={`${(currentMeters / 1000).toFixed(1)} km`} detail={currentWeekKey} tone="strong" />
        <MetricCard label="Semana anterior" value={`${(previousMeters / 1000).toFixed(1)} km`} detail={previousWeekKey} />
        <MetricCard label="Sesiones con carrera" value={`${currentWeekRunning.length}`} detail="Semana activa" tone="strong" />
        <MetricCard label="Total histórico" value={`${(runningSessions.reduce((total, item) => total + item.runMeters, 0) / 1000).toFixed(1)} km`} detail={`${runningSessions.length} sesiones`} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
        <Card>
          <h3 className="text-lg font-semibold">Sesiones con carrera</h3>
          <div className="mt-4 divide-y divide-[var(--line)]">
            {runningSessions.map((item) => (
              <Link key={item.session.id} href={`/training/${item.session.id}`} className="block py-4 first:pt-0 last:pb-0 transition hover:text-[var(--accent-strong)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold">{item.session.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{formatDate(item.session.date)} · {formatTrainingType(item.session.type)}</p>
                  </div>
                  <Badge tone="accent">{(item.runMeters / 1000).toFixed(1)} km</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <aside className="space-y-5">
          <Card>
            <h3 className="text-lg font-semibold">Distribución semanal</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3 rounded-md border border-[var(--line)] p-3">
                <dt>Running puro</dt>
                <dd className="font-mono font-black">{(distribution.running / 1000).toFixed(1)} km</dd>
              </div>
              <div className="flex justify-between gap-3 rounded-md border border-[var(--line)] p-3">
                <dt>HYROX</dt>
                <dd className="font-mono font-black">{(distribution.hyrox / 1000).toFixed(1)} km</dd>
              </div>
              <div className="flex justify-between gap-3 rounded-md border border-[var(--line)] p-3">
                <dt>Mixto</dt>
                <dd className="font-mono font-black">{(distribution.mixed / 1000).toFixed(1)} km</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">Tendencia</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {currentMeters >= previousMeters
                ? `Subida de ${((currentMeters - previousMeters) / 1000).toFixed(1)} km frente a la semana anterior.`
                : `Bajada de ${((previousMeters - currentMeters) / 1000).toFixed(1)} km frente a la semana anterior.`}
            </p>
          </Card>
        </aside>
      </section>
    </>
  );
}
