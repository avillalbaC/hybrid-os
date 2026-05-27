"use client";

import { dashboardPeriods, type DashboardPeriod } from "@/lib/domain/dashboard/periods";

export function PeriodSelector({
  value,
  onChange,
}: {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}) {
  return (
    <div
      className="inline-flex rounded-md border border-[var(--line)] bg-[rgba(7,10,9,0.38)] p-1 shadow-[inset_0_1px_0_rgba(244,247,244,0.04)]"
      aria-label="Periodo del dashboard"
    >
      {dashboardPeriods.map((period) => {
        const isActive = period.value === value;

        return (
          <button
            key={period.value}
            type="button"
            onClick={() => onChange(period.value)}
            className={`rounded-[4px] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition sm:px-4 ${
              isActive
                ? "bg-[var(--accent)] text-[#06100c] shadow-[0_10px_28px_rgba(56,217,159,0.2)]"
                : "text-[var(--muted-strong)] hover:bg-[rgba(244,247,244,0.06)] hover:text-[var(--foreground)]"
            }`}
            aria-pressed={isActive}
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}
