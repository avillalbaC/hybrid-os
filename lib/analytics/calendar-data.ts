import {
  addDaysToDateKey,
  formatMonthLabel,
  getCalendarGridRange,
  getLocalDateKey,
  getMonthEnd,
  getMonthStart,
  parseLocalDateKey,
} from "@/lib/date/local-date";
import { getPriorityStatus, type DailyEntry } from "@/types/daily";
import type {
  CalendarDay,
  CalendarDayIntensity,
  CalendarDaySession,
  CalendarDiscipline,
  CalendarMonthData,
} from "@/types/calendar";
import type { TrainingSession, TrainingSessionType } from "@/types/training";

export type BuildCalendarMonthDataInput = {
  sessions: TrainingSession[];
  dailyEntries?: DailyEntry[];
  monthDate: string;
  selectedDate?: string;
  todayDate?: string;
};

const calendarDisciplines: CalendarDiscipline[] = [
  "running",
  "hyrox",
  "crossfit",
  "fuerza",
  "halterofilia",
  "gimnasticos",
  "movilidad",
  "actividad_funcional",
  "mixed",
  "other",
];

function toCalendarDiscipline(type: TrainingSessionType | string): CalendarDiscipline {
  if (calendarDisciplines.includes(type as CalendarDiscipline)) {
    return type as CalendarDiscipline;
  }

  return "other";
}

function createEmptyDisciplineCounts() {
  return calendarDisciplines.reduce<Record<CalendarDiscipline, number>>((counts, discipline) => {
    counts[discipline] = 0;
    return counts;
  }, {} as Record<CalendarDiscipline, number>);
}

function getSessionDateKey(session: TrainingSession) {
  return session.date;
}

function getCalendarSession(session: TrainingSession): CalendarDaySession {
  return {
    id: session.id,
    title: session.title,
    type: toCalendarDiscipline(session.type),
    date: session.date,
    durationMinutes: session.durationMinutes,
    rpe: session.rpe,
    runningDistanceMeters: session.sessionMetrics.totalRunMeters,
    resultLabel: session.result?.score ?? session.result?.notes ?? null,
  };
}

function groupSessionsByDate(sessions: TrainingSession[]) {
  return sessions.reduce<Map<string, TrainingSession[]>>((groups, session) => {
    if (session.status === "cancelled") {
      return groups;
    }

    const dateKey = getSessionDateKey(session);
    const currentSessions = groups.get(dateKey) ?? [];
    groups.set(dateKey, [...currentSessions, session]);
    return groups;
  }, new Map<string, TrainingSession[]>());
}

function groupDailyEntriesByDate(dailyEntries: DailyEntry[]) {
  return dailyEntries.reduce<Map<string, DailyEntry>>((groups, entry) => {
    groups.set(entry.entryDate, entry);
    return groups;
  }, new Map<string, DailyEntry>());
}

function uniqueDisciplines(sessions: TrainingSession[]) {
  return Array.from(new Set(sessions.map((session) => toCalendarDiscipline(session.type))));
}

function getPrimaryDiscipline(sessions: TrainingSession[]): CalendarDiscipline | null {
  if (sessions.length === 0) {
    return null;
  }

  const counts = sessions.reduce<Partial<Record<CalendarDiscipline, number>>>((result, session) => {
    const discipline = toCalendarDiscipline(session.type);
    result[discipline] = (result[discipline] ?? 0) + 1;
    return result;
  }, {});

  const ranked = Object.entries(counts).sort(([, a], [, b]) => b - a);
  const top = ranked[0];

  if (!top) {
    return null;
  }

  return top[0] as CalendarDiscipline;
}

function getAverageRpe(sessions: TrainingSession[]) {
  const rpeValues = sessions
    .map((session) => session.rpe)
    .filter((rpe): rpe is number => typeof rpe === "number" && rpe > 0);

  if (rpeValues.length === 0) {
    return null;
  }

  return Number((rpeValues.reduce((total, rpe) => total + rpe, 0) / rpeValues.length).toFixed(1));
}

