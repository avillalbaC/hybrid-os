import { CheckInContextCard } from "@/components/check-in/check-in-context-card";
import { ChartCard } from "@/components/charts/chart-card";
import { HorizontalRankingChart } from "@/components/charts/horizontal-ranking-chart";
import { StackedRunBars } from "@/components/charts/stacked-run-bars";
import { StackedWeeklyBars } from "@/components/charts/stacked-weekly-bars";
import { WeeklyBarChart } from "@/components/charts/weekly-bar-chart";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import {
  buildCheckInContextData,
  buildCheckInContextText,
  buildCompactCheckInContextText,
} from "@/lib/analytics/check-in-context";
import {
  buildIntensityDistributionData,
  buildMuscleRankingData,
  buildRunningSplitData,
  buildWeeklyTrainingLoadData,
} from "@/lib/analytics/analysis-chart-data";
import type { TrainingDataInsightsResult } from "@/lib/analytics/data-insights";
import type { WeeklyTrendMetrics } from "@/lib/analytics/trends";
import {
  buildWeeklyAnalysisReport,
  getDefaultWeeklyAnalysisMode,
  getWeeklyAnalysisRange,
  type WeeklyAnalysisReport,
} from "@/lib/analytics/weekly-analysis";
import type { DashboardPeriod } from "@/lib/domain/dashboard/periods";
import { formatDuration, formatKm, formatRpe, formatTrainingType } from "@/lib/utils/format";
import type { BodyCheck } from "@/types/body";
import type { NutritionCheck } from "@/types/nutrition";
import type { PlannedSession } from "@/types/planning";
import type { ProgrammingSession } from "@/types/programming";
import type { TrainingSession } from "@/types/training";

type DaySummary = {
  date: string;
  dayLabel: string;
  sessions: TrainingSession[];
  primaryDiscipline: string;
  durationMinutes: number;
  averageRpe: number | null;
  runMeters: number;
  fatigueCost: number;
};

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  next.setHours(0, 0, 0, 0);
  return next;
}

function parseDateKey(date: string) {
  return new Date(`${date}T00:00:00`);
}

function getAverageRpe(sessions: TrainingSession[]) {
  const values = sessions.map((session) => session.rpe).filter((value): value is number => typeof value === "number" && value > 0);
  return values.length > 0 ? Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(1)) : null;
}

function getPrimaryDiscipline(sessions: TrainingSession[]) {
  if (sessions.length === 0) {
    return "Sin sesiones";
  }

  const counts = sessions.reduce<Record<string, number>>((acc, session) => {
    acc[session.type] = (acc[session.type] ?? 0) + 1;
    return acc;
  }, {});
  const [type] = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];

  return formatTrainingType(type);
}

function getWeekDays(report: WeeklyAnalysisReport): DaySummary[] {
  const start = parseDateKey(report.range.startDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const dateKey = formatDateKey(date);
    const daySessions = report.sessions.filter((session) => session.date === dateKey);
    const runMeters = daySessions.reduce((total, session) => total + session.sessionMetrics.totalRunMeters, 0);
    const durationMinutes = daySessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0);
    const fatigueCost = daySessions.reduce((total, session) => total + session.sessionMetrics.fatigueCost, 0);

    return {
      date: dateKey,
      dayLabel: new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "2-digit" }).format(date),
      sessions: daySessions,
      primaryDiscipline: getPrimaryDiscipline(daySessions),
      durationMinutes,
      averageRpe: getAverageRpe(daySessions),
      runMeters,
      fatigueCost,
    };
  });
}

function getDominantDiscipline(report: WeeklyAnalysisReport) {
  return report.disciplines.filter((item) => item.sessions > 0).sort((a, b) => b.sessions - a.sessions || b.durationMinutes - a.durationMinutes)[0] ?? null;
}

function getWeekType(report: WeeklyAnalysisReport) {
  const activeDisciplines = report.disciplines.filter((item) => item.sessions > 0).length;

  if (report.summary.sessions === 0) {
    return "Semana sin entrenamientos registrados";
  }

  if (report.summary.sessions <= 2) {
    return "Semana corta";
  }

  if (activeDisciplines >= 4) {
    return "Semana híbrida";
  }

  return "Semana concentrada";
}

