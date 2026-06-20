import { NextResponse } from "next/server";
import { requireAllowedUser } from "@/lib/auth/require-allowed-user";
import {
  deleteProgrammingSession,
  getProgrammingSessionById,
  isProgrammingSessionsDatabaseConfigured,
  updateProgrammingSession,
} from "@/lib/supabase/programming-sessions";
import { normalizeProgrammingSessionPatch } from "@/types/programming";

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

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAllowedUser();

  if (!auth.ok) {
    return auth.response;
  }

  if (!isProgrammingSessionsDatabaseConfigured()) {
    return jsonNoStore({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const programmingSession = await getProgrammingSessionById(auth.user.id, params.id);

    if (!programmingSession) {
      return jsonNoStore({ error: "Programming session not found." }, { status: 404 });
    }

    return jsonNoStore({ programmingSession });
  } catch {
    return jsonNoStore({ error: "Could not load programming session." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAllowedUser();

  if (!auth.ok) {
    return auth.response;
  }

  if (!isProgrammingSessionsDatabaseConfigured()) {
    return jsonNoStore({ error: "Supabase is not configured." }, { status: 503 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = normalizeProgrammingSessionPatch(body);

  if (!result.ok) {
    return jsonNoStore({ error: result.error }, { status: 400 });
  }

  try {
    const programmingSession = await updateProgrammingSession(auth.user.id, params.id, result.value);
    return jsonNoStore({ programmingSession });
  } catch {
    return jsonNoStore({ error: "Could not update programming session." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAllowedUser();

  if (!auth.ok) {
    return auth.response;
  }

  if (!isProgrammingSessionsDatabaseConfigured()) {
    return jsonNoStore({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    await deleteProgrammingSession(auth.user.id, params.id);
    return jsonNoStore({ ok: true });
  } catch {
    return jsonNoStore({ error: "Could not delete programming session." }, { status: 500 });
  }
}
