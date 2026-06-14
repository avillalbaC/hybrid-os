"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MuscleDataInsightCard } from "@/components/analytics/data-insights-panel";
import { ChartCard } from "@/components/charts/chart-card";
import { HorizontalRankingChart } from "@/components/charts/horizontal-ranking-chart";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import { getTrainingDataInsights } from "@/lib/analytics/data-insights";
import { filterSessionsByPeriod, getPeriodDetail, getPeriodTitle, type DashboardPeriod } from "@/lib/domain/dashboard/periods";
import { getTotalRunExposureMeters } from "@/lib/domain/training/run-exposure";
import {
  calculateMuscleGroups,
  calculateMuscleSummary,
  detectMuscleImbalances,
  getMuscleLoadMax,
  getMuscleLoadTotal,
  getMusclePercent,
  getSessionMuscleSummary,
  getTopMuscles,
  getUnderusedMuscles,
  type MuscleGroupKey,
  type MuscleGroupTotal,
  type MuscleLoadTotal,
} from "@/lib/domain/training/muscle-load";
import { isSecondaryActivity } from "@/lib/domain/training/secondary-activity";
import { useTrainingSessions } from "@/lib/storage/use-training-sessions";
import { formatDate, formatMuscleName, formatTrainingType } from "@/lib/utils/format";
import type { MuscleName, TrainingSession } from "@/types/training";

type RatioGroup = {
  label: string;
  left: MuscleGroupTotal;
  leftLabel: string;
  right: MuscleGroupTotal;
  rightLabel: string;
};

type TopSession = {
  session: TrainingSession;
  load: number;
  topMuscles: MuscleLoadTotal[];
};

type PeriodReading = {
  summary: string;
  recommendation: string;
};

function getRatioGroups(groups: MuscleGroupTotal[]): RatioGroup[] {
  const groupByKey = new Map<MuscleGroupKey, MuscleGroupTotal>(groups.map((group) => [group.key, group]));
  const build = (label: string, leftKey: MuscleGroupKey, leftLabel: string, rightKey: MuscleGroupKey, rightLabel: string) => {
    const left = groupByKey.get(leftKey);
    const right = groupByKey.get(rightKey);
    return left && right ? { label, left, leftLabel, right, rightLabel } : null;
  };

  return [
    build("Tren", "upperBody", "Superior", "lowerBody", "Inferior"),
    build("Patrón", "push", "Empuje", "pull", "Tracción"),
    build("Cadena", "anteriorChain", "Anterior", "posteriorChain", "Posterior"),
    build("Dominancia", "kneeDominant", "Rodilla", "hipDominant", "Cadera"),
  ].filter((group): group is RatioGroup => group !== null);
}

function getTopSessions(sessions: TrainingSession[]): TopSession[] {
  return sessions
    .map((session) => {
      const summary = getSessionMuscleSummary(session);

      return {
        session,
        load: getMuscleLoadTotal(summary),
        topMuscles: getTopMuscles(summary, 3),
      };
    })
    .filter((item) => item.load > 0)
    .sort((a, b) => b.load - a.load);
}

function getGroup(groups: MuscleGroupTotal[], key: MuscleGroupKey) {
  return groups.find((group) => group.key === key);
}

function getGroupPercent(groups: MuscleGroupTotal[], key: MuscleGroupKey, denominator: number) {
  return getMusclePercent(getGroup(groups, key)?.load ?? 0, denominator);
}

function getLeastLoadedMuscles(muscleSummary: Record<MuscleName, number>, limit = 5): MuscleLoadTotal[] {
  const maxLoad = Math.max(...Object.values(muscleSummary), 1);

  return (Object.entries(muscleSummary) as Array<[MuscleName, number]>)
    .map(([muscle, load]) => ({
      muscle,
      load,
      percentOfMax: getMusclePercent(load, maxLoad),
    }))
    .sort((a, b) => a.load - b.load || a.muscle.localeCompare(b.muscle))
    .slice(0, limit);
}

function joinMuscleNames(muscles: MuscleLoadTotal[]) {
  return muscles.map((item) => formatMuscleName(item.muscle)).join(", ");
}

function getRatioPercentages(leftValue: number, rightValue: number) {
  const total = leftValue + rightValue;

  if (total <= 0) {
    return { leftPercent: 0, rightPercent: 0 };
  }

  const leftPercent = Math.round((leftValue / total) * 100);
  return { leftPercent, rightPercent: 100 - leftPercent };
}

