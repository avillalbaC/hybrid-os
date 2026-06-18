import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getGoalProfileMeta } from "@/lib/goals/goal-profiles";
import { formatDate, formatGoalStatus } from "@/lib/utils/format";
import type { GoalBlock, GoalEvaluation } from "@/types/goals";

function getOverallLabel(status: GoalEvaluation["overallStatus"]) {
  const labels: Record<GoalEvaluation["overallStatus"], string> = {
    on_track: "En rango",
    under_target: "Por debajo",
    over_target: "Por encima",
    risk: "Riesgo",
    insufficient_data: "Faltan datos",
    neutral: "Neutral",
  };

  return labels[status];
}

function getBadgeTone(status: GoalEvaluation["overallStatus"]) {
  if (status === "on_track") {
    return "accent" as const;
  }

  if (status === "risk" || status === "over_target" || status === "under_target") {
    return "warning" as const;
  }

  return "neutral" as const;
}

export function ActiveGoalSummaryCard({
  goal,
  evaluation,
  compact = false,
  onEdit,
}: {
  goal: GoalBlock | null;
  evaluation: GoalEvaluation;
  compact?: boolean;
  onEdit?: () => void;
}) {
  if (!goal) {
    return (
      <Card>
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Objetivo activo</p>
        <h3 className="mt-2 text-xl font-black tracking-tight">Sin objetivo activo</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{evaluation.summary}</p>
        <Link href="/goals" className="mt-4 inline-flex text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Crear objetivo
        </Link>
      </Card>
    );
  }

  const profileMeta = getGoalProfileMeta(goal.profile);

  return (
    <Card className="border-[rgba(34,211,238,0.18)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Objetivo activo</p>
          <h3 className={`${compact ? "text-xl" : "text-2xl"} mt-2 font-black tracking-tight`}>{goal.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{profileMeta.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Badge tone={getBadgeTone(evaluation.overallStatus)}>{getOverallLabel(evaluation.overallStatus)}</Badge>
          <Badge>{formatGoalStatus(goal.status)}</Badge>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[var(--muted)]">
        <span>{profileMeta.title}</span>
        <span>{formatDate(goal.startDate)}{goal.endDate ? ` - ${formatDate(goal.endDate)}` : ""}</span>
      </div>
      {goal.notes ? <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{goal.notes}</p> : null}
      <p className="mt-4 text-sm leading-6 text-[var(--muted-strong)]">{evaluation.summary}</p>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)] hover:bg-[rgba(244,247,244,0.055)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          Editar objetivo
        </button>
      ) : null}
    </Card>
  );
}
