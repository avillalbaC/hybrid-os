"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MuscleLoadList } from "@/components/muscle-load/muscle-load-list";
import { getMuscleExerciseContributions, getMuscleSessionContributions } from "@/lib/domain/training/analysis";
import { getMovementBalance, getTopMuscles, muscleNames } from "@/lib/selectors/training";
import { useTrainingSessions } from "@/lib/storage/use-training-sessions";
import { formatDate, formatMuscleName, formatTrainingType } from "@/lib/utils/format";
import type { MuscleName, TrainingSession } from "@/types/training";

export function MuscleLoadView({ seedSessions }: { seedSessions: TrainingSession[] }) {
  const { sessions, syncMessage } = useTrainingSessions(seedSessions);
  const muscles = getTopMuscles(sessions, 8);
  const balance = getMovementBalance(sessions);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleName>(muscles[0]?.muscle ?? "quadriceps");
  const sessionContributions = useMemo(
    () => getMuscleSessionContributions(sessions, selectedMuscle).slice(0, 8),
    [selectedMuscle, sessions],
  );
  const exerciseContributions = useMemo(
    () => getMuscleExerciseContributions(sessions, selectedMuscle).slice(0, 10),
    [selectedMuscle, sessions],
  );

  return (
    <>
      <PageHeader
        eyebrow="Carga muscular"
        title="Análisis de carga muscular"
        description="Acumulación semanal, patrones de movimiento y posibles desbalances a vigilar."
      />
      {syncMessage ? (
        <p className="mb-5 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-sm text-[var(--muted-strong)]">
          {syncMessage}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Empuje" value={`${balance.push}%`} detail="Volumen relativo semanal" />
        <MetricCard label="Tracción" value={`${balance.pull}%`} detail="Volumen relativo semanal" />
        <MetricCard label="Tren inferior" value={`${balance.lower}%`} detail="Predominio semanal" />
        <MetricCard label="Tren superior" value={`${balance.upper}%`} detail="Trabajo acumulado" />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Ranking de músculos</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">Selecciona un músculo para abrir su detalle.</p>
            </div>
            <select
              value={selectedMuscle}
              onChange={(event) => setSelectedMuscle(event.target.value as MuscleName)}
              className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              {muscleNames.map((muscle) => (
                <option key={muscle} value={muscle}>
                  {formatMuscleName(muscle)}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-5">
            <MuscleLoadList muscles={muscles} />
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <h3 className="text-lg font-semibold">Cadenas</h3>
            <div className="mt-5 space-y-5">
              <ProgressBar label={`Cadena anterior ${balance.anterior}%`} value={balance.anterior} />
              <ProgressBar label={`Cadena posterior ${balance.posterior}%`} value={balance.posterior} />
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold">Alertas de balance</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
              <li>Cuádriceps acumula carga alta en HYROX y CrossFit.</li>
              <li>Tracción superior estable, sin alerta de exceso.</li>
              <li>Cadena posterior algo por debajo frente al patrón dominante de sentadilla y empuje.</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Detalle muscular</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">{formatMuscleName(selectedMuscle)}</h3>
          <div className="mt-5 divide-y divide-[var(--line)]">
            {sessionContributions.length > 0 ? (
              sessionContributions.map((item) => (
                <Link key={item.session.id} href={`/training/${item.session.id}`} className="block py-4 first:pt-0 last:pb-0 transition hover:text-[var(--accent-strong)]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{item.session.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{formatDate(item.session.date)} · {formatTrainingType(item.session.type)}</p>
                    </div>
                    <Badge tone="accent">{item.load} puntos</Badge>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">No hay sesiones con carga para este músculo.</p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Ejercicios que más cargan</h3>
          <div className="mt-4 space-y-3">
            {exerciseContributions.length > 0 ? (
              exerciseContributions.map((item) => (
                <div key={`${item.session.id}-${item.blockName}-${item.exercise.name}-${item.load}`} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[var(--foreground)]">{item.exercise.name}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.session.title} · {item.blockName}</p>
                    </div>
                    <Badge>{item.load} · {item.role}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">No hay ejercicios asociados a este músculo.</p>
            )}
          </div>
        </Card>
      </section>
    </>
  );
}
