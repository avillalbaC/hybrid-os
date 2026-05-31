import { LoginForm } from "@/app/login/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return <LoginForm error={searchParams.error} />;
}
