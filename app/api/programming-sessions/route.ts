import { NextResponse } from "next/server";
import { requireAllowedUser } from "@/lib/auth/require-allowed-user";
import {
  createProgrammingSession,
  isProgrammingSessionsDatabaseConfigured,
  listProgrammingSessions,
} from "@/lib/supabase/programming-sessions";
import { normalizeProgrammingSessionInput } from "@/types/programming";

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

  if (!isProgrammingSessionsDatabaseConfigured()) {
    return jsonNoStore({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const programmingSessions = await listProgrammingSessions(auth.user.id);
    return jsonNoStore({ programmingSessions });
  } catch {
    return jsonNoStore({ error: "Could not load programming sessions." }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

  const result = normalizeProgrammingSessionInput(body);

  if (!result.ok) {
    return jsonNoStore({ error: result.error }, { status: 400 });
  }

  try {
    const programmingSession = await createProgrammingSession(auth.user.id, result.value);
    return jsonNoStore({ programmingSession }, { status: 201 });
  } catch {
    return jsonNoStore({ error: "Could not create programming session." }, { status: 500 });
  }
}
