import { NextResponse } from "next/server";
import { isAllowedAuthEmail } from "@/lib/auth/allow-list";
import { getDevBypassUser } from "@/lib/auth/dev-auth-bypass";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAllowedUser() {
  const devBypassUser = getDevBypassUser();

  if (devBypassUser) {
    return {
      ok: true as const,
      user: devBypassUser,
    };
  }

  let supabase: ReturnType<typeof createSupabaseServerClient>;

  try {
    supabase = createSupabaseServerClient();
  } catch {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user || !isAllowedAuthEmail(user.email)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    ok: true as const,
    user,
  };
}
