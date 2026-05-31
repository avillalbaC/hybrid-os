import { NextResponse } from "next/server";
import { isAllowedAuthEmail } from "@/lib/auth/allow-list";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const { data, error: userError } = await supabase.auth.getUser();
  const user = data.user;

  if (userError || !user || !isAllowedAuthEmail(user.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=unauthorized`);
  }

  return NextResponse.redirect(`${origin}/`);
}
