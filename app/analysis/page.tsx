import { AnalysisPage } from "@/components/analysis/analysis-page";
import { bodyChecks, nutritionChecks } from "@/lib/mock-data";
import { trainingSessions } from "@/src/data/training-source";

export default function AnalysisRoute() {
  return <AnalysisPage sessions={trainingSessions} bodyChecks={bodyChecks} nutritionChecks={nutritionChecks} />;
}
