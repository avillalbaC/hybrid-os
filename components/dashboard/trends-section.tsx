"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { getHomeTrendSummary } from "@/lib/analytics/trends";
import { formatTrainingType } from "@/lib/utils/format";
import type { TrendMetric, TrendStatus, WeeklyTrendMetrics } from "@/lib/analytics/trends";
import type { TrainingSessionType } from "@/types/training";

function formatStatus(status: TrendStatus) {
  const labels: Record<TrendStatus, string> = {
    subiendo: "Subiendo",
    estable: "Estable",
    bajando: "Bajando",
    estancado: "Estable",
    subida_brusca: "Subida brusca",
    descarga: "Semana de descarga",
    referencia_insuficiente: "Histórico insuficiente",
  };

  return labels[status];
}

function getStatusClassName(status: TrendStatus) {
  const classes: Record<TrendStatus, string> = {
    subiendo: "border-[var(--accent-secondary-border)] bg-[var(--accent-secondary-soft)] text-[var(--accent-secondary-text)]",
    estable: "border-[var(--line)] bg-[rgba(244,247,244,0.035)] text-[var(--muted-strong)]",
    bajando: "border-[var(--line)] bg-[rgba(244,247,244,0.035)] text-[var(--muted-strong)]",
    estancado: "border-[var(--line)] bg-[rgba(244,247,244,0.035)] text-[var(--muted-strong)]",
    subida_brusca: "border-[rgba(240,196,107,0.32)] bg-[var(--warning-soft)] text-[var(--warning)]",
    descarga: "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-strong)]",
    referencia_insuficiente: "border-[var(--line)] bg-[rgba(244,247,244,0.035)] text-[var(--muted)]",
  };

  return classes[status];
}

function formatTrendValue(metric: TrendMetric, value: number | null) {
  if (value === null) {
    return "-";
  }

  if (metric.key.includes("Run") && metric.key.includes("Meters")) {
    return `${(value / 1000).toFixed(1)} km`;
  }

  if (metric.key === "durationMinutes") {
    const rounded = Math.round(value);
    const hours = Math.floor(rounded / 60);
    const minutes = rounded % 60;

    return hours > 0 ? `${hours} h ${String(minutes).padStart(2, "0")} min` : `${minutes} min`;
  }

  if (metric.key === "totalExternalLoadKg") {
    const rounded = Math.round(value);
    return rounded >= 1000 ? `${(rounded / 1000).toFixed(1)} t` : `${rounded.toLocaleString("es-ES")} kg`;
  }

  if (metric.key === "averageRpe") {
    return value > 0 ? `${value.toFixed(1)}/10` : "-";
  }

  return `${Math.round(value)}`;
}

function formatChange(metric: TrendMetric) {
  if (metric.changePercent === null) {
    return "Sin referencia";
  }

  const sign = metric.changePercent > 0 ? "+" : "";
  return `${sign}${metric.changePercent}% vs media 4 semanas`;
}

function formatDisciplineLabel(type: TrainingSessionType | "secondary_activity") {
  return type === "secondary_activity" ? "Actividad secundaria" : formatTrainingType(type);
}

function TrendBars({ metric }: { metric: TrendMetric }) {
  const maxValue = Math.max(...metric.weeklyValues.map((item) => item.value), 1);

  return (
    <div className="mt-4 flex h-16 items-end gap-1.5" aria-label={`${metric.label}: últimas semanas`}>
      {metric.weeklyValues.map((item) => {
        const height = Math.max(8, Math.round((item.value / maxValue) * 64));

        return (
          <span
            key={item.weekKey}
            title={`${item.isCurrentWeek ? "Esta semana · " : ""}${item.label}${item.metaLabel ? ` · ${item.metaLabel}` : ""}: ${formatTrendValue(metric, item.value)}`}
            className={`min-w-0 flex-1 rounded-sm border bg-[linear-gradient(180deg,var(--accent),rgba(244,247,244,0.07))] ${item.isCurrentWeek ? "border-[var(--accent-border-strong)] ring-1 ring-[var(--accent)]" : "border-[rgba(244,247,244,0.08)]"}`}
            style={{ height }}
          />
        );
      })}
    </div>
  );
}

function TrendCard({ metric }: { metric: TrendMetric }) {
  const hasReference = metric.status !== "referencia_insuficiente";

  return (
    <article className="rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">{metric.label}</p>
          <p className="mt-3 font-mono text-3xl font-black tracking-tight">{formatTrendValue(metric, metric.currentValue)}</p>
        </div>
        <span className={`rounded-md border px-2.5 py-1.5 text-right font-mono text-[0.68rem] font-black uppercase tracking-[0.08em] ${getStatusClassName(metric.status)}`}>
          {formatStatus(metric.status)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-5 text-[var(--muted-strong)]">
        {hasReference
          ? `${formatTrendValue(metric, metric.currentValue)} · ${formatChange(metric)}`
          : "Histórico insuficiente para tendencia"}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-2">
          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Media 4 sem.</dt>
          <dd className="mt-1 font-mono font-black">{formatTrendValue(metric, metric.recentAverage)}</dd>
        </div>
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-2">
          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Anterior</dt>
          <dd className="mt-1 font-mono font-black">{formatTrendValue(metric, metric.previousAverage)}</dd>
        </div>
      </dl>
      <TrendBars metric={metric} />
      {metric.detail ? <p className="mt-3 text-sm leading-5 text-[var(--muted-strong)]">{metric.detail}</p> : null}
      <p className="mt-2 text-sm leading-5 text-[var(--muted)]">{metric.message}</p>
    </article>
  );
}

function TrendSkeletonGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "grid gap-3" : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"} aria-label="Tendencias calculando">
      {Array.from({ length: compact ? 3 : 6 }).map((_, index) => (
        <div key={index} className="rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-4">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="mt-4 h-8 w-24" />
          <SkeletonBlock className="mt-4 h-14 w-full" />
        </div>
      ))}
    </div>
  );
}

