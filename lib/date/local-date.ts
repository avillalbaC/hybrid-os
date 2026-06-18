const dateKeyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDateKey(dateKey: string) {
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

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const date = parseDateKey(dateKey);

  if (!date) {
    return dateKey;
  }

  date.setDate(date.getDate() + days);

  return getLocalDateKey(date);
}