function hasCompetitionSignal(session: TrainingSession) {
  const searchableText = [
    session.title,
    session.objective,
    session.notes,
    session.result?.score,
    session.result?.notes,
    ...session.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes("competicion") || searchableText.includes("competición") || searchableText.includes("race");
}

export function calculateDayIntensity({
  sessions,
  mobilityDone,
}: {
  sessions: TrainingSession[];
  mobilityDone: boolean;
}): CalendarDayIntensity {
  if (sessions.length === 0) {
    return mobilityDone ? "low" : "none";
  }

  const totalDurationMinutes = sessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0);
  const averageRpe = getAverageRpe(sessions);
  const hasVeryHighSignal = sessions.some(hasCompetitionSignal);
  const hasHighDiscipline = sessions.some((session) => session.type === "hyrox" || session.type === "crossfit");
  const hasLongFunctionalSession = sessions.some(
    (session) => session.type === "actividad_funcional" && (session.durationMinutes ?? 0) > 120,
  );

  if (
    sessions.length >= 3 ||
    (sessions.length >= 2 && totalDurationMinutes > 120 && (averageRpe ?? 0) >= 8) ||
    (totalDurationMinutes > 150 && (averageRpe ?? 0) >= 8) ||
    hasVeryHighSignal ||
    hasLongFunctionalSession
  ) {
    return "very_high";
  }

  if (
    sessions.length >= 2 ||
    totalDurationMinutes > 75 ||
    (averageRpe ?? 0) >= 8 ||
    (hasHighDiscipline && (averageRpe ?? 0) >= 7)
  ) {
    return "high";
  }

  if (totalDurationMinutes > 30 || (averageRpe ?? 0) >= 5) {
    return "moderate";
  }

  return "low";
}

export function calculateDisciplineCounts(sessions: TrainingSession[]) {
  return sessions.reduce<Record<CalendarDiscipline, number>>((counts, session) => {
    if (session.status === "cancelled") {
      return counts;
    }

    const discipline = toCalendarDiscipline(session.type);
    counts[discipline] += 1;
    return counts;
  }, createEmptyDisciplineCounts());
}

function calculateDominantDiscipline(counts: Record<CalendarDiscipline, number>) {
  const ranked = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  if (ranked.length === 0) {
    return null;
  }

  if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) {
    return "mixed";
  }

  return ranked[0][0] as CalendarDiscipline;
}

export function calculateTrainingStreak(trainingDateKeys: Set<string>, todayDate = getLocalDateKey()) {
  let streak = 0;
  let currentDate = todayDate;

  while (trainingDateKeys.has(currentDate)) {
    streak += 1;
    currentDate = addDaysToDateKey(currentDate, -1);
  }

  return streak;
}

export function calculateMovementStreak(movementDateKeys: Set<string>, todayDate = getLocalDateKey()) {
  let streak = 0;
  let currentDate = todayDate;

  while (movementDateKeys.has(currentDate)) {
    streak += 1;
    currentDate = addDaysToDateKey(currentDate, -1);
  }

  return streak;
}

function calculateBestTrainingStreakInRange(trainingDateKeys: Set<string>, startDate: string, endDate: string) {
  let currentDate = startDate;
  let currentStreak = 0;
  let bestStreak = 0;

  while (currentDate <= endDate) {
    if (trainingDateKeys.has(currentDate)) {
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }

    currentDate = addDaysToDateKey(currentDate, 1);
  }

  return bestStreak;
}

