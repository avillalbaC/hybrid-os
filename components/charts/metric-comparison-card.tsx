export function MetricComparisonCard({
  detail,
  label,
  reference,
  value,
}: {
  detail: string;
  label: string;
  reference?: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-mono text-2xl font-black text-[var(--foreground)]">{value}</p>
      {reference ? <p className="mt-1 font-mono text-xs font-bold text-[var(--accent-strong)]">{reference}</p> : null}
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{detail}</p>
    </div>
  );
}
