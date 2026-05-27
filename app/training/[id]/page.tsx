import { TrainingDetailView } from "@/components/training/training-detail-view";
import { trainingSessions } from "@/src/data/training-source";

export function generateStaticParams() {
  return trainingSessions.map((session) => ({ id: session.id }));
}

export default function TrainingDetailPage({ params }: { params: { id: string } }) {
  return <TrainingDetailView sessionId={params.id} seedSessions={trainingSessions} />;
}
