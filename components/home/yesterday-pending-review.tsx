"use client";

import { useEffect, useMemo, useState } from "react";
import { addDaysToDateKey } from "@/lib/date/local-date";
import type { DailyEntry, DailyPriority } from "@/types/daily";

type PendingReviewPriority = Pick<DailyPriority, "id" | "text"> & {
  status: "pending";
};

type PendingReviewResponse = {
  date: string;
  yesterdayDate: string;
  pendingPriorities: PendingReviewPriority[];
};

type ResolvePendingReviewResponse = {
  fromEntry: DailyEntry;
  toEntry: DailyEntry | null;
  targetEntries?: Array<{
    entryDate: string;
    entry: DailyEntry | null;
  }>;
  carriedOver: DailyPriority[];
  discarded: DailyPriority[];
  warnings: Array<{
    code: string;
    priorityId: string;
    text?: string;
  }>;
};

type PendingReviewAction = "carry_over" | "complete" | "discard" | "postpone";

type YesterdayPendingReviewProps = {
  date: string;
  disabled?: boolean;
  onBeforeResolve?: () => Promise<boolean>;
  onResolved?: (entry: DailyEntry | null, message: string) => void;
};

async function getResponseError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: unknown };
    return typeof payload.error === "string" ? payload.error : fallback;
  } catch {
    return fallback;
  }
}

function getResolvedMessage(action: PendingReviewAction, count: number) {
  if (count > 1) {
    if (action === "carry_over") return "Pendientes pasados a hoy.";
    if (action === "complete") return "Pendientes marcados como completados.";
    if (action === "postpone") return "Pendientes pospuestos.";
    return "Pendientes de ayer resueltos.";
  }

  if (action === "carry_over") return "Tarea pasada a hoy.";
  if (action === "complete") return "Tarea marcada como completada.";
  if (action === "postpone") return "Tarea pospuesta.";
  return "Tarea descartada.";
}

