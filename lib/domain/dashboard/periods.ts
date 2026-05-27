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

const periodDays: Record<Exclude<DashboardPeriod, "all">, number> = {
  week: 7,
  month: 30,
  year: 365,
};

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

export function getLatestDate<T extends { date: string }>(items: T[]) {
  if (items.length === 0) {
    return null;
  }

  return items.reduce<Date | null>((latest, item) => {
    const current = parseDashboardDate(item.date);
    return !latest || current.getTime() > latest.getTime() ? current : latest;
  }, null);
}

export function getPeriodRange(period: DashboardPeriod, referenceDate: string | Date = new Date()) {
  if (period === "all") {
    return null;
  }

  const end = endOfDay(parseDashboardDate(referenceDate));
  const start = addDays(parseDashboardDate(referenceDate), -(periodDays[period] - 1));

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

  const end = endOfDay(addDays(currentRange.start, -1));
  const start = addDays(currentRange.start, -periodDays[period]);

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

  const referenceDate = getLatestDate(sessions);

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
    week: "Últimos 7 días",
    month: "Últimos 30 días",
    year: "Últimos 365 días",
    all: "Todos los registros",
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
