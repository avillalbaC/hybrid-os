import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { isDevAuthBypassEnabled } from "@/lib/auth/dev-auth-bypass";
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
  const devAuthBypassEnabled = isDevAuthBypassEnabled();

  return (
    <html lang="es">
      <body>
        <AppShell devAuthBypassEnabled={devAuthBypassEnabled}>{children}</AppShell>
      </body>
    </html>
  );
}
