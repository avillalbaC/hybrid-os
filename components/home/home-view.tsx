"use client";

import { useMemo } from "react";
import Link from "next/link";
import { QuickDataInsightCard } from "@/components/analytics/data-insights-panel";
import { TrainingMixCard } from "@/components/home/training-mix-card";
import { QuickTrendsCard } from "@/components/dashboard/trends-section";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import { getTrainingDataInsights } from "@/lib/analytics/data-insights";
import { getWeeklyTrendMetrics } from "@/lib/analytics/trends";
import { calculateDashboardMetrics, type DashboardMetric } from "@/lib/domain/dashboard/metrics";
import { getLatestWeekSessions } from "@/lib/domain/training/analysis";
import { getSessionRunMeters, getTotalRunExposureMeters, type RunningBreakdown } from "@/lib/domain/training/run-exposure";
import { secondaryActivityKindLabels, summarizeSecondaryActivities, type SecondaryActivitySummary } from "@/lib/domain/training/secondary-activity";
import { calculateTrainingMix, type TrainingModality } from "@/lib/domain/training/training-mix";
import { useTrainingSessions } from "@/lib/storage/use-training-sessions";
import { formatDataQuality, formatDate, formatDuration, formatKm, formatMuscleName, formatRpe, formatTrainingType } from "@/lib/utils/format";
import type { BodyCheck } from "@/types/body";
import type { NutritionCheck } from "@/types/nutrition";
import type { MuscleName, TrainingSession } from "@/types/training";

type WatchSignal = {
  title: string;
  detail: string;
  tone: "warning" | "critical" | "neutral";
};

type NextAction = {
  title: string;
  detail: string;
  href: string;
  label: string;
  tone: "accent" | "warning";
};

const miniMixOrder: TrainingModality[] = ["hyrox", "crossfit", "running", "halterofilia", "gimnasticos"];

const quickLinks = [
  { href: "/training/import", label: "Importar entrenamiento", detail: "Añadir nueva sesión" },
  { href: "/training", label: "Ver log", detail: "Historial y filtros" },
  { href: "/training/running", label: "Carrera", detail: "Running estructurado y mixto" },
  { href: "/muscle-load", label: "Carga muscular", detail: "Top músculos y patrones" },
  { href: "/dashboard", label: "Dashboard", detail: "Análisis completo por periodo" },
];

function MetricLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-md outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
    >
      {children}
    </Link>
  );
}

function PrimaryAction({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
    >
      {children}
    </Link>
  );
}

function SecondaryAction({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)] hover:bg-[rgba(244,247,244,0.055)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
    >
      {children}
    </Link>
  );
}

function getMuscleLoad(session: TrainingSession, muscle: MuscleName) {
  return session.sessionMuscleSummary[muscle] ?? 0;
}

function getHardSessions(sessions: TrainingSession[]) {
  return sessions.filter((session) => (session.rpe ?? 0) >= 8);
}

function getWeeklyFatigue(sessions: TrainingSession[]) {
  return sessions.reduce((total, session) => total + session.sessionMetrics.fatigueCost, 0);
}

function formatRunningBreakdown(breakdown: RunningBreakdown) {
  return `${formatKm(breakdown.structuredMeters, { forceKm: true })} running · ${formatKm(breakdown.mixedMeters, { forceKm: true })} mixto`;
}

function getHomeStatusLabel(metric: DashboardMetric) {
  const status = metric.comparisonDisplay?.badgeLabel ?? metric.deltaLabel;

  if (status.includes("Por encima")) {
    return "Sobre ritmo";
  }

  if (status.includes("Por debajo")) {
    return "Bajo ritmo";
  }

  if (status.includes("Referencia") || status.includes("Sin referencia")) {
    return "Histórico insuficiente";
  }

  if (status.includes("Histórico completo")) {
    return "Histórico completo";
  }

  return "En ritmo";
}

function getHomeStatusTone(metric: DashboardMetric) {
  return metric.comparisonDisplay?.badgeTone ?? metric.deltaTone;
}

