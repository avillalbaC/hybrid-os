"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { MuscleLoadList } from "@/components/muscle-load/muscle-load-list";
import { TrainingSessionCard } from "@/components/training/training-session-card";
import { getLatestWeekSessions } from "@/lib/domain/training/analysis";
import { compareWeeks, getHardSessionsCount, getTopMuscles } from "@/lib/selectors/training";
import { useTrainingSessions } from "@/lib/storage/use-training-sessions";
import type { TrainingSession } from "@/types/training";

export function WeeklyTrainingView({ seedSessions }: { seedSessions: TrainingSession[] }) {
  const { sessions, syncMessage } = useTrainingSessions(seedSessions);
  const { currentWeekKey, previousWeekKey, currentWeekSessions, previousWeekSessions } = getLatestWeekSessions(sessions);
  const comparison = compareWeeks(currentWeekSessions, previousWeekSessions);
  const topMuscles = getTopMuscles(currentWeekSessions, 6);
  const hardSessions = currentWeekSessions.filter(
    (session) => (session.rpe ?? 0) >= 8 || session.sessionMetrics.fatigueCost >= 75 || session.sessionMetrics.impactScore >= 75,
  );

  return (
    <>
      <PageHeader
        eyebrow="Detalle semanal"
        title="Semana activa"
        description="Sesiones, volumen, carga y alertas de la semana más reciente registrada."
        action={
          <Link href="/training/import" className="inline-flex rounded-md border border-[rgba(56,217,159,0.34)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[#06100c] transition hover:bg-[var(--accent-strong)]">
            Importar JSON
          </Link>
        }
      />

      {syncMessage ? <p className="mb-5 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-sm text-[var(--muted-strong)]">{syncMessage}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Semana" value={currentWeekKey} detail={`Anterior: ${previousWeekKey}`} tone="strong" />
        <MetricCard label="Sesiones" value={`${comparison.current.sessions}`} detail={`${comparison.current.hardSessions} duras`} tone="strong" />
        <MetricCard label="Running" value={`${(comparison.current.runMeters / 1000).toFixed(1)} km`} detail={`${(comparison.previous.runMeters / 1000).toFixed(1)} km semana anterior`} />
        <MetricCard label="Duración" value={`${comparison.current.durationMinutes}m`} detail={`${comparison.previous.durationMinutes}m semana anterior`} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-5">
          <Card>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Sesiones</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight">Realizadas esta semana</h3>
              </div>
              <p className="font-mono text-sm font-black text-[var(--accent-strong)]">{currentWeekSessions.length}</p>
            </div>
          </Card>
          <div className="grid gap-4">
            {currentWeekSessions.map((session) => (
              <TrainingSessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <Card>
            <h3 className="text-lg font-semibold">Alertas</h3>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
              {comparison.alerts.length > 0 ? (
                comparison.alerts.map((alert) => (
                  <p key={alert.title} className="rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-3">
                    <span className="font-semibold text-[var(--warning)]">{alert.title}:</span> {alert.recommendation}
                  </p>
                ))
              ) : (
                <p>Sin alertas semanales con los datos actuales.</p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">Sesiones duras</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{getHardSessionsCount(currentWeekSessions)} detectadas por RPE, impacto o fatiga.</p>
            <ul className="mt-4 space-y-3 text-sm">
              {hardSessions.map((session) => (
                <li key={session.id} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
                  <Link href={`/training/${session.id}`} className="font-bold text-[var(--foreground)] transition hover:text-[var(--accent-strong)]">{session.title}</Link>
                  <p className="mt-1 text-[var(--muted)]">RPE {session.rpe ?? "-"} · Fatiga {session.sessionMetrics.fatigueCost}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">Top músculos</h3>
            <div className="mt-4">
              {topMuscles.length > 0 ? <MuscleLoadList muscles={topMuscles} /> : <p className="text-sm text-[var(--muted)]">Sin carga muscular esta semana.</p>}
            </div>
          </Card>
        </aside>
      </section>
    </>
  );
}

