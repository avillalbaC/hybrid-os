"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", marker: "01" },
  { href: "/dashboard", label: "Dashboard", marker: "02" },
  { href: "/training", label: "Training Log", marker: "03" },
  { href: "/training/import", label: "Importar JSON", marker: "04" },
  { href: "/muscle-load", label: "Carga muscular", marker: "05" },
  { href: "/body", label: "Body Check", marker: "06" },
  { href: "/nutrition", label: "Nutrición", marker: "07" },
  { href: "/goals", label: "Objetivos", marker: "08" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1.5 lg:overflow-visible lg:pb-0">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`group flex whitespace-nowrap rounded-md border px-3 py-2 text-sm font-semibold transition ${
              isActive
                ? "border-[rgba(56,217,159,0.34)] bg-[var(--accent-soft)] text-[var(--foreground)] shadow-[inset_3px_0_0_var(--accent)]"
                : "border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:bg-[rgba(244,247,244,0.035)] hover:text-[var(--foreground)] focus-visible:bg-[rgba(244,247,244,0.05)]"
            }`}
          >
            <span className={`mr-3 font-mono text-[0.68rem] ${isActive ? "text-[var(--accent)]" : "text-[rgba(139,151,145,0.62)] group-hover:text-[var(--muted)]"}`}>
              {item.marker}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
