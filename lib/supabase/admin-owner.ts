import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function parseAllowedEmails() {
  return (process.env.ALLOWED_AUTH_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminOwnerUserId() {
  const explicitUserId = process.env.HYBRID_OS_ADMIN_USER_ID ?? process.env.OWNER_USER_ID;

  if (explicitUserId) {
    return explicitUserId;
  }

  const allowedEmails = parseAllowedEmails();

  if (allowedEmails.length !== 1) {
    throw new Error("Set HYBRID_OS_ADMIN_USER_ID, OWNER_USER_ID, or exactly one ALLOWED_AUTH_EMAILS value for admin writes.");
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    throw error;
  }

  const owner = data.users.find((user) => user.email?.toLowerCase() === allowedEmails[0]);

  if (!owner) {
    throw new Error(`Could not find Supabase Auth user for ${allowedEmails[0]}.`);
  }

  return owner.id;
}
