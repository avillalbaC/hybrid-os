import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/fake-auth";
import {
  isTrainingSessionsDatabaseConfigured,
  listRemoteBodyChecks,
  listRemoteNutritionChecks,
  listRemoteTrainingSessions,
} from "@/lib/supabase/training-sessions";

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
    const [sessions, bodyChecks, nutritionChecks] = await Promise.all([
      listRemoteTrainingSessions(),
      listRemoteBodyChecks(),
      listRemoteNutritionChecks(),
    ]);

    return NextResponse.json({ sessions, bodyChecks, nutritionChecks });
  } catch {
    return NextResponse.json({ error: "Could not load dashboard data." }, { status: 500 });
  }
}
