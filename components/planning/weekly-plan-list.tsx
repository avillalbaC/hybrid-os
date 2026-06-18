"use client";

import { PlannedSessionCard } from "@/components/planning/planned-session-card";
import { Card } from "@/components/ui/card";
import { SkeletonBlock } from "@/components/ui/skeleton";
import type { PlannedSession, PlannedSessionStatus } from "@/types/planning";
import type { TrainingSession } from "@/types/training";

type PlanningMatch = {
  plannedSession: PlannedSession;
  matchedTrainingSession: TrainingSession | null;
  isCompleted: boolean;
};

const dayLabels = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekDays(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00`);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    return {
      date: formatLocalDate(date),
      label: dayLabels[index],
    };
  });
}

export function WeeklyPlanList({
  weekStart,
  plannedSessions,
  matches = [],
  isLoading,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  weekStart: string;
  plannedSessions: PlannedSession[];
  matches?: PlanningMatch[];
  isLoading?: boolean;
  onEdit?: (plannedSession: PlannedSession) => void;
  onStatusChange?: (plannedSession: PlannedSession, status: PlannedSessionStatus) => void;
  onDelete?: (plannedSession: PlannedSession) => void;
}) {
  const days = getWeekDays(weekStart);

  return (
    <Card>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Plan semanal</p>
      <h3 className="mt-2 text-2xl font-black tracking-tight">Sesiones previstas</h3>
      <div className="mt-4 grid gap-3">
        {isLoading ? (
          <>
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
          </>
        ) : (
          days.map((day) => {
            const daySessions = plannedSessions.filter((session) => session.plannedDate === day.date);

            return (
              <div key={day.date} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.015)] p-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <p className="text-sm font-black capitalize text-[var(--foreground)]">{day.label}</p>
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{day.date}</p>
                </div>
                <div className="mt-3 grid gap-3">
                  {daySessions.length > 0 ? (
                    daySessions.map((plannedSession) => {
                      const match = matches.find((item) => item.plannedSession.id === plannedSession.id);

                      return (
                        <PlannedSessionCard
                          key={plannedSession.id}
                          plannedSession={plannedSession}
                          hasRealSession={match?.isCompleted}
                          onEdit={onEdit}
                          onStatusChange={onStatusChange}
                          onDelete={onDelete}
                        />
                      );
                    })
                  ) : (
                    <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.02)] p-3 text-sm leading-6 text-[var(--muted)]">
                      Sin sesiones planificadas.
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
