import { PeriodReportCard } from "@/components/analysis/period-report-card";
import { CalendarHeatmap } from "@/components/charts/calendar-heatmap";
import { ChartCard } from "@/components/charts/chart-card";
import { StackedRunBars } from "@/components/charts/stacked-run-bars";
import { StackedWeeklyBars } from "@/components/charts/stacked-weekly-bars";
import { WeeklyBarChart } from "@/components/charts/weekly-bar-chart";
import { Card } from "@/components/ui/card";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import {
  buildDisciplineDistributionData,
  buildIntensityDistributionData,
  buildTrainingConsistencyData,
} from "@/lib/analytics/analysis-chart-data";
import { getWeeklyChartData } from "@/lib/analytics/chart-data";
import { getWeeklyReports } from "@/lib/analytics/period-reports";
import { formatDuration, formatKm, formatRpe } from "@/lib/utils/format";
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

export function WeeklyReportsSection({
  isLoading,
  sessions,
}: {
  isLoading?: boolean;
  sessions: TrainingSession[];
}) {
  const reports = getWeeklyReports(sessions, { limit: 8, includeOpen: true });
  const weeklyData = getWeeklyChartData(sessions).slice(-8);
  const disciplineStack = buildDisciplineDistributionData(sessions).slice(-8);
  const intensityStack = buildIntensityDistributionData(sessions).slice(-8);
  const consistencyData = buildTrainingConsistencyData(sessions, 84);

  return (
    <section>
      <div className="mb-4">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Informes semanales</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight">Últimas semanas</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Semana actual en curso y últimas semanas cerradas. Las tarjetas empiezan resumidas para revisar sin ruido.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          <ReportSkeleton />
          <ReportSkeleton />
        </div>
      ) : reports.length > 0 ? (
        <div className="grid gap-5">
          <div className="grid gap-5 xl:grid-cols-4">
            <ChartCard title="Duración semanal" description="Minutos por semana calendario." unit="tiempo">
              <WeeklyBarChart
                data={weeklyData.map((week) => ({ key: week.weekKey, label: week.label, metaLabel: week.metaLabel, isCurrentWeek: week.isCurrentWeek, value: week.durationMinutes }))}
                formatter={(value) => formatDuration(value, { emptyLabel: "0 min" })}
              />
            </ChartCard>
            <ChartCard title="Carrera semanal" description="Running estructurado separado de carrera mixta." unit="km">
              <StackedRunBars
                data={weeklyData.map((week) => ({
                  key: week.weekKey,
                  label: week.label,
                  metaLabel: week.metaLabel,
                  isCurrentWeek: week.isCurrentWeek,
                  structuredRunMeters: week.structuredRunMeters,
                  mixedRunMeters: week.mixedRunMeters,
                }))}
                formatter={(value) => formatKm(value, { forceKm: true })}
              />
            </ChartCard>
            <ChartCard title="Fatiga semanal" description="Coste acumulado por semana." unit="pts">
              <WeeklyBarChart
                data={weeklyData.map((week) => ({ key: week.weekKey, label: week.label, metaLabel: week.metaLabel, isCurrentWeek: week.isCurrentWeek, value: week.fatigueCost }))}
                formatter={(value) => `${Math.round(value)}`}
                tone="warning"
              />
            </ChartCard>
            <ChartCard title="RPE y peso" description="RPE medio visualizado como intensidad; peso en el informe de cada semana." unit="RPE">
              <WeeklyBarChart
                data={weeklyData.map((week) => ({ key: week.weekKey, label: week.label, metaLabel: week.metaLabel, isCurrentWeek: week.isCurrentWeek, value: week.averageRpe ?? 0 }))}
                formatter={(value) => formatRpe(value)}
                tone="secondary"
              />
            </ChartCard>
          </div>
          <div className="grid gap-5 xl:grid-cols-3">
            <ChartCard
              title="Distribución semanal"
              description="Sesiones por disciplina en cada semana."
              unit="sesiones"
              footer="Dato relevante para ver si la carga cambia por volumen o por tipo de estímulo."
            >
              <StackedWeeklyBars data={disciplineStack} formatter={(value) => `${Math.round(value)}`} />
            </ChartCard>
            <ChartCard
              title="Intensidad semanal"
              description="Sesiones por bucket de RPE: bajo, moderado, alto y sin dato."
              unit="sesiones"
              footer="Las semanas con más segmentos sin dato tienen lectura de intensidad menos completa."
            >
              <StackedWeeklyBars data={intensityStack} formatter={(value) => `${Math.round(value)}`} />
            </ChartCard>
            <ChartCard
              title="Consistencia de registro"
              description="Últimas 12 semanas por día, con intensidad visual según sesiones, duración y fatiga."
              unit="días"
              footer="La matriz muestra presencia de entrenamiento y densidad de carga registrada."
            >
              <CalendarHeatmap data={consistencyData} />
            </ChartCard>
          </div>
          {reports.map((report) => (
            <PeriodReportCard key={report.id} report={report} defaultOpen={false} />
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm leading-6 text-[var(--muted)]">Sin semanas suficientes para generar informes.</p>
        </Card>
      )}
    </section>
  );
}
