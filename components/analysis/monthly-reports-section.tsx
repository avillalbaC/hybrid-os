import { PeriodReportCard } from "@/components/analysis/period-report-card";
import { ChartCard } from "@/components/charts/chart-card";
import { HorizontalRankingChart } from "@/components/charts/horizontal-ranking-chart";
import { StackedWeeklyBars } from "@/components/charts/stacked-weekly-bars";
import { WeeklyBarChart } from "@/components/charts/weekly-bar-chart";
import { Card } from "@/components/ui/card";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import {
  buildDisciplineDistributionData,
  buildIntensityDistributionData,
  buildMuscleRankingData,
  buildRunningSplitData,
} from "@/lib/analytics/analysis-chart-data";
import { getMonthlyChartData } from "@/lib/analytics/chart-data";
import { getMonthlyReports } from "@/lib/analytics/period-reports";
import { formatDuration, formatKm, formatLoadKg } from "@/lib/utils/format";
import type { TrainingSession } from "@/types/training";

function ReportSkeleton() {
  return (
    <Card>
      <SkeletonBlock className="h-6 w-40" />
      <SkeletonBlock className="mt-4 h-7 w-2/3" />
      <div className="mt-4">
        <SkeletonText lines={3} />
      </div>
    </Card>
  );
}

export function MonthlyReportsSection({
  isLoading,
  sessions,
}: {
  isLoading?: boolean;
  sessions: TrainingSession[];
}) {
  const reports = getMonthlyReports(sessions, { limit: 8, includeOpen: true });
  const monthlyData = getMonthlyChartData(sessions).slice(-8);
  const monthlyDiscipline = buildDisciplineDistributionData(sessions, "month").slice(-8);
  const monthlyRunning = buildRunningSplitData(sessions, "month").slice(-8);
  const monthlyIntensity = buildIntensityDistributionData(sessions, "month").slice(-8);
  const muscleRanking = buildMuscleRankingData(sessions, "all").slice(0, 8);

  return (
    <section>
      <div className="mb-4">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Informes mensuales</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight">Últimos meses</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Resumen ejecutivo mensual con detalle expandible de métricas, disciplinas, carrera, fuerza y carga muscular.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          <ReportSkeleton />
          <ReportSkeleton />
        </div>
      ) : reports.length > 0 ? (
        <div className="grid gap-5">
          <div className="grid gap-5 xl:grid-cols-4">
            <ChartCard title="Sesiones por mes" description="Frecuencia mensual del histórico reciente." unit="sesiones">
              <WeeklyBarChart
                data={monthlyData.map((month) => ({ key: month.monthKey, label: month.label, value: month.sessions }))}
                formatter={(value) => `${value}`}
              />
            </ChartCard>
            <ChartCard title="Horas por mes" description="Volumen temporal mensual." unit="tiempo">
              <WeeklyBarChart
                data={monthlyData.map((month) => ({ key: month.monthKey, label: month.label, value: month.durationMinutes }))}
                formatter={(value) => formatDuration(value, { emptyLabel: "0 min" })}
              />
            </ChartCard>
            <ChartCard title="Carrera por mes" description="Exposición total de carrera mensual." unit="km">
              <WeeklyBarChart
                data={monthlyData.map((month) => ({ key: month.monthKey, label: month.label, value: month.totalRunMeters }))}
                formatter={(value) => formatKm(value, { forceKm: true })}
                tone="secondary"
              />
            </ChartCard>
            <ChartCard title="Peso movido" description="Carga externa estimada mensual." unit="kg/t">
              <WeeklyBarChart
                data={monthlyData.map((month) => ({ key: month.monthKey, label: month.label, value: month.totalExternalLoadKg }))}
                formatter={formatLoadKg}
              />
            </ChartCard>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <ChartCard
              title="Running mensual estructurado vs mixto"
              description="Kilómetros por mes separados entre running puro y carrera dentro de sesiones mixtas."
              unit="km"
              footer="La carrera mixta mantiene contexto de impacto, pero no equivale a running técnico."
            >
              <StackedWeeklyBars data={monthlyRunning} formatter={(value) => `${value.toFixed(1)} km`} />
            </ChartCard>
            <ChartCard
              title="Distribución mensual por disciplina"
              description="Reparto de sesiones por tipo de estímulo en cada mes."
              unit="sesiones"
              footer="Útil para leer cambios de bloque sin depender solo del total de sesiones."
            >
              <StackedWeeklyBars data={monthlyDiscipline} formatter={(value) => `${Math.round(value)}`} />
            </ChartCard>
            <ChartCard
              title="Intensidad mensual"
              description="Sesiones agrupadas por RPE bajo, moderado, alto y sin dato."
              unit="sesiones"
              footer="Los segmentos sin RPE limitan la comparación mensual de intensidad."
            >
              <StackedWeeklyBars data={monthlyIntensity} formatter={(value) => `${Math.round(value)}`} />
            </ChartCard>
            <ChartCard
              title="Top músculos del histórico mensual"
              description="Ranking muscular agregado para contextualizar los informes mensuales recientes."
              unit="pts"
              isEmpty={muscleRanking.length === 0}
              footer="El ranking resume concentración muscular acumulada; el detalle cerrado vive en cada informe mensual."
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
          </div>
          {reports.map((report) => (
            <PeriodReportCard key={report.id} report={report} defaultOpen={false} />
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm leading-6 text-[var(--muted)]">Sin meses suficientes para generar informes.</p>
        </Card>
      )}
    </section>
  );
}
