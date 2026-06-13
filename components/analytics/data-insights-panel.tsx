import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import type { DataInsight, DataInsightCategory, DataInsightSeverity, TrainingDataInsightsResult } from "@/lib/analytics/data-insights";

const categoryLabels: Record<DataInsightCategory, string> = {
  load: "Carga",
  running: "Running",
  muscle: "Muscular",
  intensity: "Intensidad",
  volume: "Volumen",
  discipline: "Disciplina",
  recovery: "Recuperación",
  consistency: "Consistencia",
  data_quality: "Calidad de datos",
};

const severityLabels: Record<DataInsightSeverity, string> = {
  info: "Info",
  positive: "Bien",
  warning: "Vigilar",
  critical: "Alta carga",
};

function getSeverityTone(severity: DataInsightSeverity) {
  return severity === "positive" ? "accent" : severity === "info" ? "neutral" : "warning";
}

function getSectionInsights(analysis: TrainingDataInsightsResult, categories: DataInsightCategory[], limit = 4) {
  return analysis.insights.filter((insight) => categories.includes(insight.category)).slice(0, limit);
}

function getRunningInsights(analysis: TrainingDataInsightsResult, limit = 3) {
  const runningIds = new Set(["hyrox-without-structured-run", "running-shoes-missing"]);

  return analysis.insights
    .filter((insight) => insight.category === "running" || runningIds.has(insight.id))
    .slice(0, limit);
}

function getMuscleInsights(analysis: TrainingDataInsightsResult, limit = 4) {
  return analysis.insights.filter((insight) => insight.category === "muscle").slice(0, limit);
}

