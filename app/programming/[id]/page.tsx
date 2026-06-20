import { ProgrammingDetailView } from "@/components/programming/programming-detail-view";

export default function ProgrammingDetailPage({ params }: { params: { id: string } }) {
  return <ProgrammingDetailView sessionId={params.id} />;
}
