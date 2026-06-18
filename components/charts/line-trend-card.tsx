import { getPointPath, hasChartData } from "@/components/charts/chart-utils";

export type LineTrendPoint = {
  key: string;
  label: string;
  value: number;
};

export function LineTrendCard({
  data,
  label,
  value,
}: {
  data: LineTrendPoint[];
  label: string;
  value: string;
}) {
  const width = 180;
  const height = 54;
  const values = data.map((point) => point.value);
  const path = getPointPath(values, width, height);

  return (
    <article className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-[var(--foreground)]">{label}</p>
          <p className="mt-1 font-mono text-xs font-bold text-[var(--accent-strong)]">{value}</p>
        </div>
      </div>
      {hasChartData(values) ? (
        <svg className="mt-3 h-auto w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Tendencia de ${label}`}>
          <polyline points={path} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {values.map((pointValue, index) => {
            const max = Math.max(...values, 1);
            const x = values.length > 1 ? index * (width / (values.length - 1)) : width / 2;
            const y = height - (Math.max(0, pointValue) / max) * (height - 4) - 2;
            return <circle key={`${data[index]?.key}-${index}`} cx={x} cy={y} r="2.5" fill="var(--accent-strong)" />;
          })}
        </svg>
      ) : (
        <p className="mt-3 rounded-md border border-dashed border-[var(--line)] p-3 text-xs font-semibold text-[var(--muted)]">Sin carga en la ventana.</p>
      )}
    </article>
  );
}
