import { isPureRunningSession } from "@/lib/domain/training/session-kind";
import type { TrainingSession } from "@/types/training";

export type RunningBreakdown = {
  structuredMeters: number;
  mixedMeters: number;
  totalRunExposureMeters: number;
};

const runningExerciseNames = ["run", "running", "shuttle run", "carrera"];

function hasRunningName(value: string) {
  const normalized = value.toLowerCase();
  return runningExerciseNames.some((name) => normalized.includes(name));
}

export function getSessionRunMeters(session: TrainingSession) {
  const metricMeters = session.sessionMetrics.totalRunMeters;

  if (metricMeters > 0) {
    return metricMeters;
  }

  return session.blocks.reduce(
    (sessionTotal, block) =>
      sessionTotal +
      block.exercises.reduce((blockTotal, exercise) => {
        const isRunningExercise =
          exercise.movementPattern === "run" ||
          block.format === "running" ||
          hasRunningName(exercise.name) ||
          hasRunningName(exercise.canonicalName);
        return isRunningExercise ? blockTotal + (exercise.distanceMeters ?? 0) : blockTotal;
      }, 0),
    0,
  );
}

export function getStructuredRunningMeters(sessions: TrainingSession[]) {
  return sessions
    .filter(isPureRunningSession)
    .reduce((total, session) => total + getSessionRunMeters(session), 0);
}

export function getMixedRunningMeters(sessions: TrainingSession[]) {
  return sessions
    .filter((session) => !isPureRunningSession(session))
    .reduce((total, session) => total + getSessionRunMeters(session), 0);
}

export function getTotalRunExposureMeters(sessions: TrainingSession[]) {
  return getStructuredRunningMeters(sessions) + getMixedRunningMeters(sessions);
}

export function getRunningBreakdown(sessions: TrainingSession[]): RunningBreakdown {
  const structuredMeters = getStructuredRunningMeters(sessions);
  const mixedMeters = getMixedRunningMeters(sessions);

  return {
    structuredMeters,
    mixedMeters,
    totalRunExposureMeters: structuredMeters + mixedMeters,
  };
}
