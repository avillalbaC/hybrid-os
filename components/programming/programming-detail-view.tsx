"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  formatProgrammingDate,
  getProgrammingProgress,
  programmingBlockStatusLabels,
  programmingStatusLabels,
  programmingTypeLabels,
} from "@/components/programming/programming-format";
import type { ProgrammingBlock, ProgrammingFinalLog, ProgrammingNextSessionDecision, ProgrammingSession } from "@/types/programming";

type FinalLogForm = {
  actualDurationMinutes: string;
  technicalRpe: string;
  discomfort: string;
  finalNote: string;
  nextSessionDecision: ProgrammingNextSessionDecision;
};

type OpenBlockMap = Record<string, boolean>;

const initialFinalLogForm: FinalLogForm = {
  actualDurationMinutes: "",
  technicalRpe: "",
  discomfort: "",
  finalNote: "",
  nextSessionDecision: "mantener",
};

function SummaryStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] p-4">
      <p className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-lg font-black leading-tight text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function BlockContentSection({
  title,
  items,
  text,
  muted = false,
}: {
  title: string;
  items?: string[];
  text?: string | null;
  muted?: boolean;
}) {
  const hasItems = items && items.length > 0;
  const hasText = Boolean(text);

  if (!hasItems && !hasText) {
    return null;
  }

  return (
    <div className={`border-l-2 pl-4 ${muted ? "border-[var(--line)]" : "border-[var(--accent-border)]"}`}>
      <p className={`text-[0.68rem] font-black uppercase tracking-[0.14em] ${muted ? "text-[var(--muted)]" : "text-[var(--accent)]"}`}>
        {title}
      </p>
      {hasText ? <p className={`mt-2 text-sm leading-6 ${muted ? "text-[var(--muted)]" : "text-[var(--muted-strong)]"}`}>{text}</p> : null}
      {hasItems ? (
        <ul className={`mt-2 space-y-2 text-sm leading-6 ${muted ? "text-[var(--muted)]" : "text-[var(--foreground)]"}`}>
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function buildCompletedStatus(blocks: ProgrammingBlock[]) {
  const completed = blocks.filter((block) => block.status === "completed").length;

  return completed === blocks.length && blocks.length > 0 ? "completed" : "partially_completed";
}

function getCurrentBlockId(session: ProgrammingSession) {
  if (session.status !== "in_progress") {
    return null;
  }

  return session.blocks.find((block) => block.status === "pending")?.id ?? null;
}

function getNextPendingBlock(blocks: ProgrammingBlock[]) {
  return blocks.find((block) => block.status === "pending") ?? null;
}

function getBlockStatusProgress(block: ProgrammingBlock, isCurrent: boolean) {
  if (block.status === "completed" || block.status === "skipped") {
    return 100;
  }

  if (block.status === "in_progress" || isCurrent) {
    return 35;
  }

  return 0;
}

function BlockActionButtons({
  block,
  disabled,
  onComplete,
  onSkip,
}: {
  block: ProgrammingBlock;
  disabled: boolean;
  onComplete: () => void;
  onSkip: () => void;
}) {
  if (block.status === "completed") {
    return (
      <button
        type="button"
        disabled
        className="min-h-11 rounded-md border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-black text-[var(--accent-strong)] opacity-80"
      >
        Completado
      </button>
    );
  }

  if (block.status === "skipped") {
    return (
      <button
        type="button"
        disabled
        className="min-h-11 rounded-md border border-[rgba(240,196,107,0.34)] bg-[var(--warning-soft)] px-4 py-2 text-sm font-black text-[var(--warning)] opacity-80"
      >
        Saltado
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={onComplete}
        disabled={disabled}
        className="min-h-11 rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Completar bloque
      </button>
      <button
        type="button"
        onClick={onSkip}
        disabled={disabled}
        className="min-h-11 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[rgba(240,196,107,0.45)] hover:text-[var(--warning)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Saltar
      </button>
    </>
  );
}

function ProgrammingBlockCard({
  block,
  isCurrent,
  isOpen,
  isBusy,
  sessionStatus,
  onToggle,
  onComplete,
  onSkip,
}: {
  block: ProgrammingBlock;
  isCurrent: boolean;
  isOpen: boolean;
  isBusy: boolean;
  sessionStatus: ProgrammingSession["status"];
  onToggle: () => void;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const isDone = block.status === "completed" || block.status === "skipped";
  const statusProgress = getBlockStatusProgress(block, isCurrent);
  const cardClassName = isCurrent
    ? "border-[var(--accent-border-strong)] bg-[linear-gradient(135deg,var(--accent-soft),var(--panel)_58%,rgba(244,247,244,0.03))] shadow-[0_24px_80px_rgba(34,211,238,0.12)]"
    : isDone
      ? "border-[var(--line)] bg-[rgba(244,247,244,0.018)]"
      : "border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))]";

  return (
    <article className={`overflow-hidden rounded-md border transition ${cardClassName}`}>
      <div className="p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className="min-w-0 text-left"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">Bloque {block.order}</p>
              {isCurrent ? <Badge tone="accent">Actual</Badge> : null}
              <Badge tone={block.status === "completed" ? "accent" : block.status === "skipped" ? "warning" : "neutral"}>
                {programmingBlockStatusLabels[block.status]}
              </Badge>
              <span className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-2 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-strong)]">
                {block.durationMinutes ? `${block.durationMinutes} min` : "Sin duración"}
              </span>
            </div>
            <h3 className="mt-2 text-xl font-black leading-tight text-[var(--foreground)]">
              Bloque {block.order} · {block.title}
            </h3>
            {block.focus && !isOpen ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{block.focus}</p>
            ) : null}
          </button>

          <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <BlockActionButtons
              block={block}
              disabled={isBusy || sessionStatus === "skipped"}
              onComplete={onComplete}
              onSkip={onSkip}
            />
            <button
              type="button"
              onClick={onToggle}
              className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-4 py-2 text-sm font-bold text-[var(--muted-strong)] transition hover:border-[var(--accent-border)] hover:text-[var(--foreground)]"
            >
              {isOpen ? "Cerrar" : "Abrir"}
            </button>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[rgba(244,247,244,0.08)]" aria-hidden="true">
          <div
            className={`h-full rounded-full ${block.status === "skipped" ? "bg-[var(--warning)]" : "bg-[linear-gradient(90deg,var(--accent),var(--accent-secondary))]"}`}
            style={{ width: `${statusProgress}%` }}
          />
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-[var(--line)] px-4 pb-5 pt-5 sm:px-5">
          <div className="grid gap-5">
            <BlockContentSection title="Objetivo" text={block.focus} />
            <BlockContentSection title="Qué hacer" items={block.items} />
            <div className="grid gap-5 md:grid-cols-2">
              <BlockContentSection title="Límites" items={block.maxVolume} />
              <BlockContentSection title="No hacer" items={block.dontDo} />
            </div>
            <BlockContentSection title="Notas" text={block.notes} muted />
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function ProgrammingDetailView({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<ProgrammingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showFinalLog, setShowFinalLog] = useState(false);
  const [finalLog, setFinalLog] = useState<FinalLogForm>(initialFinalLogForm);
  const [openBlocks, setOpenBlocks] = useState<OpenBlockMap>({});

  const loadSession = useCallback(async function loadSession() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/programming-sessions/${sessionId}`, { cache: "no-store" });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "No se pudo cargar la programación.");
      }

      setSession(body.programmingSession);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la programación.");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const progress = useMemo(() => getProgrammingProgress(session?.blocks ?? []), [session]);
  const currentBlockId = useMemo(() => (session ? getCurrentBlockId(session) : null), [session]);
  const nextPendingBlock = useMemo(() => getNextPendingBlock(session?.blocks ?? []), [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    setOpenBlocks((current) => {
      const next = { ...current };
      const defaultOpenBlockId = currentBlockId ?? session.blocks.find((block) => block.status === "pending")?.id ?? session.blocks[0]?.id;

      session.blocks.forEach((block) => {
        if (next[block.id] === undefined) {
          next[block.id] = block.id === defaultOpenBlockId;
        }
      });

      if (currentBlockId) {
        next[currentBlockId] = true;
      }

      return next;
    });
  }, [currentBlockId, session]);

  async function patchSession(payload: Record<string, unknown>, successMessage: string) {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/programming-sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "No se pudo actualizar la programación.");
      }

      setSession(body.programmingSession);
      setMessage(successMessage);
      return true;
    } catch (patchError) {
      setError(patchError instanceof Error ? patchError.message : "No se pudo actualizar la programación.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateBlockStatus(blockId: string, status: ProgrammingBlock["status"]) {
    if (!session) {
      return;
    }

    const nextBlocks = session.blocks.map((block) => (block.id === blockId ? { ...block, status } : block));
    const payload: Record<string, unknown> = {
      blocks: nextBlocks,
      status: session.status === "planned" ? "in_progress" : session.status,
    };

    if (!session.startedAt) {
      payload.startedAt = new Date().toISOString();
    }

    const didUpdate = await patchSession(payload, status === "completed" ? "Bloque completado." : "Bloque saltado.");

    if (!didUpdate) {
      return;
    }

    const nextPendingBlock = nextBlocks.find((block) => block.status === "pending");

    setOpenBlocks((current) => ({
      ...current,
      [blockId]: false,
      ...(nextPendingBlock ? { [nextPendingBlock.id]: true } : {}),
    }));
  }

  function startSession() {
    void patchSession(
      {
        status: "in_progress",
        startedAt: session?.startedAt ?? new Date().toISOString(),
      },
      "Sesión iniciada.",
    );
  }

  function skipSession() {
    if (!session) {
      return;
    }

    const skippedBlocks = session.blocks.map((block) => ({
      ...block,
      status: block.status === "completed" ? block.status : "skipped",
    }));

    void patchSession(
      {
        status: "skipped",
        blocks: skippedBlocks,
        completedAt: new Date().toISOString(),
      },
      "Sesión marcada como saltada.",
    );
  }

  async function deleteSession() {
    if (!window.confirm("¿Eliminar esta programación? Esta acción no crea ni borra entrenamientos reales.")) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/programming-sessions/${sessionId}`, {
        method: "DELETE",
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "No se pudo eliminar la programación.");
      }

      router.push("/programming");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar la programación.");
      setIsDeleting(false);
    }
  }

  function toggleBlock(blockId: string) {
    setOpenBlocks((current) => ({
      ...current,
      [blockId]: !current[blockId],
    }));
  }

  function submitFinalLog() {
    if (!session) {
      return;
    }

    const actualDurationMinutes = Number(finalLog.actualDurationMinutes);
    const technicalRpe = Number(finalLog.technicalRpe);

    if (!Number.isInteger(actualDurationMinutes) || actualDurationMinutes < 0) {
      setError("La duración real debe ser un número entero igual o mayor que 0.");
      return;
    }

    if (!Number.isFinite(technicalRpe) || technicalRpe < 0 || technicalRpe > 10) {
      setError("El RPE técnico debe estar entre 0 y 10.");
      return;
    }

    const nextFinalLog: ProgrammingFinalLog = {
      actualDurationMinutes,
      technicalRpe,
      discomfort: finalLog.discomfort.trim() || null,
      finalNote: finalLog.finalNote.trim() || null,
      nextSessionDecision: finalLog.nextSessionDecision,
    };

    void patchSession(
      {
        status: buildCompletedStatus(session.blocks),
        finalLog: nextFinalLog,
        completedAt: new Date().toISOString(),
      },
      "Sesión finalizada con registro final.",
    );
    setShowFinalLog(false);
  }

  if (isLoading) {
    return (
      <>
        <PageHeader eyebrow="Programación" title="Cargando programación" />
        <Card>
          <p className="text-sm text-[var(--muted)]">Consultando Supabase.</p>
        </Card>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <PageHeader
          eyebrow="Programación"
          title="Programación no encontrada"
          description="No existe una sesión programada propia con este identificador."
        />
        {error ? (
          <Card className="mb-5 border-[rgba(240,196,107,0.32)]">
            <p className="text-sm font-semibold text-[var(--warning)]">{error}</p>
          </Card>
        ) : null}
        <Link href="/programming" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Volver a Programaciones
        </Link>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={formatProgrammingDate(session.scheduledDate)}
        title={session.title}
        description="Ejecución por bloques de una sesión programada. No crea entrenamiento real automáticamente."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/programming"
              className="inline-flex rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
            >
              Volver
            </Link>
            <button
              type="button"
              onClick={deleteSession}
              disabled={isSaving || isDeleting}
              className="inline-flex rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--muted-strong)] transition hover:border-[rgba(240,196,107,0.45)] hover:text-[var(--warning)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? "Eliminando..." : "Eliminar sesión"}
            </button>
          </div>
        }
      />

      {error ? (
        <Card className="mb-5 border-[rgba(240,196,107,0.32)]">
          <p className="text-sm font-semibold text-[var(--warning)]">{error}</p>
        </Card>
      ) : null}

      {message ? (
        <p className="mb-5 rounded-md border border-[var(--accent-border)] bg-[var(--accent-soft)] p-3 text-sm font-semibold text-[var(--accent-strong)]">
          {message}
        </p>
      ) : null}

      <section className="mb-5 rounded-md border border-[var(--accent-border)] bg-[linear-gradient(135deg,var(--accent-soft),rgba(244,247,244,0.035)_42%,rgba(240,196,107,0.08))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryStat label="Fecha" value={formatProgrammingDate(session.scheduledDate)} />
          <SummaryStat label="Tipo" value={programmingTypeLabels[session.type]} />
          <SummaryStat label="Duración estimada" value={session.estimatedDurationMinutes ? `${session.estimatedDurationMinutes} min` : "Sin dato"} />
          <SummaryStat label="Estado" value={programmingStatusLabels[session.status]} />
          <SummaryStat label="Progreso" value={`${progress.completed}/${progress.total} bloques`} />
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[rgba(244,247,244,0.1)]" aria-hidden="true">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-secondary))]" style={{ width: `${progress.percentage}%` }} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="space-y-4">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{session.blocks.length} bloques</p>
            <h2 className="mt-1 text-2xl font-black">Bloques de la sesión</h2>
          </div>

          {session.blocks.length > 0 ? session.blocks.map((block) => (
            <ProgrammingBlockCard
              key={block.id}
              block={block}
              isCurrent={block.id === currentBlockId}
              isOpen={openBlocks[block.id] ?? false}
              isBusy={isSaving || isDeleting}
              sessionStatus={session.status}
              onToggle={() => toggleBlock(block.id)}
              onComplete={() => void updateBlockStatus(block.id, "completed")}
              onSkip={() => void updateBlockStatus(block.id, "skipped")}
            />
          )) : (
            <Card>
              <p className="text-sm text-[var(--muted)]">Esta programación no tiene bloques.</p>
            </Card>
          )}
        </main>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <h2 className="text-lg font-black">Sesión</h2>
            <dl className="mt-4 grid gap-4 text-sm">
              <div>
                <dt className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Estado</dt>
                <dd className="mt-1 font-black text-[var(--foreground)]">{programmingStatusLabels[session.status]}</dd>
              </div>
              <div>
                <dt className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Progreso</dt>
                <dd className="mt-1 font-black text-[var(--foreground)]">{progress.completed}/{progress.total} bloques</dd>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[rgba(244,247,244,0.08)]" aria-hidden="true">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-secondary))]" style={{ width: `${progress.percentage}%` }} />
                </div>
              </div>
              <div>
                <dt className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Siguiente</dt>
                <dd className="mt-1 font-semibold leading-5 text-[var(--foreground)]">
                  {nextPendingBlock ? nextPendingBlock.title : "Sin bloques pendientes"}
                </dd>
              </div>
            </dl>

            <div className="mt-5 grid gap-2 border-t border-[var(--line)] pt-4">
              <button
                type="button"
                onClick={startSession}
                disabled={isSaving || isDeleting || session.status === "in_progress" || session.status === "completed" || session.status === "skipped"}
                className="rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Empezar sesión
              </button>
              <button
                type="button"
                onClick={() => setShowFinalLog((value) => !value)}
                disabled={isSaving || isDeleting || session.status === "completed" || session.status === "skipped"}
                className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Finalizar sesión
              </button>
              <button
                type="button"
                onClick={skipSession}
                disabled={isSaving || isDeleting || session.status === "completed" || session.status === "skipped"}
                className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--muted-strong)] transition hover:border-[rgba(240,196,107,0.45)] hover:text-[var(--warning)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Marcar como saltada
              </button>
            </div>
          </Card>

          {showFinalLog ? (
            <Card>
              <h2 className="text-lg font-black">Registro final</h2>
              <div className="mt-4 grid gap-3">
                <label className="block text-sm font-semibold">
                  Duración real
                  <input
                    type="number"
                    min="0"
                    value={finalLog.actualDurationMinutes}
                    onChange={(event) => setFinalLog((current) => ({ ...current, actualDurationMinutes: event.target.value }))}
                    className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent-border-strong)]"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  RPE técnico
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={finalLog.technicalRpe}
                    onChange={(event) => setFinalLog((current) => ({ ...current, technicalRpe: event.target.value }))}
                    className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent-border-strong)]"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Molestias
                  <textarea
                    value={finalLog.discomfort}
                    onChange={(event) => setFinalLog((current) => ({ ...current, discomfort: event.target.value }))}
                    rows={3}
                    className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent-border-strong)]"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Nota final
                  <textarea
                    value={finalLog.finalNote}
                    onChange={(event) => setFinalLog((current) => ({ ...current, finalNote: event.target.value }))}
                    rows={3}
                    className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent-border-strong)]"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Decisión próxima sesión
                  <select
                    value={finalLog.nextSessionDecision}
                    onChange={(event) => setFinalLog((current) => ({ ...current, nextSessionDecision: event.target.value as ProgrammingNextSessionDecision }))}
                    className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent-border-strong)]"
                  >
                    <option value="mantener">mantener</option>
                    <option value="subir">subir</option>
                    <option value="bajar">bajar</option>
                    <option value="cancelar">cancelar</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={submitFinalLog}
                  disabled={isSaving || isDeleting}
                  className="rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Guardar cierre
                </button>
              </div>
            </Card>
          ) : null}

          {session.finalLog ? (
            <Card>
              <h2 className="text-lg font-black">Final log</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Duración real</dt>
                  <dd className="mt-1 font-semibold">{session.finalLog.actualDurationMinutes} min</dd>
                </div>
                <div>
                  <dt className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">RPE técnico</dt>
                  <dd className="mt-1 font-semibold">{session.finalLog.technicalRpe}/10</dd>
                </div>
                <div>
                  <dt className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Decisión</dt>
                  <dd className="mt-1 font-semibold">{session.finalLog.nextSessionDecision}</dd>
                </div>
              </dl>
            </Card>
          ) : null}
        </aside>
      </div>
    </>
  );
}
