import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SkeletonBlock } from "@/components/ui/skeleton";
import type { TrendMetric, TrendStatus, WeeklyTrendMetrics } from "@/lib/analytics/trends";

const statusLabels: Record<TrendStatus, string> = {
  subiendo: "Subiendo",
  estable: "Estable",
  bajando: "Bajando",
  estancado: "Estable",
  subida_brusca: "Por encima",
  descarga: "Descarga",
  referencia_insuficiente: "Sin referencia",
};

function formatTrendValue(metric: TrendMetric) {
  const value = metric.currentValue;

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

function getStatusTone(status: TrendStatus) {
  if (status === "subida_brusca") {
    return "warning" as const;
  }

  if (status === "descarga") {
    return "accent" as const;
  }

  return "neutral" as const;
}

function TrendPreviewCard({ metric }: { metric: TrendMetric }) {
  const change = metric.changePercent === null ? "Sin referencia" : `${metric.changePercent > 0 ? "+" : ""}${metric.changePercent}% vs media`;

  return (
    <article className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{metric.label}</p>
          <p className="mt-3 font-mono text-2xl font-black">{formatTrendValue(metric)}</p>
        </div>
        <Badge tone={getStatusTone(metric.status)}>{statusLabels[metric.status]}</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{change}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--muted-strong)]">{metric.message}</p>
    </article>
  );
}

export function KeyTrendsPreview({
  trends,
  isLoading,
}: {
  trends: WeeklyTrendMetrics;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Tendencias clave</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Evolución que importa ahora</h3>
        </div>
        <Link href="/analysis" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Ver tendencias completas
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Tendencias clave calculando">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-28" />
          ))}
        </div>
      ) : trends.buckets.length === 0 || !trends.currentWeek?.sessionsCount ? (
        <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4 text-sm leading-6 text-[var(--muted)]">
          Sin entrenamientos suficientes para tendencias.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {trends.keyTrends.slice(0, 5).map((metric) => (
            <TrendPreviewCard key={metric.key} metric={metric} />
          ))}
        </div>
      )}
    </Card>
  );
}