function buildQuickRead(report: WeeklyAnalysisReport) {
  const dominant = getDominantDiscipline(report);
  const sentences: string[] = [];
  const weekType = getWeekType(report);

  if (report.summary.sessions === 0) {
    return [
      `${weekType} en ${report.range.selectedWeekLabel}.`,
      report.range.selectedWeekMode === "current_week"
        ? "Sin sesiones registradas en la semana en curso."
        : "Sin sesiones registradas en el rango seleccionado.",
    ];
  }

  sentences.push(
    `${weekType}, con ${report.summary.sessions} sesiones en ${report.summary.movementDays} días con movimiento${dominant ? ` y dominio de ${dominant.label}` : ""}.`,
  );

  if (report.summary.averageRpe !== null || report.summary.fatigueCost !== null) {
    sentences.push(
      `Carga registrada: ${formatDuration(report.summary.durationMinutes, { emptyLabel: "0 min" })}, RPE medio ${formatRpe(report.summary.averageRpe)} y fatiga ${report.summary.fatigueCost ?? "sin dato"}.`,
    );
  }

  if (report.summary.structuredRunMeters === 0 && report.summary.mixedRunMeters > 0) {
    sentences.push("Running estructurado ausente; la carrera aparece como impacto dentro de sesiones mixtas.");
  } else if (report.summary.totalRunMeters > 0) {
    sentences.push(`Carrera total ${formatKm(report.summary.totalRunMeters, { forceKm: true })}, con ${formatKm(report.summary.structuredRunMeters, { forceKm: true })} estructurado.`);
  }

  if (!report.expected.hasExpectations) {
    sentences.push("Sin planificación semanal registrada; la lectura se basa solo en entrenamientos realizados.");
  }

  return sentences.slice(0, 4);
}

function mapProgressLabel(label: string) {
  if (label === "Mejora frente a última referencia") {
    return "Comparación disponible";
  }

  if (label === "Sin comparación suficiente") {
    return "Sin referencia suficiente";
  }

  return label;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div>
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">{eyebrow}</p>
      <h3 className="mt-1 text-xl font-black tracking-tight text-[var(--foreground)]">{title}</h3>
      {description ? <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
    </div>
  );
}

