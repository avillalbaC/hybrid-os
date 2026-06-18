import { NextResponse } from "next/server";
import { requireAllowedUser } from "@/lib/auth/require-allowed-user";
import { getGoalProfileDefaults, getGoalProfileMeta } from "@/lib/goals/goal-profiles";
import { createGoalBlock, getActiveGoalBlock, isGoalBlocksDatabaseConfigured, updateGoalBlock } from "@/lib/supabase/goal-blocks";
import { normalizeActiveGoalInput } from "@/types/goals";

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

function getLocalDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
    const activeGoal = await getActiveGoalBlock(auth.user.id);
    return jsonNoStore({ activeGoal });
  } catch {
    return jsonNoStore({ error: "Could not load active goal." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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

  const result = normalizeActiveGoalInput(body);

  if (!result.ok) {
    return jsonNoStore({ error: result.error }, { status: 400 });
  }

  try {
    const activeGoal = await getActiveGoalBlock(auth.user.id);
    const profile = result.value.profile ?? activeGoal?.profile ?? "recomposition";
    const targets = result.value.targets && Object.keys(result.value.targets).length > 0
      ? result.value.targets
      : result.value.profile && result.value.profile !== activeGoal?.profile
        ? getGoalProfileDefaults(profile)
        : activeGoal?.targets ?? getGoalProfileDefaults(profile);
    const title = result.value.title ?? activeGoal?.title ?? getGoalProfileMeta(profile).title;

    if (!activeGoal) {
      const createdGoal = await createGoalBlock(auth.user.id, {
        title,
        profile,
        status: "active",
        startDate: result.value.startDate ?? getLocalDateKey(),
        endDate: result.value.endDate ?? null,
        targets,
        notes: result.value.notes ?? null,
      });

      return jsonNoStore({ activeGoal: createdGoal });
    }

    const updatedGoal = await updateGoalBlock(auth.user.id, activeGoal.id, {
      title,
      profile,
      status: "active",
      startDate: result.value.startDate ?? activeGoal.startDate,
      endDate: result.value.endDate !== undefined ? result.value.endDate : activeGoal.endDate,
      targets,
      notes: result.value.notes !== undefined ? result.value.notes : activeGoal.notes,
    });

    return jsonNoStore({ activeGoal: updatedGoal });
  } catch {
    return jsonNoStore({ error: "Could not save active goal." }, { status: 500 });
  }
}
