import { NextResponse } from "next/server";
import { requireAllowedUser } from "@/lib/auth/require-allowed-user";
import { getDailyEntriesRange, isDailyEntriesDatabaseConfigured } from "@/lib/supabase/daily-entries";

export const dynamic = "force-dynamic";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const auth = await requireAllowedUser();

  if (!auth.ok) {
    return auth.response;
  }

  if (!isDailyEntriesDatabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end || !datePattern.test(start) || !datePattern.test(end)) {
    return NextResponse.json({ error: "start and end must use YYYY-MM-DD." }, { status: 400 });
  }

  if (start > end) {
    return NextResponse.json({ error: "start must be before or equal to end." }, { status: 400 });
  }

  try {
    const entries = await getDailyEntriesRange(auth.user.id, start, end);
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ error: "Could not load daily entries." }, { status: 500 });
  }
}
