import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { GoalProgressStatus, GoalProgressSummary } from "@/types/goals";

const statusLabels: Record<GoalProgressStatus, string> = {
  improving: "Más cerca",
  stable: "Estable",
  worsening: "Más lejos",
  on_track: "En rango",
  off_track: "Fuera de rango",
  insufficient_data: "Faltan datos",
  neutral: "Neutral",
};

function getStatusTone(status: GoalProgressStatus) {
  if (status === "improving" || status === "on_track") {
    return "accent" as const;
  }

  if (status === "worsening" || status === "off_track") {
    return "warning" as const;
  }

  return "neutral" as const;
}

export function GoalProgressOverview({
  progress,
  isLoading,
}: {
  progress: GoalProgressSummary;
  isLoading?: boolean;
}) {
  return (
    <Card className="border-[rgba(34,211,238,0.18)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Progreso hacia el objetivo</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Lectura del objetivo</h3>
        </div>
        <Badge tone={getStatusTone(progress.overallStatus)}>{statusLabels[progress.overallStatus]}</Badge>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--muted-strong)]">
        {isLoading ? "Calculando progreso con datos reales." : progress.summary}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {progress.progressItems.map((item) => (
          <div key={item.id} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{item.label}</p>
            <p className="mt-2 font-mono text-sm font-black text-[var(--foreground)]">{item.valueLabel ?? "Contexto"}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{item.evidence}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
