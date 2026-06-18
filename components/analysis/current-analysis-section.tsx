import { CheckInContextCard } from "@/components/check-in/check-in-context-card";
import { ChartCard } from "@/components/charts/chart-card";
import { DisciplineDistributionChart } from "@/components/charts/discipline-distribution-chart";
import { HorizontalRankingChart } from "@/components/charts/horizontal-ranking-chart";
import { MetricComparisonCard } from "@/components/charts/metric-comparison-card";
import { ScatterCard } from "@/components/charts/scatter-card";
import { StackedWeeklyBars } from "@/components/charts/stacked-weekly-bars";
import { formatTrendValue, getTrendStatusTone, trendStatusLabels } from "@/components/charts/trend-card-chart";
import { WeeklyBarChart } from "@/components/charts/weekly-bar-chart";
import { Card } from "@/components/ui/card";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import {
  buildAnalysisSummaryData,
  buildDisciplineDistributionData,
  buildDurationRpeScatterData,
  buildIntensityDistributionData,
  buildMuscleRankingData,
  buildRunningSplitData,
  buildWeeklyTrainingLoadData,
} from "@/lib/analytics/analysis-chart-data";
import { getDisciplineDistributionData } from "@/lib/analytics/chart-data";
import type { DataInsight, TrainingDataInsightsResult } from "@/lib/analytics/data-insights";
import type { WeeklyTrendMetrics } from "@/lib/analytics/trends";
import type { DashboardPeriod } from "@/lib/domain/dashboard/periods";
import { formatDuration, formatKm, formatRpe } from "@/lib/utils/format";
import type { GoalProgressSummary } from "@/types/goals";
import type { WeeklyPlanSummary } from "@/types/planning";
import type { TrainingSession } from "@/types/training";

const periodLabels: Record<DashboardPeriod, string> = {
  week: "Semana actual",
  month: "Mes actual",
  year: "Año actual",
  all: "Histórico completo",
};

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
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Plan semanal beta</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">
            {summary.adherencePercentage === null ? "Sin plan semanal registrado" : `${summary.adherencePercentage}% de adherencia`}
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

