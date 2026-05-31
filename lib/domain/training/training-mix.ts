import type { TrainingSession, TrainingSessionType, TrainingSubtype } from "@/types/training";
import { getPeriodProgress, getPeriodProgressLabel } from "@/lib/domain/dashboard/periods";

export type TrainingModality =
  | "hyrox"
  | "crossfit"
  | "halterofilia"
  | "gimnasticos"
  | "running"
  | "fuerza"
  | "movilidad";

export type TrainingMixTrend = "above" | "below" | "range";

export type TrainingMixRow = {
  modality: TrainingModality;
  label: string;
  weekSessions: number;
  expectedWeekSessions: number | null;
  paceLabel: string;
  monthWeeklyAverage: number;
  yearWeeklyAverage: number;
  trend: TrainingMixTrend;
};

const coreModalities: TrainingModality[] = [
  "hyrox",
  "crossfit",
  "halterofilia",
  "gimnasticos",
  "running",
  "fuerza",
];

const modalityLabels: Record<TrainingModality, string> = {
  hyrox: "HYROX",
  crossfit: "CrossFit",
  halterofilia: "Halterofilia",
  gimnasticos: "Gimnásticos",
  running: "Running",
  fuerza: "Fuerza",
  movilidad: "Movilidad / Recovery",
};

const typeToModality: Partial<Record<TrainingSessionType, TrainingModality>> = {
  hyrox: "hyrox",
  crossfit: "crossfit",
  halterofilia: "halterofilia",
  gimnasticos: "gimnasticos",
  running: "running",
  fuerza: "fuerza",
  movilidad: "movilidad",
};

const subtypeToModality: Partial<Record<TrainingSubtype, TrainingModality>> = {
  weightlifting: "halterofilia",
  olympic_lift: "halterofilia",
  gymnastics: "gimnasticos",
  running: "running",
  strength: "fuerza",
  mobility: "movilidad",
};

function parseTrainingDate(date: string | Date) {
  const parsed = date instanceof Date ? new Date(date) : new Date(`${date}T00:00:00`);
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfWeek(date: Date) {
  const start = parseTrainingDate(date);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - (day - 1));
  return start;
}

function endOfWeek(date: Date) {
  const end = startOfWeek(date);
  end.setDate(end.getDate() + 6);
  return endOfDay(end);
}

function startOfMonth(date: Date) {
  const current = parseTrainingDate(date);
  return new Date(current.getFullYear(), current.getMonth(), 1);
}

function startOfYear(date: Date) {
  const current = parseTrainingDate(date);
  return new Date(current.getFullYear(), 0, 1);
}

function isDateInRange(date: string, start: Date, end: Date) {
  const time = parseTrainingDate(date).getTime();
  return time >= start.getTime() && time <= end.getTime();
}

function getElapsedWeeks(start: Date, referenceDate: Date) {
  const dayMs = 24 * 60 * 60 * 1000;
  const elapsedDays = Math.max(1, Math.floor((parseTrainingDate(referenceDate).getTime() - parseTrainingDate(start).getTime()) / dayMs) + 1);
  return elapsedDays / 7;
}

function roundAverage(value: number) {
  return Number(value.toFixed(1));
}

function emptyCounts() {
  return new Map<TrainingModality, number>([
    ["hyrox", 0],
    ["crossfit", 0],
    ["halterofilia", 0],
    ["gimnasticos", 0],
    ["running", 0],
    ["fuerza", 0],
    ["movilidad", 0],
  ]);
}

function countByModality(sessions: TrainingSession[]) {
  return sessions.reduce((counts, session) => {
    const modality = normalizeTrainingModality(session);

    if (!modality) {
      return counts;
    }

    counts.set(modality, (counts.get(modality) ?? 0) + 1);
    return counts;
  }, emptyCounts());
}

export function normalizeTrainingModality(session: Pick<TrainingSession, "type" | "subtypes">) {
  const typeModality = typeToModality[session.type];

  if (typeModality) {
    return typeModality;
  }

  for (const subtype of session.subtypes) {
    const subtypeModality = subtypeToModality[subtype];

    if (subtypeModality) {
      return subtypeModality;
    }
  }

  return null;
}

export function calculateTrainingMix(sessions: TrainingSession[], referenceDate: Date = new Date()): TrainingMixRow[] {
  const reference = parseTrainingDate(referenceDate);
  const weekStart = startOfWeek(reference);
  const weekEnd = endOfWeek(reference);
  const monthStart = startOfMonth(reference);
  const yearStart = startOfYear(reference);

  const weekCounts = countByModality(sessions.filter((session) => isDateInRange(session.date, weekStart, weekEnd)));
  const monthCounts = countByModality(sessions.filter((session) => isDateInRange(session.date, monthStart, endOfDay(reference))));
  const yearCounts = countByModality(sessions.filter((session) => isDateInRange(session.date, yearStart, endOfDay(reference))));
  const monthWeeksElapsed = getElapsedWeeks(monthStart, reference);
  const yearWeeksElapsed = getElapsedWeeks(yearStart, reference);
  const modalities = [...coreModalities];

  if ((weekCounts.get("movilidad") ?? 0) > 0 || (monthCounts.get("movilidad") ?? 0) > 0 || (yearCounts.get("movilidad") ?? 0) > 0) {
    modalities.push("movilidad");
  }

  return modalities.map((modality) => {
    const weekSessions = weekCounts.get(modality) ?? 0;
    const monthWeeklyAverage = roundAverage((monthCounts.get(modality) ?? 0) / monthWeeksElapsed);
    const yearWeeklyAverage = roundAverage((yearCounts.get(modality) ?? 0) / yearWeeksElapsed);
    const expectedWeeklyReference = yearWeeksElapsed >= 3 ? Math.max(monthWeeklyAverage, yearWeeklyAverage) : 0;
    const expectedWeekSessions = expectedWeeklyReference > 0
      ? roundAverage(expectedWeeklyReference * getPeriodProgress("week", reference))
      : null;

    return {
      modality,
      label: modalityLabels[modality],
      weekSessions,
      expectedWeekSessions,
      paceLabel: getTrainingMixPaceLabel(weekSessions, expectedWeekSessions, reference),
      monthWeeklyAverage,
      yearWeeklyAverage,
      trend: getTrainingMixTrend(weekSessions, expectedWeekSessions ?? monthWeeklyAverage),
    };
  });
}

export function getTrainingMixTrend(weekSessions: number, expectedSessions: number): TrainingMixTrend {
  if (expectedSessions <= 0) {
    return "range";
  }

  if (weekSessions > expectedSessions * 1.2) {
    return "above";
  }

  if (weekSessions < expectedSessions * 0.8) {
    return "below";
  }

  return "range";
}

function getTrainingMixPaceLabel(weekSessions: number, expectedSessions: number | null, reference: Date) {
  if (expectedSessions === null) {
    return "Referencia insuficiente";
  }

  const trend = getTrainingMixTrend(weekSessions, expectedSessions);

  if (trend === "above") {
    return "Por encima del ritmo esperado";
  }

  if (trend === "below") {
    return "Por debajo del ritmo esperado";
  }

  return `En ritmo para ${getPeriodProgressLabel("week", reference)}`;
}
