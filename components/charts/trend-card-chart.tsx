import { Badge } from "@/components/ui/badge";
import { WeeklyBarChart } from "@/components/charts/weekly-bar-chart";
import type { TrendMetric, TrendStatus } from "@/lib/analytics/trends";

export const trendStatusLabels: Record<TrendStatus, string> = {
  subiendo: "Subiendo",
  estable: "Estable",
  bajando: "Bajando",
  estancado: "Estable",
  subida_brusca: "Por encima",
  descarga: "Descarga",
  referencia_insuficiente: "Sin referencia",
};

export function getTrendStatusTone(status: TrendStatus) {
  if (status === "subida_brusca") {
    return "warning" as const;
  }

  if (status === "descarga") {
    return "accent" as const;
  }

  return "neutral" as const;
}

export function formatTrendValue(metric: TrendMetric, value: number | null) {
  if (value === null) {
    return "-";
  }

  if (metric.key.includes("Run") && metric.key.includes("Meters")) {
    return `${(value / 1000).toFixed(1)} km`;
  }

  if (metric.key === "durationMinutes") {
    const rounded = Math.round(value);
    const hours = Math.floor(rounded / 60);
    const minutes = rounded % 60;

    return hours > 0 ? `${hours} h ${minutes.toString().padStart(2, "0")} min` : `${minutes} min`;
  }

  if (metric.key === "totalExternalLoadKg") {
    return value >= 1000 ? `${(value / 1000).toFixed(1)} t` : `${Math.round(value).toLocaleString("es-ES")} kg`;
  }

  if (metric.key === "averageRpe") {
    return value > 0 ? `${value.toFixed(1)}/10` : "-";
  }

  return `${Math.round(value)}`;
}

export function TrendCardChart({ metric }: { metric: TrendMetric }) {
  const change = metric.changePercent === null ? "Sin referencia" : `${metric.changePercent > 0 ? "+" : ""}${metric.changePercent}% vs media 4 semanas`;

  return (
    <article className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{metric.label}</p>
          <p className="mt-3 font-mono text-3xl font-black">{formatTrendValue(metric, metric.currentValue)}</p>
        </div>
        <Badge tone={getTrendStatusTone(metric.status)}>{trendStatusLabels[metric.status]}</Badge>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.02)] p-2">
          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Media reciente</dt>
          <dd className="mt-1 font-mono font-black">{formatTrendValue(metric, metric.recentAverage)}</dd>
        </div>
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.02)] p-2">
          <dt className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Cambio</dt>
          <dd className="mt-1 font-mono font-black">{change}</dd>
        </div>
      </dl>
      <div className="mt-4">
        <WeeklyBarChart
          data={metric.weeklyValues.map((item) => ({ key: item.weekKey, label: item.label, value: item.value }))}
          formatter={(value) => formatTrendValue(metric, value)}
          compact
          tone={metric.status === "subida_brusca" ? "warning" : "accent"}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{metric.message}</p>
    </article>
  );
}
