import { HorizontalRankingChart } from "@/components/charts/horizontal-ranking-chart";
import type { DisciplineDistributionItem } from "@/lib/analytics/chart-data";

export function DisciplineDistributionChart({
  data,
}: {
  data: DisciplineDistributionItem[];
}) {
  return (
    <HorizontalRankingChart
      emptyLabel="Sin distribución de disciplinas"
      formatter={(value) => `${value} sesiones`}
      items={data.map((item) => ({
        key: item.label,
        label: item.label,
        value: item.count,
        percentage: item.percentage,
        detail: `${item.percentage}% del periodo · fatiga ${item.fatigueCost}`,
      }))}
      tone="secondary"
    />
  );
}
