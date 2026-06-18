import { NextResponse } from "next/server";
import { requireAllowedUser } from "@/lib/auth/require-allowed-user";
import {
  deletePlannedSession,
  isPlannedSessionsDatabaseConfigured,
  updatePlannedSession,
} from "@/lib/supabase/planned-sessions";
import { normalizePlannedSessionPatch } from "@/types/planning";

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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAllowedUser();

  if (!auth.ok) {
    return auth.response;
  }

  if (!isPlannedSessionsDatabaseConfigured()) {
    return jsonNoStore({ error: "Supabase is not configured." }, { status: 503 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = normalizePlannedSessionPatch(body);

  if (!result.ok) {
    return jsonNoStore({ error: result.error }, { status: 400 });
  }

  try {
    const plannedSession = await updatePlannedSession(auth.user.id, params.id, result.value);
    return jsonNoStore({ plannedSession });
  } catch {
    return jsonNoStore({ error: "Could not update planned session." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAllowedUser();

  if (!auth.ok) {
    return auth.response;
  }

  if (!isPlannedSessionsDatabaseConfigured()) {
    return jsonNoStore({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    await deletePlannedSession(auth.user.id, params.id);
    return jsonNoStore({ ok: true });
  } catch {
    return jsonNoStore({ error: "Could not delete planned session." }, { status: 500 });
  }
}