function getPeriodReading(
  ranking: MuscleLoadTotal[],
  groups: MuscleGroupTotal[],
  runningDistanceMeters: number,
): PeriodReading {
  const dominantMuscles = ranking.slice(0, 3);
  const lowerBody = getGroup(groups, "lowerBody");
  const upperBody = getGroup(groups, "upperBody");
  const core = getGroup(groups, "core");
  const push = getGroup(groups, "push");
  const pull = getGroup(groups, "pull");
  const patternCandidates = ["pull", "push", "hipDominant", "kneeDominant"] as MuscleGroupKey[];
  const dominantPattern = patternCandidates
    .map((key) => getGroup(groups, key))
    .filter((group): group is MuscleGroupTotal => Boolean(group))
    .sort((a, b) => b.load - a.load)[0];
  const bodyDenominator = (lowerBody?.load ?? 0) + (upperBody?.load ?? 0) + (core?.load ?? 0);
  const lowerPercent = getGroupPercent(groups, "lowerBody", bodyDenominator);
  const upperPercent = getGroupPercent(groups, "upperBody", bodyDenominator);
  const bodyBias =
    lowerPercent > upperPercent + 12
      ? "sesgo claro hacia tren inferior"
      : upperPercent > lowerPercent + 12
        ? "sesgo claro hacia tren superior"
        : "distribución relativamente equilibrada entre tren superior e inferior";
  const pushPullBias =
    push && pull && pull.load > push.load * 1.25
      ? "mayor peso de tracción frente a empuje"
      : push && pull && push.load > pull.load * 1.25
        ? "mayor peso de empuje frente a tracción"
        : "empuje y tracción bastante compensados";
  const summary = `Periodo con carga dominante en ${joinMuscleNames(dominantMuscles)}. Patrón dominante: ${dominantPattern?.label.toLowerCase() ?? "sin patrón claro"}. Hay ${bodyBias}, con ${pushPullBias}.`;

  let recommendation = "Distribución razonable; mantener plan.";

  if (lowerPercent >= 55) {
    recommendation = "Evitar añadir más pierna pesada en la próxima sesión.";
  } else if (push && pull && pull.load > push.load * 1.25) {
    recommendation = "Priorizar upper push moderado para equilibrar la tracción acumulada.";
  } else if (push && pull && push.load > pull.load * 1.25) {
    recommendation = "Priorizar tracción moderada o espalda técnica en la próxima sesión.";
  } else if (runningDistanceMeters >= 5000 && dominantMuscles.some((item) => item.muscle === "calves")) {
    recommendation = "Mantener intensidad controlada si hay más running.";
  }

  return { summary, recommendation };
}

type DisplayAlert = {
  level: "Info" | "Vigilar" | "Alerta";
  title: string;
  detail: string;
};

function getDisplayAlerts(alerts: Array<{ title: string; detail: string }>): DisplayAlert[] {
  return alerts.map((alert) => {
    if (alert.title.includes("alta") || alert.title.includes("elevada") || alert.title.includes("Dominancia")) {
      return { ...alert, level: "Vigilar" };
    }

    if (alert.title.includes("baja") || alert.title.includes("bajo")) {
      return { ...alert, level: "Info" };
    }

    return { ...alert, level: "Alerta" };
  });
}

function getSecondaryRecommendation(alerts: DisplayAlert[]) {
  const calvesAlert = alerts.find((alert) => alert.title === "Gemelos con carga alta");
  const pushAlert = alerts.find((alert) => alert.title === "Empuje bajo respecto a tracción");
  const pullAlert = alerts.find((alert) => alert.title === "Tracción baja respecto a empuje");

  if (calvesAlert) {
    return "Evitar más impacto si notas fatiga en gemelos.";
  }

  if (pushAlert) {
    return "Añadir empuje sin buscar máxima intensidad.";
  }

  if (pullAlert) {
    return "Añadir tracción técnica sin acumular fatiga lumbar.";
  }

  return alerts.some((alert) => alert.level !== "Info") ? alerts[0]?.detail : null;
}