function getExpectedContext(metric: DashboardMetric) {
  const comparison = metric.comparisonDisplay;

  if (!comparison?.expectedValue) {
    return undefined;
  }

  return `${comparison.expectedLabel}: ${comparison.expectedValue}`;
}

function getExpectedDeltaContext(metric: DashboardMetric) {
  const comparison = metric.comparisonDisplay;

  if (!comparison?.deltaVsExpectedLabel) {
    return undefined;
  }

  return `${comparison.deltaVsExpectedLabel} vs esperado`;
}

function getRpeStatus(rpe: number | null) {
  if (rpe === null) {
    return "Sin dato suficiente";
  }

  return rpe >= 8 ? "Alto" : "Normal";
}

function getWeeklyReading({
  sessionCount,
  runningLabel,
  averageRpe,
  alertCount,
}: {
  sessionCount: string;
  runningLabel: string;
  averageRpe: number | null;
  alertCount: number;
}) {
  if (alertCount > 0) {
    return `Semana activa con ${sessionCount} sesiones, ${runningLabel} de carrera total y señales que conviene revisar antes de sumar intensidad.`;
  }

  if (averageRpe !== null && averageRpe >= 8) {
    return `La semana avanza con intensidad alta: ${sessionCount} sesiones, ${runningLabel} de carrera total y RPE medio ${averageRpe}/10.`;
  }

  if (Number(sessionCount) === 0) {
    return "Sin sesiones registradas esta semana. Buen momento para importar el último entrenamiento o planificar la siguiente entrada.";
  }

  return `Semana estable: ${sessionCount} sesiones, ${runningLabel} de carrera total y carga sin alertas principales.`;
}

function getWatchSignals({
  dashboardAlerts,
  weekSessions,
  topCalvesLoad,
}: {
  dashboardAlerts: WatchSignal[];
  weekSessions: TrainingSession[];
  topCalvesLoad: number;
}) {
  const hardSessions = getHardSessions(weekSessions);
  const fatigue = getWeeklyFatigue(weekSessions);
  const runExposureKm = getTotalRunExposureMeters(weekSessions) / 1000;
  const signals: WatchSignal[] = dashboardAlerts.slice(0, 4);

  if (hardSessions.length >= 3 && !signals.some((signal) => signal.title === "Sesiones duras")) {
    signals.push({
      title: "Sesiones duras",
      detail: `${hardSessions.length} sesiones con RPE 8 o más esta semana.`,
      tone: hardSessions.length >= 4 ? "critical" : "warning",
    });
  }

  if (fatigue >= 250 && !signals.some((signal) => signal.title === "Fatiga acumulada")) {
    signals.push({
      title: "Fatiga acumulada",
      detail: `Coste de fatiga semanal ${fatigue}.`,
      tone: fatigue >= 360 ? "critical" : "warning",
    });
  }

  if (runExposureKm > 0 && topCalvesLoad >= 180 && !signals.some((signal) => signal.title.includes("gemelos"))) {
    signals.push({
      title: "Carrera total + gemelos",
      detail: `${runExposureKm.toFixed(1)} km de volumen de impacto esta semana con gemelos en carga alta.`,
      tone: topCalvesLoad >= 260 ? "critical" : "warning",
    });
  }

  return signals.slice(0, 4);
}

