export function getAllowedAuthEmails() {
  return (process.env.ALLOWED_AUTH_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAuthEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return getAllowedAuthEmails().includes(email.toLowerCase());
}
