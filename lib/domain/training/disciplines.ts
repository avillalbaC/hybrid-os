import {
  getAverageRpe,
  getRecentSessions,
  getTopMuscles,
  getTotalDuration,
  type MuscleTotal,
} from "@/lib/selectors/training";
import type { TrainingSession, TrainingSessionType } from "@/types/training";

export type DisciplineSummary = {
  type: TrainingSessionType;
  sessions: TrainingSession[];
  sessionCount: number;
  durationMinutes: number;
  averageRpe: number;
  latestSession: TrainingSession | null;
  topMuscles: MuscleTotal[];
};

export function getDisciplineSummaries(sessions: TrainingSession[]) {
  const groups = sessions.reduce<Partial<Record<TrainingSessionType, TrainingSession[]>>>((result, session) => {
    result[session.type] = [...(result[session.type] ?? []), session];
    return result;
  }, {});

  return Object.entries(groups)
    .map(([type, disciplineSessions]) => {
      const orderedSessions = getRecentSessions(disciplineSessions, disciplineSessions.length);

      return {
        type: type as TrainingSessionType,
        sessions: orderedSessions,
        sessionCount: disciplineSessions.length,
        durationMinutes: getTotalDuration(disciplineSessions),
        averageRpe: getAverageRpe(disciplineSessions),
        latestSession: orderedSessions[0] ?? null,
        topMuscles: getTopMuscles(disciplineSessions, 3),
      } satisfies DisciplineSummary;
    })
    .sort((a, b) => b.sessionCount - a.sessionCount || a.type.localeCompare(b.type));
}