function getNextAction({
  signals,
  weekSessions,
  topShouldersLoad,
  topCalvesLoad,
}: {
  signals: WatchSignal[];
  weekSessions: TrainingSession[];
  topShouldersLoad: number;
  topCalvesLoad: number;
}): NextAction {
  const hardSessions = getHardSessions(weekSessions);
  const runExposureKm = getTotalRunExposureMeters(weekSessions) / 1000;
  const hasCriticalSignal = signals.some((signal) => signal.tone === "critical");

  if (hasCriticalSignal || hardSessions.length >= 3) {
    return {
      title: "Priorizar recuperación",
      detail: "Baja intensidad, movilidad y sueño antes de añadir otra sesión dura.",
      href: "/training/weekly",
      label: "Ver semana",
      tone: "warning",
    };
  }

  if (runExposureKm > 0 && topCalvesLoad >= 180) {
    return {
      title: "Evitar impacto",
      detail: "Mantén el motor con bajo impacto y revisa gemelos antes de volver a correr fuerte.",
      href: "/training/running",
      label: "Ver carrera",
      tone: "warning",
    };
  }

  if (topShouldersLoad >= 220) {
    return {
      title: "Upper push moderado",
      detail: "Hombros vienen cargados. Prioriza técnica, tirón suave o movilidad torácica.",
      href: "/muscle-load",
      label: "Ver carga",
      tone: "warning",
    };
  }

  if (weekSessions.length === 0) {
    return {
      title: "Registrar actividad",
      detail: "Importa el último entrenamiento para que el estado diario tenga datos reales.",
      href: "/training/import",
      label: "Importar",
      tone: "accent",
    };
  }

  return {
    title: "Mantener plan",
    detail: "La semana no muestra señales principales de sobrecarga. Sostén el ritmo y registra la siguiente sesión.",
    href: "/training/import",
    label: "Importar sesión",
    tone: "accent",
  };
}

function LatestSessionCard({ session }: { session: TrainingSession }) {
  const sessionRunMeters = getSessionRunMeters(session);
  const runningKm = sessionRunMeters > 0
    ? formatKm(sessionRunMeters)
    : "Sin dato";

  return (
    <Link
      href={`/training/${session.id}`}
      className="mt-4 block rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-4 outline-none transition hover:-translate-y-0.5 hover:border-[var(--accent-border)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">{formatDate(session.date)}</p>
        <Badge tone="accent">{formatTrainingType(session.type)}</Badge>
        <Badge>{formatDataQuality(session.dataQuality)}</Badge>
      </div>
      <h3 className="mt-3 text-lg font-black tracking-tight text-[var(--foreground)]">{session.title}</h3>
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-md border border-[var(--line)] p-2">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Duración</p>
          <p className="mt-1 font-mono font-black">{formatDuration(session.durationMinutes)}</p>
        </div>
        <div className="rounded-md border border-[var(--line)] p-2">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">RPE</p>
          <p className="mt-1 font-mono font-black">{formatRpe(session.rpe)}</p>
        </div>
        <div className="rounded-md border border-[var(--line)] p-2">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Carrera</p>
          <p className="mt-1 font-mono font-black">{runningKm}</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-bold text-[var(--accent)]">Ver detalle</p>
    </Link>
  );
}

function LatestSessionSkeleton() {
  return (
    <div className="mt-4 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-4" aria-label="Último entrenamiento calculando">
      <div className="flex flex-wrap items-center gap-2">
        <SkeletonBlock className="h-5 w-24" />
        <SkeletonBlock className="h-6 w-20" />
      </div>
      <SkeletonBlock className="mt-4 h-6 w-4/5" />
      <div className="mt-4 grid grid-cols-3 gap-2">
        <SkeletonBlock className="h-14" />
        <SkeletonBlock className="h-14" />
        <SkeletonBlock className="h-14" />
      </div>
    </div>
  );
}

function WatchCard({
  isLoading,
  signals,
}: {
  isLoading?: boolean;
  signals: WatchSignal[];
}) {
  return (
    <Card>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Qué vigilar</p>
      <h3 className="mt-2 text-xl font-black tracking-tight">Señales principales</h3>
      <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
        {isLoading ? (
          <>
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
          </>
        ) : signals.length > 0 ? (
          signals.map((signal) => (
            <p
              key={signal.title}
              className={`rounded-md border p-3 ${
                signal.tone === "critical"
                  ? "border-[rgba(255,110,110,0.28)] bg-[rgba(255,110,110,0.08)]"
                  : "border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)]"
              }`}
            >
              <span className={signal.tone === "critical" ? "font-semibold text-[#ff8a8a]" : "font-semibold text-[var(--warning)]"}>
                {signal.title}:
              </span>{" "}
              {signal.detail}
            </p>
          ))
        ) : (
          <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
            Sin alertas principales con los datos actuales.
          </p>
        )}
      </div>
    </Card>
  );
}

