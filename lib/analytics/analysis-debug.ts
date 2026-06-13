import { getTrainingDataInsights, type DataInsight } from "@/lib/analytics/data-insights";
import { analysisFixtures } from "@/lib/analytics/__fixtures__/analysis-fixtures";

function compactInsight(insight: DataInsight) {
  return {
    id: insight.id,
    category: insight.category,
    severity: insight.severity,
    title: insight.title,
    evidence: insight.evidence,
    recommendation: insight.recommendation ?? null,
  };
}

export function getAnalysisFixtureOutputs() {
  return analysisFixtures.map((fixture) => {
    const analysis = getTrainingDataInsights(fixture.sessions, { period: "all" });

    return {
      id: fixture.id,
      title: fixture.title,
      intent: fixture.intent,
      expectedSignals: fixture.expectedSignals,
      summary: analysis.summary,
      insights: analysis.insights.map(compactInsight),
      matchedExpectedSignals: fixture.expectedSignals.filter((id) => analysis.insights.some((insight) => insight.id === id)),
    };
  });
}
