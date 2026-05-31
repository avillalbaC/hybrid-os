import { NextResponse } from "next/server";
import { requireAllowedUser } from "@/lib/auth/require-allowed-user";
import { isTrainingSessionsDatabaseConfigured, listRemoteTrainingSessions } from "@/lib/supabase/training-sessions";

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
    const sessions = await listRemoteTrainingSessions();
    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ error: "Could not load training sessions." }, { status: 500 });
  }
}
