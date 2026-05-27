import type { TrainingSession } from "@/types/training";

export type DashboardPeriod = "week" | "month" | "year" | "all";

export type PeriodRange = {
  start: Date;
  end: Date;
};

export const dashboardPeriods: Array<{ value: DashboardPeriod; label: string }> = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
  { value: "all", label: "Todo" },
];

export function parseDashboardDate(date: string | Date) {
  const parsed = date instanceof Date ? new Date(date) : new Date(`${date}T00:00:00`);
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const start = parseDashboardDate(date);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - (day - 1));
  return start;
}

function endOfWeek(date: Date) {
  return endOfDay(addDays(startOfWeek(date), 6));
}

function startOfMonth(date: Date) {
  const current = parseDashboardDate(date);
  return new Date(current.getFullYear(), current.getMonth(), 1);
}

function endOfMonth(date: Date) {
  const current = parseDashboardDate(date);
  return endOfDay(new Date(current.getFullYear(), current.getMonth() + 1, 0));
}

function startOfYear(date: Date) {
  const current = parseDashboardDate(date);
  return new Date(current.getFullYear(), 0, 1);
}

function endOfYear(date: Date) {
  const current = parseDashboardDate(date);
  return endOfDay(new Date(current.getFullYear(), 11, 31));
}

export function getLatestDate<T extends { date: string }>(items: T[]) {
  if (items.length === 0) {
    return null;
  }

  return items.reduce<Date | null>((latest, item) => {
    const current = parseDashboardDate(item.date);
    return !latest || current.getTime() > latest.getTime() ? current : latest;
  }, null);
}

export function resolvePeriodReferenceDate(period: DashboardPeriod, latestDate: Date | null, today: Date = new Date()) {
  const currentDate = parseDashboardDate(today);

  if (!latestDate || period === "all") {
    return currentDate;
  }

  const currentRange = getPeriodRange(period, currentDate);

  if (currentRange && latestDate.getTime() >= currentRange.start.getTime() && latestDate.getTime() <= currentRange.end.getTime()) {
    return currentDate;
  }

  return latestDate;
}

export function getPeriodRange(period: DashboardPeriod, referenceDate: string | Date = new Date()) {
  if (period === "all") {
    return null;
  }

  const reference = parseDashboardDate(referenceDate);

  if (period === "week") {
    return { start: startOfWeek(reference), end: endOfWeek(reference) };
  }

  if (period === "month") {
    return { start: startOfMonth(reference), end: endOfMonth(reference) };
  }

  const start = startOfYear(reference);
  const end = endOfYear(reference);

  return { start, end };
}

export function getPreviousPeriodRange(period: DashboardPeriod, referenceDate: string | Date = new Date()) {
  if (period === "all") {
    return null;
  }

  const currentRange = getPeriodRange(period, referenceDate);

  if (!currentRange) {
    return null;
  }

  if (period === "week") {
    const previousReference = addDays(currentRange.start, -1);
    return { start: startOfWeek(previousReference), end: endOfWeek(previousReference) };
  }

  if (period === "month") {
    const previousReference = new Date(currentRange.start.getFullYear(), currentRange.start.getMonth() - 1, 1);
    return { start: startOfMonth(previousReference), end: endOfMonth(previousReference) };
  }

  const previousReference = new Date(currentRange.start.getFullYear() - 1, 0, 1);
  const start = startOfYear(previousReference);
  const end = endOfYear(previousReference);

  return { start, end };
}

export function isDateInRange(date: string, range: PeriodRange) {
  const time = parseDashboardDate(date).getTime();
  return time >= range.start.getTime() && time <= range.end.getTime();
}

export function filterSessionsByPeriod(sessions: TrainingSession[], period: DashboardPeriod) {
  if (period === "all") {
    return sessions;
  }

  const referenceDate = resolvePeriodReferenceDate(period, getLatestDate(sessions));

  if (!referenceDate) {
    return [];
  }

  const range = getPeriodRange(period, referenceDate);
  return range ? sessions.filter((session) => isDateInRange(session.date, range)) : sessions;
}

export function getPeriodTitle(period: DashboardPeriod) {
  const labels: Record<DashboardPeriod, string> = {
    week: "Semana activa",
    month: "Mes activo",
    year: "Año activo",
    all: "Histórico completo",
  };

  return labels[period];
}

export function getPeriodDetail(period: DashboardPeriod) {
  const labels: Record<DashboardPeriod, string> = {
    week: "Semana actual",
    month: "Mes actual",
    year: "Año actual",
    all: "Histórico completo",
  };

  return labels[period];
}

export function getPreviousPeriodLabel(period: DashboardPeriod) {
  const labels: Record<DashboardPeriod, string> = {
    week: "semana anterior",
    month: "mes anterior",
    year: "año anterior",
    all: "histórico completo",
  };

  return labels[period];
}
