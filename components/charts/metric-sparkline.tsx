import { getPointPath, hasChartData } from "@/components/charts/chart-utils";

export function MetricSparkline({
  ariaLabel,
  className = "",
  values,
}: {
  ariaLabel: string;
  className?: string;
  values: number[];
}) {
  const width = 120;
  const height = 34;

  if (!hasChartData(values)) {
    return <div className={`h-8 rounded-md border border-dashed border-[var(--line)] ${className}`} aria-label="Histórico insuficiente" />;
  }

  const points = getPointPath(values, width, height);

  return (
    <svg className={className} width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="rgba(119, 255, 214, 0.95)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={points} fill="none" stroke="rgba(119, 255, 214, 0.18)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
