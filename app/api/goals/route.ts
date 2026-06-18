import { NextResponse } from "next/server";
import { requireAllowedUser } from "@/lib/auth/require-allowed-user";
import { getGoalProfileDefaults, getGoalProfileMeta } from "@/lib/goals/goal-profiles";
import { createGoalBlock, getActiveGoalBlock, getGoalBlocks, isGoalBlocksDatabaseConfigured } from "@/lib/supabase/goal-blocks";
import { normalizeGoalBlockInput } from "@/types/goals";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store, max-age=0");

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

export async function GET() {
  const auth = await requireAllowedUser();

  if (!auth.ok) {
    return auth.response;
  }

  if (!isGoalBlocksDatabaseConfigured()) {
    return jsonNoStore({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const [activeGoal, goals] = await Promise.all([
      getActiveGoalBlock(auth.user.id),
      getGoalBlocks(auth.user.id),
    ]);

    return jsonNoStore({ activeGoal, goals });
  } catch {
    return jsonNoStore({ error: "Could not load goals." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAllowedUser();

  if (!auth.ok) {
    return auth.response;
  }

  if (!isGoalBlocksDatabaseConfigured()) {
    return jsonNoStore({ error: "Supabase is not configured." }, { status: 503 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = normalizeGoalBlockInput(body);

  if (!result.ok) {
    return jsonNoStore({ error: result.error }, { status: 400 });
  }

  const defaults = getGoalProfileDefaults(result.value.profile);
  const title = result.value.title || getGoalProfileMeta(result.value.profile).title;

  try {
    const goal = await createGoalBlock(auth.user.id, {
      ...result.value,
      title,
      targets: Object.keys(result.value.targets ?? {}).length > 0 ? result.value.targets : defaults,
    });

    return jsonNoStore({ goal }, { status: 201 });
  } catch {
    return jsonNoStore({ error: "Could not create goal." }, { status: 500 });
  }
}
