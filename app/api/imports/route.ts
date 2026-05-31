import { NextResponse } from "next/server";
import { requireAllowedUser } from "@/lib/auth/require-allowed-user";
import { saveAppInputs } from "@/lib/imports/save-app-input";
import { isTrainingSessionsDatabaseConfigured } from "@/lib/supabase/training-sessions";

export const dynamic = "force-dynamic";

function hasProperty<T extends string>(value: unknown, property: T): value is Record<T, unknown> {
  return typeof value === "object" && value !== null && property in value;
}

export async function POST(request: Request) {
  const auth = await requireAllowedUser();

  if (!auth.ok) {
    return auth.response;
  }

  if (!isTrainingSessionsDatabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const inputPayload = typeof body === "object" && body !== null && "inputs" in body
    ? (body as { inputs: unknown }).inputs
    : body;
  try {
    const result = await saveAppInputs(inputPayload, { duplicateMode: "upsert" });

    if (result.errors.length > 0) {
      return NextResponse.json({ error: "Could not import appInput.", details: result.errors }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      savedSessionIds: result.importedIds,
      savedExercises: result.savedExercises,
      savedBodyCheckIds: result.savedBodyCheckIds,
      savedNutritionCheckIds: result.savedNutritionCheckIds,
      skippedInvalidStatus: result.skippedInvalidStatus,
    });
  } catch (error) {
    if (hasProperty(error, "issues")) {
      return NextResponse.json({ error: "Invalid appInput.", issues: (error as { issues: unknown }).issues }, { status: 400 });
    }

    if (hasProperty(error, "duplicateIds")) {
      return NextResponse.json(
        {
          error: "Training session already exists.",
          message: "Ya existe una sesión con ese id. Cambia el id o edita la sesión existente.",
          duplicateIds: (error as { duplicateIds: string[] }).duplicateIds,
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: "Could not import appInput." }, { status: 500 });
  }
}
