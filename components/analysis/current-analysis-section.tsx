import { InsightCard, InsightList } from "@/components/analytics/data-insights-panel";
import { ChartCard } from "@/components/charts/chart-card";
import { DisciplineDistributionChart } from "@/components/charts/discipline-distribution-chart";
import { HorizontalRankingChart } from "@/components/charts/horizontal-ranking-chart";
import { StackedRunBars } from "@/components/charts/stacked-run-bars";
import { formatTrendValue, getTrendStatusTone, trendStatusLabels } from "@/components/charts/trend-card-chart";
import { WeeklyBarChart } from "@/components/charts/weekly-bar-chart";
import { Card } from "@/components/ui/card";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import {
  getDisciplineDistributionData,
  getMuscleRankingChartData,
  getRunExposureChartData,
  getWeeklyChartData,
} from "@/lib/analytics/chart-data";
import type { TrainingDataInsightsResult } from "@/lib/analytics/data-insights";
import type { WeeklyTrendMetrics } from "@/lib/analytics/trends";
import type { DashboardPeriod } from "@/lib/domain/dashboard/periods";
import { formatDuration, formatKm } from "@/lib/utils/format";
import type { TrainingSession } from "@/types/training";

export function CurrentAnalysisSection({
  analysis,
  isLoading,
  period,
  sessions,
  trends,
}: {
  analysis: TrainingDataInsightsResult;
  isLoading?: boolean;
  period: DashboardPeriod;
  sessions: TrainingSession[];
  trends: WeeklyTrendMetrics;
}) {
  const weeklyData = getWeeklyChartData(sessions).slice(-8);
  const runExposureData = getRunExposureChartData(sessions).slice(-8);
  const disciplineData = getDisciplineDistributionData(sessions, period);
  const muscleRanking = getMuscleRankingChartData(sessions, period, 6);
  const topDiscipline = disciplineData[0];
  const topMuscle = muscleRanking[0];

  if (isLoading) {
    return (
      <div className="grid gap-5">
        <Card>
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="mt-4 h-8 w-3/4" />
          <div className="mt-4">
            <SkeletonText lines={4} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <Card>
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Lectura global</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight">{analysis.summary.headline}</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--muted-strong)]">{analysis.summary.summary}</p>
      </Card>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Evolución semanal reciente"
          description="Duración total de las últimas semanas para leer volumen real."
          unit="tiempo"
          currentValue={formatTrendValue(trends.duration, trends.duration.currentValue)}
          meta={[
            { label: "Media reciente", value: formatTrendValue(trends.duration, trends.duration.recentAverage) },
            { label: "Cambio", value: trends.duration.changePercent === null ? "Sin referencia" : `${trends.duration.changePercent > 0 ? "+" : ""}${trends.duration.changePercent}%` },
          ]}
          status={{ label: trendStatusLabels[trends.duration.status], tone: getTrendStatusTone(trends.duration.status) }}
          footer={trends.duration.message}
        >
          <WeeklyBarChart
            data={weeklyData.map((week) => ({ key: week.weekKey, label: week.label, value: week.durationMinutes }))}
            formatter={(value) => formatDuration(value, { emptyLabel: "0 min" })}
          />
        </ChartCard>
        <ChartCard
          title="Distribución por disciplina"
          description="Peso relativo de cada disciplina dentro del periodo seleccionado."
          unit="sesiones"
          currentValue={topDiscipline ? topDiscipline.label : undefined}
          meta={topDiscipline ? [{ label: "Peso", value: `${topDiscipline.percentage}%` }] : undefined}
          footer="El reparto ayuda a interpretar si el periodo fue de carrera, fuerza, HYROX o carga secundaria."
        >
          <DisciplineDistributionChart data={disciplineData} />
        </ChartCard>
        <ChartCard
          title="Carrera estructurada vs mixta"
          description="Running técnico separado del impacto acumulado en sesiones mixtas."
          unit="km"
          currentValue={formatTrendValue(trends.runExposure.total, trends.runExposure.total.currentValue)}
          meta={[
            { label: "Media reciente", value: formatTrendValue(trends.runExposure.total, trends.runExposure.total.recentAverage) },
            { label: "Cambio", value: trends.runExposure.total.changePercent === null ? "Sin referencia" : `${trends.runExposure.total.changePercent > 0 ? "+" : ""}${trends.runExposure.total.changePercent}%` },
          ]}
          status={{ label: trendStatusLabels[trends.runExposure.total.status], tone: getTrendStatusTone(trends.runExposure.total.status) }}
          footer={trends.runExposure.total.message}
        >
          <StackedRunBars
            data={runExposureData.map((week) => ({
              key: week.weekKey,
              label: week.label,
              structuredRunMeters: week.structuredRunMeters,
              mixedRunMeters: week.mixedRunMeters,
            }))}
            formatter={(value) => formatKm(value, { forceKm: true })}
          />
        </ChartCard>
        <ChartCard
          title="Top músculos"
          description="Carga acumulada del periodo por grupo muscular."
          unit="pts"
          currentValue={topMuscle ? `${topMuscle.label} ${topMuscle.load}` : undefined}
          meta={topMuscle ? [{ label: "Relativo", value: `${topMuscle.percentage}%` }] : undefined}
          footer="El insight muscular explica la concentración, pero el ranking muestra dónde está la carga."
        >
          <HorizontalRankingChart
            items={muscleRanking.map((item) => ({
              key: item.muscle,
              label: item.label,
              value: item.load,
              percentage: item.percentage,
            }))}
            formatter={(value) => `${Math.round(value)} pts`}
          />
        </ChartCard>
      </section>

      <section>
        <h3 className="text-xl font-black tracking-tight">Señales principales</h3>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {analysis.summary.topSignals.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Qué vigilar</p>
          <div className="mt-4">
            <InsightList empty="Sin señales de riesgo con los umbrales actuales." insights={analysis.summary.warnings} />
          </div>
        </Card>
        <Card>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Qué va bien</p>
          <div className="mt-4">
            <InsightList empty="Sin señales positivas claras en este periodo." insights={analysis.summary.positives} />
          </div>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <Card>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Recomendaciones</p>
          <div className="mt-4 space-y-3">
            {analysis.summary.recommendations.length > 0 ? (
              analysis.summary.recommendations.map((recommendation) => (
                <p key={recommendation} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm font-semibold leading-6 text-[var(--foreground)]">
                  {recommendation}
                </p>
              ))
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">Completar más datos antes de recomendar cambios.</p>
            )}
          </div>
        </Card>
        <Card>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Evidencias</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {analysis.insights.slice(0, 8).map((insight) => (
              <div key={insight.id} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
                <p className="text-sm font-bold text-[var(--foreground)]">{insight.title}</p>
                <ul className="mt-2 space-y-1 text-sm leading-6 text-[var(--muted)]">
                  {insight.evidence.slice(0, 3).map((item) => (
                    <li key={item}>Dato: {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
