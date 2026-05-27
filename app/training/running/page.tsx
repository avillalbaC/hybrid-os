import { RunningTrainingView } from "@/components/training/running-training-view";
import { trainingSessions } from "@/src/data/training-source";

export default function RunningTrainingPage() {
  return <RunningTrainingView seedSessions={trainingSessions} />;
}

