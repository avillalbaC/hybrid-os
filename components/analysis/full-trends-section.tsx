"use client";

import { useState } from "react";
import { CalendarHeatmap } from "@/components/charts/calendar-heatmap";
import { ChartCard } from "@/components/charts/chart-card";
import { LineTrendCard } from "@/components/charts/line-trend-card";
import { StackedWeeklyBars } from "@/components/charts/stacked-weekly-bars";
import { TrendCardChart } from "@/components/charts/trend-card-chart";
import { Card } from "@/components/ui/card";
import { SkeletonBlock } from "@/components/ui/skeleton";
import {
  buildDataQualityTimelineData,
  buildMuscleTrendData,
  buildTrainingConsistencyData,
} from "@/lib/analytics/analysis-chart-data";
import type { TrendMetric, WeeklyTrendMetrics } from "@/lib/analytics/trends";
import type { TrainingSession } from "@/types/training";

function TrendGroup({
  description,
  metrics,
  title,
}: {
  description: string;
  metrics: TrendMetric[];
  title: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleMetrics = expanded ? metrics : metrics.slice(0, 4);

  return (
    <section>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-black tracking-tight">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
        {metrics.length > 4 ? (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="min-h-10 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        ) : null}
      </div>
      <div className={`grid gap-3 md:grid-cols-2 ${visibleMetrics.length <= 2 ? "xl:max-w-3xl xl:grid-cols-2" : "xl:grid-cols-4"}`}>
        {visibleMetrics.map((metric) => (
          <TrendCardChart key={metric.key} metric={metric} />
        ))}
      </div>
    </section>
  );
}

export function FullTrendsSection({
  isLoading,
  sessions,
  trends,
}: {
  isLoading?: boolean;
  sessions: TrainingSession[];
  trends: WeeklyTrendMetrics;
}) {
  const muscleTrends = buildMuscleTrendData(sessions).slice(0, 8);
  const consistencyData = buildTrainingConsistencyData(sessions, 84);
  const qualityTimeline = buildDataQualityTimelineData(sessions).slice(-8);
  const groups = [
    { title: "Volumen", description: "Tiempo y frecuencia para leer si el bloque acumula o descarga.", metrics: [trends.duration] },
    { title: "Carrera", description: "Exposición total separando running técnico de carrera mixta.", metrics: [trends.runExposure.total, trends.runExposure.structured, trends.runExposure.mixed] },
    { title: "Carga", description: "Fatiga, impacto y cargas por estímulo para interpretar acumulación.", metrics: [trends.load, trends.impact, trends.cardioLoad, trends.technicalLoad] },
    { title: "Fuerza", description: "Peso movido y carga de fuerza para ver si el bloque sostiene estímulo pesado.", metrics: [trends.externalLoad, trends.strengthLoad] },
    { title: "Intensidad", description: "RPE medio como señal de dureza percibida.", metrics: [trends.averageRpe] },
    { title: "Muscular", description: "Carga muscular total para detectar concentración acumulada.", metrics: [trends.muscleLoad] },
  ];

  return (
    <section>
      <div className="mb-4">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Tendencias completas</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight">Evolución agrupada</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Lectura semanal con media reciente y serie de las últimas semanas.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Tendencias calculando">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-52" />
          ))}
        </div>
      ) : trends.buckets.length === 0 ? (
        <Card>
          <p className="text-sm leading-6 text-[var(--muted)]">Sin entrenamientos suficientes para tendencias.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <TrendGroup key={group.title} title={group.title} description={group.description} metrics={group.metrics} />
          ))}
          <section>
            <div className="mb-3">
              <h3 className="text-xl font-black tracking-tight">Músculos principales</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Mini líneas de las últimas semanas para ver qué cargas locales suben o bajan.</p>
            </div>
            {muscleTrends.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {muscleTrends.map((muscle) => (
                  <LineTrendCard
                    key={muscle.muscle}
                    label={muscle.label}
                    value={`${Math.round(muscle.totalLoad)} pts`}
                    data={muscle.points}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <p className="text-sm leading-6 text-[var(--muted)]">Sin carga muscular suficiente para tendencias.</p>
              </Card>
            )}
          </section>
          <section className="grid gap-5 xl:grid-cols-2">
            <ChartCard
              title="Consistencia"
              description="Últimas 12 semanas por día con intensidad visual según sesiones, duración y fatiga."
              unit="días"
              footer="Dato útil para distinguir continuidad real de semanas con sesiones concentradas."
            >
              <CalendarHeatmap data={consistencyData} />
            </ChartCard>
            <ChartCard
              title="Calidad de datos semanal"
              description="Completas, parciales y principales faltantes por semana."
              unit="sesiones"
              footer="La tendencia de calidad indica qué semanas son más comparables."
            >
              <StackedWeeklyBars data={qualityTimeline} formatter={(value) => `${Math.round(value)}`} />
            </ChartCard>
          </section>
        </div>
      )}
    </section>
  );
}