export function buildCalendarDay({
  date,
  currentMonthStart,
  currentMonthEnd,
  selectedDate,
  todayDate,
  sessions,
  dailyEntry,
}: {
  date: string;
  currentMonthStart: string;
  currentMonthEnd: string;
  selectedDate: string;
  todayDate: string;
  sessions: TrainingSession[];
  dailyEntry?: DailyEntry | null;
}): CalendarDay {
  const parsedDate = parseLocalDateKey(date);
  const mobilityDone = Boolean(dailyEntry?.mobilityDone || sessions.some((session) => session.type === "movilidad"));
  const priorities = dailyEntry?.priorities ?? [];
  const prioritiesCompleted = priorities.filter((priority) => getPriorityStatus(priority) === "completed").length;
  const totalDurationMinutes = sessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0);
  const totalRunMeters = sessions.reduce((total, session) => total + session.sessionMetrics.totalRunMeters, 0);
  const hasTraining = sessions.length > 0;
  const hasMovement = hasTraining || mobilityDone;

  return {
    date,
    dayOfMonth: parsedDate?.getDate() ?? Number(date.slice(-2)),
    isCurrentMonth: date >= currentMonthStart && date <= currentMonthEnd,
    isToday: date === todayDate,
    isSelected: date === selectedDate,
    sessions: sessions.map(getCalendarSession),
    disciplines: uniqueDisciplines(sessions),
    primaryDiscipline: getPrimaryDiscipline(sessions),
    hasTraining,
    hasMovement,
    mobilityDone,
    mobilityMinutes: dailyEntry?.mobilityMinutes ?? null,
    dailyNote: dailyEntry?.dailyNote ?? null,
    prioritiesTotal: priorities.length,
    prioritiesCompleted,
    totalDurationMinutes,
    averageRpe: getAverageRpe(sessions),
    totalRunMeters,
    intensity: calculateDayIntensity({ sessions, mobilityDone }),
  };
}

export function buildCalendarMonthData({
  sessions,
  dailyEntries = [],
  monthDate,
  selectedDate,
  todayDate = getLocalDateKey(),
}: BuildCalendarMonthDataInput): CalendarMonthData {
  const monthStart = getMonthStart(monthDate);
  const monthEnd = getMonthEnd(monthDate);
  const selectedDateKey = selectedDate ?? todayDate;
  const gridRange = getCalendarGridRange(monthDate);
  const sessionsByDate = groupSessionsByDate(sessions);
  const dailyEntriesByDate = groupDailyEntriesByDate(dailyEntries);
  const trainingDateKeys = new Set(Array.from(sessionsByDate.entries()).filter(([, daySessions]) => daySessions.length > 0).map(([date]) => date));
  const mobilityDateKeys = new Set(
    [
      ...dailyEntries.filter((entry) => entry.mobilityDone).map((entry) => entry.entryDate),
      ...sessions.filter((session) => session.status !== "cancelled" && session.type === "movilidad").map((session) => session.date),
    ],
  );
  const movementDateKeys = new Set([...trainingDateKeys, ...mobilityDateKeys]);
  const monthSessions = sessions.filter((session) => session.status !== "cancelled" && session.date >= monthStart && session.date <= monthEnd);
  const disciplineCounts = calculateDisciplineCounts(monthSessions);
  const mobilityDays = new Set(
    [
      ...dailyEntries.filter((entry) => entry.entryDate >= monthStart && entry.entryDate <= monthEnd && entry.mobilityDone).map((entry) => entry.entryDate),
      ...monthSessions.filter((session) => session.type === "movilidad").map((session) => session.date),
    ],
  ).size;
  const days: CalendarDay[] = [];
  let currentDate = gridRange.start;

  while (currentDate <= gridRange.end) {
    days.push(buildCalendarDay({
      date: currentDate,
      currentMonthStart: monthStart,
      currentMonthEnd: monthEnd,
      selectedDate: selectedDateKey,
      todayDate,
      sessions: sessionsByDate.get(currentDate) ?? [],
      dailyEntry: dailyEntriesByDate.get(currentDate) ?? null,
    }));
    currentDate = addDaysToDateKey(currentDate, 1);
  }

  return {
    days,
    summary: {
      monthLabel: formatMonthLabel(monthStart),
      monthStart,
      monthEnd,
      trainingDays: Array.from(trainingDateKeys).filter((date) => date >= monthStart && date <= monthEnd).length,
      movementDays: Array.from(movementDateKeys).filter((date) => date >= monthStart && date <= monthEnd).length,
      sessionsCount: monthSessions.length,
      mobilityDays,
      currentTrainingStreak: calculateTrainingStreak(trainingDateKeys, todayDate),
      currentMovementStreak: calculateMovementStreak(movementDateKeys, todayDate),
      bestTrainingStreakInMonth: calculateBestTrainingStreakInRange(trainingDateKeys, monthStart, monthEnd),
      disciplineCounts,
      dominantDiscipline: calculateDominantDiscipline(disciplineCounts),
    },
  };
}
