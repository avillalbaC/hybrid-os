import { NextResponse } from "next/server";
import { requireAllowedUser } from "@/lib/auth/require-allowed-user";
import { deleteRemoteTrainingSession, isTrainingSessionsDatabaseConfigured, upsertRemoteTrainingSession } from "@/lib/supabase/training-sessions";
import { coercePartialSession, validateTrainingSession } from "@/lib/validation/hybrid-os-input";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

  const result = validateTrainingSession(body);

  if (!result.ok || !result.value) {
    return NextResponse.json({ error: "Invalid training session.", issues: result.errors }, { status: 400 });
  }

  if (result.value.id !== params.id) {
    return NextResponse.json({ error: "Route id does not match session id." }, { status: 400 });
  }

  try {
    const session = await upsertRemoteTrainingSession(coercePartialSession(result.value));
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: "Could not save training session." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAllowedUser();

  if (!auth.ok) {
    return auth.response;
  }

  if (!isTrainingSessionsDatabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    await deleteRemoteTrainingSession(params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete training session." }, { status: 500 });
  }
}
