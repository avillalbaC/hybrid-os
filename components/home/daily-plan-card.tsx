"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  DAILY_MOBILITY_FOCUS_OPTIONS,
  DAILY_PRIORITY_LIMIT,
  createEmptyDailyPriorities,
  normalizeDailyPriorities,
  type DailyEntry,
  type DailyPriority,
} from "@/types/daily";

type DailyEntryResponse = {
  entry: DailyEntry | null;
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

function getLocalDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildEditablePriorities(priorities: DailyPriority[]) {
  const cleanPriorities = normalizeDailyPriorities(priorities);
  const emptyPriorities = createEmptyDailyPriorities();

  return emptyPriorities.map((emptyPriority, index) => cleanPriorities[index] ?? emptyPriority);
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
  const latestDraftRef = useRef<DailyPlanDraft | null>(null);
  const { priorities, mobilityDone, mobilityMinutes, mobilityFocus, dailyNote } = form;

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
        priorityIndex === index ? { ...priority, ...partialPriority } : priority,
      ),
    }));
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
    } catch (saveError) {
      if (latestDraftRef.current?.snapshot === draft.snapshot) {
        setFailedSnapshot(draft.snapshot);
      }

      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar. Revisa Supabase o la sesión privada.");
      setStatus("error");
    }
  }, [entryDate]);

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
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Acción Hybrid OS</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-strong)]">{recommendedAction}</p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-md border border-[rgba(255,110,110,0.28)] bg-[rgba(255,110,110,0.08)] p-3 text-sm font-semibold text-[#ff9b9b]">
          {error}
        </p>
      ) : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <p className="text-sm font-black text-[var(--foreground)]">Prioridades</p>
          <div className="mt-3 space-y-2">
            {priorities.slice(0, DAILY_PRIORITY_LIMIT).map((priority, index) => (
              <label
                key={priority.id}
                className="flex min-h-12 items-center gap-3 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-2 focus-within:border-[var(--accent-border)]"
              >
                <input
                  type="checkbox"
                  checked={priority.done}
                  disabled={isReadonly}
                  onChange={(event) => updatePriority(index, { done: event.target.checked })}
                  className="h-5 w-5 shrink-0 accent-[var(--accent)]"
                  aria-label={`Marcar prioridad ${index + 1} como hecha`}
                />
                <input
                  type="text"
                  value={priority.text}
                  disabled={isReadonly}
                  onChange={(event) => updatePriority(index, { text: event.target.value })}
                  placeholder={`Prioridad ${index + 1}`}
                  className={`min-h-10 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm font-semibold text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] disabled:opacity-70 ${
                    priority.done ? "text-[var(--muted)] line-through" : ""
                  }`}
                />
              </label>
            ))}
          </div>
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
    </Card>
  );
}