function WeeklyEditorialHeader({ report }: { report: WeeklyAnalysisReport }) {
  const quickRead = buildQuickRead(report);
  const dominant = getDominantDiscipline(report);
  const chips = [
    { label: "Lo más relevante", value: dominant ? `${dominant.label} · ${dominant.sessions} sesiones` : `${report.summary.sessions} sesiones` },
    { label: "A favor", value: report.signals.positive[0] ?? "Sin señal positiva clara" },
    { label: "A revisar", value: report.signals.review[0] ?? "Sin señal principal" },
    { label: "Datos insuficientes", value: report.signals.insufficient[0] ?? "Sin huecos principales" },
  ];

  return (
    <Card className="border-[rgba(34,211,238,0.18)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Badge tone={report.range.isClosed ? "accent" : "neutral"}>{report.range.statusLabel}</Badge>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--foreground)]">
            Informe semanal · {report.range.selectedWeekLabel}
          </h2>
          <p className="mt-2 text-sm font-semibold text-[var(--muted)]">{getWeekType(report)}</p>
        </div>
        <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-3 py-2 text-sm font-semibold text-[var(--muted-strong)]">
          {report.range.selectedWeekStart} / {report.range.selectedWeekEnd}
        </p>
      </div>

      <div className="mt-5 max-w-4xl space-y-2 text-base leading-7 text-[var(--muted-strong)]">
        {quickRead.map((sentence) => (
          <p key={sentence}>{sentence}</p>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {chips.map((chip) => (
          <div key={chip.label} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{chip.label}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--foreground)]">{chip.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WeekAtGlance({ report }: { report: WeeklyAnalysisReport }) {
  const days = getWeekDays(report);
  const maxFatigue = Math.max(...days.map((day) => day.fatigueCost), 1);

  return (
    <Card>
      <SectionHeading eyebrow="Calendario" title="Semana de un vistazo" description="Fila lunes-domingo con disciplina, sesiones, duración, RPE y carrera registrada." />
      <div className="mt-4 overflow-x-auto pb-1">
        <div className="grid min-w-[760px] grid-cols-7 gap-2">
          {days.map((day) => {
            const loadPercent = Math.round((day.fatigueCost / maxFatigue) * 100);
            return (
              <article key={day.date} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">{day.dayLabel}</p>
                  <span className="rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[0.62rem] font-black text-[var(--muted-strong)]">
                    {day.sessions.length}
                  </span>
                </div>
                <p className="mt-3 min-h-10 text-sm font-black leading-5 text-[var(--foreground)]">{day.primaryDiscipline}</p>
                <div className="mt-3 space-y-1 text-xs leading-5 text-[var(--muted-strong)]">
                  <p>{formatDuration(day.durationMinutes, { emptyLabel: "0 min" })}</p>
                  <p>RPE {formatRpe(day.averageRpe)}</p>
                  <p>{formatKm(day.runMeters, { forceKm: day.runMeters >= 1000, emptyLabel: "0 m" })}</p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[rgba(244,247,244,0.08)]">
                  <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${loadPercent}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function DisciplineSection({ report }: { report: WeeklyAnalysisReport }) {
  return (
    <Card>
      <SectionHeading eyebrow="Distribución" title="Entrenamientos por disciplina" />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-[0.62rem] uppercase tracking-[0.14em] text-[var(--muted)]">
              <th className="py-3 pr-3 font-bold">Disciplina</th>
              <th className="px-3 py-3 font-bold">Sesiones</th>
              <th className="px-3 py-3 font-bold">Duración</th>
              <th className="px-3 py-3 font-bold">RPE medio</th>
              <th className="py-3 pl-3 font-bold">Métrica clave</th>
            </tr>
          </thead>
          <tbody>
            {report.disciplines.map((item) => (
              <tr key={item.key} className="border-b border-[rgba(244,247,244,0.06)] last:border-0">
                <td className="py-3 pr-3 font-bold text-[var(--foreground)]">{item.label}</td>
                <td className={`px-3 py-3 font-mono font-black ${item.sessions > 0 ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>{item.sessions}</td>
                <td className="px-3 py-3 text-[var(--muted-strong)]">{formatDuration(item.durationMinutes, { emptyLabel: "0 min" })}</td>
                <td className="px-3 py-3 text-[var(--muted-strong)]">{formatRpe(item.averageRpe)}</td>
                <td className="py-3 pl-3 text-[var(--muted-strong)]">{item.sessions > 0 ? item.keyMetric : "sin sesiones"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ExpectedSection({ report, isLoading }: { report: WeeklyAnalysisReport; isLoading?: boolean }) {
  return (
    <Card>
      <SectionHeading eyebrow="Plan" title="Realizado vs esperado" />
      {isLoading ? (
        <div className="mt-4"><SkeletonText lines={2} /></div>
      ) : report.expected.hasExpectations ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <dl className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Esperado</dt>
              <dd className="mt-1 font-mono text-2xl font-black">{report.expected.expectedSessions}</dd>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Realizado</dt>
              <dd className="mt-1 font-mono text-2xl font-black">{report.expected.completedSessions}</dd>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Pendiente</dt>
              <dd className="mt-1 font-mono text-2xl font-black">{report.expected.pendingSessions}</dd>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Saltado</dt>
              <dd className="mt-1 font-mono text-2xl font-black">{report.expected.skippedSessions}</dd>
            </div>
          </dl>
          <div className="grid gap-2">
            {report.expected.byDiscipline.map((item) => (
              <div key={item.key} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <p className="font-bold text-[var(--foreground)]">{item.label}</p>
                  <p className="font-mono text-xs font-black text-[var(--muted-strong)]">{item.completed}/{item.expected}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm leading-6 text-[var(--muted-strong)]">
          Sin planificación semanal registrada. La lectura se basa solo en entrenamientos realizados.
        </p>
      )}
    </Card>
  );
}

function ProgressSection({ report }: { report: WeeklyAnalysisReport }) {
  const progressItems = report.progress.filter((item) => item.id !== "no-progress-reference");

  return (
    <Card>
      <SectionHeading eyebrow="Comparables" title="Progreso y marcas" description="Solo se compara cuando existe misma métrica, movimiento, distancia o título." />
      {progressItems.length === 0 ? (
        <p className="mt-4 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm leading-6 text-[var(--muted-strong)]">
          Sin marcas comparables esta semana.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {progressItems.map((item) => (
            <article key={item.id} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
              <Badge tone={item.label === "Mejora frente a última referencia" ? "accent" : "neutral"}>{mapProgressLabel(item.label)}</Badge>
              <h4 className="mt-3 font-black text-[var(--foreground)]">{item.title}</h4>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">{item.detail}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{item.evidence}</p>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}

function CheckDailySection({
  compactText,
  context,
  text,
}: {
  compactText: string;
  context: ReturnType<typeof buildCheckInContextData>;
  text: string;
}) {
  const columns = [
    { title: "A favor", items: context.signals.positive.slice(0, 3), empty: "Sin señales a favor claras." },
    { title: "A revisar", items: context.signals.negative.slice(0, 3), empty: "Sin señales a revisar claras." },
    { title: "Datos insuficientes", items: context.signals.insufficient.slice(0, 3), empty: "Sin huecos principales." },
  ];

  return (
    <Card>
      <SectionHeading eyebrow="Contexto" title="Para el check diario" description="Señales compactas del mismo periodo del informe." />
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {columns.map((column) => (
          <div key={column.title} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
            <p className="font-black text-[var(--foreground)]">{column.title}</p>
            <div className="mt-2 space-y-2">
              {(column.items.length > 0 ? column.items : [column.empty]).map((item) => (
                <p key={item} className="text-sm leading-6 text-[var(--muted-strong)]">{item}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <CheckInContextCard
          compact
          showDetails={false}
          context={context}
          text={text}
          compactText={compactText}
          title="Copiar contexto"
        />
      </div>
    </Card>
  );
}

function SupportCharts({
  report,
  sessions,
  trends,
}: {
  report: WeeklyAnalysisReport;
  sessions: TrainingSession[];
  trends: WeeklyTrendMetrics;
}) {
  const weeklyData = buildWeeklyTrainingLoadData(sessions).slice(-8);
  const runningSplit = buildRunningSplitData(sessions).slice(-8);
  const intensityStack = buildIntensityDistributionData(sessions).slice(-8);
  const muscleRanking = buildMuscleRankingData(report.sessions, "all").slice(0, 5);

  return (
    <section className="grid gap-5">
      <SectionHeading eyebrow="Soporte visual" title="Carga e impacto" description="Gráficas de apoyo; el informe semanal queda arriba." />
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Carga semanal reciente"
          description="Duración reciente para comparar el rango del informe con semanas previas."
          unit="min"
          currentValue={formatDuration(report.summary.durationMinutes, { emptyLabel: "0 min" })}
          meta={[{ label: "Fatiga semana", value: `${report.summary.fatigueCost ?? "sin dato"}` }]}
          status={{ label: trends.duration.status.replace("_", " "), tone: "neutral" }}
          footer={trends.duration.message}
        >
          <WeeklyBarChart
            data={weeklyData.map((week) => ({ key: week.weekKey, label: week.label, metaLabel: week.metaLabel, isCurrentWeek: week.isCurrentWeek, value: week.durationMinutes }))}
            formatter={(value) => formatDuration(value, { emptyLabel: "0 min" })}
          />
        </ChartCard>

        <ChartCard title="Running estructurado vs mixto" description="Carrera pura separada del impacto dentro de sesiones mixtas." unit="km">
          <StackedRunBars
            data={runningSplit.map((week) => ({
              key: week.key,
              label: week.label,
              metaLabel: week.metaLabel,
              isCurrentWeek: week.isCurrentWeek,
              structuredRunMeters: (week.segments.find((segment) => segment.key === "running")?.value ?? 0) * 1000,
              mixedRunMeters: (week.segments.find((segment) => segment.key === "mixed")?.value ?? 0) * 1000,
            }))}
            formatter={(value) => formatKm(value, { forceKm: true })}
          />
        </ChartCard>

        <ChartCard title="Intensidad semanal" description="RPE bajo, moderado, alto y sin dato." unit="sesiones">
          <StackedWeeklyBars data={intensityStack} formatter={(value) => `${Math.round(value)}`} />
        </ChartCard>

        <ChartCard title="Top músculos del informe" description="Carga muscular agregada en el rango seleccionado." unit="pts" isEmpty={muscleRanking.length === 0}>
          <HorizontalRankingChart
            items={muscleRanking.map((item) => ({ key: item.muscle, label: item.label, value: item.load, percentage: item.percentage }))}
            formatter={(value) => `${Math.round(value)} pts`}
          />
        </ChartCard>
      </div>
    </section>
  );
}

export function CurrentAnalysisSection({
  bodyChecks,
  isLoading,
  isPlanningLoading,
  nutritionChecks,
  plannedSessions,
  programmingSessions,
  sessions,
  trends,
}: {
  analysis: TrainingDataInsightsResult;
  bodyChecks: BodyCheck[];
  isLoading?: boolean;
  isPlanningLoading?: boolean;
  nutritionChecks: NutritionCheck[];
  period: DashboardPeriod;
  plannedSessions: PlannedSession[];
  programmingSessions: ProgrammingSession[];
  sessions: TrainingSession[];
  trends: WeeklyTrendMetrics;
}) {
  const weeklyRange = getWeeklyAnalysisRange(getDefaultWeeklyAnalysisMode());
  const weeklyReport = buildWeeklyAnalysisReport({
    sessions,
    plannedSessions,
    programmingSessions,
    mode: weeklyRange.mode,
    selectedWeek: weeklyRange,
  });
  const selectedContextData = buildCheckInContextData({
    period: {
      label: weeklyReport.range.displayLabel,
      startDate: weeklyReport.range.startDate,
      endDate: weeklyReport.range.endDate,
    },
    sessions: weeklyReport.sessions,
    bodyChecks,
    nutritionChecks,
    plannedSessions,
  });
  const selectedContextText = buildCheckInContextText(selectedContextData);
  const selectedCompactContextText = buildCompactCheckInContextText(selectedContextData);

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
      <WeeklyEditorialHeader report={weeklyReport} />
      <WeekAtGlance report={weeklyReport} />
      <DisciplineSection report={weeklyReport} />
      <ExpectedSection report={weeklyReport} isLoading={isPlanningLoading} />
      <ProgressSection report={weeklyReport} />
      <CheckDailySection context={selectedContextData} text={selectedContextText} compactText={selectedCompactContextText} />
      <SupportCharts report={weeklyReport} sessions={sessions} trends={trends} />
    </div>
  );
}
