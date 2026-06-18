"use client";

import { useEffect, useState } from "react";
import type { PlannedSession, PlannedSessionInput, PlannedSessionPriority, PlannedSessionType } from "@/types/planning";
import { plannedSessionPriorities, plannedSessionTypes } from "@/types/planning";
import { plannedSessionPriorityLabels, plannedSessionTypeLabels } from "./planning-labels";

type PlannedSessionFormState = {
  plannedDate: string;
  title: string;
  type: PlannedSessionType;
  priority: PlannedSessionPriority;
  plannedDurationMinutes: string;
  plannedDistanceMeters: string;
  plannedRpe: string;
  focus: string;
  subtypes: string;
  notes: string;
};

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function splitList(value: string) {
  return Array.from(new Set(value.split(",").map((item) => item.trim()).filter(Boolean)));
}

function createEmptyForm(defaultDate: string): PlannedSessionFormState {
  return {
    plannedDate: defaultDate,
    title: "",
    type: "running",
    priority: "normal",
    plannedDurationMinutes: "",
    plannedDistanceMeters: "",
    plannedRpe: "",
    focus: "",
    subtypes: "",
    notes: "",
  };
}

function createFormFromSession(plannedSession: PlannedSession): PlannedSessionFormState {
  return {
    plannedDate: plannedSession.plannedDate,
    title: plannedSession.title,
    type: plannedSession.type,
    priority: plannedSession.priority,
    plannedDurationMinutes: plannedSession.plannedDurationMinutes?.toString() ?? "",
    plannedDistanceMeters: plannedSession.plannedDistanceMeters?.toString() ?? "",
    plannedRpe: plannedSession.plannedRpe?.toString() ?? "",
    focus: plannedSession.focus.join(", "),
    subtypes: plannedSession.subtypes.join(", "),
    notes: plannedSession.notes ?? "",
  };
}

function toInput(form: PlannedSessionFormState, goalBlockId?: string | null): PlannedSessionInput {
  return {
    goalBlockId: goalBlockId ?? null,
    plannedDate: form.plannedDate,
    title: form.title.trim(),
    type: form.type,
    priority: form.priority,
    plannedDurationMinutes: form.plannedDurationMinutes ? Number.parseInt(form.plannedDurationMinutes, 10) : null,
    plannedDistanceMeters: form.plannedDistanceMeters ? Number.parseInt(form.plannedDistanceMeters, 10) : null,
    plannedRpe: form.plannedRpe ? Number.parseFloat(form.plannedRpe) : null,
    focus: splitList(form.focus),
    subtypes: splitList(form.subtypes),
    notes: form.notes.trim() || null,
  };
}

export function PlannedSessionForm({
  defaultDate = getLocalDateKey(),
  editingSession,
  goalBlockId,
  isSaving,
  error,
  onCancel,
  onSubmit,
}: {
  defaultDate?: string;
  editingSession?: PlannedSession | null;
  goalBlockId?: string | null;
  isSaving?: boolean;
  error?: string | null;
  onCancel?: () => void;
  onSubmit: (input: PlannedSessionInput, editingSession?: PlannedSession | null) => void;
}) {
  const [form, setForm] = useState<PlannedSessionFormState>(() => editingSession ? createFormFromSession(editingSession) : createEmptyForm(defaultDate));

  useEffect(() => {
    setForm(editingSession ? createFormFromSession(editingSession) : createEmptyForm(defaultDate));
  }, [defaultDate, editingSession]);

  return (
    <form
      className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(toInput(form, goalBlockId), editingSession);
      }}
    >
      <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)_180px]">
        <label className="grid gap-2 text-sm font-black">
          Fecha
          <input
            type="date"
            value={form.plannedDate}
            onChange={(event) => setForm((current) => ({ ...current, plannedDate: event.target.value }))}
            className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.72)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent-border)]"
          />
        </label>
        <label className="grid gap-2 text-sm font-black">
          Título
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Running Z2 40 min"
            className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.72)] px-3 text-sm font-bold text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent-border)]"
          />
        </label>
        <label className="grid gap-2 text-sm font-black">
          Tipo
          <select
            value={form.type}
            onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as PlannedSessionType }))}
            className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.72)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent-border)]"
          >
            {plannedSessionTypes.map((type) => (
              <option key={type} value={type}>{plannedSessionTypeLabels[type]}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-2 text-sm font-black">
          Prioridad
          <select
            value={form.priority}
            onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as PlannedSessionPriority }))}
            className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.72)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent-border)]"
          >
            {plannedSessionPriorities.map((priority) => (
              <option key={priority} value={priority}>{plannedSessionPriorityLabels[priority]}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-black">
          Duración min
          <input
            type="number"
            min={0}
            value={form.plannedDurationMinutes}
            onChange={(event) => setForm((current) => ({ ...current, plannedDurationMinutes: event.target.value }))}
            className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.72)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent-border)]"
          />
        </label>
        <label className="grid gap-2 text-sm font-black">
          Distancia m
          <input
            type="number"
            min={0}
            value={form.plannedDistanceMeters}
            onChange={(event) => setForm((current) => ({ ...current, plannedDistanceMeters: event.target.value }))}
            className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.72)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent-border)]"
          />
        </label>
        <label className="grid gap-2 text-sm font-black">
          RPE previsto
          <input
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={form.plannedRpe}
            onChange={(event) => setForm((current) => ({ ...current, plannedRpe: event.target.value }))}
            className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.72)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent-border)]"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-black">
          Foco
          <input
            type="text"
            value={form.focus}
            onChange={(event) => setForm((current) => ({ ...current, focus: event.target.value }))}
            placeholder="z2, aerobic"
            className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.72)] px-3 text-sm font-bold text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent-border)]"
          />
        </label>
        <label className="grid gap-2 text-sm font-black">
          Subtipos
          <input
            type="text"
            value={form.subtypes}
            onChange={(event) => setForm((current) => ({ ...current, subtypes: event.target.value }))}
            placeholder="z2, technique"
            className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.72)] px-3 text-sm font-bold text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent-border)]"
          />
        </label>
      </div>

      <label className="mt-4 grid gap-2 text-sm font-black">
        Notas
        <textarea
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          rows={3}
          className="min-h-24 resize-none rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.72)] p-3 text-sm font-medium leading-6 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent-border)]"
          placeholder="Rodaje suave"
        />
      </label>

      {error ? (
        <p className="mt-4 rounded-md border border-[rgba(255,110,110,0.28)] bg-[rgba(255,110,110,0.08)] p-3 text-sm font-semibold text-[#ff9b9b]">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSaving || form.title.trim().length === 0 || form.plannedDate.length === 0}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Guardando" : editingSession ? "Guardar cambios" : "Crear sesión planificada"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
