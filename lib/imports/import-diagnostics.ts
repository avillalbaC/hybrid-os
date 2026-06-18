import type { HybridOSAppInput, TrainingSession } from "@/types/training";

export type PotentialDuplicateMatch = {
  inputId: string;
  existingId: string;
  existingTitle: string;
  date: string;
  type: TrainingSession["type"];
  reason: string;
};

function normalizeComparableText(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function resultLooksSimilar(inputSession: TrainingSession, existingSession: TrainingSession) {
  const inputScore = normalizeComparableText(inputSession.result?.score);
  const existingScore = normalizeComparableText(existingSession.result?.score);

  if (inputScore.length > 0 && inputScore === existingScore) {
    return "mismo resultado";
  }

  const inputTime = inputSession.result?.timeSeconds;
  const existingTime = existingSession.result?.timeSeconds;

  if (typeof inputTime === "number" && typeof existingTime === "number" && Math.abs(inputTime - existingTime) <= 10) {
    return "tiempo muy parecido";
  }

  const inputRunMeters = inputSession.sessionMetrics.totalRunMeters;
  const existingRunMeters = existingSession.sessionMetrics.totalRunMeters;
  const inputDuration = inputSession.durationMinutes;
  const existingDuration = existingSession.durationMinutes;

  if (
    inputRunMeters > 0 &&
    existingRunMeters > 0 &&
    Math.abs(inputRunMeters - existingRunMeters) <= 100 &&
    typeof inputDuration === "number" &&
    typeof existingDuration === "number" &&
    Math.abs(inputDuration - existingDuration) <= 5
  ) {
    return "distancia y duración muy parecidas";
  }

  return null;
}

function titleLooksSimilar(inputSession: TrainingSession, existingSession: TrainingSession) {
  const inputTitle = normalizeComparableText(inputSession.title);
  const existingTitle = normalizeComparableText(existingSession.title);

  if (inputTitle.length === 0 || existingTitle.length === 0) {
    return false;
  }

  return inputTitle === existingTitle || inputTitle.includes(existingTitle) || existingTitle.includes(inputTitle);
}

export function findInternalDuplicateSessionIds(inputs: HybridOSAppInput[]) {
  const counts = new Map<string, number>();

  inputs.forEach((input) => {
    const id = input.trainingSession.id;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([id]) => id);
}

export function findPotentialDuplicateMatches(inputs: HybridOSAppInput[], existingSessions: TrainingSession[]) {
  const matches: PotentialDuplicateMatch[] = [];

  inputs.forEach((input) => {
    const inputSession = input.trainingSession;

    existingSessions.forEach((existingSession) => {
      if (
        existingSession.id === inputSession.id ||
        existingSession.date !== inputSession.date ||
        existingSession.type !== inputSession.type
      ) {
        return;
      }

      const resultReason = resultLooksSimilar(inputSession, existingSession);
      const reason = resultReason ?? (titleLooksSimilar(inputSession, existingSession) ? "título muy parecido" : null);

      if (!reason) {
        return;
      }

      matches.push({
        inputId: inputSession.id,
        existingId: existingSession.id,
        existingTitle: existingSession.title,
        date: existingSession.date,
        type: existingSession.type,
        reason,
      });
    });
  });

  return matches;
}
