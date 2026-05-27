export function MetricCard({
  label,
  value,
  detail,
  delta,
  deltaTone = "neutral",
  tone = "default",
}: {
  label: string;
  value: string;
  detail?: string;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  tone?: "default" | "strong";
}) {
  const deltaClassName = {
    positive: "border-[rgba(56,217,159,0.2)] bg-[rgba(56,217,159,0.08)] text-[var(--accent-strong)]",
    negative: "border-[rgba(240,196,107,0.2)] bg-[rgba(240,196,107,0.08)] text-[var(--warning)]",
    neutral: "border-[var(--line)] bg-[rgba(244,247,244,0.035)] text-[var(--muted-strong)]",
  }[deltaTone];

  return (
    <div
      className={`rounded-md border p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:shadow-[0_28px_90px_rgba(0,0,0,0.34)] ${
        tone === "strong"
          ? "border-[rgba(56,217,159,0.28)] bg-[linear-gradient(180deg,rgba(56,217,159,0.14),rgba(16,21,19,0.96))]"
          : "border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))]"
      }`}
    >
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
      <p className="mt-4 font-mono text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">{value}</p>
      {detail ? <p className="mt-3 text-sm leading-5 text-[var(--muted)]">{detail}</p> : null}
      {delta ? (
        <p className={`mt-4 inline-flex rounded-md border px-2.5 py-1.5 font-mono text-xs font-black ${deltaClassName}`}>
          {delta}
        </p>
      ) : null}
    </div>
  );
}