export function YesterdayPendingReview({ date, disabled, onBeforeResolve, onResolved }: YesterdayPendingReviewProps) {
  const [review, setReview] = useState<PendingReviewResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "resolving" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [resolvingIds, setResolvingIds] = useState<string[]>([]);
  const [postponeDraft, setPostponeDraft] = useState<{ priorityId: string; toDate: string } | null>(null);
  const yesterdayDate = useMemo(() => addDaysToDateKey(date, -1), [date]);
  const defaultPostponeDate = useMemo(() => addDaysToDateKey(date, 1), [date]);

  useEffect(() => {
    let isMounted = true;

    async function loadReview() {
      setStatus("loading");
      setError(null);

      try {
        const response = await fetch(`/api/daily-entry/pending-review?date=${date}`, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(await getResponseError(response, "No se pudo revisar pendientes de ayer."));
        }

        const payload = (await response.json()) as PendingReviewResponse;

        if (!isMounted) {
          return;
        }

        setReview(payload);
        setStatus("idle");
      } catch (reviewError) {
        if (!isMounted) {
          return;
        }

        setError(reviewError instanceof Error ? reviewError.message : "No se pudo revisar pendientes de ayer.");
        setStatus("error");
      }
    }

    void loadReview();

    return () => {
      isMounted = false;
    };
  }, [date]);

  async function resolvePriorities(priorityIds: string[], action: PendingReviewAction, targetDate?: string) {
    if (priorityIds.length === 0 || status === "resolving") {
      return;
    }

    if (action === "postpone" && (!targetDate || targetDate <= (review?.yesterdayDate ?? yesterdayDate))) {
      setError("Elige una fecha posterior a ayer para posponer.");
      return;
    }

    const canResolve = onBeforeResolve ? await onBeforeResolve() : true;

    if (!canResolve) {
      return;
    }

    setStatus("resolving");
    setError(null);
    setResolvingIds(priorityIds);

    try {
      const response = await fetch("/api/daily-entry/pending-review/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromDate: review?.yesterdayDate ?? yesterdayDate,
          toDate: date,
          actions: priorityIds.map((priorityId) => ({
            priorityId,
            action,
            ...(action === "postpone" ? { toDate: targetDate } : {}),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No se pudieron resolver pendientes."));
      }

      const payload = (await response.json()) as ResolvePendingReviewResponse;
      const blockingWarningIds = new Set(payload.warnings.filter((warning) => warning.code !== "duplicate_possible").map((warning) => warning.priorityId));
      const resolvedIds = new Set(priorityIds.filter((priorityId) => !blockingWarningIds.has(priorityId)));
      const nextPendingPriorities = review?.pendingPriorities.filter((priority) => !resolvedIds.has(priority.id)) ?? [];
      const resolvedTodayEntry = action === "postpone"
        ? payload.targetEntries?.find((item) => item.entryDate === date)?.entry ?? payload.toEntry
        : payload.toEntry;

      setReview((currentReview) =>
        currentReview
          ? {
            ...currentReview,
            pendingPriorities: nextPendingPriorities,
          }
          : currentReview,
      );
      setPostponeDraft(null);
      onResolved?.(resolvedTodayEntry, getResolvedMessage(action, priorityIds.length));
      setStatus("idle");
    } catch (resolveError) {
      setError(resolveError instanceof Error ? resolveError.message : "No se pudieron resolver pendientes.");
      setStatus("error");
    } finally {
      setResolvingIds([]);
    }
  }

  const pendingPriorities = review?.pendingPriorities ?? [];

  if (status === "loading" || pendingPriorities.length === 0) {
    return null;
  }

  const isResolving = status === "resolving";
  const isDisabled = disabled || isResolving;

  return (
    <section className="mt-4 rounded-md border border-[rgba(34,211,238,0.18)] bg-[rgba(34,211,238,0.055)] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Pendientes de ayer</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-strong)]">
            Estas tareas quedaron abiertas. Decide si siguen vivas hoy, si ya están cerradas o si las descartas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => void resolvePriorities(pendingPriorities.map((priority) => priority.id), "carry_over")}
            className="min-h-9 rounded-md border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 text-xs font-black text-[var(--accent-text)] transition hover:bg-[var(--accent-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Pasar todas a hoy
          </button>
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => void resolvePriorities(pendingPriorities.map((priority) => priority.id), "discard")}
            className="min-h-9 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-3 text-xs font-black text-[var(--muted-strong)] transition hover:border-[rgba(255,110,110,0.4)] hover:text-[#ffb4b4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Descartar todas
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-md border border-[rgba(255,110,110,0.28)] bg-[rgba(255,110,110,0.08)] p-2 text-xs font-semibold text-[#ffb4b4]">
          {error}
        </p>
      ) : null}

      <div className="mt-3 space-y-2">
        {pendingPriorities.map((priority) => {
          const rowResolving = resolvingIds.includes(priority.id);

          return (
            <div key={priority.id} className="flex flex-col gap-2 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(7,10,9,0.28)] p-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-[var(--foreground)]">{priority.text}</p>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <button
                  type="button"
                  disabled={isDisabled || rowResolving}
                  onClick={() => void resolvePriorities([priority.id], "complete")}
                  className="min-h-9 rounded-md border border-[rgba(34,211,238,0.24)] bg-[rgba(244,247,244,0.035)] px-3 text-xs font-black text-[var(--muted-strong)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Completar
                </button>
                <button
                  type="button"
                  disabled={isDisabled || rowResolving}
                  onClick={() => void resolvePriorities([priority.id], "carry_over")}
                  className="min-h-9 rounded-md border border-[rgba(34,211,238,0.24)] bg-[var(--accent-faint)] px-3 text-xs font-black text-[var(--accent-text)] transition hover:border-[var(--accent-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Pasar a hoy
                </button>
                <button
                  type="button"
                  disabled={isDisabled || rowResolving}
                  onClick={() => setPostponeDraft({ priorityId: priority.id, toDate: defaultPostponeDate })}
                  className="min-h-9 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-3 text-xs font-black text-[var(--muted-strong)] transition hover:border-[var(--accent-border)] hover:text-[var(--accent-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Posponer
                </button>
                <button
                  type="button"
                  disabled={isDisabled || rowResolving}
                  onClick={() => void resolvePriorities([priority.id], "discard")}
                  className="min-h-9 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-3 text-xs font-black text-[var(--muted-strong)] transition hover:border-[rgba(255,110,110,0.4)] hover:text-[#ffb4b4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Descartar
                </button>
              </div>
              {postponeDraft?.priorityId === priority.id ? (
                <div className="flex flex-col gap-2 border-t border-[rgba(255,255,255,0.08)] pt-2 sm:col-span-2 sm:ml-auto sm:flex-row sm:items-center">
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)] sm:min-w-40">
                    Nueva fecha
                    <input
                      type="date"
                      min={review?.yesterdayDate ?? yesterdayDate}
                      value={postponeDraft.toDate}
                      disabled={isDisabled}
                      onChange={(event) => setPostponeDraft({ priorityId: priority.id, toDate: event.target.value })}
                      className="min-h-9 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.52)] px-3 text-sm font-bold normal-case tracking-normal text-[var(--foreground)] outline-none focus:border-[var(--accent-border)] disabled:opacity-70"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isDisabled || postponeDraft.toDate <= (review?.yesterdayDate ?? yesterdayDate)}
                      onClick={() => void resolvePriorities([priority.id], "postpone", postponeDraft.toDate)}
                      className="min-h-9 rounded-md border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 text-xs font-black text-[var(--accent-text)] transition hover:bg-[var(--accent-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setPostponeDraft(null)}
                      className="min-h-9 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-3 text-xs font-black text-[var(--muted-strong)] transition hover:border-[var(--accent-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
