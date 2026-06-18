import {
  getLatestDate,
  getPeriodRange,
  getPreviousPeriodRange,
  isDateInRange,
  resolvePeriodReferenceDate,
} from "@/lib/domain/dashboard/periods";
import { formatRelativeWeekLabel, formatWeekMetaLabel, getWeekStartDateKey } from "@/lib/date/week-labels";
import { getSessionRunMeters } from "@/lib/domain/training/run-exposure";
import { isPureRunningSession } from "@/lib/domain/training/session-kind";
import { getRecentSessions, getWeekKey } from "@/lib/selectors/training";
import type { MuscleName, TrainingExercise, TrainingSession } from "@/types/training";

export type RunningSessionSummary = {
  session: TrainingSession;
  runMeters: number;
  sourceType: "running" | "hyrox" | "mixed";
};

export type MuscleSessionContribution = {
  session: TrainingSession;
  load: number;
};

export type MuscleExerciseContribution = {
  session: TrainingSession;
  blockName: string;
  exercise: TrainingExercise;
  load: number;
  role: string;
};

export function getLatestWeekSessions(sessions: TrainingSession[]) {
  const referenceDate = resolvePeriodReferenceDate("week", getLatestDate(sessions));
  const currentRange = getPeriodRange("week", referenceDate);
  const previousRange = getPreviousPeriodRange("week", referenceDate);
  const currentWeekSessions = currentRange ? sessions.filter((session) => isDateInRange(session.date, currentRange)) : [];
  const previousWeekSessions = previousRange ? sessions.filter((session) => isDateInRange(session.date, previousRange)) : [];
  const currentWeekStart = currentRange ? getWeekStartDateKey(currentRange.start) : null;
  const previousWeekStart = previousRange ? getWeekStartDateKey(previousRange.start) : null;
  const currentWeekKey = currentWeekSessions[0] ? getWeekKey(currentWeekSessions[0].date) : currentWeekStart ? getWeekKey(currentWeekStart) : "empty";
  const previousWeekKey = previousWeekSessions[0] ? getWeekKey(previousWeekSessions[0].date) : previousWeekStart ? getWeekKey(previousWeekStart) : "empty";

  return {
    currentWeekKey,
    previousWeekKey,
    currentWeekLabel: currentWeekStart ? formatRelativeWeekLabel(currentWeekStart, getWeekStartDateKey(new Date())) : "Sin semana",
    previousWeekLabel: previousWeekStart ? formatRelativeWeekLabel(previousWeekStart, getWeekStartDateKey(new Date())) : "Sin semana previa",
    currentWeekMetaLabel: formatWeekMetaLabel(currentWeekKey),
    previousWeekMetaLabel: formatWeekMetaLabel(previousWeekKey),
    currentWeekSessions,
    previousWeekSessions,
  };
}

export function getRunningSessions(sessions: TrainingSession[]): RunningSessionSummary[] {
  return getRecentSessions(sessions, sessions.length)
    .map((session) => ({
      session,
      runMeters: getSessionRunMeters(session),
      sourceType: isPureRunningSession(session) ? "running" as const : session.type === "hyrox" ? "hyrox" as const : "mixed" as const,
    }))
    .filter((summary) => summary.runMeters > 0);
}

export function groupRunningSessionsByWeek(sessions: TrainingSession[]) {
  return getRunningSessions(sessions).reduce<Record<string, RunningSessionSummary[]>>((weeks, summary) => {
    const weekKey = getWeekKey(summary.session.date);
    weeks[weekKey] = [...(weeks[weekKey] ?? []), summary];
    return weeks;
  }, {});
}

export function getRunningDistribution(summaries: RunningSessionSummary[]) {
  return summaries.reduce(
    (result, summary) => {
      result[summary.sourceType] += summary.runMeters;
      return result;
    },
    { running: 0, hyrox: 0, mixed: 0 },
  );
}

export function getMuscleSessionContributions(sessions: TrainingSession[], muscle: MuscleName): MuscleSessionContribution[] {
  return getRecentSessions(sessions, sessions.length)
    .map((session) => ({
      session,
      load: session.sessionMuscleSummary[muscle] ?? 0,
    }))
    .filter((item) => item.load > 0)
    .sort((a, b) => b.load - a.load);
}

export function getMuscleExerciseContributions(sessions: TrainingSession[], muscle: MuscleName): MuscleExerciseContribution[] {
  return sessions
    .flatMap((session) =>
      session.blocks.flatMap((block) =>
        block.exercises.flatMap((exercise) =>
          exercise.muscleLoad
            .filter((entry) => entry.muscle === muscle && entry.load > 0)
            .map((entry) => ({
              session,
              blockName: block.name,
              exercise,
              load: entry.load,
              role: entry.role,
            })),
        ),
      ),
    )
    .sort((a, b) => b.load - a.load);
}
