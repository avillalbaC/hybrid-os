import type { DataInsight, TrainingDataInsightsResult } from "@/lib/analytics/data-insights";

export type InsightSurface = "home" | "dashboard" | "analysis" | "running" | "muscleLoad";

function uniqueInsights(insights: DataInsight[]) {
  const seen = new Set<string>();

  return insights.filter((insight) => {
    if (seen.has(insight.id)) {
      return false;
    }

    seen.add(insight.id);
    return true;
  });
}

export function getInsightsForSurface(analysis: TrainingDataInsightsResult, surface: InsightSurface) {
  if (surface === "home") {
    return analysis.summary.topSignals.slice(0, 2);
  }

  if (surface === "dashboard") {
    return uniqueInsights([
      ...analysis.summary.topSignals,
      ...analysis.summary.warnings,
      ...analysis.summary.positives,
    ]).slice(0, 7);
  }

  if (surface === "running") {
    const linkedRunningIds = new Set(["hyrox-without-structured-run", "running-shoes-missing"]);

    return analysis.insights
      .filter((insight) => insight.category === "running" || linkedRunningIds.has(insight.id))
      .slice(0, 3);
  }

  if (surface === "muscleLoad") {
    return analysis.insights
      .filter((insight) => insight.category === "muscle")
      .slice(0, 3);
  }

  return analysis.insights;
}

export function getPrimaryRecommendation(analysis: TrainingDataInsightsResult) {
  return analysis.summary.recommendations[0] ?? "Completar más sesiones o datos antes de recomendar cambios.";
}