function NextActionCard({
  action,
  isLoading,
}: {
  action: NextAction;
  isLoading?: boolean;
}) {
  return (
    <Card className={action.tone === "warning" ? "border-[rgba(240,196,107,0.26)]" : ""}>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Próxima acción</p>
      {isLoading ? (
        <div className="mt-3" aria-label="Próxima acción calculando">
          <SkeletonBlock className="h-8 w-3/4" />
          <div className="mt-4">
            <SkeletonText lines={2} />
          </div>
          <SkeletonBlock className="mt-5 h-11 w-32" />
        </div>
      ) : (
        <>
          <h3 className="mt-2 text-2xl font-black tracking-tight">{action.title}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{action.detail}</p>
          <Link
            href={action.href}
            className={`mt-5 inline-flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
              action.tone === "warning"
                ? "border-[rgba(240,196,107,0.34)] bg-[var(--warning-soft)] text-[var(--warning)] hover:border-[rgba(240,196,107,0.5)]"
                : "border-[var(--accent-border)] bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
            }`}
          >
            {action.label}
          </Link>
        </>
      )}
    </Card>
  );
}

function MuscleSummaryCard({
  isLoading,
  muscles,
}: {
  isLoading?: boolean;
  muscles: { muscle: MuscleName; loadScore: number }[];
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Carga muscular resumida</p>
          <h3 className="mt-2 text-xl font-black tracking-tight">Top semanal</h3>
        </div>
        <Link href="/muscle-load" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Ver análisis muscular
        </Link>
      </div>
      <div className="mt-4 space-y-2">
        {isLoading ? (
          <>
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-full" />
          </>
        ) : muscles.length > 0 ? (
          muscles.map((item) => (
            <div key={item.muscle} className="flex items-center justify-between rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-3 py-2 text-sm">
              <span className="font-semibold text-[var(--foreground)]">{formatMuscleName(item.muscle)}</span>
              <span className="font-mono font-black text-[var(--accent-strong)]">{item.loadScore}</span>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-[var(--muted)]">Sin datos del periodo.</p>
        )}
      </div>
    </Card>
  );
}

function HeroMetricValue({
  isLoading,
  isEmpty,
  value,
}: {
  isLoading: boolean;
  isEmpty: boolean;
  value: string;
}) {
  if (isLoading) {
    return <SkeletonBlock className="mt-2 h-8 w-20" />;
  }

  if (isEmpty) {
    return <p className="mt-2 text-sm font-bold leading-5 text-[var(--muted-strong)]">Sin datos</p>;
  }

  return <p className="mt-2 whitespace-nowrap font-mono text-2xl font-black">{value}</p>;
}

function SecondaryActivityCard({
  isLoading,
  summary,
}: {
  isLoading?: boolean;
  summary: SecondaryActivitySummary;
}) {
  const topKinds = summary.topKinds.slice(0, 3).map((kind) => secondaryActivityKindLabels[kind]).join(" · ");

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Actividad secundaria</p>
          <h3 className="mt-2 text-xl font-black tracking-tight">Complemento semanal</h3>
        </div>
        <Link href="/training?filter=secondary" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Ver log
        </Link>
      </div>
      {isLoading ? (
        <div className="mt-4 space-y-3" aria-label="Actividad secundaria calculando">
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
        </div>
      ) : summary.sessions > 0 ? (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Sesiones</dt>
              <dd className="mt-1 font-mono text-lg font-black">{summary.sessions}</dd>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Duración</dt>
              <dd className="mt-1 font-mono text-lg font-black">{formatDuration(summary.durationMinutes)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-strong)]">{topKinds || "Sin tipo dominante"}</p>
        </>
      ) : (
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Sin actividad secundaria esta semana.</p>
      )}
    </Card>
  );
}

