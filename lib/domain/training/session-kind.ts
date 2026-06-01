import type { TrainingSession } from "@/types/training";

export function isPureRunningSession(session: TrainingSession) {
  return session.type === "running";
}