function SignalEvidenceCard({ insight }: { insight: DataInsight }) {
  return (
    <article className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Señal</p>
      <h4 className="mt-2 text-base font-black tracking-tight text-[var(--foreground)]">{insight.title}</h4>
      <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">{insight.message}</p>
      <ul className="mt-3 space-y-1 text-sm leading-6 text-[var(--muted)]">
        {insight.evidence.slice(0, 3).map((item) => (
          <li key={item}>Dato relevante: {item}</li>
        ))}
      </ul>
    </article>
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
  const summary = buildAnalysisSummaryData(sessions, period);
  const weeklyData = buildWeeklyTrainingLoadData(sessions).slice(-8);
  const disciplineStack = buildDisciplineDistributionData(sessions).slice(-8);
  const runningSplit = buildRunningSplitData(sessions).slice(-8);
  const intensityStack = buildIntensityDistributionData(sessions).slice(-8);
  const scatterData = buildDurationRpeScatterData(sessions, period);
  const disciplineData = getDisciplineDistributionData(sessions, period);
  const muscleRanking = buildMuscleRankingData(sessions, period).slice(0, 8);
  const topDiscipline = disciplineData[0];
  const topMuscle = muscleRanking[0];
  const objectiveSignals = analysis.summary.topSignals.slice(0, 5);

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
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Laboratorio visual</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight">{periodLabels[period]}</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--muted-strong)]">{analysis.summary.summary}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricComparisonCard label="Sesiones" value={`${summary.sessions}`} detail="Entrenamientos reales del periodo." />
          <MetricComparisonCard label="Duración" value={formatDuration(summary.durationMinutes, { emptyLabel: "0 min" })} detail="Volumen temporal registrado." />
          <MetricComparisonCard label="Fatiga" value={`${summary.fatigueCost}`} detail="Carga interna agregada." />
          <MetricComparisonCard label="RPE medio" value={formatRpe(summary.averageRpe)} reference={`${summary.highRpeSessions} altas`} detail="Intensidad percibida disponible." />
          <MetricComparisonCard label="Carrera total" value={formatKm(summary.totalRunMeters, { forceKm: true })} reference={`${formatKm(summary.structuredRunMeters, { forceKm: true })} / ${formatKm(summary.mixedRunMeters, { forceKm: true })}`} detail="Estructurada / mixta." />
        </div>
      </Card>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <ChartCard
          title="Carga semanal reciente"
          description="Duración y fatiga permiten leer si el periodo llega desde acumulación o descarga."
          unit="min / pts"
          currentValue={formatTrendValue(trends.duration, trends.duration.currentValue)}
          meta={[
            { label: "Fatiga actual", value: formatTrendValue(trends.load, trends.load.currentValue) },
            { label: "Cambio duración", value: trends.duration.changePercent === null ? "Sin referencia" : `${trends.duration.changePercent > 0 ? "+" : ""}${trends.duration.changePercent}%` },
          ]}
          status={{ label: trendStatusLabels[trends.duration.status], tone: getTrendStatusTone(trends.duration.status) }}
          footer={trends.duration.message}
        >
          <WeeklyBarChart
            data={weeklyData.map((week) => ({ key: week.weekKey, label: week.label, metaLabel: week.metaLabel, isCurrentWeek: week.isCurrentWeek, value: week.durationMinutes }))}
            formatter={(value) => formatDuration(value, { emptyLabel: "0 min" })}
          />
        </ChartCard>

        <ChartCard
          title="Distribución del periodo"
          description="Peso relativo de cada disciplina en la selección actual."
          unit="sesiones"
          currentValue={topDiscipline ? topDiscipline.label : undefined}
          meta={topDiscipline ? [{ label: "Peso", value: `${topDiscipline.percentage}%` }] : undefined}
          isEmpty={disciplineData.length === 0}
          footer="Contexto útil para separar semanas de carrera, fuerza, HYROX o actividad funcional."
        >
          <DisciplineDistributionChart data={disciplineData} />
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Disciplina por semana"
          description="Barras apiladas para ver hacia dónde se desplaza cada semana."
          unit="sesiones"
          footer="La mezcla semanal ayuda a explicar cambios de carga sin leer la lista de sesiones."
        >
          <StackedWeeklyBars data={disciplineStack} formatter={(value) => `${Math.round(value)}`} />
        </ChartCard>

        <ChartCard
          title="Running estructurado vs carrera mixta"
          description="Kilómetros de running puro separados del impacto acumulado dentro de sesiones mixtas."
          unit="km"
          currentValue={formatTrendValue(trends.runExposure.total, trends.runExposure.total.currentValue)}
          meta={[
            { label: "Media reciente", value: formatTrendValue(trends.runExposure.total, trends.runExposure.total.recentAverage) },
            { label: "Cambio", value: trends.runExposure.total.changePercent === null ? "Sin referencia" : `${trends.runExposure.total.changePercent > 0 ? "+" : ""}${trends.runExposure.total.changePercent}%` },
          ]}
          status={{ label: trendStatusLabels[trends.runExposure.total.status], tone: getTrendStatusTone(trends.runExposure.total.status) }}
          footer="La carrera mixta cuenta como impacto, pero no como running técnico."
        >
          <StackedWeeklyBars data={runningSplit} formatter={(value) => `${value.toFixed(1)} km`} />
        </ChartCard>

        <ChartCard
          title="Intensidad por semana"
          description="Sesiones agrupadas por RPE bajo, moderado, alto y sin dato."
          unit="sesiones"
          footer={summary.missingRpeSessions > 0 ? `${summary.missingRpeSessions} sesiones del periodo no tienen RPE.` : "RPE disponible en las sesiones del periodo."}
        >
          <StackedWeeklyBars data={intensityStack} formatter={(value) => `${Math.round(value)}`} />
        </ChartCard>

        <ChartCard
          title="Duración vs RPE"
          description="Cada punto es una sesión con duración y RPE disponibles."
          unit="min / RPE"
          isEmpty={scatterData.length === 0}
          footer={summary.missingDurationSessions > 0 ? `${summary.missingDurationSessions} sesiones del periodo no tienen duración.` : "Útil para detectar sesiones largas e intensas dentro del periodo."}
        >
          <ScatterCard data={scatterData} />
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <ChartCard
          title="Top músculos del periodo"
          description="Carga muscular agregada para ver concentración local."
          unit="pts"
          currentValue={topMuscle ? `${topMuscle.label} ${topMuscle.load}` : undefined}
          meta={topMuscle ? [{ label: "Relativo", value: `${topMuscle.percentage}%` }] : undefined}
          isEmpty={muscleRanking.length === 0}
          footer="El ranking muestra dónde se acumula carga; la interpretación depende del objetivo y del contexto semanal."
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

        <Card>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Señales objetivas</p>
          <h3 className="mt-2 text-xl font-black tracking-tight">{analysis.summary.headline}</h3>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {objectiveSignals.length > 0 ? (
              objectiveSignals.map((insight) => <SignalEvidenceCard key={insight.id} insight={insight} />)
            ) : (
              <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4 text-sm leading-6 text-[var(--muted)]">
                Sin señales deterministas con los umbrales actuales.
              </p>
            )}
          </div>
        </Card>
      </section>

      <GoalContextCard progress={goalProgress} isLoading={isGoalLoading} />

      <CheckInContextCard
        context={goalProgress.checkInContextData}
        text={goalProgress.checkInContext}
        compactText={goalProgress.compactCheckInContext}
      />

      <PlanningContextCard summary={planningSummary} isLoading={isPlanningLoading} />
    </div>
  );
}
