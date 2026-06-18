import { GoalsView } from "@/components/goals/goals-view";
import { bodyChecks, nutritionChecks } from "@/lib/mock-data";
import { trainingSessions } from "@/src/data/training-source";

export default function GoalsPage() {
  return <GoalsView sessions={trainingSessions} bodyChecks={bodyChecks} nutritionChecks={nutritionChecks} />;
}
