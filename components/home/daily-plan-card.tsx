"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { YesterdayPendingReview } from "@/components/home/yesterday-pending-review";
import { addDaysToDateKey, getLocalDateKey } from "@/lib/date/local-date";
import {
  DAILY_MOBILITY_FOCUS_OPTIONS,
  DAILY_PRIORITY_LIMIT,
  createEmptyDailyPriorities,
  getPriorityStatus,
  isActivePriority,
  toPrioritySlots,
  type DailyEntry,
  type DailyPriority,
  type DailyPriorityStatus,
} from "@/types/daily";

type DailyEntryResponse = {
  entry: DailyEntry | null;
};

type PostponePriorityResponse = {
  fromEntry: DailyEntry;
  toEntry: DailyEntry;
};

type DailyPlanCardProps = {
  recommendedAction?: string;
};

type SaveStatus = "loading" | "empty" | "loaded" | "saving" | "saved" | "error";

type DailyPlanDraft = {
  priorities: DailyPriority[];
  mobilityDone: boolean;
  mobilityMinutes: number | null;
  mobilityFocus: string[];
  dailyNote: string;
  snapshot: string;
};

type DailyPlanFormState = {
  priorities: DailyPriority[];
  mobilityDone: boolean;
  mobilityMinutes: number | null;
  mobilityFocus: string[];
  dailyNote: string;
};

type PostponeDialogState = {
  priority: DailyPriority;
  toDate: string;
} | null;

function buildEditablePriorities(priorities: DailyPriority[]) {
  return toPrioritySlots(priorities);
}

function createEmptyDailyPlanForm(): DailyPlanFormState {
  return {
    priorities: createEmptyDailyPriorities(),
    mobilityDone: false,
    mobilityMinutes: null,
    mobilityFocus: [],
    dailyNote: "",
  };
}

function createDailyPlanFormFromEntry(entry: DailyEntry): DailyPlanFormState {
  return {
    priorities: buildEditablePriorities(entry.priorities),
    mobilityDone: entry.mobilityDone,
    mobilityMinutes: entry.mobilityMinutes,
    mobilityFocus: entry.mobilityFocus ?? [],
    dailyNote: entry.dailyNote ?? "",
  };
}

function getSnapshot({
  priorities,
  mobilityDone,
  mobilityMinutes,
  mobilityFocus,
  dailyNote,
}: {
  priorities: DailyPriority[];
  mobilityDone: boolean;
  mobilityMinutes: number | null;
  mobilityFocus: string[];
  dailyNote: string;
}) {
  return JSON.stringify({
    priorities,
    mobilityDone,
    mobilityMinutes,
    mobilityFocus: [...mobilityFocus].sort(),
    dailyNote,
  });
}

function formatSavedAt(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(year, month - 1, day));
}

function getClosedPriorityLabel(priority: DailyPriority) {
  const status = getPriorityStatus(priority);

  if (status === "completed") {
    return "Completada";
  }

  if (status === "discarded") {
    return "Descartada";
  }

  if (status === "postponed") {
    return `Pospuesta${formatShortDate(priority.postponedToDate) ? ` a ${formatShortDate(priority.postponedToDate)}` : ""}`;
  }

  return "Pendiente";
}

async function getResponseError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as {
      error?: unknown;
      detail?: {
        code?: unknown;
        message?: unknown;
      };
    };
    const message = typeof payload.error === "string" ? payload.error : fallback;
    const technicalMessage = typeof payload.detail?.message === "string" ? payload.detail.message : null;
    const technicalCode = typeof payload.detail?.code === "string" ? payload.detail.code : null;

    if (technicalMessage) {
      return `${message} (${technicalCode ? `${technicalCode}: ` : ""}${technicalMessage})`;
    }

    return message;
  } catch {
    return fallback;
  }
}

function logDailyPlanForm(action: string, data: unknown) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.info(`[daily-plan-card] ${action}`, data);
}

