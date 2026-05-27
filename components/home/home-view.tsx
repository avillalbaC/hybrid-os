"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { MuscleLoadList } from "@/components/muscle-load/muscle-load-list";
import { TrainingSessionCard } from "@/components/training/training-session-card";
import { calculateDashboardMetrics } from "@/lib/domain/dashboard/metrics";
import { compareWeeks, getSessionsByWeek } from "@/lib/selectors/training";
import { useTrainingSessions } from "@/lib/storage/use-training-sessions";
import type { BodyCheck } from "@/types/body";
import type { NutritionCheck } from "@/types/nutrition";
import type { TrainingSession } from "@/types/training";

function MetricLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-md outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
    >
      {children}
    </Link>
  );
}

export function HomeView({
  sessions,
  bodyChecks,
  nutritionChecks,
}: {
  sessions: TrainingSession[];
  bodyChecks: BodyCheck[];
  nutritionChecks: NutritionCheck[];
}) {
  const { sessions: combinedSessions, syncMessage } = useTrainingSessions(sessions);
  const metrics = calculateDashboardMetrics(combinedSessions, bodyChecks, nutritionChecks, "week");
  const weeks = getSessionsByWeek(combinedSessions);
  const weekKeys = Object.keys(weeks).sort().reverse();
  const weeklyComparison = compareWeeks(weeks[weekKeys[0]] ?? [], weeks[weekKeys[1]] ?? []);
  const latestSession = metrics.recentSessions[0] ?? null;

  return (
    <>
      <section className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
        <div className="rounded-md border border-[var(--line)] bg-[linear-gradient(135deg,rgba(56,217,159,0.16),rgba(18,23,21,0.98)_42%,rgba(11,14,13,0.98))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)] sm:p-8">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Home</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-[var(--foreground)] sm:text-6xl">
            Estado actual.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted-strong)]">
            Señales principales para decidir si hoy toca empujar, sostener o recuperar.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/training/import"
              className="inline-flex items-center justify-center rounded-md border border-[rgba(56,217,159,0.34)] bg-[var(--accent)] px-4 py-3 text-sm font-black text-[#06100c] transition hover:bg-[var(--accent-strong)]"
            >
              Importar entrenamiento
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-3 text-sm font-bold text-[var(--foreground)] transition hover:border-[rgba(56,217,159,0.34)]"
            >
              Ver dashboard
            </Link>
            <Link
              href="/training"
              className="inline-flex items-center justify-center rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-3 text-sm font-bold text-[var(--foreground)] transition hover:border-[rgba(56,217,159,0.34)]"
            >
              Ver log
            </Link>
          </div>
        </div>

        <Card>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Último entrenamiento</p>
          {latestSession ? (
            <div className="mt-4">
              <TrainingSessionCard session={latestSession} />
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Todavía no hay entrenamientos para mostrar.</p>
          )}
        </Card>
      </section>

      {syncMessage ? (
        <p className="mb-5 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-sm text-[var(--muted-strong)]">
          {syncMessage}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricLink href="/training/weekly">
          <MetricCard label="Sesiones semana" value={metrics.sessions.formattedValue} detail={`${metrics.periodDetail} · Ver detalle`} delta={metrics.sessions.deltaLabel} deltaTone={metrics.sessions.deltaTone} tone="strong" />
        </MetricLink>
        <MetricLink href="/training/running">
          <MetricCard label="Running" value={metrics.runningKm.formattedValue} detail="Running + HYROX · Ver detalle" delta={metrics.runningKm.deltaLabel} deltaTone={metrics.runningKm.deltaTone} tone="strong" />
        </MetricLink>
        <MetricLink href="/dashboard">
          <MetricCard label="Duración" value={metrics.durationMinutes.formattedValue} detail="Carga semanal · Ver dashboard" delta={metrics.durationMinutes.deltaLabel} deltaTone={metrics.durationMinutes.deltaTone} />
        </MetricLink>
        <MetricLink href="/dashboard">
          <MetricCard label="RPE medio" value={metrics.averageRpe.formattedValue} detail="Intensidad percibida · Ver dashboard" delta={metrics.averageRpe.deltaLabel} deltaTone={metrics.averageRpe.deltaTone} />
        </MetricLink>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <Card>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Alertas</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Semana activa</h3>
          <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
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
        </Card>

        <Link href="/muscle-load" className="block rounded-md outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]">
          <Card className="h-full transition hover:-translate-y-0.5 hover:border-[rgba(56,217,159,0.34)]">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Carga muscular</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">Top músculos</h3>
            <div className="mt-5">
              {metrics.topMuscles.length > 0 ? (
                <MuscleLoadList muscles={metrics.topMuscles.slice(0, 5)} />
              ) : (
                <p className="text-sm text-[var(--muted)]">Sin carga acumulada esta semana.</p>
              )}
            </div>
          </Card>
        </Link>
      </section>
    </>
  );
}
