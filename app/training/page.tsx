import { TrainingLogView } from "@/components/training/training-log-view";
import { trainingSessions } from "@/src/data/training-source";

export default function TrainingPage() {
  return <TrainingLogView seedSessions={trainingSessions} />;
}
