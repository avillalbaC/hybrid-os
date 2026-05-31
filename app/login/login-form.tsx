"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const errorMessages: Record<string, string> = {
  unauthorized: "Tu email no está autorizado para acceder a Hybrid OS.",
  missing_config: "Supabase Auth no está configurado todavía.",
  auth_failed: "No se pudo completar el inicio de sesión.",
};

export function LoginForm({ error }: { error?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const visibleError = localError || (error ? errorMessages[error] ?? "No se pudo iniciar sesión." : "");

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setLocalError("");

    let supabase: ReturnType<typeof createSupabaseBrowserClient>;

    try {
      supabase = createSupabaseBrowserClient();
    } catch {
      setLocalError(errorMessages.missing_config);
      setIsLoading(false);
      return;
    }

    const origin = window.location.origin;
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (signInError) {
      setLocalError("No se pudo conectar con Google.");
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-md border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
        <div className="mb-7">
          <div className="mb-5 grid size-11 place-items-center rounded-md border border-[var(--line-strong)] bg-[var(--panel-soft)] text-sm font-black text-[var(--accent-strong)]">
            H/
          </div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[var(--accent)]">
            Hybrid OS
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--foreground)]">
            Acceso privado
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Inicia sesión con tu cuenta autorizada para ver tu dashboard, entrenamientos y métricas personales.
          </p>
        </div>

        {visibleError ? (
          <p className="mb-4 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            {visibleError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-md border border-[rgba(56,217,159,0.34)] bg-[var(--accent-soft)] px-4 py-2.5 text-sm font-bold text-[var(--foreground)] transition hover:bg-[rgba(56,217,159,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="grid size-7 place-items-center rounded-md border border-[var(--line-strong)] bg-[var(--panel-soft)] font-black text-[0.72rem]">
            G
          </span>
          {isLoading ? "Conectando..." : "Entrar con Google"}
        </button>
      </section>
    </main>
  );
}
