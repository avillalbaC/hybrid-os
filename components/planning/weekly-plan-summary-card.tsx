import { Card } from "@/components/ui/card";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import type { WeeklyPlanDeviation, WeeklyPlanSummary } from "@/types/planning";
import { plannedSessionTypeLabels } from "./planning-labels";

function getDeviationClasses(severity: WeeklyPlanDeviation["severity"]) {
  if (severity === "positive") {
    return "border-[var(--accent-border)] bg-[var(--accent-faint)]";
  }

  if (severity === "warning" || severity === "critical") {
    return "border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)]";
  }

  return "border-[var(--line)] bg-[rgba(244,247,244,0.025)]";
}

function getAllTypes(summary: WeeklyPlanSummary) {
  return Array.from(new Set([...Object.keys(summary.plannedByType), ...Object.keys(summary.completedByType)])).sort();
}

export function WeeklyPlanSummaryCard({
  summary,
  isLoading,
}: {
  summary: WeeklyPlanSummary;
  isLoading?: boolean;
}) {
  const types = getAllTypes(summary);

  return (
    <Card>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Cumplimiento planificado vs realizado</p>
      <h3 className="mt-2 text-2xl font-black tracking-tight">
        {summary.adherencePercentage === null ? "Sin plan registrado" : `${summary.completedPlannedSessions}/${summary.plannedSessions} completadas`}
      </h3>
      {isLoading ? (
        <div className="mt-4">
          <SkeletonText lines={4} />
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Adherencia</p>
              <p className="mt-1 font-mono text-xl font-black">{summary.adherencePercentage === null ? "-" : `${summary.adherencePercentage}%`}</p>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Saltadas</p>
              <p className="mt-1 font-mono text-xl font-black">{summary.skippedSessions}</p>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">No planificadas</p>
              <p className="mt-1 font-mono text-xl font-black">{summary.unplannedCompletedSessions}</p>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Semana</p>
              <p className="mt-1 font-mono text-xs font-black">{summary.weekStart} - {summary.weekEnd}</p>
            </div>
          </div>

          {types.length > 0 ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {types.map((type) => (
                <div key={type} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
                  <p className="text-sm font-black text-[var(--foreground)]">{plannedSessionTypeLabels[type as keyof typeof plannedSessionTypeLabels] ?? type}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Plan {summary.plannedByType[type] ?? 0} · Real {summary.completedByType[type] ?? 0}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3">
            {summary.deviations.slice(0, 4).map((deviation) => (
              <div key={deviation.id} className={`rounded-md border p-3 ${getDeviationClasses(deviation.severity)}`}>
                <p className="text-sm font-black text-[var(--foreground)]">{deviation.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">{deviation.description}</p>
                {deviation.recommendation ? <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{deviation.recommendation}</p> : null}
              </div>
            ))}
          </div>
        </>
      )}
      {isLoading ? <SkeletonBlock className="mt-4 h-16" /> : null}
    </Card>
  );
}
