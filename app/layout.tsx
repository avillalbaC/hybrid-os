import type { Metadata } from "next";
import { cookies } from "next/headers";
import { FakeLoginScreen } from "@/components/auth/fake-auth-gate";
import { AppShell } from "@/components/layout/app-shell";
import { AUTH_COOKIE_NAME } from "@/lib/auth/fake-auth";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hybrid OS",
  description: "Personal dashboard for hybrid training, body checks, nutrition and goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuthenticated = cookies().get(AUTH_COOKIE_NAME)?.value === "true";

  return (
    <html lang="es">
      <body>
        {isAuthenticated ? <AppShell>{children}</AppShell> : <FakeLoginScreen />}
      </body>
    </html>
  );
}
