"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useTrainingSessions, type TrainingSessionWithSync } from "@/lib/storage/use-training-sessions";
import { formatDataQuality, formatLongDate, formatMuscleName, formatMuscleRole, formatTag, formatTrainingType } from "@/lib/utils/format";
import type { MuscleName, TrainingBlock, TrainingExercise, TrainingResult, TrainingSession } from "@/types/training";

const statusLabels: Record<TrainingSession["status"], string> = {
  completed: "Completado",
  partial: "Parcial",
  planned: "Planificado",
  cancelled: "Cancelado",
};

const sourceLabels: Record<TrainingSession["source"], string> = {
  chatgpt: "ChatGPT",
  import: "Importación",
  manual: "Manual",
};

function formatOptional(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function formatSeconds(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined) {
    return null;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}:${String(remainingSeconds).padStart(2, "0")}` : `${remainingSeconds}s`;
}

function formatResult(result: TrainingResult | null) {
  if (!result) {
    return "-";
  }

  return [result.score, result.timeSeconds ? formatSeconds(result.timeSeconds) : null, result.capMinutes ? `cap ${result.capMinutes} min` : null, result.notes]
    .filter(Boolean)
    .join(" · ") || result.type;
}

function formatMeters(meters: number | null | undefined) {
  if (!meters) {
    return null;
  }

  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
}

function formatMinutes(minutes: number | null | undefined) {
  return minutes === null || minutes === undefined ? "-" : `${minutes} min`;
}

function formatUnit(value: string | number | boolean | null | undefined, unit: string) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return `${value} ${unit}`;
}

function getTopMuscles(session: TrainingSession, limit = 3) {
  return (Object.entries(session.sessionMuscleSummary) as Array<[MuscleName, number]>)
    .filter(([, load]) => load > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);
}

function getExerciseTopMuscles(exercise: TrainingExercise, limit = 3) {
  return [...exercise.muscleLoad]
    .filter((entry) => entry.load > 0)
    .sort((a, b) => b.load - a.load)
    .slice(0, limit);
}

function SummaryStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "neutral" | "accent" | "warning";
}) {
  const toneClasses = {
    neutral: "border-[var(--line)] bg-[rgba(244,247,244,0.035)]",
    accent: "border-[rgba(56,217,159,0.32)] bg-[var(--accent-soft)]",
    warning: "border-[rgba(240,196,107,0.34)] bg-[var(--warning-soft)]",
  };

  return (
    <div className={`rounded-md border p-4 ${toneClasses[tone]}`}>
      <p className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-lg font-black leading-tight text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function CompactField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold leading-5 text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  id,
}: {
  eyebrow?: string;
  title: string;
  id?: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      {eyebrow ? <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p> : null}
      <h2 className="mt-1 text-xl font-black tracking-[-0.01em] text-[var(--foreground)]">{title}</h2>
    </div>
  );
}

function ExecutiveSummary({
  session,
  topMuscles,
}: {
  session: TrainingSession;
  topMuscles: Array<[MuscleName, number]>;
}) {
  const dominantLoad = topMuscles.length > 0
    ? topMuscles.map(([muscle]) => formatMuscleName(muscle).toLowerCase()).join(", ")
    : "sin carga muscular registrada";
  const resultText = formatResult(session.result);
  const summaryParts = [
    formatTrainingType(session.type),
    formatMinutes(session.durationMinutes),
    `RPE ${session.rpe ?? "-"}`,
    resultText !== "-" ? resultText : null,
    `carga dominante: ${dominantLoad}`,
  ].filter(Boolean);

  return (
    <section className="mb-5 rounded-md border border-[rgba(56,217,159,0.22)] bg-[linear-gradient(135deg,rgba(56,217,159,0.12),rgba(244,247,244,0.035)_42%,rgba(240,196,107,0.08))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--accent-strong)]">Lectura rápida</p>
          <p className="mt-3 text-2xl font-black leading-tight text-[var(--foreground)] md:text-3xl">
            {summaryParts.join(" · ")}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="accent">{formatTrainingType(session.type)}</Badge>
            {session.subtypes.map((subtype) => (
              <Badge key={subtype}>{formatTag(subtype)}</Badge>
            ))}
            <Badge>{statusLabels[session.status]}</Badge>
            <Badge>{formatDataQuality(session.dataQuality)}</Badge>
            <Badge>{sourceLabels[session.source]}</Badge>
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-3 sm:min-w-[360px]">
          <SummaryStat label="Fecha" value={formatLongDate(session.date)} />
          <SummaryStat label="Tipo" value={formatTrainingType(session.type)} />
          <SummaryStat label="Duración" value={formatMinutes(session.durationMinutes)} tone="accent" />
          <SummaryStat label="RPE" value={`${session.rpe ?? "-"}/10`} tone={session.rpe && session.rpe >= 8 ? "warning" : "neutral"} />
        </div>
      </div>
    </section>
  );
}

function ResultCard({
  session,
}: {
  session: TrainingSession;
}) {
  const result = session.result;
  const runMeters = formatMeters(session.sessionMetrics.totalRunMeters);

  return (
    <Card className="border-[rgba(56,217,159,0.24)]">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--accent)]">Resultado principal</p>
          <p className="mt-2 text-3xl font-black leading-none text-[var(--foreground)] md:text-4xl">
            {result?.score ?? "-"}
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--muted-strong)]">{formatResult(result)}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 md:min-w-[420px]">
          <SummaryStat label="Estado" value={statusLabels[session.status]} tone={session.status === "completed" ? "accent" : "warning"} />
          <SummaryStat label="Cap" value={result?.capMinutes ? `${result.capMinutes} min` : "-"} />
          <SummaryStat label="Running" value={runMeters ?? "-"} />
        </div>
      </div>
      {result?.completedAsPlanned !== undefined && result.completedAsPlanned !== null ? (
        <p className="mt-4 text-sm font-semibold text-[var(--muted)]">
          {result.completedAsPlanned ? "Completado según lo planificado." : "Resultado parcial o con ajuste respecto al plan."}
        </p>
      ) : null}
    </Card>
  );
}

function MetadataSection({
  session,
  ergMetrics,
}: {
  session: TrainingSession;
  ergMetrics: Array<{ label: string; meters: number; detail: string }>;
}) {
  return (
    <Card>
      <div className="grid gap-6 xl:grid-cols-3">
        <div>
          <SectionTitle title="Datos principales" />
          <dl className="mt-4 grid gap-4">
            <CompactField label="Título" value={session.title} />
            <CompactField label="Fecha" value={formatLongDate(session.date)} />
            <CompactField label="Ubicación" value={formatOptional(session.location)} />
            <CompactField label="Subtipos" value={session.subtypes.length > 0 ? session.subtypes.map(formatTag).join(", ") : "-"} />
          </dl>
        </div>
        <div>
          <SectionTitle title="Calidad y notas" />
          <dl className="mt-4 grid gap-4">
            <CompactField label="Data quality" value={formatDataQuality(session.dataQuality)} />
            <CompactField label="Source" value={sourceLabels[session.source]} />
            <CompactField label="Pending fields" value={session.pendingFields.length > 0 ? session.pendingFields.join(", ") : "Sin campos pendientes"} />
            <CompactField label="Feeling" value={formatOptional(session.feeling)} />
            <CompactField label="Soreness" value={session.soreness.length > 0 ? session.soreness.join(", ") : "-"} />
            <CompactField label="Injury notes" value={formatOptional(session.injuryNotes)} />
          </dl>
        </div>
        <div>
          <SectionTitle title="Métricas secundarias" />
          <dl className="mt-4 grid gap-4">
            <CompactField label="Fecha reportada" value={formatOptional(session.reportedAt)} />
            <CompactField label="Date confidence" value={formatOptional(session.dateConfidence)} />
            <CompactField label="Date rule" value={formatOptional(session.dateRule)} />
            <CompactField label="Calorías" value={formatOptional(session.sessionMetrics.totalCalories)} />
            <CompactField label="Carga externa" value={formatUnit(session.sessionMetrics.totalExternalLoadKg, "kg")} />
            {ergMetrics.map((metric) => (
              <CompactField key={metric.label} label={metric.label} value={formatMeters(metric.meters) ?? "-"} />
            ))}
          </dl>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Notas</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--muted-strong)]">{session.notes || "Sin notas registradas."}</p>
        </div>
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Import notes</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--muted-strong)]">{session.importNotes || "Sin notas de importación."}</p>
        </div>
      </div>
    </Card>
  );
}

function ExerciseMuscleLoad({ exercise }: { exercise: TrainingExercise }) {
  const topMuscles = getExerciseTopMuscles(exercise);

  if (exercise.muscleLoad.length === 0) {
    return <p className="mt-3 text-sm text-[var(--muted)]">Sin muscleLoad por ejercicio.</p>;
  }

  return (
    <details className="mt-3 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.02)] p-3">
      <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
        Ver carga muscular del ejercicio
        {topMuscles.length > 0 ? ` · ${topMuscles.map((entry) => `${formatMuscleName(entry.muscle)} ${entry.load}`).join(" · ")}` : null}
      </summary>
      <div className="mt-3 flex flex-wrap gap-2">
        {exercise.muscleLoad.map((entry) => (
          <Badge key={`${exercise.name}-${entry.muscle}-${entry.role}`}>
            {formatMuscleName(entry.muscle)} · {formatMuscleRole(entry.role)} · {entry.load}
          </Badge>
        ))}
      </div>
    </details>
  );
}

function getExerciseMetrics(exercise: TrainingExercise) {
  return [
    exercise.sets !== undefined ? `${formatOptional(exercise.sets)} sets` : null,
    exercise.reps !== undefined ? `${formatOptional(exercise.reps)} reps` : null,
    exercise.loadKg !== undefined ? formatUnit(exercise.loadKg, "kg") : null,
    exercise.distanceMeters !== undefined ? formatUnit(exercise.distanceMeters, "m") : null,
    exercise.durationSeconds !== undefined ? formatSeconds(exercise.durationSeconds) : null,
    exercise.calories !== undefined ? formatUnit(exercise.calories, "cal") : null,
  ].filter(Boolean);
}

function ExerciseCard({ exercise }: { exercise: TrainingExercise }) {
  const metrics = getExerciseMetrics(exercise);

  return (
    <article className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.024)] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h4 className="text-base font-black text-[var(--foreground)]">{exercise.name}</h4>
          <p className="mt-1 font-mono text-xs text-[var(--muted)]">{exercise.canonicalName}</p>
          {metrics.length > 0 ? (
            <p className="mt-3 text-sm font-semibold leading-6 text-[var(--muted-strong)]">{metrics.join(" · ")}</p>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted)]">Sin métricas detalladas registradas.</p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Badge>{formatTag(exercise.movementPattern)}</Badge>
          {exercise.intensity ? <Badge tone={exercise.intensity === "max" || exercise.intensity === "high" ? "warning" : "accent"}>{exercise.intensity}</Badge> : null}
        </div>
      </div>
      {exercise.notes ? <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{exercise.notes}</p> : null}
      <ExerciseMuscleLoad exercise={exercise} />
    </article>
  );
}

function BlockCard({ block, index }: { block: TrainingBlock; index: number }) {
  const blockFacts = [
    block.roundsPlanned !== undefined ? `plan ${formatOptional(block.roundsPlanned)} rondas` : null,
    block.roundsCompleted !== undefined ? `hechas ${formatOptional(block.roundsCompleted)}` : null,
    block.timeCapMinutes !== undefined ? `cap ${formatUnit(block.timeCapMinutes, "min")}` : null,
    block.restSeconds !== undefined ? `rest ${formatUnit(block.restSeconds, "s")}` : null,
  ].filter(Boolean);

  return (
    <article className="rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">Bloque {index + 1}</p>
          <h3 className="mt-1 text-xl font-black text-[var(--foreground)]">{block.name}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="accent">{formatTag(block.format)}</Badge>
            {block.blockResult ? <Badge tone="warning">{block.blockResult}</Badge> : null}
          </div>
        </div>
        {blockFacts.length > 0 ? (
          <p className="max-w-xl text-sm font-semibold leading-6 text-[var(--muted-strong)] md:text-right">{blockFacts.join(" · ")}</p>
        ) : null}
      </div>

      {block.notes ? <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{block.notes}</p> : null}

      <div className="mt-5 grid gap-3">
        {block.exercises.length > 0 ? block.exercises.map((exercise, exerciseIndex) => (
          <ExerciseCard key={`${block.id}-${exercise.name}-${exerciseIndex}`} exercise={exercise} />
        )) : (
          <div className="rounded-md border border-[rgba(240,196,107,0.28)] bg-[var(--warning-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--warning)]">Este bloque no tiene ejercicios detallados.</p>
          </div>
        )}
      </div>
    </article>
  );
}

function MuscleRanking({ session }: { session: TrainingSession }) {
  const muscles = (Object.entries(session.sessionMuscleSummary) as Array<[MuscleName, number]>)
    .filter(([, load]) => load > 0)
    .sort(([, a], [, b]) => b - a);
  const maxLoad = muscles[0]?.[1] ?? 0;
  const warningMuscles = muscles.filter(([, load]) => load >= 80).slice(0, 3);

  return (
    <Card>
      <h3 className="text-lg font-black">Carga muscular</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">Máximo de sesión: {maxLoad > 0 ? `${maxLoad} puntos` : "-"}</p>
      {warningMuscles.length > 0 ? (
        <p className="mt-3 rounded-md border border-[rgba(240,196,107,0.28)] bg-[var(--warning-soft)] p-3 text-sm font-semibold leading-5 text-[var(--warning)]">
          Alta carga en {warningMuscles.map(([muscle]) => formatMuscleName(muscle).toLowerCase()).join(", ")}.
        </p>
      ) : null}
      <div className="mt-4 space-y-3">
        {muscles.length > 0 ? muscles.slice(0, 8).map(([muscle, load]) => (
          <div key={muscle} className="grid gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-[var(--foreground)]">{formatMuscleName(muscle)}</span>
              <span className="text-xs font-bold text-[var(--muted-strong)]">{load}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[rgba(244,247,244,0.08)]" aria-hidden="true">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--warning))]"
                style={{ width: `${Math.max(8, (load / maxLoad) * 100)}%` }}
              />
            </div>
          </div>
        )) : <p className="text-sm text-[var(--muted)]">Sin carga muscular registrada.</p>}
      </div>
    </Card>
  );
}

function Sidebar({
  session,
  previousSession,
  nextSession,
}: {
  session: TrainingSession;
  previousSession?: TrainingSessionWithSync;
  nextSession?: TrainingSessionWithSync;
}) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
      <Card>
        <h3 className="text-lg font-black">Navegación</h3>
        <nav className="mt-4 grid gap-2 text-sm font-semibold text-[var(--muted-strong)]">
          <a href="#resultado" className="rounded-md border border-[var(--line)] px-3 py-2 transition hover:border-[rgba(56,217,159,0.34)] hover:text-[var(--foreground)]">Resultado</a>
          <a href="#datos" className="rounded-md border border-[var(--line)] px-3 py-2 transition hover:border-[rgba(56,217,159,0.34)] hover:text-[var(--foreground)]">Datos y calidad</a>
          <a href="#bloques" className="rounded-md border border-[var(--line)] px-3 py-2 transition hover:border-[rgba(56,217,159,0.34)] hover:text-[var(--foreground)]">Bloques</a>
          <a href="#debug" className="rounded-md border border-[var(--line)] px-3 py-2 transition hover:border-[rgba(56,217,159,0.34)] hover:text-[var(--foreground)]">Payload/debug</a>
        </nav>
        <div className="mt-4 grid gap-3">
          {nextSession ? (
            <Link href={`/training/${nextSession.id}`} className="rounded-md border border-[var(--line)] p-3 text-sm font-semibold transition hover:border-[rgba(56,217,159,0.34)]">
              <span className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Sesión siguiente</span>
              <span className="mt-1 block">{nextSession.title}</span>
            </Link>
          ) : <p className="text-sm text-[var(--muted)]">No hay sesión más reciente.</p>}
          {previousSession ? (
            <Link href={`/training/${previousSession.id}`} className="rounded-md border border-[var(--line)] p-3 text-sm font-semibold transition hover:border-[rgba(56,217,159,0.34)]">
              <span className="block text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Sesión anterior</span>
              <span className="mt-1 block">{previousSession.title}</span>
            </Link>
          ) : <p className="text-sm text-[var(--muted)]">No hay sesión más antigua.</p>}
        </div>
      </Card>

      <MuscleRanking session={session} />

      <Card>
        <h3 className="text-lg font-black">Tags</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {session.tags.map((tag) => (
            <Badge key={tag}>{formatTag(tag)}</Badge>
          ))}
          {session.tags.length === 0 ? <p className="text-sm text-[var(--muted)]">Sin tags.</p> : null}
        </div>
      </Card>

      <Card>
        <details id="debug" className="scroll-mt-24">
          <summary className="cursor-pointer text-sm font-bold text-[var(--accent)]">Payload JSON completo</summary>
          <pre className="mt-4 max-h-[420px] overflow-auto rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-4 text-xs leading-5 text-[#d9f2e9]">
            {JSON.stringify(session, null, 2)}
          </pre>
        </details>
      </Card>
    </aside>
  );
}

export function TrainingDetailView({
  sessionId,
  seedSessions,
}: {
  sessionId: string;
  seedSessions: TrainingSession[];
}) {
  const router = useRouter();
  const { sessions, pendingSessions, source, hasHydrated, deleteSession, syncMessage, remoteError } = useTrainingSessions(seedSessions);
  const sortedSessions = useMemo(
    () => ([...sessions] as TrainingSessionWithSync[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [sessions],
  );
  const sessionIndex = sortedSessions.findIndex((item) => item.id === sessionId);
  const session = sessionIndex >= 0 ? sortedSessions[sessionIndex] : undefined;
  const previousSession = sessionIndex >= 0 ? sortedSessions[sessionIndex + 1] : undefined;
  const nextSession = sessionIndex > 0 ? sortedSessions[sessionIndex - 1] : undefined;

  if (!session) {
    return (
      <>
        <PageHeader
          eyebrow="Detalle de entrenamiento"
          title={hasHydrated ? "Entrenamiento no encontrado" : "Cargando entrenamiento"}
          description={hasHydrated ? "No existe una sesión con este identificador en Supabase, pendientes locales ni fallback seed." : undefined}
        />
        {remoteError ? (
          <Card className="mb-5 border-[rgba(240,196,107,0.32)]">
            <p className="text-sm font-semibold text-[var(--warning)]">No se pudo cargar Supabase.</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{syncMessage ?? remoteError}</p>
          </Card>
        ) : null}
        {hasHydrated ? (
          <Link href="/training" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
            Volver al Training Log
          </Link>
        ) : null}
      </>
    );
  }

  const activeSession = session;
  const topMuscles = getTopMuscles(activeSession);
  const ergMetrics = [
    { label: "Row", meters: activeSession.sessionMetrics.totalRowMeters, detail: "Remo registrado" },
    { label: "Ski", meters: activeSession.sessionMetrics.totalSkiMeters, detail: "SkiErg registrado" },
    { label: "Bike", meters: activeSession.sessionMetrics.totalBikeMeters, detail: "Bike registrada" },
  ].filter((metric) => metric.meters > 0);

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar "${activeSession.title}"?`)) {
      return;
    }

    await deleteSession(activeSession.id);
    router.push("/training");
  }

  return (
    <>
      <PageHeader
        eyebrow={formatLongDate(activeSession.date)}
        title={activeSession.title}
        description={activeSession.objective ?? undefined}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/training"
              className="inline-flex rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[rgba(56,217,159,0.34)]"
            >
              Volver al Training Log
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--muted-strong)] transition hover:border-[rgba(240,196,107,0.5)] hover:text-[var(--warning)]"
            >
              Eliminar
            </button>
          </div>
        }
      />

      <ExecutiveSummary session={activeSession} topMuscles={topMuscles} />

      <section className="mb-5 flex flex-wrap gap-2">
        <Badge tone={source === "remote" ? "accent" : source === "seed-fallback" ? "warning" : "neutral"}>
          {source === "remote" ? "Datos Supabase" : source === "seed-fallback" ? "Fallback seed" : "sincronizando"}
        </Badge>
        {activeSession.pendingSync ? <Badge tone="warning">pendingSync</Badge> : null}
        {pendingSessions.length > 0 ? <Badge tone="warning">Pendientes locales {pendingSessions.length}</Badge> : null}
      </section>

      {syncMessage && source !== "remote" ? (
        <p className="mb-5 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-sm text-[var(--muted-strong)]">
          {syncMessage}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="space-y-5">
          <div id="resultado" className="scroll-mt-24">
            <ResultCard session={activeSession} />
          </div>

          <div id="datos" className="scroll-mt-24">
            <MetadataSection session={activeSession} ergMetrics={ergMetrics} />
          </div>

          <div id="bloques" className="space-y-4 scroll-mt-24">
            <SectionTitle eyebrow={`${activeSession.blocks.length} bloques`} title="Bloques y ejercicios" />
            {activeSession.blocks.length > 0 ? activeSession.blocks.map((block, index) => (
              <BlockCard key={block.id} block={block} index={index} />
            )) : (
              <Card>
                <h3 className="text-lg font-black">Bloques</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">Esta sesión no tiene bloques detallados en el payload.</p>
              </Card>
            )}
          </div>
        </main>

        <Sidebar session={activeSession} previousSession={previousSession} nextSession={nextSession} />
      </div>
    </>
  );
}
