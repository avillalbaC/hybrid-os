import { NextResponse } from "next/server";
import { evaluateWeeklyPlan, getPlanningWeekBounds } from "@/lib/analytics/planning-evaluation";
import { requireAllowedUser } from "@/lib/auth/require-allowed-user";
import { getDailyEntriesRange, isDailyEntriesDatabaseConfigured } from "@/lib/supabase/daily-entries";
import { getActiveGoalBlock, isGoalBlocksDatabaseConfigured } from "@/lib/supabase/goal-blocks";
import { getPlannedSessionsRange, isPlannedSessionsDatabaseConfigured } from "@/lib/supabase/planned-sessions";
import { isTrainingSessionsDatabaseConfigured, listRemoteTrainingSessions } from "@/lib/supabase/training-sessions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store, max-age=0");

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

export async function GET(request: Request) {
  const auth = await requireAllowedUser();

  if (!auth.ok) {
    return auth.response;
  }

  if (!isPlannedSessionsDatabaseConfigured() || !isTrainingSessionsDatabaseConfigured()) {
    return jsonNoStore({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const defaults = getPlanningWeekBounds();
  const weekStart = searchParams.get("weekStart") ?? defaults.weekStart;
  const weekEnd = searchParams.get("weekEnd") ?? defaults.weekEnd;

  if (!datePattern.test(weekStart) || !datePattern.test(weekEnd)) {
    return jsonNoStore({ error: "weekStart and weekEnd must use YYYY-MM-DD." }, { status: 400 });
  }

  if (weekStart > weekEnd) {
    return jsonNoStore({ error: "weekStart must be before or equal to weekEnd." }, { status: 400 });
  }

  try {
    const [plannedSessions, trainingSessions, dailyEntries, activeGoal] = await Promise.all([
      getPlannedSessionsRange(auth.user.id, weekStart, weekEnd),
      listRemoteTrainingSessions(auth.user.id),
      isDailyEntriesDatabaseConfigured() ? getDailyEntriesRange(auth.user.id, weekStart, weekEnd) : Promise.resolve([]),
      isGoalBlocksDatabaseConfigured() ? getActiveGoalBlock(auth.user.id) : Promise.resolve(null),
    ]);
    const evaluation = evaluateWeeklyPlan({
      plannedSessions,
      trainingSessions,
      dailyEntries,
      activeGoal,
      referenceDate: new Date(`${weekStart}T00:00:00`),
    });

    return jsonNoStore({
      summary: evaluation.summary,
      plannedSessions,
      matches: evaluation.matches,
      unplannedSessions: evaluation.unplannedSessions,
    });
  } catch {
    return jsonNoStore({ error: "Could not load weekly planning summary." }, { status: 500 });
  }
}