function getLoadCategory(totalLoad: number, sessionCount: number) {
  if (totalLoad <= 0 || sessionCount === 0) {
    return { label: "Carga baja del periodo", tone: "neutral" as const };
  }

  const averageLoad = totalLoad / sessionCount;

  if (totalLoad >= 2500 || averageLoad >= 650) {
    return { label: "Carga alta del periodo", tone: "positive" as const };
  }

  if (totalLoad >= 900 || averageLoad >= 300) {
    return { label: "Carga moderada", tone: "neutral" as const };
  }

  return { label: "Carga baja del periodo", tone: "negative" as const };
}

function AlertCard({ alert }: { alert: DisplayAlert }) {
  const levelStyle = {
    Info: "border-[var(--line)] bg-[rgba(244,247,244,0.035)] text-[var(--muted-strong)]",
    Vigilar: "border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] text-[var(--warning)]",
    Alerta: "border-[rgba(240,196,107,0.42)] bg-[rgba(240,196,107,0.16)] text-[var(--warning)]",
  }[alert.level];

  return (
    <div className={`rounded-md border p-3 text-sm ${levelStyle}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={alert.level === "Info" ? "neutral" : "warning"}>{alert.level}</Badge>
        <p className="font-semibold text-[var(--foreground)]">{alert.title}</p>
      </div>
      <p className="mt-2 text-[var(--muted-strong)]">{alert.detail}</p>
    </div>
  );
}

function RatioRow({ group }: { group: RatioGroup }) {
  const { leftPercent, rightPercent } = getRatioPercentages(group.left.load, group.right.load);

  return (
    <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-[var(--foreground)]">
          {group.leftLabel} {leftPercent}% / {group.rightLabel} {rightPercent}%
        </p>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{group.label}</p>
      </div>
      <div className="mt-3 flex h-2 overflow-hidden rounded-full border border-[var(--line)] bg-[rgba(244,247,244,0.05)]">
        <span
          className="bg-[linear-gradient(90deg,var(--accent),var(--accent-strong))]"
          style={{ width: `${leftPercent}%` }}
        />
        <span className="bg-[rgba(240,196,107,0.72)]" style={{ width: `${rightPercent}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 font-mono text-[0.68rem] font-bold text-[var(--muted)]">
        <span>{group.left.load} pts</span>
        <span>{group.right.load} pts</span>
      </div>
    </div>
  );
}

function RatiosPanel({ groups }: { groups: RatioGroup[] }) {
  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Ratios principales</p>
          <h3 className="mt-2 text-xl font-black tracking-tight">Equilibrios del periodo</h3>
        </div>
        <p className="text-sm text-[var(--muted)]">Cada par suma 100%.</p>
      </div>
      <div className="mt-4 grid gap-2">
        {groups.map((group) => (
          <RatioRow key={group.label} group={group} />
        ))}
      </div>
    </Card>
  );
}

function MuscleRanking({
  empty,
  ranking,
}: {
  empty: string;
  ranking: MuscleLoadTotal[];
}) {
  if (ranking.length === 0) {
    return <p className="py-4 text-sm text-[var(--muted)]">{empty}</p>;
  }

  return (
    <div className="space-y-3">
      {ranking.map((item, index) => (
        <div key={item.muscle} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="font-mono text-[0.68rem] font-bold text-[var(--muted)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="truncate text-sm font-bold text-[var(--foreground)]">{formatMuscleName(item.muscle)}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-black text-[var(--accent-strong)]">{item.load}</p>
              <p className="mt-0.5 font-mono text-[0.68rem] font-bold text-[var(--muted)]">{item.percentOfMax}%</p>
            </div>
          </div>
          <ProgressBar value={item.percentOfMax} />
        </div>
      ))}
    </div>
  );
}

