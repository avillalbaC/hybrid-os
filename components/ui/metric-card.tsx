import { SkeletonBlock } from "@/components/ui/skeleton";
import { MetricSparkline } from "@/components/charts/metric-sparkline";

type MetricComparisonDisplay = {
  expectedLabel: string;
  expectedValue: string | null;
  deltaVsExpectedLabel: string | null;
  previousFullLabel: string;
  previousFullValue: string | null;
  previousSameProgressLabel: string;
  previousSameProgressValue: string | null;
  deltaVsPreviousFullLabel: string | null;
  badgeLabel: string;
  badgeTone: "positive" | "negative" | "neutral";
};

export function MetricCard({
  label,
  value,
  detail,
  delta,
  deltaTone = "neutral",
  secondaryDelta,
  secondaryDeltaTone = "neutral",
  comparison,
  tone = "default",
  state = "ready",
  emptyLabel = "Sin datos del periodo",
  sparklineData,
  sparklineLabel,
}: {
  label: string;
  value: string;
  detail?: string;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  secondaryDelta?: string;
  secondaryDeltaTone?: "positive" | "negative" | "neutral";
  comparison?: MetricComparisonDisplay;
  tone?: "default" | "strong";
  state?: "loading" | "ready" | "empty";
  emptyLabel?: string;
  sparklineData?: number[];
  sparklineLabel?: string;
}) {
  const getDeltaClassName = (value: "positive" | "negative" | "neutral") => ({
    positive: "border-[var(--accent-secondary-border)] bg-[var(--accent-secondary-soft)] text-[var(--accent-secondary-text)]",
    negative: "border-[rgba(240,196,107,0.2)] bg-[rgba(240,196,107,0.08)] text-[var(--warning)]",
    neutral: "border-[var(--line)] bg-[rgba(244,247,244,0.035)] text-[var(--muted-strong)]",
  })[value];

  return (
    <div
      className={`rounded-md border p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:shadow-[0_28px_90px_rgba(0,0,0,0.34)] ${
        tone === "strong"
          ? "border-[var(--accent-border)] bg-[linear-gradient(180deg,var(--accent-hero),rgba(16,21,19,0.96))]"
          : "border-[var(--line)] bg-[linear-gradient(180deg,var(--panel-strong),var(--panel))]"
      }`}
    >
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
      {state === "loading" ? (
        <div className="mt-4" aria-label={`${label}: calculando`}>
          <SkeletonBlock className="h-10 w-28" />
          <SkeletonBlock className="mt-3 h-4 w-40" />
          <SkeletonBlock className="mt-4 h-7 w-24" />
        </div>
      ) : state === "empty" ? (
        <>
          <p className="mt-4 min-h-10 text-base font-bold leading-6 text-[var(--muted-strong)]">{emptyLabel}</p>
          {detail ? <p className="mt-3 text-sm leading-5 text-[var(--muted)]">{detail}</p> : null}
        </>
      ) : (
        <>
          <p className="mt-4 font-mono text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">{value}</p>
          {detail ? <p className="mt-3 text-sm leading-5 text-[var(--muted)]">{detail}</p> : null}
        </>
      )}
      {state === "ready" && comparison ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
            <p className="mb-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--accent)]">Ritmo actual</p>
            {comparison.expectedValue ? (
              <p className="break-words text-sm leading-6 text-[var(--muted-strong)]">
                <span>{comparison.expectedLabel}</span>{" "}
                <span className="font-mono font-black text-[var(--foreground)]">{comparison.expectedValue}</span>
                {comparison.deltaVsExpectedLabel ? (
                  <>
                    <span className="text-[var(--muted)]"> · Diferencia </span>
                    <span className="font-mono font-black text-[var(--foreground)]">{comparison.deltaVsExpectedLabel}</span>
                  </>
                ) : null}
              </p>
            ) : (
              <p className="text-sm font-semibold leading-6 text-[var(--muted-strong)]">Referencia insuficiente</p>
            )}
          </div>
          <div className="break-words rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm leading-6 text-[var(--muted-strong)]">
            <p className="mb-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--accent)]">Referencia</p>
            <p>
              <span>{comparison.previousFullLabel}</span>{" "}
              <span className="font-mono font-black text-[var(--foreground)]">{comparison.previousFullValue ?? "Sin datos"}</span>
              {comparison.previousSameProgressValue ? (
                <>
                  <span className="text-[var(--muted)]"> · {comparison.previousSameProgressLabel} </span>
                  <span className="font-mono font-black text-[var(--foreground)]">{comparison.previousSameProgressValue}</span>
                </>
              ) : null}
            </p>
            {comparison.deltaVsPreviousFullLabel ? (
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{comparison.deltaVsPreviousFullLabel}</p>
            ) : null}
          </div>
          <p className={`inline-flex rounded-md border px-2.5 py-1.5 font-mono text-xs font-black ${getDeltaClassName(comparison.badgeTone)}`}>
            {comparison.badgeLabel}
          </p>
        </div>
      ) : state === "ready" && delta ? (
        <p className={`mt-4 inline-flex rounded-md border px-2.5 py-1.5 font-mono text-xs font-black ${getDeltaClassName(deltaTone)}`}>
          {delta}
        </p>
      ) : null}
      {state === "ready" && !comparison && sparklineData && sparklineData.length > 1 ? (
        <div className="mt-4 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-2">
          <MetricSparkline ariaLabel={sparklineLabel ?? `${label}: evolución reciente`} values={sparklineData} />
        </div>
      ) : null}
      {state === "ready" && !comparison && secondaryDelta ? (
        <p className={`mt-2 inline-flex rounded-md border px-2.5 py-1.5 font-mono text-[0.68rem] font-bold ${getDeltaClassName(secondaryDeltaTone)}`}>
          {secondaryDelta}
        </p>
      ) : null}
    </div>
  );
}
