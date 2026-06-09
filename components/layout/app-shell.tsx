"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MainNav } from "@/components/navigation/main-nav";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const SIDEBAR_STORAGE_KEY = "hybrid-os:sidebar-collapsed";

const routeContext = [
  { prefix: "/dashboard", period: "Periodo: seleccionable", source: "Fuente: Supabase primero" },
  { prefix: "/training/import", period: "Importación", source: "Raw data preservada" },
  { prefix: "/training/running", period: "Running", source: "Entrenamientos reales" },
  { prefix: "/training", period: "Training Log", source: "Supabase + cola local" },
  { prefix: "/muscle-load", period: "Carga muscular", source: "Sesiones reales" },
  { prefix: "/", period: "Estado actual", source: "Supabase primero" },
];

export function AppShell({
  children,
  devAuthBypassEnabled = false,
}: {
  children: React.ReactNode;
  devAuthBypassEnabled?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isPublicAuthRoute = pathname === "/login" || pathname.startsWith("/auth/callback");
  const topbarContext = routeContext.find((item) => (item.prefix === "/" ? pathname === "/" : pathname.startsWith(item.prefix))) ?? routeContext[0];

  useEffect(() => {
    setIsCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  function toggleCollapsed() {
    setIsCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }

  async function handleSignOut() {
    if (!devAuthBypassEnabled) {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    }

    router.push("/login");
    router.refresh();
  }

  if (isPublicAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen lg:grid ${isCollapsed ? "lg:grid-cols-[64px_1fr]" : "lg:grid-cols-[208px_1fr]"}`}>
      {isMobileOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[17rem] border-r border-[var(--line)] bg-[rgba(7,10,9,0.94)] px-4 py-4 shadow-[0_28px_90px_rgba(0,0,0,0.48)] backdrop-blur-xl transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 lg:px-2.5 lg:py-4 lg:shadow-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className={`mb-3 flex items-center gap-3 ${isCollapsed ? "lg:justify-center" : ""}`}>
          <div className="grid size-9 shrink-0 place-items-center rounded-md border border-[var(--line-strong)] bg-[var(--panel-strong)] text-sm font-black text-[var(--accent-strong)] shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
            H/
          </div>
          <div className={isCollapsed ? "lg:sr-only" : "min-w-0"}>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Hybrid OS</p>
            <h1 className="mt-1 truncate text-base font-black tracking-tight text-[var(--foreground)]">Control System</h1>
          </div>
        </div>
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            className={`hidden h-9 items-center justify-center rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.02)] px-2 text-xs font-bold text-[var(--muted-strong)] transition hover:border-[var(--line-strong)] hover:text-[var(--foreground)] lg:inline-flex ${
              isCollapsed ? "w-full" : "flex-1"
            }`}
          >
            <span aria-hidden="true" className="font-mono">{isCollapsed ? ">>" : "<<"}</span>
            <span className={isCollapsed ? "sr-only" : "ml-2"}>{isCollapsed ? "Expandir" : "Colapsar"}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-3 text-sm font-bold text-[var(--muted-strong)] lg:hidden"
          >
            Cerrar
          </button>
        </div>
        <MainNav collapsed={isCollapsed} onNavigate={() => setIsMobileOpen(false)} />
        <button
          type="button"
          onClick={handleSignOut}
          title={isCollapsed ? "Cerrar sesión" : undefined}
          aria-label={isCollapsed ? "Cerrar sesión" : undefined}
          className={`mt-4 flex min-h-10 w-full items-center rounded-md border border-[var(--line)] px-2 py-2 text-left text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--line-strong)] hover:bg-[rgba(244,247,244,0.035)] hover:text-[var(--foreground)] lg:mt-5 ${isCollapsed ? "lg:justify-center" : ""}`}
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-md border border-[var(--line)] font-mono text-[0.68rem]">S</span>
          <span className={isCollapsed ? "sr-only" : "ml-3"}>Cerrar sesión</span>
        </button>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(7,10,9,0.74)] px-4 py-2.5 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Abrir menú"
                onClick={() => setIsMobileOpen(true)}
                className="inline-grid size-10 place-items-center rounded-md border border-[var(--line)] bg-[var(--panel-soft)] font-mono text-sm font-black text-[var(--foreground)] lg:hidden"
              >
                =
              </button>
              <div className="hidden min-w-0 gap-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)] sm:flex">
                <span className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.02)] px-2.5 py-1.5">{topbarContext.period}</span>
                <span className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.02)] px-2.5 py-1.5">{topbarContext.source}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/training/import"
                className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-3 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
              >
                Importar
              </Link>
              {devAuthBypassEnabled ? (
                <span className="hidden h-9 items-center rounded-md border border-amber-300/30 bg-amber-300/10 px-3 text-sm font-bold text-amber-100 sm:inline-flex">
                  Dev auth bypass
                </span>
              ) : (
                <span className="hidden h-9 items-center rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.02)] px-3 text-sm font-bold text-[var(--muted-strong)] sm:inline-flex">
                  Google Auth
                </span>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
