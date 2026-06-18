const dateKeyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const isoWeekKeyPattern = /^(\d{4})-W(\d{1,2})$/;

const monthLabels = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function parseDateKey(value: string) {
  const match = value.match(dateKeyPattern);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  return date;
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - (day - 1));
  return start;
}

function parseWeekStart(weekStart: string) {
  const date = parseDateKey(weekStart);

  if (date) {
    return date;
  }

  const weekKeyStart = getWeekStartFromWeekKey(weekStart);
  return weekKeyStart ? parseDateKey(weekKeyStart) : null;
}

function getDayDiff(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

export function getWeekStartDateKey(date: string | Date) {
  const parsed = date instanceof Date ? new Date(date) : parseDateKey(date);

  if (!parsed) {
    return typeof date === "string" ? date : formatDateKey(date);
  }

  return formatDateKey(startOfWeek(parsed));
}

export function getWeekDateRange(weekStart: string) {
  const start = parseWeekStart(weekStart);

  if (!start) {
    return {
      startDate: weekStart,
      endDate: weekStart,
    };
  }

  return {
    startDate: formatDateKey(start),
    endDate: formatDateKey(addDays(start, 6)),
  };
}

export function formatWeekRangeLabel(weekStart: string) {
  const start = parseWeekStart(weekStart);

  if (!start) {
    return weekStart;
  }

  const end = addDays(start, 6);
  const startMonth = monthLabels[start.getMonth()];
  const endMonth = monthLabels[end.getMonth()];

  if (start.getFullYear() !== end.getFullYear()) {
    return `${start.getDate()} ${startMonth} ${start.getFullYear()}–${end.getDate()} ${endMonth} ${end.getFullYear()}`;
  }

  if (start.getMonth() !== end.getMonth()) {
    return `${start.getDate()} ${startMonth}–${end.getDate()} ${endMonth}`;
  }

  return `${start.getDate()}–${end.getDate()} ${startMonth}`;
}

export function formatRelativeWeekLabel(weekStart: string, currentWeekStart: string) {
  const start = parseWeekStart(weekStart);
  const current = parseWeekStart(currentWeekStart);
  const rangeLabel = formatWeekRangeLabel(weekStart);

  if (!start || !current) {
    return rangeLabel;
  }

  const diff = getDayDiff(start, current);

  if (diff === 0) {
    return `Esta semana · ${rangeLabel}`;
  }

  if (diff === -7) {
    return `Semana anterior · ${rangeLabel}`;
  }

  return rangeLabel;
}

export function formatWeekMetaLabel(weekKey: string, options: { includeYear?: boolean } = {}) {
  const isoMatch = weekKey.match(isoWeekKeyPattern);

  if (isoMatch) {
    const year = isoMatch[1];
    const week = String(Number(isoMatch[2])).padStart(2, "0");
    return options.includeYear ? `${year}-W${week}` : `W${week}`;
  }

  const shortMatch = weekKey.match(/^W(\d{1,2})$/);

  if (shortMatch) {
    return `W${String(Number(shortMatch[1])).padStart(2, "0")}`;
  }

  return weekKey;
}

export function getCurrentWeekStartLocal() {
  return formatDateKey(startOfWeek(new Date()));
}

export function getWeekStartFromWeekKey(weekKey: string) {
  const match = weekKey.match(isoWeekKeyPattern);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const week = Number(match[2]);
  const januaryFourth = new Date(year, 0, 4);
  const firstWeekStart = startOfWeek(januaryFourth);

  return formatDateKey(addDays(firstWeekStart, (week - 1) * 7));
}

export function getWeekKeyForDate(date: string | Date) {
  const parsed = date instanceof Date ? new Date(date) : parseDateKey(date);

  if (!parsed) {
    return typeof date === "string" ? date : formatDateKey(date);
  }

  const current = new Date(parsed);
  const day = current.getDay() || 7;
  current.setDate(current.getDate() + 4 - day);
  const yearStart = new Date(current.getFullYear(), 0, 1);
  const week = Math.ceil(((current.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return `${current.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function isCurrentWeekStart(weekStart: string) {
  return getWeekDateRange(weekStart).startDate === getCurrentWeekStartLocal();
}

export function isCurrentWeekKey(weekKey: string) {
  const weekStart = getWeekStartFromWeekKey(weekKey);
  return weekStart ? isCurrentWeekStart(weekStart) : false;
}
