const dateKeyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseLocalDateKey(dateKey: string) {
  const match = dateKey.match(dateKeyPattern);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function toDateKeyParts(dateKey: string) {
  const date = parseLocalDateKey(dateKey);

  if (!date) {
    return null;
  }

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const date = parseLocalDateKey(dateKey);

  if (!date) {
    return dateKey;
  }

  date.setDate(date.getDate() + days);

  return getLocalDateKey(date);
}

export function addMonthsToDateKey(dateKey: string, months: number) {
  const date = parseLocalDateKey(dateKey);

  if (!date) {
    return dateKey;
  }

  return getLocalDateKey(new Date(date.getFullYear(), date.getMonth() + months, 1));
}

export function getMonthStart(dateKey: string) {
  const parts = toDateKeyParts(dateKey);

  if (!parts) {
    return dateKey;
  }

  return getLocalDateKey(new Date(parts.year, parts.month, 1));
}

export function getMonthEnd(dateKey: string) {
  const parts = toDateKeyParts(dateKey);

  if (!parts) {
    return dateKey;
  }

  return getLocalDateKey(new Date(parts.year, parts.month + 1, 0));
}

export function getCalendarGridRange(monthDateKey: string) {
  const monthStart = getMonthStart(monthDateKey);
  const monthEnd = getMonthEnd(monthDateKey);
  const startDate = parseLocalDateKey(monthStart);
  const endDate = parseLocalDateKey(monthEnd);

  if (!startDate || !endDate) {
    return { start: monthDateKey, end: monthDateKey };
  }

  const startOffset = (startDate.getDay() + 6) % 7;
  const endOffset = 6 - ((endDate.getDay() + 6) % 7);

  return {
    start: addDaysToDateKey(monthStart, -startOffset),
    end: addDaysToDateKey(monthEnd, endOffset),
  };
}

export function formatMonthLabel(dateKey: string) {
  const date = parseLocalDateKey(dateKey);

  if (!date) {
    return dateKey;
  }

  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDayShort(dateKey: string) {
  const date = parseLocalDateKey(dateKey);

  if (!date) {
    return dateKey;
  }

  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function isTodayDateKey(dateKey: string) {
  return dateKey === getLocalDateKey();
}
