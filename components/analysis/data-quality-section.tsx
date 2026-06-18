import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChartCard } from "@/components/charts/chart-card";
import { DataQualityBars } from "@/components/charts/data-quality-bars";
import { HorizontalRankingChart } from "@/components/charts/horizontal-ranking-chart";
import { StackedWeeklyBars } from "@/components/charts/stacked-weekly-bars";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { buildDataQualityTimelineData } from "@/lib/analytics/analysis-chart-data";
import { getDataQualityChartData } from "@/lib/analytics/chart-data";
import type { TrainingSession } from "@/types/training";

type DataQualityMetrics = {
  totalSessions: number;
  partialSessions: number;
  sessionsWithRpe: number;
  sessionsWithoutRpe: number;
  sessionsWithoutDuration: number;
  sessionsWithoutResult: number;
  runningWithoutShoes: number;
  pendingFields: Array<{ field: string; count: number }>;
};

function getDataQualityMetrics(sessions: TrainingSession[]): DataQualityMetrics {
  const pendingFieldCounts = new Map<string, number>();

  sessions.forEach((session) => {
    session.pendingFields.forEach((field) => {
      pendingFieldCounts.set(field, (pendingFieldCounts.get(field) ?? 0) + 1);
    });
  });

  return {
    totalSessions: sessions.length,
    partialSessions: sessions.filter((session) => session.status === "partial" || session.dataQuality === "partial").length,
    sessionsWithRpe: sessions.filter((session) => typeof session.rpe === "number" && session.rpe > 0).length,
    sessionsWithoutRpe: sessions.filter((session) => !(typeof session.rpe === "number" && session.rpe > 0)).length,
    sessionsWithoutDuration: sessions.filter((session) => !session.durationMinutes).length,
    sessionsWithoutResult: sessions.filter((session) => {
      if (!session.result || session.result.type === "none") {
        return true;
      }

      return !session.result.score && !session.result.timeSeconds && !session.result.capMinutes;
    }).length,
    runningWithoutShoes: sessions.filter((session) => session.type === "running" && session.sessionMetrics.totalRunMeters > 0 && !session.equipment?.shoes?.trim()).length,
    pendingFields: Array.from(pendingFieldCounts.entries())
      .map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count || a.field.localeCompare(b.field))
      .slice(0, 8),
  };
}

function getQualityLabel(metrics: DataQualityMetrics) {
  if (metrics.totalSessions === 0) {
    return { label: "Sin histórico", tone: "neutral" as const };
  }

  const completeRatio = (metrics.totalSessions - metrics.partialSessions - metrics.sessionsWithoutRpe - metrics.sessionsWithoutDuration) / metrics.totalSessions;

  if (completeRatio >= 0.75) {
    return { label: "Calidad alta", tone: "accent" as const };
  }

  if (completeRatio >= 0.45) {
    return { label: "Calidad útil", tone: "neutral" as const };
  }

  return { label: "Calidad limitada", tone: "warning" as const };
}

function getDataQualityActions(metrics: DataQualityMetrics) {
  const actions: string[] = [];
  const pendingText = metrics.pendingFields
    .filter((item) => /rpe|carga|peso|resultado|exact/i.test(item.field))
    .slice(0, 2)
    .map((item) => `${item.field} (${item.count})`)
    .join(", ");

  if (metrics.sessionsWithoutResult > 0) {
    actions.push("Registrar resultados exactos en sesiones clave mejora la comparabilidad histórica.");
  }

  if (metrics.runningWithoutShoes > 0) {
    actions.push("Zapatillas en sesiones running aportan contexto de volumen por modelo.");
  }

  if (pendingText) {
    actions.push(`PendingFields con mayor impacto en comparativas: ${pendingText}.`);
  }

  if (actions.length < 3 && metrics.sessionsWithoutRpe > 0) {
    actions.push("RPE en sesiones recientes aporta más lectura de intensidad que completar todo el histórico.");
  }

  if (actions.length === 0) {
    actions.push("El registro actual tiene cobertura suficiente; las sesiones nuevas de alta carga son el dato más relevante.");
  }

  return actions.slice(0, 3);
}

function getDataQualityImpacts(metrics: DataQualityMetrics) {
  const impacts = [
    {
      label: "Sin resultado",
      count: metrics.sessionsWithoutResult,
      impact: "Reduce comparabilidad histórica y lectura de progreso.",
    },
    {
      label: "Sin RPE",
      count: metrics.sessionsWithoutRpe,
      impact: "Limita intensidad percibida y detección de semanas duras.",
    },
    {
      label: "Sin duración",
      count: metrics.sessionsWithoutDuration,
      impact: "Puede infravalorar volumen temporal y recuperación necesaria.",
    },
    {
      label: "Partial",
      count: metrics.partialSessions,
      impact: "Análisis válido, pero con precisión limitada.",
    },
    {
      label: "Running sin zapatillas",
      count: metrics.runningWithoutShoes,
      impact: "Limita volumen por modelo y seguimiento de material.",
    },
  ];

  return impacts.filter((item) => item.count > 0).slice(0, 5);
}

function QualityMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-mono text-2xl font-black">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{detail}</p>
    </div>
  );
}

export function DataQualitySection({
  isLoading,
  sessions,
}: {
  isLoading?: boolean;
  sessions: TrainingSession[];
}) {
  const metrics = getDataQualityMetrics(sessions);
  const chartData = getDataQualityChartData(sessions);
  const qualityTimeline = buildDataQualityTimelineData(sessions).slice(-8);
  const quality = getQualityLabel(metrics);
  const qualityActions = getDataQualityActions(metrics);
  const qualityImpacts = getDataQualityImpacts(metrics);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Calidad de datos</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Fiabilidad del histórico</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Este análisis depende de la calidad de los datos importados.</p>
        </div>
        <Badge tone={quality.tone}>{quality.label}</Badge>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Calidad de datos calculando">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <Card>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Completitud visual</p>
              <h3 className="mt-2 text-xl font-black tracking-tight">Datos clave del histórico</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">RPE, duración, resultados y estado completo frente a parcial.</p>
              <div className="mt-5">
                <DataQualityBars data={chartData} />
              </div>
            </Card>
            <Card>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Pending fields frecuentes</p>
              <h3 className="mt-2 text-xl font-black tracking-tight">Campos que más limitan</h3>
              <div className="mt-5">
                <HorizontalRankingChart
                  emptyLabel="No hay campos pendientes frecuentes."
                  formatter={(value) => `${value}`}
                  items={chartData.pendingFields.map((item) => ({
                    key: item.field,
                    label: item.field,
                    value: item.count,
                  }))}
                  tone="warning"
                />
              </div>
            </Card>
          </div>

          <ChartCard
            title="Timeline de calidad"
            description="Completas, partial y principales faltantes por semana."
            unit="sesiones"
            footer="Las semanas con más faltantes tienen menor fiabilidad para comparar carga, intensidad y rendimiento."
          >
            <StackedWeeklyBars data={qualityTimeline} formatter={(value) => `${Math.round(value)}`} />
          </ChartCard>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <QualityMetric label="Sesiones totales" value={`${metrics.totalSessions}`} detail="Histórico disponible para análisis." />
            <QualityMetric label="Sesiones partial" value={`${metrics.partialSessions}`} detail="Útiles, pero con precisión limitada." />
            <QualityMetric label="Con RPE" value={`${metrics.sessionsWithRpe}`} detail="Base para intensidad percibida." />
            <QualityMetric label="Sin RPE" value={`${metrics.sessionsWithoutRpe}`} detail="Limita lectura de intensidad." />
            <QualityMetric label="Sin duración" value={`${metrics.sessionsWithoutDuration}`} detail="Puede infravalorar volumen temporal." />
            <QualityMetric label="Sin resultado" value={`${metrics.sessionsWithoutResult}`} detail="Reduce comparabilidad histórica." />
            <QualityMetric label="Running sin zapatillas" value={`${metrics.runningWithoutShoes}`} detail="No bloquea análisis, limita contexto de carrera." />
            <QualityMetric label="Campos pendientes" value={`${metrics.pendingFields.reduce((total, item) => total + item.count, 0)}`} detail="Datos marcados como relevantes al importar." />
          </div>

          <Card>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Mejoras de registro</p>
            <div className="mt-4 grid gap-3">
              {qualityActions.map((action, index) => (
                <div key={action} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Mejora {index + 1}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--foreground)]">{action}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Impacto de datos faltantes</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {qualityImpacts.length > 0 ? (
                qualityImpacts.map((item) => (
                  <div key={item.label} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-[var(--foreground)]">{item.label}</p>
                      <Badge tone="warning">{item.count}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.impact}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-[var(--muted)]">Sin faltas relevantes detectadas.</p>
              )}
            </div>
          </Card>

          <Card>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Resumen de calidad</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={metrics.sessionsWithoutRpe > 0 ? "warning" : "accent"}>RPE pendiente: {metrics.sessionsWithoutRpe}</Badge>
              <Badge tone={metrics.sessionsWithoutDuration > 0 ? "warning" : "accent"}>Duración pendiente: {metrics.sessionsWithoutDuration}</Badge>
              <Badge tone={metrics.runningWithoutShoes > 0 ? "neutral" : "accent"}>Running sin zapatillas: {metrics.runningWithoutShoes}</Badge>
              <Badge>Campos pendientes: {metrics.pendingFields.reduce((total, item) => total + item.count, 0)}</Badge>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}
