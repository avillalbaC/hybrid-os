import { DashboardView } from "@/components/dashboard/dashboard-view";
import { bodyChecks, nutritionChecks } from "@/lib/mock-data";
import { trainingSessions } from "@/src/data/training-source";

export default function DashboardPage() {
  return <DashboardView sessions={trainingSessions} bodyChecks={bodyChecks} nutritionChecks={nutritionChecks} />;
}

