"use client";

import { getAllGoalProfileMeta, getGoalProfileDefaults, getGoalProfileMeta } from "@/lib/goals/goal-profiles";
import type { GoalBlock, GoalBlockTargets, GoalProfile } from "@/types/goals";

export type GoalFormState = {
  profile: GoalProfile;
  title: string;
  startDate: string;
  endDate: string;
  notes: string;
  targets: GoalBlockTargets;
};

export function createGoalFormState(goal: GoalBlock | null, fallbackDate: string): GoalFormState {
  const profile = goal?.profile ?? "recomposition";
  const meta = getGoalProfileMeta(profile);

  return {
    profile,
    title: goal?.title ?? meta.title,
    startDate: goal?.startDate ?? fallbackDate,
    endDate: goal?.endDate ?? "",
    notes: goal?.notes ?? "",
    targets: goal?.targets ?? getGoalProfileDefaults(profile),
  };
}

export function GoalProfileSelector({
  form,
  onChange,
  onSubmit,
  isSaving,
  error,
}: {
  form: GoalFormState;
  onChange: (form: GoalFormState) => void;
  onSubmit: () => void;
  isSaving?: boolean;
  error?: string | null;
}) {
  function setProfile(profile: GoalProfile) {
    const meta = getGoalProfileMeta(profile);
    onChange({
      ...form,
      profile,
      title: meta.title,
      targets: getGoalProfileDefaults(profile),
    });
  }

  return (
    <form
      className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <label className="grid gap-2 text-sm font-black">
          Perfil
          <select
            value={form.profile}
            onChange={(event) => setProfile(event.target.value as GoalProfile)}
            className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.72)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent-border)]"
          >
            {getAllGoalProfileMeta().map((profile) => (
              <option key={profile.profile} value={profile.profile}>
                {profile.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-black">
          Título
          <input
            type="text"
            value={form.title}
            onChange={(event) => onChange({ ...form, title: event.target.value })}
            className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.72)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent-border)]"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-black">
          Inicio
          <input
            type="date"
            value={form.startDate}
            onChange={(event) => onChange({ ...form, startDate: event.target.value })}
            className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.72)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent-border)]"
          />
        </label>
        <label className="grid gap-2 text-sm font-black">
          Fin opcional
          <input
            type="date"
            value={form.endDate}
            onChange={(event) => onChange({ ...form, endDate: event.target.value })}
            className="min-h-11 rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.72)] px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent-border)]"
          />
        </label>
      </div>

      <label className="mt-4 grid gap-2 text-sm font-black">
        Notas
        <textarea
          value={form.notes}
          onChange={(event) => onChange({ ...form, notes: event.target.value })}
          rows={3}
          className="min-h-24 resize-none rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.72)] p-3 text-sm font-medium leading-6 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent-border)]"
          placeholder="Contexto del bloque"
        />
      </label>

      {error ? (
        <p className="mt-4 rounded-md border border-[rgba(255,110,110,0.28)] bg-[rgba(255,110,110,0.08)] p-3 text-sm font-semibold text-[#ff9b9b]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving || form.title.trim().length === 0 || form.startDate.length === 0}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Guardando" : "Guardar objetivo activo"}
      </button>
    </form>
  );
}
