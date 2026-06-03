import { getSessionMuscleSummary, getMuscleLoadTotal } from "@/lib/domain/training/muscle-load";
import type { TrainingSession } from "@/types/training";

export type SecondaryActivityKind = "padel" | "hiking" | "walking" | "route" | "other";

export type SecondaryActivitySummary = {
  sessions: number;
  durationMinutes: number;
  distanceMeters: number;
  muscleLoad: number;
  fatigueCost: number;
  kindCounts: Record<SecondaryActivityKind, number>;
  topKinds: SecondaryActivityKind[];
};

export const secondaryActivityTags = ["secondary-activity", "padel", "hiking", "walking", "route"];

export const secondaryActivityKindLabels: Record<SecondaryActivityKind, string> = {
  padel: "Pádel",
  hiking: "Senderismo",
  walking: "Walking",
  route: "Ruta",
  other: "Otra",
};

const kindPatterns: Array<{ kind: SecondaryActivityKind; patterns: RegExp[] }> = [
  { kind: "padel", patterns: [/\bpadel\b/i, /\bpádel\b/i] },
  { kind: "hiking", patterns: [/\bhiking\b/i, /\bsenderismo\b/i, /\bsenderista\b/i] },
  { kind: "walking", patterns: [/\bwalking\b/i, /\bcaminata\b/i, /\bcaminar\b/i, /\bandando\b/i, /\bpaseo\b/i] },
  { kind: "route", patterns: [/\broute\b/i, /\bruta\b/i] },
];

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}

function hasTag(session: TrainingSession, tag: string) {
  return session.tags.some((item) => normalizeTag(item) === tag);
}

function collectSecondaryText(session: TrainingSession) {
  return [session.title, session.rawText, session.notes, session.objective, session.importNotes, ...session.tags]
    .filter(Boolean)
    .join(" ");
}

export function isSecondaryActivity(session: TrainingSession) {
  return session.type === "actividad_funcional" || secondaryActivityTags.some((tag) => hasTag(session, tag));
}

export function getSecondaryActivityKind(session: TrainingSession): SecondaryActivityKind {
  if (hasTag(session, "padel")) return "padel";
  if (hasTag(session, "hiking")) return "hiking";
  if (hasTag(session, "walking")) return "walking";
  if (hasTag(session, "route")) return "route";

  const text = collectSecondaryText(session);
  const match = kindPatterns.find(({ patterns }) => patterns.some((pattern) => pattern.test(text)));
  return match?.kind ?? "other";
}

export function getSecondaryActivityDistanceMeters(session: TrainingSession) {
  if (session.sessionMetrics.totalRunMeters > 0) {
    return session.sessionMetrics.totalRunMeters;
  }

  return session.blocks.reduce(
    (sessionTotal, block) =>
      sessionTotal + block.exercises.reduce((blockTotal, exercise) => blockTotal + (exercise.distanceMeters ?? 0), 0),
    0,
  );
}

export function summarizeSecondaryActivities(sessions: TrainingSession[]): SecondaryActivitySummary {
  const secondarySessions = sessions.filter(isSecondaryActivity);
  const kindCounts: Record<SecondaryActivityKind, number> = {
    padel: 0,
    hiking: 0,
    walking: 0,
    route: 0,
    other: 0,
  };

  secondarySessions.forEach((session) => {
    kindCounts[getSecondaryActivityKind(session)] += 1;
  });

  const topKinds = (Object.entries(kindCounts) as Array<[SecondaryActivityKind, number]>)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([kind]) => kind);

  return {
    sessions: secondarySessions.length,
    durationMinutes: secondarySessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0),
    distanceMeters: secondarySessions.reduce((total, session) => total + getSecondaryActivityDistanceMeters(session), 0),
    muscleLoad: secondarySessions.reduce((total, session) => total + getMuscleLoadTotal(getSessionMuscleSummary(session)), 0),
    fatigueCost: secondarySessions.reduce((total, session) => total + session.sessionMetrics.fatigueCost, 0),
    kindCounts,
    topKinds,
  };
}
