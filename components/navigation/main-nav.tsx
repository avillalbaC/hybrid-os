"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navSections = [
  {
    label: "Principal",
    items: [
      { href: "/", label: "Home", marker: "O" },
      { href: "/calendar", label: "Calendario", marker: "C" },
      { href: "/dashboard", label: "Dashboard", marker: "A" },
      { href: "/analysis", label: "Análisis", marker: "A" },
      { href: "/goals", label: "Objetivos", marker: "G" },
    ],
  },
  {
    label: "Entrenamiento",
    items: [
      { href: "/training", label: "Training Log", marker: "L" },
      { href: "/programming", label: "Programaciones", marker: "P" },
      { href: "/training/import", label: "Importar JSON", marker: "+" },
      { href: "/training/running", label: "Running", marker: "R" },
      { href: "/muscle-load", label: "Carga muscular", marker: "M" },
    ],
  },
  {
    label: "Seguimiento",
    items: [
      { href: "/body", label: "Body Check", marker: "B" },
      { href: "/nutrition", label: "Nutrición", marker: "N" },
    ],
  },
];

export function MainNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="space-y-3">
      {navSections.map((section) => (
        <div key={section.label} className={`space-y-1 ${collapsed ? "border-t border-[var(--line)] pt-3 first:border-t-0 first:pt-0" : ""}`}>
          <p className={`px-2 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)] ${collapsed ? "sr-only" : ""}`}>
            {section.label}
          </p>
          {section.items.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                title={item.label}
                aria-label={collapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={`group flex h-10 items-center rounded-md border px-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-[var(--accent-border)] bg-[var(--accent-secondary-soft)] text-[var(--foreground)] shadow-[inset_2px_0_0_var(--accent)]"
                    : "border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:bg-[rgba(244,247,244,0.03)] hover:text-[var(--foreground)] focus-visible:bg-[rgba(244,247,244,0.05)]"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <span className={`grid size-7 shrink-0 place-items-center rounded-md border font-mono text-[0.68rem] ${
                  isActive
                    ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                    : "border-[var(--line)] bg-[rgba(244,247,244,0.02)] text-[rgba(139,151,145,0.82)] group-hover:text-[var(--muted-strong)]"
                }`}>
                  {item.marker}
                </span>
                <span className={`ml-2 min-w-0 truncate ${collapsed ? "sr-only" : "block"}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
