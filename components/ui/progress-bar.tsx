export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      {label ? <div className="mb-2 text-sm font-medium text-[var(--muted)]">{label}</div> : null}
      <div className="h-2 overflow-hidden rounded-full border border-[var(--line)] bg-[rgba(244,247,244,0.05)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-strong))] shadow-[0_0_18px_rgba(56,217,159,0.28)]"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
