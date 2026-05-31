import { NextResponse } from "next/server";
import { requireAllowedUser } from "@/lib/auth/require-allowed-user";
import {
  isTrainingSessionsDatabaseConfigured,
  listRemoteBodyChecks,
  listRemoteNutritionChecks,
  listRemoteTrainingSessions,
} from "@/lib/supabase/training-sessions";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAllowedUser();

  if (!auth.ok) {
    return auth.response;
  }

  if (!isTrainingSessionsDatabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const [sessions, bodyChecks, nutritionChecks] = await Promise.all([
      listRemoteTrainingSessions(auth.user.id),
      listRemoteBodyChecks(auth.user.id),
      listRemoteNutritionChecks(auth.user.id),
    ]);

    return NextResponse.json({ sessions, bodyChecks, nutritionChecks });
  } catch {
    return NextResponse.json({ error: "Could not load dashboard data." }, { status: 500 });
  }
}
