import { InsightCard, InsightList } from "@/components/analytics/data-insights-panel";
import { CheckInContextCard } from "@/components/goals/check-in-context-card";
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
import type { GoalProgressSummary } from "@/types/goals";
import type { WeeklyPlanSummary } from "@/types/planning";
import type { TrainingSession } from "@/types/training";

function GoalContextCard({
  progress,
  isLoading,
}: {
  progress: GoalProgressSummary;
  isLoading?: boolean;
}) {
  const signals = [...progress.negativeSignals, ...progress.insufficientData].slice(0, 3);

  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Contexto de objetivo</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">{progress.goalTitle ? progress.goalTitle : "Sin objetivo activo"}</h3>
        </div>
        <a href="/goals" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Ver objetivos
        </a>
      </div>
      {isLoading ? (
        <div className="mt-4">
          <SkeletonText lines={3} />
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-strong)]">{progress.summary}</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {signals.length > 0 ? (
              signals.map((item) => (
                <div key={item.id} className="rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-3">
                  <p className="text-sm font-black text-[var(--foreground)]">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">{item.evidence}</p>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm leading-6 text-[var(--muted)]">
                Sin desviaciones principales contra el objetivo activo.
              </p>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

function PlanningContextCard({
  summary,
  isLoading,
}: {
  summary: WeeklyPlanSummary;
  isLoading?: boolean;
}) {
  const deviations = summary.deviations.slice(0, 3);

  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Cumplimiento del plan</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">
            {summary.adherencePercentage === null ? "No hay plan semanal registrado" : `${summary.adherencePercentage}% de adherencia`}
          </h3>
        </div>
        <a href="/goals" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Ver plan
        </a>
      </div>
      {isLoading ? (
        <div className="mt-4">
          <SkeletonText lines={3} />
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-strong)]">
            Plan {summary.plannedSessions} · completadas {summary.completedPlannedSessions} · no planificadas {summary.unplannedCompletedSessions}.
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {deviations.length > 0 ? (
              deviations.map((deviation) => (
                <div key={deviation.id} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
                  <p className="text-sm font-black text-[var(--foreground)]">{deviation.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">{deviation.description}</p>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm leading-6 text-[var(--muted)]">
                Sin desviaciones relevantes del plan.
              </p>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

export function CurrentAnalysisSection({
  analysis,
  goalProgress,
  isGoalLoading,
  isPlanningLoading,
  isLoading,
  period,
  planningSummary,
  sessions,
  trends,
}: {
  analysis: TrainingDataInsightsResult;
  goalProgress: GoalProgressSummary;
  isGoalLoading?: boolean;
  isPlanningLoading?: boolean;
  isLoading?: boolean;
  period: DashboardPeriod;
  planningSummary: WeeklyPlanSummary;
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

      <GoalContextCard progress={goalProgress} isLoading={isGoalLoading} />

      <CheckInContextCard context={goalProgress.checkInContext} />

      <PlanningContextCard summary={planningSummary} isLoading={isPlanningLoading} />

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
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Contexto para check diario</p>
          <div className="mt-4 space-y-3">
            {[...goalProgress.positiveSignals.slice(0, 2), ...goalProgress.negativeSignals.slice(0, 2)].length > 0 ? (
              [...goalProgress.positiveSignals.slice(0, 2), ...goalProgress.negativeSignals.slice(0, 2)].map((signal) => (
                <p key={signal.id} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm font-semibold leading-6 text-[var(--foreground)]">
                  <span className="block text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{signal.direction === "positive" ? "A favor" : "En contra"}</span>
                  {signal.label}: <span className="font-medium text-[var(--muted-strong)]">{signal.evidence}</span>
                </p>
              ))
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">Faltan más datos para preparar contexto adicional.</p>
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
