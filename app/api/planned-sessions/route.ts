import { NextResponse } from "next/server";
import { requireAllowedUser } from "@/lib/auth/require-allowed-user";
import { getPeriodRange } from "@/lib/domain/dashboard/periods";
import {
  createPlannedSession,
  getPlannedSessionsRange,
  isPlannedSessionsDatabaseConfigured,
} from "@/lib/supabase/planned-sessions";
import { normalizePlannedSessionInput } from "@/types/planning";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDefaultWeekRange() {
  const range = getPeriodRange("week", new Date());

  if (!range) {
    const today = formatLocalDate(new Date());
    return { start: today, end: today };
  }

  return {
    start: formatLocalDate(range.start),
    end: formatLocalDate(range.end),
  };
}

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

  if (!isPlannedSessionsDatabaseConfigured()) {
    return jsonNoStore({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const defaults = getDefaultWeekRange();
  const start = searchParams.get("start") ?? defaults.start;
  const end = searchParams.get("end") ?? defaults.end;
  const goalBlockId = searchParams.get("goalBlockId");

  if (!datePattern.test(start) || !datePattern.test(end)) {
    return jsonNoStore({ error: "start and end must use YYYY-MM-DD." }, { status: 400 });
  }

  if (start > end) {
    return jsonNoStore({ error: "start must be before or equal to end." }, { status: 400 });
  }

  try {
    const plannedSessions = await getPlannedSessionsRange(auth.user.id, start, end, goalBlockId);
    return jsonNoStore({ plannedSessions });
  } catch {
    return jsonNoStore({ error: "Could not load planned sessions." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAllowedUser();

  if (!auth.ok) {
    return auth.response;
  }

  if (!isPlannedSessionsDatabaseConfigured()) {
    return jsonNoStore({ error: "Supabase is not configured." }, { status: 503 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = normalizePlannedSessionInput(body);

  if (!result.ok) {
    return jsonNoStore({ error: result.error }, { status: 400 });
  }

  try {
    const plannedSession = await createPlannedSession(auth.user.id, result.value);
    return jsonNoStore({ plannedSession }, { status: 201 });
  } catch {
    return jsonNoStore({ error: "Could not create planned session." }, { status: 500 });
  }
}
