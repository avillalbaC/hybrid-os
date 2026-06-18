import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { GoalProgressSignal } from "@/types/goals";

function getTone(severity: GoalProgressSignal["severity"]) {
  if (severity === "positive") {
    return "accent" as const;
  }

  if (severity === "warning" || severity === "critical") {
    return "warning" as const;
  }

  return "neutral" as const;
}

export function GoalSignalList({
  eyebrow,
  title,
  empty,
  signals,
}: {
  eyebrow: string;
  title: string;
  empty: string;
  signals: GoalProgressSignal[];
}) {
  return (
    <Card>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">{eyebrow}</p>
      <h3 className="mt-2 text-2xl font-black tracking-tight">{title}</h3>
      <div className="mt-4 grid gap-3">
        {signals.length > 0 ? (
          signals.slice(0, 6).map((signal) => (
            <div key={signal.id} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black text-[var(--foreground)]">{signal.label}</p>
                  {signal.valueLabel || signal.targetLabel ? (
                    <p className="mt-1 font-mono text-xs font-bold text-[var(--muted)]">
                      {[signal.valueLabel, signal.targetLabel].filter(Boolean).join(" / ")}
                    </p>
                  ) : null}
                </div>
                <Badge tone={getTone(signal.severity)}>{signal.category}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-strong)]">{signal.evidence}</p>
            </div>
          ))
        ) : (
          <p className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm leading-6 text-[var(--muted)]">
            {empty}
          </p>
        )}
      </div>
    </Card>
  );
}
