type BadgeTone = "neutral" | "accent" | "warning";

const tones: Record<BadgeTone, string> = {
  neutral: "border-[var(--line)] bg-[rgba(244,247,244,0.04)] text-[var(--muted-strong)]",
  accent: "border-[rgba(56,217,159,0.3)] bg-[var(--accent-soft)] text-[var(--accent-strong)]",
  warning: "border-[rgba(240,196,107,0.32)] bg-[var(--warning-soft)] text-[var(--warning)]",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] ${tones[tone]}`}>
      {children}
    </span>
  );
}
