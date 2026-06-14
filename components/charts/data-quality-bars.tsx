import { HorizontalRankingChart } from "@/components/charts/horizontal-ranking-chart";
import type { DataQualityChartData } from "@/lib/analytics/chart-data";

export function DataQualityBars({
  data,
}: {
  data: DataQualityChartData;
}) {
  const total = Math.max(data.total, 1);
  const items = [
    { key: "with-rpe", label: "Con RPE", value: data.withRpe, percentage: (data.withRpe / total) * 100, detail: `${data.withoutRpe} sin RPE` },
    { key: "with-duration", label: "Con duración", value: data.withDuration, percentage: (data.withDuration / total) * 100, detail: `${data.withoutDuration} sin duración` },
    { key: "with-result", label: "Con resultado", value: data.withResult, percentage: (data.withResult / total) * 100, detail: `${data.withoutResult} sin resultado` },
    { key: "complete", label: "Completas", value: data.complete, percentage: (data.complete / total) * 100, detail: `${data.partial} parciales` },
  ];

  return (
    <HorizontalRankingChart
      emptyLabel="Sin histórico para calidad de datos"
      formatter={(value) => `${value}/${data.total}`}
      items={items}
      tone="accent"
    />
  );
}
