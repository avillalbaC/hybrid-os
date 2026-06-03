import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAllowedAuthEmail } from "@/lib/auth/allow-list";
import { isDevAuthBypassEnabled } from "@/lib/auth/dev-auth-bypass";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });
  const devAuthBypassEnabled = isDevAuthBypassEnabled();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (devAuthBypassEnabled) {
    return response;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isPublicPath(pathname)) {
      return response;
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "missing_config");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();
  const user = data.user;
  const isAllowed = Boolean(user && !error && isAllowedAuthEmail(user.email));

  if (isPublicPath(pathname)) {
    if (pathname === "/login" && isAllowed) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }

  if (!isAllowed) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|models).*)"],
};