function InsightCard({ insight }: { insight: DataInsight }) {
  const isWarning = insight.severity === "warning" || insight.severity === "critical";

  return (
    <article className={`rounded-md border p-4 ${isWarning ? "border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)]" : "border-[var(--line)] bg-[rgba(244,247,244,0.025)]"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={getSeverityTone(insight.severity)}>{severityLabels[insight.severity]}</Badge>
        <Badge>{categoryLabels[insight.category]}</Badge>
        {insight.metric ? <Badge tone="accent">{insight.metric.label}: {insight.metric.value}</Badge> : null}
      </div>
      <h4 className="mt-3 text-base font-black tracking-tight text-[var(--foreground)]">{insight.title}</h4>
      <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">{insight.message}</p>
      <ul className="mt-3 space-y-1 text-sm leading-6 text-[var(--muted)]">
        {insight.evidence.map((item) => (
          <li key={item}>Dato: {item}</li>
        ))}
      </ul>
      {insight.recommendation ? (
        <p className="mt-3 rounded-md border border-[var(--line)] bg-[rgba(10,14,13,0.34)] p-3 text-sm font-semibold leading-6 text-[var(--foreground)]">
          {insight.recommendation}
        </p>
      ) : null}
    </article>
  );
}

function InsightList({
  empty,
  insights,
}: {
  empty: string;
  insights: DataInsight[];
}) {
  if (insights.length === 0) {
    return (
      <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4 text-sm leading-6 text-[var(--muted)]">
        {empty}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
}

function AnalysisSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <Card>
      <SkeletonBlock className="h-5 w-36" />
      <SkeletonBlock className="mt-4 h-8 w-3/4" />
      <div className="mt-4">
        <SkeletonText lines={compact ? 2 : 4} />
      </div>
    </Card>
  );
}

export function QuickDataInsightCard({
  analysis,
  isLoading,
}: {
  analysis: TrainingDataInsightsResult;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <AnalysisSkeleton compact />;
  }

  const recommendation = analysis.summary.recommendations[0] ?? "Mantener registro y revisar la siguiente sesión con datos reales.";

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={analysis.summary.status === "normal" ? "accent" : analysis.summary.status === "insuficiente" ? "neutral" : "warning"}>
          {analysis.summary.status.replace("_", " ")}
        </Badge>
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Análisis rápido</p>
      </div>
      <h3 className="mt-3 text-xl font-black tracking-tight">{analysis.summary.headline}</h3>
      <div className="mt-4 space-y-3">
        {analysis.summary.topSignals.slice(0, 3).map((signal) => (
          <p key={signal.id} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm leading-6 text-[var(--muted-strong)]">
            <span className="font-semibold text-[var(--foreground)]">{signal.title}:</span> {signal.evidence[0] ?? signal.message}
          </p>
        ))}
      </div>
      <p className="mt-4 text-sm font-semibold leading-6 text-[var(--foreground)]">{recommendation}</p>
    </Card>
  );
}

export function DashboardDataInsights({
  analysis,
  isLoading,
}: {
  analysis: TrainingDataInsightsResult;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]" aria-label="Análisis de datos calculando">
        <AnalysisSkeleton />
        <AnalysisSkeleton />
      </section>
    );
  }

  const categories = [
    getSectionInsights(analysis, ["load", "volume", "intensity"], 4),
    getSectionInsights(analysis, ["running", "discipline"], 4),
    getSectionInsights(analysis, ["muscle", "recovery", "data_quality"], 4),
  ].flat();
  const nextDecision = analysis.summary.recommendations[0] ?? "Mantener el plan y seguir registrando sesiones completas.";

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
      <div className="space-y-5">
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={analysis.summary.status === "normal" ? "accent" : analysis.summary.status === "insuficiente" ? "neutral" : "warning"}>
              {analysis.summary.status.replace("_", " ")}
            </Badge>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Análisis de datos</p>
          </div>
          <h3 className="mt-3 text-2xl font-black tracking-tight">{analysis.summary.headline}</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--muted-strong)]">{analysis.summary.summary}</p>
        </Card>

        <div className="grid gap-3 lg:grid-cols-2">
          {categories.slice(0, 6).map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      <aside className="space-y-5">
        <Card>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Qué vigilar</p>
          <div className="mt-4">
            <InsightList empty="Sin señales de riesgo con los umbrales actuales." insights={analysis.summary.warnings.slice(0, 3)} />
          </div>
        </Card>
        <Card>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Qué va bien</p>
          <div className="mt-4">
            <InsightList empty="Aún no hay señales positivas claras; puede ser falta de referencia o de volumen." insights={analysis.summary.positives.slice(0, 3)} />
          </div>
        </Card>
        <Card>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Siguiente decisión</p>
          <p className="mt-3 text-lg font-semibold leading-7 text-[var(--foreground)]">{nextDecision}</p>
        </Card>
      </aside>
    </section>
  );
}

export function RunningDataInsightCard({
  analysis,
  isLoading,
}: {
  analysis: TrainingDataInsightsResult;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <AnalysisSkeleton compact />;
  }

  const runningInsights = getRunningInsights(analysis, 3);
  const runningSummary = runningInsights[0]?.message ?? "Sin señales específicas de carrera con los datos actuales.";

  return (
    <Card>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Lectura de carrera</p>
      <h3 className="mt-3 text-xl font-black tracking-tight">{runningInsights[0]?.title ?? analysis.summary.headline}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--muted-strong)]">{runningSummary}</p>
      <div className="mt-4">
        <InsightList empty="Sin señales específicas de running con los datos actuales." insights={runningInsights} />
      </div>
    </Card>
  );
}

export function MuscleDataInsightCard({
  analysis,
  isLoading,
}: {
  analysis: TrainingDataInsightsResult;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <AnalysisSkeleton compact />;
  }

  const muscleInsights = getMuscleInsights(analysis, 4);

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={muscleInsights.some((insight) => insight.severity === "warning" || insight.severity === "critical") ? "warning" : "accent"}>
          Lectura avanzada
        </Badge>
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Lectura muscular avanzada</p>
      </div>
      <h3 className="mt-3 text-xl font-black tracking-tight">{muscleInsights[0]?.title ?? analysis.summary.headline}</h3>
      <div className="mt-4">
        <InsightList empty="Sin señales musculares adicionales con los datos actuales." insights={muscleInsights} />
      </div>
    </Card>
  );
}
