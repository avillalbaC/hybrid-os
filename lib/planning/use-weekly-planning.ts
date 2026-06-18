"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getPlanningWeekBounds } from "@/lib/analytics/planning-evaluation";
import type { PlannedSession, WeeklyPlanSummary } from "@/types/planning";
import type { TrainingSession } from "@/types/training";

type WeeklyPlanningResponse = {
  summary: WeeklyPlanSummary;
  plannedSessions: PlannedSession[];
  matches?: Array<{
    plannedSession: PlannedSession;
    matchedTrainingSession: TrainingSession | null;
    isCompleted: boolean;
    reason: "manual" | "training_session" | "daily_mobility" | "rest_day" | "not_completed";
  }>;
  unplannedSessions?: TrainingSession[];
};

function createEmptySummary(weekStart: string, weekEnd: string): WeeklyPlanSummary {
  return {
    weekStart,
    weekEnd,
    plannedSessions: 0,
    completedPlannedSessions: 0,
    skippedSessions: 0,
    unplannedCompletedSessions: 0,
    plannedByType: {},
    completedByType: {},
    adherencePercentage: null,
    deviations: [
      {
        id: "no-weekly-plan",
        severity: "info",
        title: "No hay plan semanal registrado",
        description: "Crea una sesión planificada para comparar intención y ejecución.",
      },
    ],
  };
}

export function useWeeklyPlanning() {
  const weekBounds = useMemo(() => getPlanningWeekBounds(), []);
  const [plannedSessions, setPlannedSessions] = useState<PlannedSession[]>([]);
  const [summary, setSummary] = useState<WeeklyPlanSummary>(() => createEmptySummary(weekBounds.weekStart, weekBounds.weekEnd));
  const [matches, setMatches] = useState<WeeklyPlanningResponse["matches"]>([]);
  const [unplannedSessions, setUnplannedSessions] = useState<TrainingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/planning/weekly-summary?weekStart=${weekBounds.weekStart}&weekEnd=${weekBounds.weekEnd}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar el plan semanal.");
      }

      const payload = (await response.json()) as WeeklyPlanningResponse;
      setPlannedSessions(payload.plannedSessions);
      setSummary(payload.summary);
      setMatches(payload.matches ?? []);
      setUnplannedSessions(payload.unplannedSessions ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el plan semanal.");
      setPlannedSessions([]);
      setSummary(createEmptySummary(weekBounds.weekStart, weekBounds.weekEnd));
      setMatches([]);
      setUnplannedSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [weekBounds.weekEnd, weekBounds.weekStart]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    weekStart: weekBounds.weekStart,
    weekEnd: weekBounds.weekEnd,
    plannedSessions,
    summary,
    matches,
    unplannedSessions,
    isLoading,
    error,
    refresh,
  };
}
