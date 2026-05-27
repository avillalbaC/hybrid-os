import { getRecentSessions, getSessionsByWeek, getWeekKey } from "@/lib/selectors/training";
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
  const weeks = getSessionsByWeek(sessions);
  const weekKeys = Object.keys(weeks).sort().reverse();

  return {
    currentWeekKey: weekKeys[0] ?? "empty",
    previousWeekKey: weekKeys[1] ?? "empty",
    currentWeekSessions: weeks[weekKeys[0]] ?? [],
    previousWeekSessions: weeks[weekKeys[1]] ?? [],
  };
}

export function getRunningSessions(sessions: TrainingSession[]): RunningSessionSummary[] {
  return getRecentSessions(sessions, sessions.length)
    .filter((session) => session.sessionMetrics.totalRunMeters > 0 || session.type === "running")
    .map((session) => ({
      session,
      runMeters: session.sessionMetrics.totalRunMeters,
      sourceType: session.type === "running" ? "running" : session.type === "hyrox" ? "hyrox" : "mixed",
    }));
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