function DisciplineTrendBlock({ trends }: { trends: WeeklyTrendMetrics }) {
  const rows = Object.entries(trends.disciplineTrend.current)
    .map(([type, value]) => ({
      type: type as TrainingSessionType | "secondary_activity",
      value: value ?? 0,
      recentAverage: trends.disciplineTrend.recentAverage[type as TrainingSessionType | "secondary_activity"] ?? 0,
    }))
    .filter((row) => row.value > 0 || row.recentAverage > 0)
    .sort((a, b) => b.value - a.value);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Distribución por disciplina</p>
          <h4 className="mt-2 text-xl font-black tracking-tight">Sesiones de la semana</h4>
        </div>
        <Badge>{trends.currentWeek?.sessionsCount ?? 0} sesiones</Badge>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => (
          <div key={row.type} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
            <p className="text-sm font-bold text-[var(--foreground)]">{formatDisciplineLabel(row.type)}</p>
            <p className="mt-1 font-mono text-lg font-black">{row.value}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Media 4 sem.: {row.recentAverage.toFixed(1)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrendsSection({
  isLoading = false,
  trends,
}: {
  isLoading?: boolean;
  trends: WeeklyTrendMetrics;
}) {
  const hasSessions = Boolean(trends.currentWeek?.sessionsCount);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Tendencias</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Evolución semanal</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">Evolución semanal de volumen, carrera, carga e intensidad.</p>
        </div>
        <Badge tone="accent">Ritmo esperado a día de semana</Badge>
      </div>

      {isLoading ? (
        <TrendSkeletonGrid />
      ) : trends.buckets.length === 0 ? (
        <div className="rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-6 text-sm leading-6 text-[var(--muted)]">
          Sin entrenamientos en el periodo.
        </div>
      ) : !hasSessions ? (
        <div className="rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-6 text-sm leading-6 text-[var(--muted)]">
          Sin entrenamientos en el periodo.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trends.keyTrends.map((metric) => (
            <TrendCard key={metric.key} metric={metric} />
          ))}
        </div>
      )}

      {!isLoading && trends.currentWeek ? (
        <>
          <div className="mt-4 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4 text-sm leading-6 text-[var(--muted-strong)]">
            <span className="font-semibold text-[var(--foreground)]">Carrera separada:</span>{" "}
            {formatTrendValue(trends.runExposure.structured, trends.currentWeek.structuredRunMeters)} running estructurado ·{" "}
            {formatTrendValue(trends.runExposure.mixed, trends.currentWeek.mixedRunMeters)} en sesiones mixtas ·{" "}
            {formatTrendValue(trends.runExposure.total, trends.currentWeek.totalRunExposureMeters)} total.
            {trends.currentWeek.mixedRunMeters > trends.currentWeek.structuredRunMeters ? " Carrera mixta elevada por HYROX/CrossFit." : ""}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Implementos</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-strong)]">
                Barra {trends.currentWeek.totalBarbellReps} reps · Mancuernas {trends.currentWeek.totalDumbbellReps} · KB {trends.currentWeek.totalKettlebellReps}
              </p>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">RPE alto</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-strong)]">{trends.currentWeek.sessionsRpe8Plus} sesiones con RPE 8+</p>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Carga muscular</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-strong)]">
                Tren inferior {trends.currentWeek.lowerBodyLoad} · Tren superior {trends.currentWeek.upperBodyLoad}
              </p>
            </div>
          </div>
          <DisciplineTrendBlock trends={trends} />
        </>
      ) : null}
    </section>
  );
}

export function QuickTrendsCard({
  isLoading = false,
  trends,
}: {
  isLoading?: boolean;
  trends: WeeklyTrendMetrics;
}) {
  const quickTrends = getHomeTrendSummary(trends.buckets);

  return (
    <section className="rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.26)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Tendencias rápidas</p>
          <h3 className="mt-2 text-xl font-black tracking-tight">Lectura semanal</h3>
        </div>
        <Link href="/dashboard" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Ver tendencias completas
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4">
          <TrendSkeletonGrid compact />
        </div>
      ) : trends.buckets.length === 0 || !trends.currentWeek?.sessionsCount ? (
        <p className="mt-4 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm leading-6 text-[var(--muted)]">
          Sin entrenamientos en el periodo.
        </p>
      ) : (
        <div className="mt-4 grid gap-3">
          {quickTrends.map((metric) => (
            <div key={metric.key} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">{metric.label}</p>
                  <p className="mt-1 font-mono text-lg font-black">{formatTrendValue(metric, metric.currentValue)}</p>
                </div>
                <span className={`rounded-md border px-2 py-1 text-right font-mono text-[0.65rem] font-black uppercase tracking-[0.08em] ${getStatusClassName(metric.status)}`}>
                  {formatStatus(metric.status)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{formatChange(metric)}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-strong)]">{metric.message}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
