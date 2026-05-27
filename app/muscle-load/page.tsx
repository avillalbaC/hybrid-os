import { MuscleLoadView } from "@/components/muscle-load/muscle-load-view";
import { trainingSessions } from "@/src/data/training-source";

export default function MuscleLoadPage() {
  return <MuscleLoadView seedSessions={trainingSessions} />;
}
