"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnalysisTabs, type AnalysisTab } from "@/components/analysis/analysis-tabs";
import { CurrentAnalysisSection } from "@/components/analysis/current-analysis-section";
import { DataQualitySection } from "@/components/analysis/data-quality-section";
import { FullTrendsSection } from "@/components/analysis/full-trends-section";
import { MonthlyReportsSection } from "@/components/analysis/monthly-reports-section";
import { WeeklyReportsSection } from "@/components/analysis/weekly-reports-section";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { Badge } from "@/components/ui/badge";
import { getTrainingDataInsights } from "@/lib/analytics/data-insights";
import { getWeeklyTrendMetrics } from "@/lib/analytics/trends";
import { useDashboardData } from "@/lib/storage/use-dashboard-data";
import type { DashboardPeriod } from "@/lib/domain/dashboard/periods";
import type { BodyCheck } from "@/types/body";
import type { NutritionCheck } from "@/types/nutrition";
import type { TrainingSession } from "@/types/training";

function getTabFromParam(value: string | null): AnalysisTab {
  if (value === "weeks" || value === "months" || value === "trends" || value === "data-quality") {
    return value;
  }

  return "current";
}

export function AnalysisPage({
  sessions,
  bodyChecks,
  nutritionChecks,
}: {
  sessions: TrainingSession[];
  bodyChecks: BodyCheck[];
  nutritionChecks: NutritionCheck[];
}) {
  const searchParams = useSearchParams();
  const urlTab = getTabFromParam(searchParams.get("tab"));
  const [activeTab, setActiveTab] = useState<AnalysisTab>(urlTab);
  const [period, setPeriod] = useState<DashboardPeriod>("week");
  const {
    sessions: dashboardSessions,
    source,
    message: syncMessage,
    isLoading,
    isReady,
  } = useDashboardData({
    seedSessions: sessions,
    seedBodyChecks: bodyChecks,
    seedNutritionChecks: nutritionChecks,
  });
  const analysis = useMemo(() => getTrainingDataInsights(dashboardSessions, { period }), [dashboardSessions, period]);
  const trends = useMemo(() => getWeeklyTrendMetrics(dashboardSessions), [dashboardSessions]);
  const isMetricsLoading = isLoading || !isReady;

  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  return (
    <>
      <section className="mb-6 overflow-hidden rounded-md border border-[var(--line)] bg-[linear-gradient(135deg,var(--accent-hero),rgba(21,27,24,0.98)_38%,rgba(12,16,15,0.98))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)] sm:p-8">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Análisis profundo</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-[var(--foreground)] sm:text-6xl">Análisis</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted-strong)]">
              Informes, tendencias y conclusiones históricas a partir de tus sesiones reales.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={source === "remote" ? "accent" : source === "seed-fallback" ? "warning" : "neutral"}>
                {source === "remote" ? "Datos reales" : source === "seed-fallback" ? "Fallback seed" : "sincronizando"}
              </Badge>
              <Badge>Histórico dinámico</Badge>
              <Badge>Informes automáticos</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:items-center lg:justify-end">
            <PeriodSelector value={period} onChange={setPeriod} />
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
            >
              Volver al dashboard
            </Link>
          </div>
        </div>
      </section>

      {syncMessage ? (
        <p className="mb-5 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-3 text-sm text-[var(--muted-strong)]">
          {syncMessage}
        </p>
      ) : null}

      <section className="mb-6">
        <AnalysisTabs activeTab={activeTab} onChange={setActiveTab} />
      </section>

      {activeTab === "current" ? <CurrentAnalysisSection analysis={analysis} isLoading={isMetricsLoading} period={period} sessions={dashboardSessions} trends={trends} /> : null}
      {activeTab === "weeks" ? <WeeklyReportsSection sessions={dashboardSessions} isLoading={isMetricsLoading} /> : null}
      {activeTab === "months" ? <MonthlyReportsSection sessions={dashboardSessions} isLoading={isMetricsLoading} /> : null}
      {activeTab === "trends" ? <FullTrendsSection trends={trends} isLoading={isMetricsLoading} /> : null}
      {activeTab === "data-quality" ? <DataQualitySection sessions={dashboardSessions} isLoading={isMetricsLoading} /> : null}
    </>
  );
}
