import { WeeklyTrainingView } from "@/components/training/weekly-training-view";
import { trainingSessions } from "@/src/data/training-source";

export default function WeeklyTrainingPage() {
  return <WeeklyTrainingView seedSessions={trainingSessions} />;
}

