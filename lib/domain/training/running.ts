import { getPeriodRange, getPreviousPeriodRange, isDateInRange } from "@/lib/domain/dashboard/periods";
import { getSessionRunMeters } from "@/lib/domain/training/run-exposure";
import { isPureRunningSession } from "@/lib/domain/training/session-kind";
import { getWeekKey } from "@/lib/selectors/training";
import type { TrainingSession } from "@/types/training";

export type RunningContext = "pure" | "hyrox-crossfit" | "mixed";

export type RunningSessionRow = {
  session: TrainingSession;
  runMeters: number;
  durationMinutes: number | null;
  paceSecondsPerKm: number | null;
  averageHeartRate: number | null;
  context: RunningContext;
};

export type RunningPeriodStats = {
  runMeters: number;
  sessions: number;
  durationMinutes: number;
  averageRpe: number | null;
};

export type RunningWeekSummary = {
  weekKey: string;
  runMeters: number;
  sessions: number;
};

export type RunningShoeVolume = {
  shoes: string;
  runMeters: number;
  sessions: number;
};

export { getSessionRunMeters } from "@/lib/domain/training/run-exposure";

export function getRunningContext(session: TrainingSession): RunningContext {
  if (isPureRunningSession(session)) {
    return "pure";
  }

  if (session.type === "hyrox" || session.type === "crossfit") {
    return "hyrox-crossfit";
  }

  return "mixed";
}

export function getRunningShoeVolumes(rows: RunningSessionRow[]): RunningShoeVolume[] {
  const summaries = rows
    .filter((row) => isPureRunningSession(row.session))
    .reduce<Record<string, RunningShoeVolume>>((volumes, row) => {
      const shoes = row.session.equipment?.shoes?.trim() || "Sin zapatilla registrada";
      volumes[shoes] = volumes[shoes] ?? { shoes, runMeters: 0, sessions: 0 };
      volumes[shoes].runMeters += row.runMeters;
      volumes[shoes].sessions += 1;
      return volumes;
    }, {});

  return Object.values(summaries).sort((a, b) => b.runMeters - a.runMeters);
}

function collectSearchText(session: TrainingSession) {
  const blockText = session.blocks.flatMap((block) => [
    block.name,
    block.notes,
    block.blockResult,
    ...block.exercises.flatMap((exercise) => [exercise.name, exercise.canonicalName, exercise.notes]),
  ]);

  return [
    session.rawText,
    session.notes,
    session.feeling,
    session.result?.score,
    session.result?.notes,
    session.importNotes,
    ...session.tags,
    ...blockText,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getAverageHeartRate(session: TrainingSession) {
  const text = collectSearchText(session);
  const patterns = [
    /(?:fc\s*media|frecuencia\s*cardiaca\s*media|avg\s*hr|average\s*hr)\D{0,12}(\d{2,3})/i,
    /(\d{2,3})\s*(?:bpm|ppm)\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = match ? Number(match[1]) : null;

    if (value && value >= 40 && value <= 230) {
      return value;
    }
  }

  return null;
}

export function getRunningSessionRows(sessions: TrainingSession[]): RunningSessionRow[] {
  return sessions
    .filter(isPureRunningSession)
    .map((session) => {
      const runMeters = getSessionRunMeters(session);
      const durationMinutes = session.durationMinutes;
      const paceSecondsPerKm = runMeters > 0 && durationMinutes ? Math.round((durationMinutes * 60) / (runMeters / 1000)) : null;

      return {
        session,
        runMeters,
        durationMinutes,
        paceSecondsPerKm,
        averageHeartRate: getAverageHeartRate(session),
        context: getRunningContext(session),
      };
    })
    .filter((row) => row.runMeters > 0 || row.session.type === "running")
    .sort((a, b) => new Date(b.session.date).getTime() - new Date(a.session.date).getTime());
}

export function summarizeRunning(rows: RunningSessionRow[]): RunningPeriodStats {
  const rowsWithRpe = rows.filter((row) => typeof row.session.rpe === "number" && row.session.rpe > 0);
  const totalRpe = rowsWithRpe.reduce((total, row) => total + (row.session.rpe ?? 0), 0);

  return {
    runMeters: rows.reduce((total, row) => total + row.runMeters, 0),
    sessions: rows.length,
    durationMinutes: rows.reduce((total, row) => total + (row.durationMinutes ?? 0), 0),
    averageRpe: rowsWithRpe.length > 0 ? Number((totalRpe / rowsWithRpe.length).toFixed(1)) : null,
  };
}

export function getCurrentRunningPeriods(rows: RunningSessionRow[], today: Date = new Date()) {
  const weekRange = getPeriodRange("week", today);
  const monthRange = getPeriodRange("month", today);
  const previousWeekRange = getPreviousPeriodRange("week", today);
  const weekRows = weekRange ? rows.filter((row) => isDateInRange(row.session.date, weekRange)) : [];
  const monthRows = monthRange ? rows.filter((row) => isDateInRange(row.session.date, monthRange)) : [];
  const previousWeekRows = previousWeekRange ? rows.filter((row) => isDateInRange(row.session.date, previousWeekRange)) : [];

  return {
    weekRows,
    monthRows,
    previousWeekRows,
    week: summarizeRunning(weekRows),
    month: summarizeRunning(monthRows),
    previousWeek: summarizeRunning(previousWeekRows),
  };
}

export function groupRunningByCalendarWeek(rows: RunningSessionRow[], limit = 10): RunningWeekSummary[] {
  const summaries = rows.reduce<Record<string, RunningWeekSummary>>((weeks, row) => {
    const weekKey = getWeekKey(row.session.date);
    weeks[weekKey] = weeks[weekKey] ?? { weekKey, runMeters: 0, sessions: 0 };
    weeks[weekKey].runMeters += row.runMeters;
    weeks[weekKey].sessions += 1;
    return weeks;
  }, {});

  return Object.values(summaries)
    .sort((a, b) => b.weekKey.localeCompare(a.weekKey))
    .slice(0, limit)
    .reverse();
}

export function getRunningContextTotals(rows: RunningSessionRow[]) {
  return rows.reduce(
    (totals, row) => {
      totals[row.context] += row.runMeters;
      return totals;
    },
    { pure: 0, "hyrox-crossfit": 0, mixed: 0 } satisfies Record<RunningContext, number>,
  );
}
