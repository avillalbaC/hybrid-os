"use client";

import { useEffect, useMemo, useState } from "react";
import { evaluateGoalBlock } from "@/lib/analytics/goal-evaluation";
import { getGoalProgressSummary } from "@/lib/analytics/goal-progress";
import { getPeriodRange } from "@/lib/domain/dashboard/periods";
import type { BodyCheck } from "@/types/body";
import type { DailyEntry } from "@/types/daily";
import type { GoalBlock } from "@/types/goals";
import type { NutritionCheck } from "@/types/nutrition";
import type { PlannedSession } from "@/types/planning";
import type { TrainingSession } from "@/types/training";

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentWeekRange() {
  const range = getPeriodRange("week", new Date());

  if (!range) {
    const today = getLocalDateKey();
    return { start: today, end: today };
  }

  return {
    start: getLocalDateKey(range.start),
    end: getLocalDateKey(range.end),
  };
}

export function useActiveGoalEvaluation(
  sessions: TrainingSession[],
  options: {
    bodyChecks?: BodyCheck[];
    nutritionChecks?: NutritionCheck[];
    plannedSessions?: PlannedSession[];
  } = {},
) {
  const [activeGoal, setActiveGoal] = useState<GoalBlock | null>(null);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadGoalContext() {
      setIsLoading(true);

      try {
        const range = getCurrentWeekRange();
        const [goalResponse, dailyResponse] = await Promise.all([
          fetch("/api/goals/active", { cache: "no-store" }),
          fetch(`/api/daily-entry/range?start=${range.start}&end=${range.end}`, { cache: "no-store" }),
        ]);

        if (isMounted && goalResponse.ok) {
          const payload = (await goalResponse.json()) as { activeGoal: GoalBlock | null };
          setActiveGoal(payload.activeGoal);
        }

        if (isMounted && dailyResponse.ok) {
          const payload = (await dailyResponse.json()) as { entries: DailyEntry[] };
          setDailyEntries(payload.entries);
        }
      } catch {
        if (isMounted) {
          setActiveGoal(null);
          setDailyEntries([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadGoalContext();

    return () => {
      isMounted = false;
    };
  }, []);

  const evaluation = useMemo(
    () => evaluateGoalBlock({ activeGoal, sessions, dailyEntries }),
    [activeGoal, dailyEntries, sessions],
  );
  const progress = useMemo(
    () => getGoalProgressSummary({
      activeGoal,
      sessions,
      dailyEntries,
      bodyChecks: options.bodyChecks ?? [],
      nutritionChecks: options.nutritionChecks ?? [],
      plannedSessions: options.plannedSessions ?? [],
    }),
    [activeGoal, dailyEntries, options.bodyChecks, options.nutritionChecks, options.plannedSessions, sessions],
  );

  return {
    activeGoal,
    evaluation,
    progress,
    isLoading,
  };
}
