"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { MuscleLoadList } from "@/components/muscle-load/muscle-load-list";
import { TrainingSessionCard } from "@/components/training/training-session-card";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { DisciplinesOverview } from "@/components/dashboard/disciplines-overview";
import { calculateDashboardMetrics } from "@/lib/domain/dashboard/metrics";
import { getLatestWeekSessions } from "@/lib/domain/training/analysis";
import { compareWeeks } from "@/lib/selectors/training";
import { useDashboardData } from "@/lib/storage/use-dashboard-data";
import type { DashboardPeriod } from "@/lib/domain/dashboard/periods";
import type { BodyCheck } from "@/types/body";
import type { NutritionCheck } from "@/types/nutrition";
import type { TrainingSession } from "@/types/training";

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
  const {
    sessions: dashboardSessions,
    bodyChecks: dashboardBodyChecks,
    nutritionChecks: dashboardNutritionChecks,
    source,
    message: syncMessage,
  } = useDashboardData({
    seedSessions: sessions,
    seedBodyChecks: bodyChecks,
    seedNutritionChecks: nutritionChecks,
  });
  const metrics = useMemo(
    () => calculateDashboardMetrics(dashboardSessions, dashboardBodyChecks, dashboardNutritionChecks, period),
    [dashboardBodyChecks, dashboardNutritionChecks, dashboardSessions, period],
  );
  const weeklyComparison = useMemo(() => {
    const { currentWeekSessions, previousWeekSessions } = getLatestWeekSessions(dashboardSessions);

    return compareWeeks(currentWeekSessions, previousWeekSessions);
  }, [dashboardSessions]);

  return (
    <>
      <section className="mb-8 overflow-hidden rounded-md border border-[var(--line)] bg-[linear-gradient(135deg,rgba(56,217,159,0.14),rgba(21,27,24,0.98)_38%,rgba(12,16,15,0.98))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)] sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[var(--accent)]">
              {metrics.periodTitle}
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-[var(--foreground)] sm:text-6xl">
              Hybrid athlete control room.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted-strong)]">
              Entrenamiento, carga muscular, nutrición y señales corporales en una vista de decisión rápida.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={source === "remote" ? "accent" : source === "seed-fallback" ? "warning" : "neutral"}>
                {source === "remote" ? "Datos Supabase" : source === "seed-fallback" ? "Fallback seed" : "sincronizando"}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:items-center lg:justify-end">
            <PeriodSelector value={period} onChange={setPeriod} />
            <Link
              href="/training/import"
              className="inline-flex items-center justify-center rounded-md border border-[rgba(56,217,159,0.34)] bg-[var(--accent)] px-4 py-3 text-sm font-black text-[#06100c] transition hover:bg-[var(--accent-strong)]"
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
          tone="strong"
        />
        <MetricCard
          label="Km de running"
          value={metrics.runningKm.formattedValue}
          detail="Running + HYROX"
          delta={metrics.runningKm.deltaLabel}
          deltaTone={metrics.runningKm.deltaTone}
          tone="strong"
        />
        <MetricCard
          label="Duración total"
          value={metrics.durationMinutes.formattedValue}
          detail={`Carga acumulada · ${metrics.periodDetail}`}
          delta={metrics.durationMinutes.deltaLabel}
          deltaTone={metrics.durationMinutes.deltaTone}
        />
        <MetricCard
          label="RPE medio"
          value={metrics.averageRpe.formattedValue}
          detail="Intensidad percibida"
          delta={metrics.averageRpe.deltaLabel}
          deltaTone={metrics.averageRpe.deltaTone}
        />
        <MetricCard
          label="Peso actual"
          value={metrics.weightKg.formattedValue}
          detail="Último registro corporal"
          delta={metrics.weightKg.deltaLabel}
          deltaTone={metrics.weightKg.deltaTone}
        />
        <MetricCard
          label="Cintura actual"
          value={metrics.waistCm.formattedValue}
          detail="Último registro corporal"
          delta={metrics.waistCm.deltaLabel}
          deltaTone={metrics.waistCm.deltaTone}
        />
        <MetricCard
          label="Adherencia nutricional"
          value={metrics.nutritionAdherence.formattedValue}
          detail="Media del periodo"
          delta={metrics.nutritionAdherence.deltaLabel}
          deltaTone={metrics.nutritionAdherence.deltaTone}
        />
        <MetricCard
          label="Sueño"
          value={metrics.sleepHours.formattedValue}
          detail="Último registro corporal"
          delta={metrics.sleepHours.deltaLabel}
          deltaTone={metrics.sleepHours.deltaTone}
        />
      </section>

      <DisciplinesOverview sessions={dashboardSessions} />

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Actividad reciente</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight">Últimos entrenamientos</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{metrics.periodDetail}</p>
            </div>
            <Link href="/training" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
              Ver log
            </Link>
          </div>
          <div className="grid gap-4">
            {metrics.recentSessions.length > 0 ? (
              metrics.recentSessions.map((session) => (
                <TrainingSessionCard key={session.id} session={session} />
              ))
            ) : (
              <div className="rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-6 text-sm leading-6 text-[var(--muted)] shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
                No hay entrenamientos registrados en este periodo.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5 lg:sticky lg:top-8 lg:self-start">
          <Card>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Alertas</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">Señales del periodo</h3>
            <div className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted)]">
              {metrics.alerts.length > 0 ? (
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
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Ranking técnico para decidir dónde empujar y dónde bajar exposición.
            </p>
            <div className="mt-5">
              {metrics.topMuscles.length > 0 ? (
                <MuscleLoadList muscles={metrics.topMuscles} />
              ) : (
                <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4 text-sm leading-6 text-[var(--muted)]">
                  Sin carga muscular acumulada en este periodo.
                </div>
              )}
            </div>
            <Link href="/muscle-load" className="mt-4 inline-flex text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
              Abrir detalle muscular
            </Link>
          </Card>

          <Card>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Comparativa semanal</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">{weeklyComparison.current.weekKey}</h3>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-3">
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Sesiones</dt>
                <dd className="mt-1 font-mono text-lg font-black">{weeklyComparison.current.sessions}</dd>
              </div>
              <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-3">
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Running</dt>
                <dd className="mt-1 font-mono text-lg font-black">{(weeklyComparison.current.runMeters / 1000).toFixed(1)} km</dd>
              </div>
              <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-3">
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Duración</dt>
                <dd className="mt-1 font-mono text-lg font-black">{weeklyComparison.current.durationMinutes}m</dd>
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
          </Card>
        </div>
      </section>
    </>
  );
}
