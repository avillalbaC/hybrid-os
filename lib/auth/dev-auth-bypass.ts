import { isAllowedAuthEmail } from "@/lib/auth/allow-list";

export type DevBypassUser = {
  id: string;
  email: string;
};

function getConfiguredBypassUser(): DevBypassUser | null {
  const id = process.env.CODEX_AUTH_USER_ID?.trim();
  const email = process.env.CODEX_AUTH_EMAIL?.trim();

  if (!id || !email) {
    return null;
  }

  return { id, email };
}

function isProductionEnvironment() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

export function getDevBypassUser(): DevBypassUser | null {
  if (process.env.CODEX_AUTH_BYPASS !== "true" || isProductionEnvironment()) {
    return null;
  }

  const user = getConfiguredBypassUser();

  if (!user || !isAllowedAuthEmail(user.email)) {
    return null;
  }

  return user;
}

export function isDevAuthBypassEnabled() {
  return getDevBypassUser() !== null;
}
