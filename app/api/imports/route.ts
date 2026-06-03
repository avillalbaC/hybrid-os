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

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dryRun") === "true";
  const inputPayload = typeof body === "object" && body !== null && "inputs" in body
    ? (body as { inputs: unknown }).inputs
    : body;

  try {
    const result = await saveAppInputs(inputPayload, {
      duplicateMode: dryRun ? "skip" : "error",
      dryRun,
      userId: auth.user.id,
    });

    if (result.errors.length > 0) {
      return NextResponse.json({ error: dryRun ? "Could not simulate appInput import." : "Could not import appInput.", dryRun, details: result.errors }, { status: 500 });
    }

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        wouldImport: result.wouldImport,
        duplicates: result.skippedDuplicate,
        warnings: result.validationWarnings,
        phases: result.phases,
        wouldSaveSessionIds: result.importedIds,
        wouldSaveExercises: result.savedExercises,
        wouldSaveBodyCheckIds: result.savedBodyCheckIds,
        wouldSaveNutritionCheckIds: result.savedNutritionCheckIds,
        skippedInvalidStatus: result.skippedInvalidStatus,
      });
    }

    return NextResponse.json({
      ok: true,
      dryRun: false,
      savedSessionIds: result.importedIds,
      savedExercises: result.savedExercises,
      savedBodyCheckIds: result.savedBodyCheckIds,
      savedNutritionCheckIds: result.savedNutritionCheckIds,
      skippedInvalidStatus: result.skippedInvalidStatus,
      phases: result.phases,
    });
  } catch (error) {
    if (hasProperty(error, "issues")) {
      return NextResponse.json({ error: "Invalid appInput.", dryRun, issues: (error as { issues: unknown }).issues }, { status: 400 });
    }

    if (hasProperty(error, "duplicateIds")) {
      return NextResponse.json(
        {
          error: "Training session already exists.",
          dryRun,
          message: "Ya existe una sesión con ese id. Cambia el id o edita la sesión existente.",
          duplicateIds: (error as { duplicateIds: string[] }).duplicateIds,
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: dryRun ? "Could not simulate appInput import." : "Could not import appInput.", dryRun }, { status: 500 });
  }
}
