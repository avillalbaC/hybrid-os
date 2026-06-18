import { Card } from "@/components/ui/card";
import type { GoalBlock, GoalBlockTargets, GoalTargetRange } from "@/types/goals";

const targetRows: Array<{ key: keyof NonNullable<GoalBlockTargets["weekly"]>; label: string }> = [
  { key: "structuredRunSessions", label: "Running estructurado" },
  { key: "structuredRunKm", label: "Kilómetros running" },
  { key: "totalRunExposureKm", label: "Exposición total carrera" },
  { key: "hyroxSessions", label: "HYROX" },
  { key: "strengthSessions", label: "Fuerza" },
  { key: "mobilityDays", label: "Movilidad" },
  { key: "highIntensitySessions", label: "Alta intensidad" },
  { key: "averageRpe", label: "RPE medio" },
  { key: "totalDurationMinutes", label: "Duración total" },
];

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatRange(range: GoalTargetRange | undefined) {
  if (!range) {
    return "Sin target";
  }

  const parts = [
    typeof range.min === "number" ? `mín. ${formatNumber(range.min)}` : null,
    typeof range.target === "number" ? `obj. ${formatNumber(range.target)}` : null,
    typeof range.max === "number" ? `máx. ${formatNumber(range.max)}` : null,
  ].filter(Boolean);

  return `${parts.join(" · ")}${range.unit ? ` ${range.unit}` : ""}`;
}

export function GoalTargetsCard({ goal }: { goal: GoalBlock | null }) {
  const weekly = goal?.targets.weekly ?? {};

  return (
    <Card>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Targets del bloque</p>
      <h3 className="mt-2 text-2xl font-black tracking-tight">Targets semanales</h3>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {targetRows.map((row) => (
          <div key={row.key} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{row.label}</p>
            <p className="mt-2 font-mono text-sm font-black text-[var(--foreground)]">{formatRange(weekly[row.key])}</p>
          </div>
        ))}
      </div>
      {goal?.targets.body ? (
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          Tendencia corporal esperada: peso {goal.targets.body.weightTrend ?? "any"} · cintura {goal.targets.body.waistTrend ?? "any"}.
        </p>
      ) : null}
    </Card>
  );
}
