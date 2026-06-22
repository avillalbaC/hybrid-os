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
import { getDefaultWeeklyAnalysisMode, getWeeklyAnalysisRange } from "@/lib/analytics/weekly-analysis";
import { getPeriodRange, isDateInRange, type PeriodRange } from "@/lib/domain/dashboard/periods";
import { useDashboardData } from "@/lib/storage/use-dashboard-data";
import type { DashboardPeriod } from "@/lib/domain/dashboard/periods";
import type { BodyCheck } from "@/types/body";
import type { NutritionCheck } from "@/types/nutrition";
import type { PlannedSession } from "@/types/planning";
import type { ProgrammingSession } from "@/types/programming";
import type { TrainingSession } from "@/types/training";

function getTabFromParam(value: string | null): AnalysisTab {
  if (value === "weeks" || value === "months" || value === "trends" || value === "data-quality") {
    return value;
  }

  return "current";
}

export type SelectedAnalysisPeriod = {
  label: string;
  startDate: string | null;
  endDate: string | null;
  sessions: TrainingSession[];
};

function useSelectedPlanning(startDate: string | null, endDate: string | null) {
  const [plannedSessions, setPlannedSessions] = useState<PlannedSession[]>([]);
  const [programmingSessions, setProgrammingSessions] = useState<ProgrammingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!startDate || !endDate) {
      setPlannedSessions([]);
      setProgrammingSessions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const rangeStart = startDate;
    const rangeEnd = endDate;

    async function loadPlanning() {
      setIsLoading(true);

      try {
        const [plannedResponse, programmingResponse] = await Promise.all([
          fetch(`/api/planned-sessions?start=${rangeStart}&end=${rangeEnd}`, { cache: "no-store", signal: controller.signal }),
          fetch("/api/programming-sessions", { cache: "no-store", signal: controller.signal }),
        ]);
        const plannedPayload = plannedResponse.ok ? ((await plannedResponse.json()) as { plannedSessions?: PlannedSession[] }) : {};
        const programmingPayload = programmingResponse.ok ? ((await programmingResponse.json()) as { programmingSessions?: ProgrammingSession[] }) : {};

        setPlannedSessions(plannedPayload.plannedSessions ?? []);
        setProgrammingSessions(
          (programmingPayload.programmingSessions ?? []).filter((session) => session.scheduledDate >= rangeStart && session.scheduledDate <= rangeEnd),
        );
      } catch {
        if (!controller.signal.aborted) {
          setPlannedSessions([]);
          setProgrammingSessions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadPlanning();

    return () => {
      controller.abort();
    };
  }, [endDate, startDate]);

  return { plannedSessions, programmingSessions, isLoading };
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function filterSessionsByRange(sessions: TrainingSession[], range: PeriodRange | null) {
  if (!range) {
    return sessions;
  }

  return sessions.filter((session) => isDateInRange(session.date, range));
}

function buildSelectedAnalysisPeriod(period: DashboardPeriod, sessions: TrainingSession[]): SelectedAnalysisPeriod {
  if (period === "week") {
    const selectedWeek = getWeeklyAnalysisRange(getDefaultWeeklyAnalysisMode());
    return {
      label: selectedWeek.displayLabel,
      startDate: selectedWeek.selectedWeekStart,
      endDate: selectedWeek.selectedWeekEnd,
      sessions: sessions.filter((session) => session.date >= selectedWeek.selectedWeekStart && session.date <= selectedWeek.selectedWeekEnd),
    };
  }

  if (period === "all") {
    return {
      label: "Histórico completo",
      startDate: null,
      endDate: null,
      sessions,
    };
  }

  const range = getPeriodRange(period);
  const label = range
    ? period === "month"
      ? `Mes en curso · ${new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(range.start)}`
      : `Año en curso · ${range.start.getFullYear()}`
    : "Periodo seleccionado";

  return {
    label,
    startDate: range ? formatDateKey(range.start) : null,
    endDate: range ? formatDateKey(range.end) : null,
    sessions: filterSessionsByRange(sessions, range),
  };
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
    bodyChecks: dashboardBodyChecks,
    nutritionChecks: dashboardNutritionChecks,
    source,
    message: syncMessage,
    isLoading,
    isReady,
  } = useDashboardData({
    seedSessions: sessions,
    seedBodyChecks: bodyChecks,
    seedNutritionChecks: nutritionChecks,
  });
  const selectedPeriod = useMemo(() => buildSelectedAnalysisPeriod(period, dashboardSessions), [dashboardSessions, period]);
  const analysis = useMemo(() => getTrainingDataInsights(selectedPeriod.sessions, { period }), [period, selectedPeriod.sessions]);
  const trends = useMemo(() => getWeeklyTrendMetrics(dashboardSessions), [dashboardSessions]);
  const selectedPlanning = useSelectedPlanning(selectedPeriod.startDate, selectedPeriod.endDate);
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
              Laboratorio visual para leer evolución, distribución, intensidad, calidad de datos y contexto útil para el check diario.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={source === "remote" ? "accent" : source === "seed-fallback" ? "warning" : "neutral"}>
                {source === "remote" ? "Datos reales" : source === "seed-fallback" ? "Fallback seed" : "sincronizando"}
              </Badge>
              <Badge>Histórico dinámico</Badge>
              <Badge>Contexto objetivo</Badge>
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

      {activeTab === "current" ? (
        <CurrentAnalysisSection
          analysis={analysis}
          isPlanningLoading={selectedPlanning.isLoading}
          isLoading={isMetricsLoading}
          period={period}
          plannedSessions={selectedPlanning.plannedSessions}
          programmingSessions={selectedPlanning.programmingSessions}
          sessions={dashboardSessions}
          bodyChecks={dashboardBodyChecks}
          nutritionChecks={dashboardNutritionChecks}
          trends={trends}
        />
      ) : null}
      {activeTab === "weeks" ? <WeeklyReportsSection sessions={dashboardSessions} isLoading={isMetricsLoading} /> : null}
      {activeTab === "months" ? <MonthlyReportsSection sessions={dashboardSessions} isLoading={isMetricsLoading} /> : null}
      {activeTab === "trends" ? <FullTrendsSection sessions={dashboardSessions} trends={trends} isLoading={isMetricsLoading} /> : null}
      {activeTab === "data-quality" ? <DataQualitySection sessions={dashboardSessions} isLoading={isMetricsLoading} /> : null}
    </>
  );
}
