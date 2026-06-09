"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { TrainingSessionCard } from "@/components/training/training-session-card";
import { getDisciplineSummaries } from "@/lib/domain/training/disciplines";
import { formatDate, formatMuscleName, formatTrainingType } from "@/lib/utils/format";
import type { TrainingSession, TrainingSessionType } from "@/types/training";

export function DisciplinesOverview({
  isLoading = false,
  sessions,
}: {
  isLoading?: boolean;
  sessions: TrainingSession[];
}) {
  const summaries = useMemo(() => getDisciplineSummaries(sessions), [sessions]);
  const [selectedType, setSelectedType] = useState<TrainingSessionType | null>(null);
  const selectedSummary = summaries.find((summary) => summary.type === selectedType) ?? summaries[0] ?? null;

  if (isLoading) {
    return (
      <section className="mt-8" aria-label="Disciplinas calculando">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Disciplinas</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">Sesiones por disciplina</h3>
            <SkeletonBlock className="mt-3 h-4 w-80 max-w-full" />
          </div>
          <SkeletonBlock className="h-10 w-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
              <SkeletonBlock className="h-5 w-32" />
              <SkeletonBlock className="mt-3 h-4 w-24" />
              <div className="mt-4 grid grid-cols-3 gap-2">
                <SkeletonBlock className="h-14" />
                <SkeletonBlock className="h-14" />
                <SkeletonBlock className="h-14" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (summaries.length === 0) {
    return (
      <Card>
        <h3 className="text-2xl font-black tracking-tight">Disciplinas</h3>
        <p className="mt-3 text-sm text-[var(--muted)]">No hay sesiones para agrupar por disciplina.</p>
      </Card>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Disciplinas</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Sesiones por disciplina</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">Volumen, intensidad y últimas sesiones agrupadas por tipo de entrenamiento.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">{summaries.length} activas</Badge>
          <Link href="/training" className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)]">
            Ver log completo
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaries.map((summary) => {
          const isSelected = selectedSummary?.type === summary.type;

          return (
            <button
              key={summary.type}
              type="button"
              onClick={() => setSelectedType(summary.type)}
              className={`rounded-md border p-4 text-left shadow-[0_22px_70px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 ${
                isSelected
                  ? "border-[var(--accent-border)] bg-[linear-gradient(180deg,var(--accent-soft),var(--panel))]"
                  : "border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] hover:border-[var(--line-strong)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black tracking-tight">{formatTrainingType(summary.type)}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {summary.latestSession ? `Última: ${formatDate(summary.latestSession.date)}` : "Sin última sesión"}
                  </p>
                </div>
                <Badge tone={isSelected ? "accent" : "neutral"}>{summary.sessionCount}</Badge>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-2">
                  <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Duración</dt>
                  <dd className="mt-1 font-mono font-black">{summary.durationMinutes}m</dd>
                </div>
                <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-2">
                  <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">RPE</dt>
                  <dd className="mt-1 font-mono font-black">{summary.averageRpe || "Sin dato"}</dd>
                </div>
                <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.03)] p-2">
                  <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Horas</dt>
                  <dd className="mt-1 font-mono font-black">{(summary.durationMinutes / 60).toFixed(1)}</dd>
                </div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                {summary.topMuscles.map((muscle) => (
                  <Badge key={muscle.muscle}>{formatMuscleName(muscle.muscle)} {muscle.loadScore}</Badge>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {selectedSummary ? (
        <div className="mt-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
                {formatTrainingType(selectedSummary.type)}
              </p>
              <h4 className="mt-2 text-xl font-black tracking-tight">Sesiones recientes</h4>
            </div>
            <Badge>{selectedSummary.sessionCount} sesiones</Badge>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {selectedSummary.sessions.slice(0, 6).map((session) => (
              <TrainingSessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