export function MuscleLoadView({ seedSessions }: { seedSessions: TrainingSession[] }) {
  const [period, setPeriod] = useState<DashboardPeriod>("week");
  const [isPeriodPending, setIsPeriodPending] = useState(false);
  const [showFullRanking, setShowFullRanking] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [includeSecondaryActivities, setIncludeSecondaryActivities] = useState(true);
  const { sessions, pendingSessions, source, syncMessage, isLoading, isReady } = useTrainingSessions(seedSessions);
  const periodSessions = useMemo(() => filterSessionsByPeriod(sessions, period), [period, sessions]);
  const primarySessions = useMemo(() => periodSessions.filter((session) => !isSecondaryActivity(session)), [periodSessions]);
  const analysisSessions = includeSecondaryActivities ? periodSessions : primarySessions;
  const dataAnalysis = useMemo(() => getTrainingDataInsights(analysisSessions, { period: "all" }), [analysisSessions]);
  const excludedSecondaryCount = periodSessions.length - primarySessions.length;
  const muscleSummary = useMemo(() => calculateMuscleSummary(analysisSessions), [analysisSessions]);
  const ranking = useMemo(() => getTopMuscles(muscleSummary, 100), [muscleSummary]);
  const underusedMuscles = useMemo(() => getUnderusedMuscles(muscleSummary, 12), [muscleSummary]);
  const leastLoadedMuscles = useMemo(() => getLeastLoadedMuscles(muscleSummary, 5), [muscleSummary]);
  const groups = useMemo(() => calculateMuscleGroups(muscleSummary), [muscleSummary]);
  const ratioGroups = useMemo(() => getRatioGroups(groups), [groups]);
  const topSessions = useMemo(() => getTopSessions(analysisSessions), [analysisSessions]);
  const runningDistanceMeters = getTotalRunExposureMeters(analysisSessions);
  const periodReading = useMemo(
    () => getPeriodReading(ranking, groups, runningDistanceMeters),
    [ranking, groups, runningDistanceMeters],
  );
  const alerts = useMemo(
    () => detectMuscleImbalances(muscleSummary, { runningDistanceMeters }),
    [muscleSummary, runningDistanceMeters],
  );
  const displayAlerts = useMemo(() => getDisplayAlerts(alerts), [alerts]);
  const secondaryRecommendation = useMemo(() => getSecondaryRecommendation(displayAlerts), [displayAlerts]);
  const totalLoad = getMuscleLoadTotal(muscleSummary);
  const loadCategory = getLoadCategory(totalLoad, analysisSessions.length);
  const maxLoad = getMuscleLoadMax(muscleSummary);
  const lowerBody = getGroup(groups, "lowerBody");
  const upperBody = getGroup(groups, "upperBody");
  const coreGroup = getGroup(groups, "core");
  const bodyCategoryTotal = (lowerBody?.load ?? 0) + (upperBody?.load ?? 0) + (coreGroup?.load ?? 0);
  const lowerBodyPercent = getGroupPercent(groups, "lowerBody", bodyCategoryTotal);
  const upperBodyPercent = getGroupPercent(groups, "upperBody", bodyCategoryTotal);
  const corePercent = getGroupPercent(groups, "core", bodyCategoryTotal);
  const hasCriticalUnderuse = underusedMuscles.length > 0;
  const visibleRanking = showFullRanking ? ranking : ranking.slice(0, 8);
  const visibleTopSessions = showAllSessions ? topSessions : topSessions.slice(0, 3);
  const dominantMuscleName = ranking[0] ? formatMuscleName(ranking[0].muscle) : "Sin carga";
  const isMetricsLoading = isLoading || !isReady || isPeriodPending;
  const totalLoadState = isMetricsLoading ? "loading" : totalLoad > 0 ? "ready" : "empty";
  const maxLoadState = isMetricsLoading ? "loading" : maxLoad > 0 ? "ready" : "empty";
  const ratioState = isMetricsLoading ? "loading" : totalLoad > 0 ? "ready" : "empty";
  const handlePeriodChange = (nextPeriod: DashboardPeriod) => {
    if (nextPeriod === period) {
      return;
    }

    setIsPeriodPending(true);
    setPeriod(nextPeriod);
  };

  useEffect(() => {
    if (!isPeriodPending || isLoading || !isReady) {
      return;
    }

    const frame = window.requestAnimationFrame(() => setIsPeriodPending(false));

    return () => window.cancelAnimationFrame(frame);
  }, [isLoading, isPeriodPending, isReady, period]);

  return (
    <>
      <PageHeader
        eyebrow="Carga muscular"
        title="Análisis de carga muscular"
        description={`${getPeriodTitle(period)}: músculos cargados, infrautilizados, ratios y sesiones clave.`}
      />

      <section className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge tone={source === "remote" ? "accent" : source === "seed-fallback" ? "warning" : "neutral"}>
            {source === "remote" ? "Datos reales" : source === "seed-fallback" ? "Fallback seed" : "sincronizando"}
          </Badge>
          {pendingSessions.length > 0 ? <Badge tone="warning">Pendientes locales {pendingSessions.length}</Badge> : null}
          <Badge>{getPeriodDetail(period)}</Badge>
          <Badge>{includeSecondaryActivities ? "Carga total real" : "Solo entrenamiento principal"}</Badge>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="inline-flex min-h-11 items-center gap-3 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={includeSecondaryActivities}
              onChange={(event) => setIncludeSecondaryActivities(event.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Incluir actividades secundarias
          </label>
          <PeriodSelector value={period} onChange={handlePeriodChange} />
        </div>
      </section>

      {syncMessage ? (
        <p className="mb-5 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-sm text-[var(--muted-strong)]">
          {syncMessage}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Carga total"
          value={`${totalLoad}`}
          detail={`${analysisSessions.length} sesiones analizadas${includeSecondaryActivities ? "" : ` · ${excludedSecondaryCount} secundarias fuera`}`}
          delta={loadCategory.label}
          deltaTone={loadCategory.tone}
          tone="strong"
          state={totalLoadState}
        />
        <MetricCard label="Máximo del periodo" value={`${maxLoad}`} detail={`${dominantMuscleName} · músculo dominante`} tone="strong" state={maxLoadState} />
        <MetricCard label="Tren inferior" value={`${lowerBodyPercent}%`} detail={`${lowerBody?.load ?? 0} puntos · ${lowerBodyPercent}% de carga`} state={ratioState} />
        <MetricCard label="Tren superior" value={`${upperBodyPercent}%`} detail={`${upperBody?.load ?? 0} puntos · ${upperBodyPercent}% de carga`} state={ratioState} />
        <MetricCard label="Core/lumbar" value={`${corePercent}%`} detail={`${coreGroup?.load ?? 0} puntos · ${corePercent}% de carga`} state={ratioState} />
      </section>

      <section className="mt-6">
        <MuscleDataInsightCard analysis={dataAnalysis} isLoading={isMetricsLoading} />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ChartCard
          title="Top músculos"
          description="Carga acumulada del periodo por grupo muscular."
          unit="pts"
          compact
          currentValue={ranking[0] ? `${formatMuscleName(ranking[0].muscle)} ${ranking[0].load}` : undefined}
          meta={[
            { label: "Carga total", value: `${totalLoad}` },
            { label: "Sesiones", value: `${analysisSessions.length}` },
          ]}
          isLoading={isMetricsLoading}
          footer="Color e intensidad representan porcentaje relativo al músculo más cargado."
        >
          <HorizontalRankingChart
            emptyLabel="Sin carga muscular en el periodo"
            formatter={(value) => `${Math.round(value)} pts`}
            items={ranking.slice(0, 8).map((item) => ({
              key: item.muscle,
              label: formatMuscleName(item.muscle),
              value: item.load,
              percentage: item.percentOfMax,
            }))}
          />
        </ChartCard>
        <Card className="p-4">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Mapa corporal</p>
          <h3 className="mt-2 text-xl font-black tracking-tight">Futura sección superior</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            El mapa corporal queda pendiente para la fase asset-based. De momento, el ranking y los ratios son la fuente visual principal.
          </p>
          {/* Future BodyMap slot: keep data fed by muscleSummary/ranking, not by ad hoc anatomy code. */}
        </Card>
      </section>

      {isMetricsLoading ? (
        <section className="mt-7 grid gap-5 lg:grid-cols-2" aria-label="Carga muscular calculando">
          <Card>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Lectura del periodo</p>
            <div className="mt-4">
              <SkeletonText lines={3} />
            </div>
          </Card>
          <Card>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Acción recomendada</p>
            <SkeletonBlock className="mt-4 h-7 w-3/4" />
            <SkeletonBlock className="mt-3 h-4 w-full" />
          </Card>
          <Card>
            <SkeletonBlock className="h-6 w-48" />
            <div className="mt-5 space-y-3">
              <SkeletonBlock className="h-14 w-full" />
              <SkeletonBlock className="h-14 w-full" />
              <SkeletonBlock className="h-14 w-full" />
            </div>
          </Card>
          <Card>
            <SkeletonBlock className="h-6 w-36" />
            <div className="mt-5 space-y-3">
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
            </div>
          </Card>
        </section>
      ) : totalLoad <= 0 ? (
        <section className="mt-6">
          <Card>
            <p className="text-sm leading-6 text-[var(--muted)]">Sin datos del periodo.</p>
          </Card>
        </section>
      ) : (
        <>
          <section className="mt-7 grid gap-5 lg:grid-cols-2">
            <Card>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Lectura del periodo</p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-strong)]">{periodReading.summary}</p>
            </Card>
            <Card>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Acción recomendada</p>
              <p className="mt-3 text-lg font-semibold leading-7 text-[var(--foreground)]">{periodReading.recommendation}</p>
              {secondaryRecommendation ? (
                <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">{secondaryRecommendation}</p>
              ) : null}
            </Card>
          </section>

          <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
            <Card>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Análisis principal</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight">Músculos por carga</h3>
                </div>
                <p className="text-sm text-[var(--muted)]">
                  {showFullRanking ? "Ranking completo" : "Top 8"} · porcentaje relativo al músculo con mayor carga.
                </p>
              </div>
              <div className="mt-5">
                <MuscleRanking empty="No hay músculos cargados en este periodo." ranking={visibleRanking} />
              </div>
              {ranking.length > 8 ? (
                <button
                  type="button"
                  onClick={() => setShowFullRanking((current) => !current)}
                  className="mt-5 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)] focus-visible:border-[var(--accent-border)]"
                >
                  {showFullRanking ? "Mostrar menos" : "Ver ranking completo"}
                </button>
              ) : null}
            </Card>

            <div className="space-y-5">
              <Card>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Insights</p>
                    <h3 className="mt-2 text-xl font-black tracking-tight">Qué vigilar</h3>
                  </div>
                  <p className="text-sm text-[var(--muted)]">Menor estímulo y avisos accionables.</p>
                </div>

                <div className="mt-5 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Infrautilización</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                    {hasCriticalUnderuse ? "Infrautilización crítica detectada." : "Sin infrautilización crítica."}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">
                    Menor estímulo: {joinMuscleNames(leastLoadedMuscles)}.
                  </p>
                </div>

                <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Avisos</p>
                  {displayAlerts.length > 0 ? (
                    displayAlerts.map((alert) => (
                      <AlertCard key={alert.title} alert={alert} />
                    ))
                  ) : (
                    <p>Sin avisos relevantes con los umbrales actuales.</p>
                  )}
                </div>
              </Card>

              <RatiosPanel groups={ratioGroups} />
            </div>
          </section>

          <section className="mt-6">
            <Card>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Sesiones clave</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight">Top sesiones por carga muscular</h3>
                </div>
                <p className="text-sm text-[var(--muted)]">Ordenadas por carga total acumulada.</p>
              </div>

              <div className="mt-5 divide-y divide-[var(--line)]">
                {visibleTopSessions.length > 0 ? (
                  visibleTopSessions.map((item) => (
                    <Link key={item.session.id} href={`/training/${item.session.id}`} className="block py-4 first:pt-0 last:pb-0 transition hover:text-[var(--accent-strong)]">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">{item.session.title}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {formatDate(item.session.date)} · {formatTrainingType(item.session.type)}
                          </p>
                          <p className="mt-2 text-sm text-[var(--muted-strong)]">Principal: {joinMuscleNames(item.topMuscles)}.</p>
                          <p className="mt-3 text-sm font-bold text-[var(--accent)]">Ver sesión →</p>
                        </div>
                        <div className="min-w-0 lg:w-80">
                          <Badge tone="accent">{item.load} puntos</Badge>
                          <div className="mt-3 space-y-2">
                            {item.topMuscles.map((muscle) => (
                              <div key={muscle.muscle}>
                                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                                  <span className="truncate text-[var(--muted)]">{formatMuscleName(muscle.muscle)}</span>
                                  <span className="font-mono font-bold text-[var(--accent-strong)]">{muscle.load}</span>
                                </div>
                                <ProgressBar value={muscle.percentOfMax} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="py-4 text-sm text-[var(--muted)]">No hay sesiones con carga muscular en este periodo.</p>
                )}
              </div>
              {topSessions.length > 3 ? (
                <button
                  type="button"
                  onClick={() => setShowAllSessions((current) => !current)}
                  className="mt-5 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)] focus-visible:border-[var(--accent-border)]"
                >
                  {showAllSessions ? "Mostrar menos" : "Ver más sesiones"}
                </button>
              ) : null}
            </Card>
          </section>
        </>
      )}
    </>
  );
}
