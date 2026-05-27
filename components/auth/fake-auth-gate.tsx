"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/lib/auth/fake-auth";

const LOGIN_USER = "alvaro";
const LOGIN_PASSWORD = "admin";

export function FakeLoginScreen() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (user.trim() === LOGIN_USER && password === LOGIN_PASSWORD) {
      document.cookie = `${AUTH_COOKIE_NAME}=true; path=/; samesite=lax`;
      setError("");
      setPassword("");
      router.refresh();
      return;
    }

    setError("Usuario o contraseña incorrectos.");
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
            Inicia sesión para ver tu dashboard, entrenamientos y métricas personales.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fake-login-user" className="text-sm font-semibold text-[var(--muted-strong)]">
              Usuario
            </label>
            <input
              id="fake-login-user"
              name="user"
              type="text"
              autoComplete="username"
              value={user}
              onChange={(event) => setUser(event.target.value)}
              className="mt-2 w-full rounded-md border border-[var(--line-strong)] bg-[var(--panel-soft)] px-3 py-2.5 text-sm text-[var(--foreground)] transition placeholder:text-[rgba(139,151,145,0.7)] focus:border-[rgba(56,217,159,0.45)]"
            />
          </div>

          <div>
            <label htmlFor="fake-login-password" className="text-sm font-semibold text-[var(--muted-strong)]">
              Contraseña
            </label>
            <input
              id="fake-login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-md border border-[var(--line-strong)] bg-[var(--panel-soft)] px-3 py-2.5 text-sm text-[var(--foreground)] transition placeholder:text-[rgba(139,151,145,0.7)] focus:border-[rgba(56,217,159,0.45)]"
            />
          </div>

          {error ? (
            <p className="rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-md border border-[rgba(56,217,159,0.34)] bg-[var(--accent-soft)] px-4 py-2.5 text-sm font-bold text-[var(--foreground)] transition hover:bg-[rgba(56,217,159,0.18)]"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
