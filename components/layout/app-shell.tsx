"use client";

import { useRouter } from "next/navigation";
import { MainNav } from "@/components/navigation/main-nav";
import { AUTH_COOKIE_NAME } from "@/lib/auth/fake-auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function handleSignOut() {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="border-b border-[var(--line)] bg-[rgba(7,10,9,0.86)] px-4 py-4 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <div className="mb-6 flex items-center gap-3 lg:block">
          <div className="grid size-10 shrink-0 place-items-center rounded-md border border-[var(--line-strong)] bg-[var(--panel-strong)] text-sm font-black text-[var(--accent-strong)] shadow-[0_18px_60px_rgba(0,0,0,0.28)] lg:mb-5">
            H/
          </div>
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[var(--accent)]">
              Hybrid OS
            </p>
            <h1 className="mt-1 text-xl font-black tracking-tight text-[var(--foreground)]">
              Control System
            </h1>
            <p className="mt-1 max-w-[15rem] text-xs leading-5 text-[var(--muted)]">
              Training, recovery and body signals.
            </p>
          </div>
        </div>
        <MainNav />
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-4 w-full rounded-md border border-[var(--line)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--line-strong)] hover:bg-[rgba(244,247,244,0.035)] hover:text-[var(--foreground)] lg:mt-6"
        >
          Cerrar sesión
        </button>
      </aside>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        {children}
      </main>
    </div>
  );
}
