import type { TrainingSessionType } from "@/types/training";

export type ScatterPoint = {
  id: string;
  label: string;
  date: string;
  durationMinutes: number;
  rpe: number;
  type: TrainingSessionType;
};

function getPointColor(type: TrainingSessionType) {
  if (type === "running") {
    return "var(--accent)";
  }

  if (type === "hyrox" || type === "crossfit" || type === "mixed") {
    return "var(--warning)";
  }

  if (type === "fuerza" || type === "halterofilia") {
    return "var(--accent-secondary)";
  }

  return "rgba(244,247,244,0.62)";
}

export function ScatterCard({
  data,
  emptyLabel = "Sin sesiones con duración y RPE.",
}: {
  data: ScatterPoint[];
  emptyLabel?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-36 items-center justify-center rounded-md border border-dashed border-[var(--line-strong)] bg-[rgba(244,247,244,0.025)] p-4 text-sm font-semibold text-[var(--muted)]">
        {emptyLabel}
      </div>
    );
  }

  const width = 420;
  const height = 220;
  const padding = 34;
  const maxDuration = Math.max(...data.map((point) => point.durationMinutes), 60);
  const minRpe = 1;
  const maxRpe = 10;

  return (
    <div>
      <svg className="h-auto w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Dispersión de duración y RPE">
        <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} stroke="rgba(244,247,244,0.18)" />
        <line x1={padding} x2={padding} y1={padding} y2={height - padding} stroke="rgba(244,247,244,0.18)" />
        {[5, 8].map((rpe) => {
          const y = height - padding - ((rpe - minRpe) / (maxRpe - minRpe)) * (height - padding * 2);
          return (
            <g key={rpe}>
              <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="rgba(244,247,244,0.08)" strokeDasharray="4 4" />
              <text x={10} y={y + 4} fill="rgba(244,247,244,0.52)" fontSize="11" fontWeight="700">
                RPE {rpe}
              </text>
            </g>
          );
        })}
        {[0, Math.round(maxDuration / 2), maxDuration].map((duration) => {
          const x = padding + (duration / maxDuration) * (width - padding * 2);
          return (
            <g key={duration}>
              <line x1={x} x2={x} y1={height - padding} y2={height - padding + 4} stroke="rgba(244,247,244,0.18)" />
              <text x={x} y={height - 8} textAnchor="middle" fill="rgba(244,247,244,0.52)" fontSize="11" fontWeight="700">
                {duration}m
              </text>
            </g>
          );
        })}
        {data.map((point) => {
          const x = padding + (point.durationMinutes / maxDuration) * (width - padding * 2);
          const y = height - padding - ((point.rpe - minRpe) / (maxRpe - minRpe)) * (height - padding * 2);
          const radius = point.rpe >= 8 ? 5.5 : 4.5;

          return (
            <circle
              key={point.id}
              cx={x}
              cy={y}
              r={radius}
              fill={getPointColor(point.type)}
              opacity="0.88"
              stroke="rgba(10,14,13,0.9)"
              strokeWidth="1.5"
            >
              <title>{`${point.label} · ${point.date}: ${point.durationMinutes} min · RPE ${point.rpe}`}</title>
            </circle>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--accent)]" /> Running</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--warning)]" /> Mixto/HYROX/CrossFit</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--accent-secondary)]" /> Fuerza/Haltero</span>
      </div>
    </div>
  );
}
