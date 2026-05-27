"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useTrainingSessions } from "@/lib/storage/use-training-sessions";
import { formatLongDate, formatMuscleName, formatMuscleRole, formatTag, formatTrainingType } from "@/lib/utils/format";
import type { TrainingSession } from "@/types/training";

const editablePendingFields: TrainingSession["pendingFields"] = [
  "RPE exacto",
  "Duración exacta",
  "Tiempo exacto",
  "Resultado exacto",
  "Reparto individual",
  "Carga exacta",
  "Repeticiones exactas",
  "Distancia exacta",
  "Molestias durante/después",
  "Escalado/variantes",
  "Fecha exacta",
  "Otro",
];

export function TrainingDetailView({
  sessionId,
  seedSessions,
}: {
  sessionId: string;
  seedSessions: TrainingSession[];
}) {
  const router = useRouter();
  const { sessions, hasHydrated, saveSession, deleteSession, syncMessage } = useTrainingSessions(seedSessions);
  const session = sessions.find((item) => item.id === sessionId);
  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    date: "",
    title: "",
    durationMinutes: "",
    rpe: "",
    feeling: "",
    notes: "",
    soreness: "",
    pendingFields: "",
  });

  useEffect(() => {
    if (!session) return;

    setFormState({
      date: session.date,
      title: session.title,
      durationMinutes: session.durationMinutes?.toString() ?? "",
      rpe: session.rpe?.toString() ?? "",
      feeling: session.feeling ?? "",
      notes: session.notes ?? "",
      soreness: session.soreness.join(", "),
      pendingFields: session.pendingFields.join(", "),
    });
  }, [session]);

  if (!session) {
    return (
      <>
        <PageHeader
          eyebrow="Detalle de entrenamiento"
          title={hasHydrated ? "Entrenamiento no encontrado" : "Cargando entrenamiento"}
          description={hasHydrated ? "No existe una sesión con este identificador en el seed ni en el storage local." : undefined}
        />
        {hasHydrated ? (
          <Link href="/training" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
            Volver al log
          </Link>
        ) : null}
      </>
    );
  }

  const activeSession = session;

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar "${activeSession.title}"?`)) {
      return;
    }

    await deleteSession(activeSession.id);
    router.push("/training");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const durationMinutes = formState.durationMinutes.trim() === "" ? null : Number(formState.durationMinutes);
    const rpe = formState.rpe.trim() === "" ? null : Number(formState.rpe);

    if (durationMinutes !== null && (!Number.isFinite(durationMinutes) || durationMinutes < 0)) {
      setEditMessage("La duración debe ser un número positivo o quedar vacía.");
      return;
    }

    if (rpe !== null && (!Number.isFinite(rpe) || rpe < 0 || rpe > 10)) {
      setEditMessage("El RPE debe estar entre 0 y 10 o quedar vacío.");
      return;
    }

    if (!formState.date || !formState.title.trim()) {
      setEditMessage("Fecha y título son obligatorios.");
      return;
    }

    const pendingFields = formState.pendingFields
      .split(",")
      .map((item) => item.trim())
      .filter((item): item is TrainingSession["pendingFields"][number] => editablePendingFields.includes(item as TrainingSession["pendingFields"][number]));

    const nextSession: TrainingSession = {
      ...activeSession,
      date: formState.date,
      title: formState.title.trim(),
      durationMinutes,
      rpe,
      feeling: formState.feeling.trim() || null,
      notes: formState.notes.trim() || null,
      soreness: formState.soreness.split(",").map((item) => item.trim()).filter(Boolean),
      pendingFields,
    };

    const result = await saveSession(nextSession);
    setEditMessage(result.remote ? "Cambios guardados en Supabase." : "Cambios guardados localmente hasta sincronizar.");
    setIsEditing(false);
  }

  return (
    <>
      <PageHeader
        eyebrow={formatLongDate(session.date)}
        title={session.title}
        description={session.objective ?? undefined}
      />

      <section className="mb-5 flex flex-wrap gap-2">
        <Badge tone="accent">{formatTrainingType(session.type)}</Badge>
        {session.subtypes.map((subtype) => (
          <Badge key={subtype}>{formatTag(subtype)}</Badge>
        ))}
        <Badge>RPE {session.rpe ?? "-"}/10</Badge>
        <Badge>{session.durationMinutes ?? "-"} min</Badge>
        {syncMessage ? <Badge tone="warning">{syncMessage}</Badge> : null}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {session.blocks.map((block) => (
            <Card key={block.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{block.name}</h3>
                  <p className="text-sm text-[var(--muted)]">{block.format}</p>
                </div>
                {block.timeCapMinutes ? <Badge tone="warning">Cap {block.timeCapMinutes} min</Badge> : null}
              </div>
              <div className="mt-4 divide-y divide-[var(--line)]">
                {block.exercises.map((exercise) => (
                  <div key={exercise.name} className="py-4 first:pt-0 last:pb-0">
                    <p className="font-semibold">{exercise.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {[
                        exercise.sets ? `${exercise.sets} series` : null,
                        exercise.reps ? `${exercise.reps} reps` : null,
                        exercise.loadKg ? `${exercise.loadKg} kg` : null,
                        exercise.distanceMeters ? `${exercise.distanceMeters} m` : null,
                        exercise.durationSeconds ? `${exercise.durationSeconds}s` : null,
                        exercise.calories ? `${exercise.calories} cal` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <aside className="space-y-5">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Resumen</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing((value) => !value)}
                  className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs font-bold text-[var(--foreground)] transition hover:border-[rgba(56,217,159,0.34)]"
                >
                  {isEditing ? "Cerrar" : "Editar"}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs font-bold text-[var(--muted-strong)] transition hover:border-[rgba(240,196,107,0.5)] hover:text-[var(--warning)]"
                >
                  Eliminar
                </button>
              </div>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">Sensación</dt>
                <dd className="font-semibold">{session.feeling ?? "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">Ubicación</dt>
                <dd className="font-semibold">{session.location ?? "-"}</dd>
              </div>
            </dl>
            {session.notes ? <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{session.notes}</p> : null}
            {editMessage ? <p className="mt-4 text-sm font-semibold text-[var(--accent)]">{editMessage}</p> : null}
          </Card>

          {isEditing ? (
            <Card>
              <h3 className="text-lg font-semibold">Edición rápida</h3>
              <form className="mt-4 space-y-3" onSubmit={handleSave}>
                <label className="block text-sm font-semibold">
                  Fecha
                  <input
                    type="date"
                    value={formState.date}
                    onChange={(event) => setFormState((state) => ({ ...state, date: event.target.value }))}
                    className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Título
                  <input
                    value={formState.title}
                    onChange={(event) => setFormState((state) => ({ ...state, title: event.target.value }))}
                    className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-semibold">
                    Duración
                    <input
                      inputMode="numeric"
                      value={formState.durationMinutes}
                      onChange={(event) => setFormState((state) => ({ ...state, durationMinutes: event.target.value }))}
                      className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm font-semibold">
                    RPE
                    <input
                      inputMode="decimal"
                      value={formState.rpe}
                      onChange={(event) => setFormState((state) => ({ ...state, rpe: event.target.value }))}
                      className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <label className="block text-sm font-semibold">
                  Feeling
                  <input
                    value={formState.feeling}
                    onChange={(event) => setFormState((state) => ({ ...state, feeling: event.target.value }))}
                    className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Soreness
                  <input
                    value={formState.soreness}
                    onChange={(event) => setFormState((state) => ({ ...state, soreness: event.target.value }))}
                    className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Pending fields
                  <input
                    value={formState.pendingFields}
                    onChange={(event) => setFormState((state) => ({ ...state, pendingFields: event.target.value }))}
                    className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Notas
                  <textarea
                    value={formState.notes}
                    onChange={(event) => setFormState((state) => ({ ...state, notes: event.target.value }))}
                    className="mt-2 min-h-24 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-md border border-[rgba(56,217,159,0.34)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[#06100c] transition hover:bg-[var(--accent-strong)]"
                >
                  Guardar cambios
                </button>
              </form>
            </Card>
          ) : null}

          <Card>
            <h3 className="text-lg font-semibold">Carga muscular</h3>
            <div className="mt-4 space-y-3">
              {Object.entries(session.sessionMuscleSummary)
                .filter(([, load]) => load > 0)
                .map(([muscle, load]) => (
                  <div key={muscle} className="flex items-center justify-between gap-3 text-sm">
                    <span>{formatMuscleName(muscle)}</span>
                    <Badge>{load} puntos · {formatMuscleRole("primary")}</Badge>
                  </div>
                ))}
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