function QuickLinksCard() {
  return (
    <Card>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Accesos rápidos</p>
      <div className="mt-4 grid gap-2">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 transition hover:border-[var(--accent-border)] hover:bg-[rgba(244,247,244,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          >
            <span className="block text-sm font-bold text-[var(--foreground)]">{item.label}</span>
            <span className="mt-1 block text-xs text-[var(--muted)]">{item.detail}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function HomeView({
  sessions,
  bodyChecks,
  nutritionChecks,
}: {
  sessions: TrainingSession[];
  bodyChecks: BodyCheck[];
  nutritionChecks: NutritionCheck[];
}) {
  const { sessions: combinedSessions, pendingSessions, source, syncMessage, isLoading, isReady } = useTrainingSessions(sessions);
  const metrics = calculateDashboardMetrics(combinedSessions, bodyChecks, nutritionChecks, "week");
  const dataAnalysis = useMemo(() => getTrainingDataInsights(combinedSessions, { period: "week" }), [combinedSessions]);
  const trends = useMemo(() => getWeeklyTrendMetrics(combinedSessions), [combinedSessions]);
  const { currentWeekSessions } = useMemo(() => getLatestWeekSessions(combinedSessions), [combinedSessions]);
  const secondaryActivitySummary = useMemo(() => summarizeSecondaryActivities(currentWeekSessions), [currentWeekSessions]);
  const trainingMix = useMemo(() => calculateTrainingMix(combinedSessions), [combinedSessions]);
  const latestSession = metrics.recentSessions[0] ?? null;
  const miniMixRows = miniMixOrder
    .map((modality) => trainingMix.find((row) => row.modality === modality))
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
  const visibleMuscles = metrics.topMuscles.slice(0, 5);
  const shouldersLoad = currentWeekSessions.reduce((total, session) => total + getMuscleLoad(session, "shoulders"), 0);
  const calvesLoad = currentWeekSessions.reduce((total, session) => total + getMuscleLoad(session, "calves"), 0);
  const watchSignals = getWatchSignals({
    dashboardAlerts: metrics.alerts,
    weekSessions: currentWeekSessions,
    topCalvesLoad: calvesLoad,
  });
  const nextAction = getNextAction({
    signals: watchSignals,
    weekSessions: currentWeekSessions,
    topShouldersLoad: shouldersLoad,
    topCalvesLoad: calvesLoad,
  });
  const weeklyReading = getWeeklyReading({
    sessionCount: metrics.sessions.formattedValue,
    runningLabel: metrics.runningKm.formattedValue,
    averageRpe: metrics.averageRpe.value,
    alertCount: watchSignals.length,
  });
  const isMetricsLoading = isLoading || !isReady;
  const hasWeekSessions = (metrics.sessions.value ?? 0) > 0;
  const sessionsState = isMetricsLoading ? "loading" : "ready";
  const runningState = isMetricsLoading ? "loading" : "ready";
  const durationState = isMetricsLoading ? "loading" : "ready";
  const rpeState = isMetricsLoading ? "loading" : metrics.averageRpe.value !== null ? "ready" : "empty";
  const weeklyReadingText = isMetricsLoading
    ? "Calculando métricas semanales con la fuente final de entrenamiento."
    : weeklyReading;

  return (
    <>
      <section className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
        <div className="rounded-md border border-[var(--line)] bg-[linear-gradient(135deg,var(--accent-hero),rgba(18,23,21,0.98)_44%,rgba(11,14,13,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-7">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Centro de mando diario</p>
          <div className="mt-3 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="max-w-3xl text-4xl font-black tracking-tight text-[var(--foreground)] sm:text-5xl">
                Estado actual.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted-strong)]">{weeklyReadingText}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:min-w-[320px] sm:grid-cols-3">
              <div className="rounded-md border border-[rgba(244,247,244,0.12)] bg-[rgba(244,247,244,0.035)] p-3">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Sesiones</p>
                <HeroMetricValue isLoading={isMetricsLoading} isEmpty={!hasWeekSessions} value={metrics.sessions.formattedValue} />
              </div>
              <div className="rounded-md border border-[rgba(244,247,244,0.12)] bg-[rgba(244,247,244,0.035)] p-3">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Carrera total</p>
                <HeroMetricValue isLoading={isMetricsLoading} isEmpty={(metrics.runningKm.value ?? 0) <= 0} value={metrics.runningKm.formattedValue} />
              </div>
              <div className="rounded-md border border-[rgba(244,247,244,0.12)] bg-[rgba(244,247,244,0.035)] p-3">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">RPE</p>
                <HeroMetricValue isLoading={isMetricsLoading} isEmpty={metrics.averageRpe.value === null} value={metrics.averageRpe.formattedValue} />
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone={source === "remote" ? "accent" : source === "seed-fallback" ? "warning" : "neutral"}>
              {source === "remote" ? "Datos Supabase" : source === "seed-fallback" ? "Fallback seed" : "sincronizando"}
            </Badge>
            <Badge>{metrics.periodDetail}</Badge>
            {pendingSessions.length > 0 ? <Badge tone="warning">Pendientes locales {pendingSessions.length}</Badge> : null}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <PrimaryAction href="/training/import">Importar entrenamiento</PrimaryAction>
            <SecondaryAction href="/training">Ver log</SecondaryAction>
            <SecondaryAction href="/dashboard">Ver dashboard</SecondaryAction>
          </div>
        </div>

        <Card>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Último entrenamiento</p>
          {isMetricsLoading ? (
            <LatestSessionSkeleton />
          ) : latestSession ? (
            <LatestSessionCard session={latestSession} />
          ) : (
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Sin sesiones en este periodo.</p>
          )}
        </Card>
      </section>

      {syncMessage ? (
        <p className="mb-5 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-sm text-[var(--muted-strong)]">
          {syncMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-6">
        <section className="order-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:order-1">
          <MetricLink href="/training/weekly">
            <MetricCard
              label="Sesiones semana"
              value={metrics.sessions.formattedValue}
              detail={getExpectedContext(metrics.sessions) ?? "Estado semanal"}
              delta={getHomeStatusLabel(metrics.sessions)}
              deltaTone={getHomeStatusTone(metrics.sessions)}
              tone="strong"
              state={sessionsState}
            />
          </MetricLink>
          <MetricLink href="/training/running">
            <MetricCard
              label="Carrera total"
              value={metrics.runningKm.formattedValue}
              detail={formatRunningBreakdown(metrics.runningBreakdown)}
              delta={getHomeStatusLabel(metrics.runningKm)}
              deltaTone={getHomeStatusTone(metrics.runningKm)}
              secondaryDelta={getExpectedDeltaContext(metrics.runningKm)}
              secondaryDeltaTone={getHomeStatusTone(metrics.runningKm)}
              tone="strong"
              state={runningState}
            />
          </MetricLink>
          <MetricLink href="/dashboard">
            <MetricCard
              label="Duración"
              value={metrics.durationMinutes.formattedValue}
              detail={getExpectedDeltaContext(metrics.durationMinutes) ?? "Carga de la semana"}
              delta={getHomeStatusLabel(metrics.durationMinutes)}
              deltaTone={getHomeStatusTone(metrics.durationMinutes)}
              state={durationState}
            />
          </MetricLink>
          <MetricLink href="/dashboard">
            <MetricCard label="RPE medio" value={metrics.averageRpe.formattedValue} detail="Intensidad percibida" delta={getRpeStatus(metrics.averageRpe.value)} deltaTone={metrics.averageRpe.value !== null && metrics.averageRpe.value >= 8 ? "negative" : "neutral"} state={rpeState} />
          </MetricLink>
        </section>

        <section className="order-1 grid gap-5 lg:order-2 lg:grid-cols-3">
          <QuickDataInsightCard analysis={dataAnalysis} isLoading={isMetricsLoading} />
          <WatchCard signals={watchSignals} isLoading={isMetricsLoading} />
          <NextActionCard action={nextAction} isLoading={isMetricsLoading} />
        </section>

        <section className="order-3 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.8fr)_320px]">
          <TrainingMixCard rows={miniMixRows} density="compact" actionHref="/dashboard" actionLabel="Ver dashboard" state={isMetricsLoading ? "loading" : miniMixRows.length > 0 ? "ready" : "empty"} />
          <QuickTrendsCard trends={trends} isLoading={isMetricsLoading} />
          <MuscleSummaryCard muscles={visibleMuscles} isLoading={isMetricsLoading} />
          <SecondaryActivityCard summary={secondaryActivitySummary} isLoading={isMetricsLoading} />
          <QuickLinksCard />
        </section>
      </div>
    </>
  );
}