export function DailyPlanCard({ recommendedAction }: DailyPlanCardProps) {
  const [entryDate] = useState(getLocalDateKey);
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<DailyPlanFormState>(createEmptyDailyPlanForm);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState("");
  const [failedSnapshot, setFailedSnapshot] = useState<string | null>(null);
  const [postponeDialog, setPostponeDialog] = useState<PostponeDialogState>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const latestDraftRef = useRef<DailyPlanDraft | null>(null);
  const { priorities, mobilityDone, mobilityMinutes, mobilityFocus, dailyNote } = form;
  const activePrioritySlots = priorities.slice(0, DAILY_PRIORITY_LIMIT);
  const extraPendingPriorities = priorities.slice(DAILY_PRIORITY_LIMIT).filter(isActivePriority);
  const closedPriorities = priorities.slice(DAILY_PRIORITY_LIMIT).filter((priority) => !isActivePriority(priority));

  const currentSnapshot = useMemo(
    () => getSnapshot({ priorities, mobilityDone, mobilityMinutes, mobilityFocus, dailyNote }),
    [dailyNote, mobilityDone, mobilityFocus, mobilityMinutes, priorities],
  );
  const isDirty = initialSnapshot !== "" && currentSnapshot !== initialSnapshot;
  const savedAtLabel = formatSavedAt(savedAt);
  const currentDraft = useMemo(
    () => ({
      priorities,
      mobilityDone,
      mobilityMinutes,
      mobilityFocus,
      dailyNote,
      snapshot: currentSnapshot,
    }),
    [currentSnapshot, dailyNote, mobilityDone, mobilityFocus, mobilityMinutes, priorities],
  );

  useEffect(() => {
    latestDraftRef.current = currentDraft;
  }, [currentDraft]);

  useEffect(() => {
    let isMounted = true;

    async function loadEntry() {
      setStatus("loading");
      setError(null);

      try {
        const response = await fetch(`/api/daily-entry?date=${entryDate}`, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(await getResponseError(response, "No se pudo cargar el plan de hoy."));
        }

        const payload = (await response.json()) as DailyEntryResponse;
        const nextForm = payload.entry === null
          ? createEmptyDailyPlanForm()
          : createDailyPlanFormFromEntry(payload.entry);
        const nextSnapshot = getSnapshot(nextForm);

        if (!isMounted) {
          return;
        }

        logDailyPlanForm("loaded", {
          entryDate,
          hasEntry: payload.entry !== null,
          prioritiesCount: nextForm.priorities.filter((priority) => priority.text.length > 0).length,
          form: nextForm,
        });
        setForm(nextForm);
        setSavedAt(payload.entry?.updatedAt ?? null);
        setInitialSnapshot(nextSnapshot);
        setFailedSnapshot(null);
        setFeedbackMessage(null);
        setStatus(payload.entry ? "loaded" : "empty");
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el plan de hoy.");
        setStatus("error");
      }
    }

    void loadEntry();

    return () => {
      isMounted = false;
    };
  }, [entryDate]);

  function updatePriority(index: number, partialPriority: Partial<DailyPriority>) {
    setForm((currentForm) => ({
      ...currentForm,
      priorities: currentForm.priorities.map((priority, priorityIndex) =>
        priorityIndex === index
          ? {
            ...priority,
            ...partialPriority,
            status: partialPriority.done === true ? "completed" : partialPriority.done === false ? "pending" : partialPriority.status ?? priority.status,
            done: partialPriority.status ? partialPriority.status === "completed" : partialPriority.done ?? priority.done,
          }
          : priority,
      ),
    }));
    setFeedbackMessage(null);
  }

  function updatePrioritiesWithSlots(nextPriorities: DailyPriority[]) {
    setForm((currentForm) => ({
      ...currentForm,
      priorities: buildEditablePriorities(nextPriorities),
    }));
  }

  function updatePriorityStatus(priorityId: string, status: Exclude<DailyPriorityStatus, "postponed">) {
    const now = new Date().toISOString();
    const nextPriorities = priorities.map((priority) =>
      priority.id === priorityId
        ? {
          ...priority,
          status,
          done: status === "completed",
          updatedAt: now,
        }
        : priority,
    );

    updatePrioritiesWithSlots(nextPriorities);
    setFeedbackMessage(status === "completed" ? "Tarea completada." : status === "discarded" ? "Tarea descartada." : null);
  }

  function toggleMobilityFocus(focus: string) {
    setForm((currentForm) => ({
      ...currentForm,
      mobilityFocus: currentForm.mobilityFocus.includes(focus)
        ? currentForm.mobilityFocus.filter((item) => item !== focus)
        : [...currentForm.mobilityFocus, focus],
    }));
  }

  function resetChanges() {
    try {
      const snapshot = JSON.parse(initialSnapshot) as {
        priorities: DailyPriority[];
        mobilityDone: boolean;
        mobilityMinutes: number | null;
        mobilityFocus: string[];
        dailyNote: string;
      };

      setForm({
        priorities: buildEditablePriorities(snapshot.priorities),
        mobilityDone: snapshot.mobilityDone,
        mobilityMinutes: snapshot.mobilityMinutes,
        mobilityFocus: snapshot.mobilityFocus,
        dailyNote: snapshot.dailyNote,
      });
      setError(null);
      setFailedSnapshot(null);
      setFeedbackMessage(null);
      setStatus(savedAt ? "loaded" : "empty");
    } catch {
      setForm(createEmptyDailyPlanForm());
      setFailedSnapshot(null);
    }
  }

  const saveEntry = useCallback(async (draft: DailyPlanDraft) => {
    setStatus("saving");
    setError(null);
    setFailedSnapshot(null);

    try {
      const response = await fetch("/api/daily-entry", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entryDate,
          priorities: draft.priorities,
          mobilityDone: draft.mobilityDone,
          mobilityMinutes: draft.mobilityMinutes,
          mobilityFocus: draft.mobilityFocus,
          dailyNote: draft.dailyNote,
        }),
      });

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No se pudo guardar el plan diario."));
      }

      const payload = (await response.json()) as { entry: DailyEntry };
      const nextForm = createDailyPlanFormFromEntry(payload.entry);
      const nextSnapshot = getSnapshot(nextForm);
      const latestSnapshot = latestDraftRef.current?.snapshot;

      logDailyPlanForm("saved", {
        entryDate,
        prioritiesCount: nextForm.priorities.filter((priority) => priority.text.length > 0).length,
        form: nextForm,
      });
      setSavedAt(payload.entry.updatedAt);

      if (latestSnapshot === draft.snapshot) {
        setForm(nextForm);
        setInitialSnapshot(nextSnapshot);
      } else {
        setInitialSnapshot(draft.snapshot);
      }

      setStatus("saved");
      return payload.entry;
    } catch (saveError) {
      if (latestDraftRef.current?.snapshot === draft.snapshot) {
        setFailedSnapshot(draft.snapshot);
      }

      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar. Revisa Supabase o la sesión privada.");
      setStatus("error");
      return null;
    }
  }, [entryDate]);

  async function postponePriority() {
    if (!postponeDialog) {
      return;
    }

    if (postponeDialog.toDate <= entryDate) {
      setError("Elige una fecha posterior a hoy para posponer.");
      return;
    }

    const draft = latestDraftRef.current;

    if (draft && draft.snapshot !== initialSnapshot) {
      const savedEntry = await saveEntry(draft);

      if (!savedEntry) {
        return;
      }
    }

    setStatus("saving");
    setError(null);
    setFailedSnapshot(null);

    try {
      const response = await fetch("/api/daily-entry/priorities/postpone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromDate: entryDate,
          toDate: postponeDialog.toDate,
          priorityId: postponeDialog.priority.id,
        }),
      });

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No se pudo posponer la tarea."));
      }

      const payload = (await response.json()) as PostponePriorityResponse;
      const nextForm = createDailyPlanFormFromEntry(payload.fromEntry);
      const nextSnapshot = getSnapshot(nextForm);

      setForm(nextForm);
      setInitialSnapshot(nextSnapshot);
      setSavedAt(payload.fromEntry.updatedAt);
      setPostponeDialog(null);
      setFeedbackMessage(`Tarea movida al día seleccionado: ${formatShortDate(postponeDialog.toDate) ?? postponeDialog.toDate}.`);
      setStatus("saved");
    } catch (postponeError) {
      setError(postponeError instanceof Error ? postponeError.message : "No se pudo posponer la tarea.");
      setStatus("error");
    }
  }

  useEffect(() => {
    if (!isDirty || status === "loading" || status === "saving" || failedSnapshot === currentSnapshot) {
      return;
    }

    const saveTimeout = window.setTimeout(() => {
      const draft = latestDraftRef.current;

      if (draft && draft.snapshot !== initialSnapshot) {
        void saveEntry(draft);
      }
    }, 550);

    return () => window.clearTimeout(saveTimeout);
  }, [currentSnapshot, failedSnapshot, initialSnapshot, isDirty, saveEntry, status]);

  async function savePendingDraftBeforeResolve() {
    const draft = latestDraftRef.current;

    if (draft && draft.snapshot !== initialSnapshot) {
      const savedEntry = await saveEntry(draft);
      return savedEntry !== null;
    }

    return true;
  }

  function handlePendingReviewResolved(entry: DailyEntry | null, message: string) {
    if (entry) {
      const nextForm = createDailyPlanFormFromEntry(entry);
      const nextSnapshot = getSnapshot(nextForm);

      setForm(nextForm);
      setInitialSnapshot(nextSnapshot);
      setSavedAt(entry.updatedAt);
      setStatus("saved");
    }

    setFeedbackMessage(message);
    setError(null);
  }

  const isLoading = status === "loading";
  const isSaving = status === "saving";
  const isReadonly = isLoading;

  return (
    <Card className="border-[rgba(34,211,238,0.18)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Plan de hoy</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Prioridades, movilidad y nota rápida.</h3>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{entryDate}</p>
          <p className="mt-1 text-xs font-bold text-[var(--muted-strong)]">
            {isSaving ? "Guardando" : isDirty ? "Cambios pendientes" : status === "saved" || savedAtLabel ? `Guardado${savedAtLabel ? ` ${savedAtLabel}` : ""}` : "Sin guardar"}
          </p>
        </div>
      </div>

      {recommendedAction ? (
        <div className="mt-4 rounded-md border border-[rgba(34,211,238,0.2)] bg-[var(--accent-faint)] p-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Contexto Hybrid OS</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-strong)]">{recommendedAction}</p>
        </div>
      ) : null}

      <YesterdayPendingReview
        date={entryDate}
        disabled={isSaving}
        onBeforeResolve={savePendingDraftBeforeResolve}
        onResolved={handlePendingReviewResolved}
      />

      {error ? (
        <p className="mt-4 rounded-md border border-[rgba(255,110,110,0.28)] bg-[rgba(255,110,110,0.08)] p-3 text-sm font-semibold text-[#ff9b9b]">
          {error}
        </p>
      ) : null}

      {feedbackMessage ? (
        <p className="mt-4 rounded-md border border-[rgba(34,211,238,0.2)] bg-[var(--accent-faint)] p-3 text-sm font-semibold text-[var(--accent-text)]" aria-live="polite">
          {feedbackMessage}
        </p>
      ) : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <p className="text-sm font-black text-[var(--foreground)]">Prioridades</p>
          <div className="mt-3 space-y-2">
            {activePrioritySlots.map((priority, index) => (
              <div
                key={priority.id}
                className="flex flex-col gap-2 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-2 focus-within:border-[var(--accent-border)] sm:flex-row sm:items-center"
              >
                <div className="flex min-h-10 min-w-0 flex-1 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={getPriorityStatus(priority) === "completed"}
                    disabled={isReadonly || priority.text.trim().length === 0}
                    onChange={(event) =>
                      event.target.checked
                        ? updatePriorityStatus(priority.id, "completed")
                        : updatePriority(index, { done: false, status: "pending" })
                    }
                    className="h-5 w-5 shrink-0 accent-[var(--accent)]"
                    aria-label={`Completar prioridad ${index + 1}`}
                  />
                  <input
                    type="text"
                    value={priority.text}
                    disabled={isReadonly}
                    onChange={(event) => updatePriority(index, { text: event.target.value, status: "pending", done: false })}
                    placeholder={`Prioridad ${index + 1}`}
                    className="min-h-10 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm font-semibold text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] disabled:opacity-70"
                    aria-label={`Texto de prioridad ${index + 1}`}
                  />
                </div>
                {priority.text.trim().length > 0 ? (
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <button
                      type="button"
                      disabled={isReadonly}
                      onClick={() => updatePriorityStatus(priority.id, "completed")}
                      className="min-h-9 rounded-md border border-[rgba(34,211,238,0.24)] bg-[var(--accent-faint)] px-3 text-xs font-black text-[var(--accent-text)] transition hover:border-[var(--accent-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Completar
                    </button>
                    <button
                      type="button"
                      disabled={isReadonly}
                      onClick={() => setPostponeDialog({ priority, toDate: addDaysToDateKey(entryDate, 1) })}
                      className="min-h-9 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-3 text-xs font-black text-[var(--muted-strong)] transition hover:border-[var(--accent-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Posponer
                    </button>
                    <button
                      type="button"
                      disabled={isReadonly}
                      onClick={() => updatePriorityStatus(priority.id, "discarded")}
                      className="min-h-9 rounded-md border border-[rgba(255,255,255,0.1)] bg-[rgba(244,247,244,0.025)] px-3 text-xs font-black text-[var(--muted)] transition hover:border-[rgba(255,110,110,0.4)] hover:text-[#ffb4b4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Descartar
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {extraPendingPriorities.length > 0 ? (
            <div className="mt-4 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(244,247,244,0.02)] p-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">Más tareas pendientes</p>
              <div className="mt-2 space-y-2">
                {extraPendingPriorities.map((priority) => (
                  <p key={priority.id} className="text-sm font-semibold text-[var(--muted-strong)]">
                    {priority.text}
                    {priority.postponedFromDate ? (
                      <span className="ml-2 text-xs text-[var(--muted)]">desde {formatShortDate(priority.postponedFromDate)}</span>
                    ) : null}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          {closedPriorities.length > 0 ? (
            <div className="mt-4 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(244,247,244,0.02)] p-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">Cerradas hoy</p>
              <div className="mt-2 space-y-2">
                {closedPriorities.map((priority) => {
                  const status = getPriorityStatus(priority);

                  return (
                    <div key={priority.id} className="flex flex-col gap-1 rounded-md border border-[rgba(255,255,255,0.06)] bg-[rgba(7,10,9,0.32)] p-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className={`text-sm font-semibold ${status === "completed" ? "text-[var(--muted-strong)] line-through" : "text-[var(--muted)]"}`}>
                        {priority.text}
                      </p>
                      <span className="w-fit rounded-full border border-[rgba(255,255,255,0.08)] px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--muted-strong)]">
                        {getClosedPriorityLabel(priority)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex flex-col gap-3 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <label className="flex min-h-11 items-center gap-3 text-sm font-black">
                <input
                  type="checkbox"
                  checked={mobilityDone}
                  disabled={isReadonly}
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, mobilityDone: event.target.checked }))}
                  className="h-5 w-5 shrink-0 accent-[var(--accent)]"
                />
                Movilidad hecha
              </label>
              <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                Minutos
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={mobilityMinutes ?? ""}
                  disabled={isReadonly}
                  onChange={(event) => {
                    const value = event.target.value;
                    setForm((currentForm) => ({
                      ...currentForm,
                      mobilityMinutes: value === "" ? null : Math.max(0, Number.parseInt(value, 10) || 0),
                    }));
                  }}
                  className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.52)] px-3 text-sm font-bold normal-case tracking-normal text-[var(--foreground)] outline-none focus:border-[var(--accent-border)] disabled:opacity-70"
                  placeholder="10"
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-2" aria-label="Foco de movilidad">
              {DAILY_MOBILITY_FOCUS_OPTIONS.map((focus) => {
                const selected = mobilityFocus.includes(focus);

                return (
                  <button
                    key={focus}
                    type="button"
                    disabled={isReadonly}
                    onClick={() => toggleMobilityFocus(focus)}
                    className={`min-h-10 rounded-md border px-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-70 ${
                      selected
                        ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-text)]"
                        : "border-[var(--line)] bg-[rgba(244,247,244,0.025)] text-[var(--muted-strong)] hover:border-[var(--accent-border)]"
                    }`}
                    aria-pressed={selected}
                  >
                    {focus}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="grid gap-2 text-sm font-black">
            Nota rápida
            <textarea
              value={dailyNote}
              disabled={isReadonly}
              onChange={(event) => setForm((currentForm) => ({ ...currentForm, dailyNote: event.target.value }))}
              rows={3}
              placeholder="Nota del día"
              className="min-h-24 resize-none rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.52)] p-3 text-sm font-medium leading-6 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent-border)] disabled:opacity-70"
            />
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        {isDirty ? (
          <button
            type="button"
            disabled={isSaving}
            onClick={resetChanges}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)] hover:bg-[rgba(244,247,244,0.055)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Resetear cambios
          </button>
        ) : null}
        {!isLoading && !error ? (
          <p className="text-xs font-semibold text-[var(--muted)]" aria-live="polite">
            {isSaving ? "Guardando cambios." : status === "empty" ? "Plan listo para completar." : isDirty ? "Cambios pendientes." : "Sin cambios pendientes."}
          </p>
        ) : null}
      </div>

      {postponeDialog ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="postpone-priority-title">
          <div className="w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Posponer tarea</p>
                <h4 id="postpone-priority-title" className="mt-1 text-xl font-black text-[var(--foreground)]">
                  Elegir fecha
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPostponeDialog(null)}
                className="rounded-md border border-[var(--line)] px-3 py-2 text-xs font-black text-[var(--muted-strong)] transition hover:border-[var(--accent-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
              >
                Cerrar
              </button>
            </div>

            <p className="mt-4 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(244,247,244,0.025)] p-3 text-sm font-semibold leading-6 text-[var(--muted-strong)]">
              {postponeDialog.priority.text}
            </p>

            <label className="mt-4 grid gap-2 text-sm font-black text-[var(--foreground)]">
              Nueva fecha
              <input
                type="date"
                min={entryDate}
                value={postponeDialog.toDate}
                onChange={(event) => setPostponeDialog((currentDialog) => currentDialog ? { ...currentDialog, toDate: event.target.value } : currentDialog)}
                className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.52)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent-border)]"
              />
            </label>

            {postponeDialog.toDate <= entryDate ? (
              <p className="mt-2 text-xs font-semibold text-[#ffb4b4]">Elige una fecha posterior a hoy.</p>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setPostponeDialog(null)}
                className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSaving || postponeDialog.toDate <= entryDate}
                onClick={() => void postponePriority()}
                className="min-h-11 rounded-md border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-black text-[var(--accent-text)] transition hover:bg-[var(--accent-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Posponer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
