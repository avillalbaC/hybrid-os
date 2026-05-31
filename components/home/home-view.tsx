"use client";

import { useMemo } from "react";
import Link from "next/link";
import { TrainingMixCard } from "@/components/home/training-mix-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { calculateDashboardMetrics } from "@/lib/domain/dashboard/metrics";
import { getLatestWeekSessions } from "@/lib/domain/training/analysis";
import { calculateTrainingMix, type TrainingModality } from "@/lib/domain/training/training-mix";
import { useTrainingSessions } from "@/lib/storage/use-training-sessions";
import { formatDataQuality, formatDate, formatMuscleName, formatTrainingType } from "@/lib/utils/format";
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
  { href: "/training/running", label: "Running", detail: "Sesiones con carrera" },
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
      className="inline-flex min-h-11 items-center justify-center rounded-md border border-[rgba(56,217,159,0.34)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[#06100c] transition hover:bg-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
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
      className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[rgba(56,217,159,0.34)] hover:bg-[rgba(244,247,244,0.055)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
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
    return `Semana activa con ${sessionCount} sesiones, ${runningLabel} de running y señales que conviene revisar antes de sumar intensidad.`;
  }

  if (averageRpe !== null && averageRpe >= 8) {
    return `La semana avanza con intensidad alta: ${sessionCount} sesiones, ${runningLabel} de running y RPE medio ${averageRpe}/10.`;
  }

  if (Number(sessionCount) === 0) {
    return "Sin sesiones registradas esta semana. Buen momento para importar el último entrenamiento o planificar la siguiente entrada.";
  }

  return `Semana estable: ${sessionCount} sesiones, ${runningLabel} de running y carga sin alertas principales.`;
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
  const runningKm = weekSessions.reduce((total, session) => total + session.sessionMetrics.totalRunMeters, 0) / 1000;
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

  if (runningKm > 0 && topCalvesLoad >= 180 && !signals.some((signal) => signal.title.includes("gemelos"))) {
    signals.push({
      title: "Running + gemelos",
      detail: `${runningKm.toFixed(1)} km esta semana con gemelos en carga alta.`,
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
  const runningKm = weekSessions.reduce((total, session) => total + session.sessionMetrics.totalRunMeters, 0) / 1000;
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

  if (runningKm > 0 && topCalvesLoad >= 180) {
    return {
      title: "Evitar impacto",
      detail: "Mantén el motor con bajo impacto y revisa gemelos antes de volver a correr fuerte.",
      href: "/training/running",
      label: "Ver running",
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
  const runningKm = session.sessionMetrics.totalRunMeters > 0
    ? `${(session.sessionMetrics.totalRunMeters / 1000).toFixed(1)} km`
    : "-";

  return (
    <Link
      href={`/training/${session.id}`}
      className="mt-4 block rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-4 outline-none transition hover:-translate-y-0.5 hover:border-[rgba(56,217,159,0.34)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
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
          <p className="mt-1 font-mono font-black">{session.durationMinutes ?? "-"}m</p>
        </div>
        <div className="rounded-md border border-[var(--line)] p-2">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">RPE</p>
          <p className="mt-1 font-mono font-black">{session.rpe ?? "-"}/10</p>
        </div>
        <div className="rounded-md border border-[var(--line)] p-2">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Running</p>
          <p className="mt-1 font-mono font-black">{runningKm}</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-bold text-[var(--accent)]">Ver detalle</p>
    </Link>
  );
}

function WatchCard({ signals }: { signals: WatchSignal[] }) {
  return (
    <Card>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Qué vigilar</p>
      <h3 className="mt-2 text-xl font-black tracking-tight">Señales principales</h3>
      <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
        {signals.length > 0 ? (
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

function NextActionCard({ action }: { action: NextAction }) {
  return (
    <Card className={action.tone === "warning" ? "border-[rgba(240,196,107,0.26)]" : ""}>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Próxima acción</p>
      <h3 className="mt-2 text-2xl font-black tracking-tight">{action.title}</h3>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{action.detail}</p>
      <Link
        href={action.href}
        className={`mt-5 inline-flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
          action.tone === "warning"
            ? "border-[rgba(240,196,107,0.34)] bg-[var(--warning-soft)] text-[var(--warning)] hover:border-[rgba(240,196,107,0.5)]"
            : "border-[rgba(56,217,159,0.34)] bg-[var(--accent)] text-[#06100c] hover:bg-[var(--accent-strong)]"
        }`}
      >
        {action.label}
      </Link>
    </Card>
  );
}

function MuscleSummaryCard({
  muscles,
}: {
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
        {muscles.length > 0 ? (
          muscles.map((item) => (
            <div key={item.muscle} className="flex items-center justify-between rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-3 py-2 text-sm">
              <span className="font-semibold text-[var(--foreground)]">{formatMuscleName(item.muscle)}</span>
              <span className="font-mono font-black text-[var(--accent-strong)]">{item.loadScore}</span>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-[var(--muted)]">Sin carga acumulada esta semana.</p>
        )}
      </div>
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
            className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 transition hover:border-[rgba(56,217,159,0.34)] hover:bg-[rgba(244,247,244,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
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
  const { sessions: combinedSessions, pendingSessions, source, syncMessage } = useTrainingSessions(sessions);
  const metrics = calculateDashboardMetrics(combinedSessions, bodyChecks, nutritionChecks, "week");
  const { currentWeekSessions } = useMemo(() => getLatestWeekSessions(combinedSessions), [combinedSessions]);
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

  return (
    <>
      <section className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
        <div className="rounded-md border border-[var(--line)] bg-[linear-gradient(135deg,rgba(56,217,159,0.14),rgba(18,23,21,0.98)_44%,rgba(11,14,13,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-7">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Centro de mando diario</p>
          <div className="mt-3 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="max-w-3xl text-4xl font-black tracking-tight text-[var(--foreground)] sm:text-5xl">
                Estado actual.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted-strong)]">{weeklyReading}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:min-w-[320px] sm:grid-cols-3">
              <div className="rounded-md border border-[rgba(244,247,244,0.12)] bg-[rgba(244,247,244,0.035)] p-3">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Sesiones</p>
                <p className="mt-2 whitespace-nowrap font-mono text-2xl font-black">{metrics.sessions.formattedValue}</p>
              </div>
              <div className="rounded-md border border-[rgba(244,247,244,0.12)] bg-[rgba(244,247,244,0.035)] p-3">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Running</p>
                <p className="mt-2 whitespace-nowrap font-mono text-2xl font-black">{metrics.runningKm.formattedValue}</p>
              </div>
              <div className="rounded-md border border-[rgba(244,247,244,0.12)] bg-[rgba(244,247,244,0.035)] p-3">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">RPE</p>
                <p className="mt-2 whitespace-nowrap font-mono text-2xl font-black">{metrics.averageRpe.formattedValue}</p>
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
          {latestSession ? (
            <LatestSessionCard session={latestSession} />
          ) : (
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Todavía no hay entrenamientos para mostrar.</p>
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
            <MetricCard label="Sesiones semana" value={metrics.sessions.formattedValue} detail="Estado semanal" delta={metrics.sessions.deltaLabel} deltaTone={metrics.sessions.deltaTone} tone="strong" />
          </MetricLink>
          <MetricLink href="/training/running">
            <MetricCard label="Running" value={metrics.runningKm.formattedValue} detail="Running + HYROX" delta={metrics.runningKm.deltaLabel} deltaTone={metrics.runningKm.deltaTone} tone="strong" />
          </MetricLink>
          <MetricLink href="/dashboard">
            <MetricCard label="Duración" value={metrics.durationMinutes.formattedValue} detail="Carga de la semana" delta={metrics.durationMinutes.deltaLabel} deltaTone={metrics.durationMinutes.deltaTone} />
          </MetricLink>
          <MetricLink href="/dashboard">
            <MetricCard label="RPE medio" value={metrics.averageRpe.formattedValue} detail="Intensidad percibida" delta={metrics.averageRpe.deltaLabel} deltaTone={metrics.averageRpe.deltaTone} />
          </MetricLink>
        </section>

        <section className="order-1 grid gap-5 lg:order-2 lg:grid-cols-[minmax(0,1fr)_360px]">
          <WatchCard signals={watchSignals} />
          <NextActionCard action={nextAction} />
        </section>

        <section className="order-3 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.8fr)_320px]">
          <TrainingMixCard rows={miniMixRows} density="compact" actionHref="/dashboard" actionLabel="Ver dashboard" />
          <MuscleSummaryCard muscles={visibleMuscles} />
          <QuickLinksCard />
        </section>
      </div>
    </>
  );
}
