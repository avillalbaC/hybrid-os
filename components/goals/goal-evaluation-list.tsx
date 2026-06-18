import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { GoalEvaluation, GoalEvaluationItem } from "@/types/goals";

function getStatusLabel(status: GoalEvaluationItem["status"]) {
  const labels: Record<GoalEvaluationItem["status"], string> = {
    on_track: "En rango",
    under_target: "Bajo objetivo",
    over_target: "Sobre objetivo",
    risk: "Riesgo",
    insufficient_data: "Faltan datos",
    neutral: "Neutral",
  };

  return labels[status];
}

function getTone(severity: GoalEvaluationItem["severity"]) {
  if (severity === "positive") {
    return "accent" as const;
  }

  if (severity === "warning" || severity === "critical") {
    return "warning" as const;
  }

  return "neutral" as const;
}

function formatCurrentValue(item: GoalEvaluationItem) {
  if (item.currentValue === null) {
    return "Sin dato";
  }

  return Number.isInteger(item.currentValue) ? String(item.currentValue) : item.currentValue.toFixed(1);
}

export function GoalEvaluationList({ evaluation }: { evaluation: GoalEvaluation }) {
  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Evaluación semanal</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Lectura contra datos reales</h3>
        </div>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{evaluation.periodLabel}</p>
      </div>

      <div className="mt-4 grid gap-3">
        {evaluation.items.length > 0 ? (
          evaluation.items.map((item) => (
            <div key={item.id} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black text-[var(--foreground)]">{item.label}</p>
                  <p className="mt-1 font-mono text-xs font-bold text-[var(--muted)]">
                    {formatCurrentValue(item)} / {item.targetLabel}
                  </p>
                </div>
                <Badge tone={getTone(item.severity)}>{getStatusLabel(item.status)}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-strong)]">{item.explanation}</p>
            </div>
          ))
        ) : (
          <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm leading-6 text-[var(--muted)]">
            Sin objetivo activo o sin targets semanales configurados.
          </p>
        )}
      </div>
    </Card>
  );
}
