"use client";

import { useMemo, useState } from "react";
import { PeriodReportCard } from "@/components/analysis/period-report-card";
import { Card } from "@/components/ui/card";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import { getMonthlyReports, getWeeklyReports } from "@/lib/analytics/period-reports";
import type { TrainingSession } from "@/types/training";

type ReportTab = "weeks" | "months";

function ReportSkeleton() {
  return (
    <Card>
      <SkeletonBlock className="h-6 w-40" />
      <SkeletonBlock className="mt-4 h-7 w-2/3" />
      <div className="mt-4">
        <SkeletonText lines={3} />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <SkeletonBlock className="h-16" />
        <SkeletonBlock className="h-16" />
        <SkeletonBlock className="h-16" />
        <SkeletonBlock className="h-16" />
      </div>
    </Card>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-md border px-4 py-2 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
        active
          ? "border-[var(--accent-border)] bg-[var(--accent)] text-[var(--accent-foreground)]"
          : "border-[var(--line)] bg-[rgba(244,247,244,0.035)] text-[var(--foreground)] hover:border-[var(--accent-border)]"
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export function WeeklyReportList({ reports }: { reports: ReturnType<typeof getWeeklyReports> }) {
  if (reports.length === 0) {
    return (
      <Card>
        <p className="text-sm leading-6 text-[var(--muted)]">Sin semanas suficientes para generar informes.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {reports.map((report) => (
        <PeriodReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}

export function MonthlyReportList({ reports }: { reports: ReturnType<typeof getMonthlyReports> }) {
  if (reports.length === 0) {
    return (
      <Card>
        <p className="text-sm leading-6 text-[var(--muted)]">Sin meses suficientes para generar informes.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {reports.map((report) => (
        <PeriodReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}

export function PeriodReportsSection({
  isLoading,
  sessions,
}: {
  isLoading?: boolean;
  sessions: TrainingSession[];
}) {
  const [tab, setTab] = useState<ReportTab>("weeks");
  const weeklyReports = useMemo(() => getWeeklyReports(sessions, { limit: 4 }), [sessions]);
  const monthlyReports = useMemo(() => getMonthlyReports(sessions, { limit: 3 }), [sessions]);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Resúmenes de periodo</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Conclusiones semanales y mensuales</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Informes generados en cliente desde sesiones reales, sin guardar nada nuevo.</p>
        </div>
        <div className="flex gap-2">
          <TabButton active={tab === "weeks"} onClick={() => setTab("weeks")}>Semanas</TabButton>
          <TabButton active={tab === "months"} onClick={() => setTab("months")}>Meses</TabButton>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          <ReportSkeleton />
          <ReportSkeleton />
        </div>
      ) : tab === "weeks" ? (
        <WeeklyReportList reports={weeklyReports} />
      ) : (
        <MonthlyReportList reports={monthlyReports} />
      )}
    </section>
  );
}
