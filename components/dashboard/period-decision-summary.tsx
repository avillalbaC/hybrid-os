import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import type { TrainingDataInsightsResult } from "@/lib/analytics/data-insights";

export function PeriodDecisionSummary({
  analysis,
  isLoading,
}: {
  analysis: TrainingDataInsightsResult;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <SkeletonBlock className="h-5 w-40" />
        <SkeletonBlock className="mt-4 h-8 w-3/4" />
        <div className="mt-4">
          <SkeletonText lines={3} />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={analysis.summary.status === "normal" ? "accent" : analysis.summary.status === "insuficiente" ? "neutral" : "warning"}>
              {analysis.summary.status.replace("_", " ")}
            </Badge>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Lectura del periodo</p>
          </div>
          <h3 className="mt-3 text-2xl font-black tracking-tight">{analysis.summary.headline}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted-strong)]">{analysis.summary.summary}</p>
        </div>
        <Link href="/analysis" className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Ver análisis
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {analysis.summary.topSignals.slice(0, 3).map((signal) => (
          <div key={signal.id} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
            <p className="text-sm font-bold text-[var(--foreground)]">{signal.title}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{signal.evidence[0] ?? signal.message}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
