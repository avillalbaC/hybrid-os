import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/fake-auth";
import { isTrainingSessionsDatabaseConfigured, listRemoteTrainingSessions } from "@/lib/supabase/training-sessions";

export const dynamic = "force-dynamic";

function isAuthenticated() {
  return cookies().get(AUTH_COOKIE_NAME)?.value === "true";
}

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isTrainingSessionsDatabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const sessions = await listRemoteTrainingSessions();
    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ error: "Could not load training sessions." }, { status: 500 });
  }
}

