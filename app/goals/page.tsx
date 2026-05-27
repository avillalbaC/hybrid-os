import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { goals } from "@/lib/mock-data";
import { formatDate, formatGoalStatus } from "@/lib/utils/format";
import type { GoalCategory } from "@/types/goals";

const categoryLabels: Record<GoalCategory, string> = {
  performance: "Rendimiento",
  body: "Corporal",
  nutrition: "Nutrición",
  habit: "Hábito",
  recovery: "Recuperación",
};

export default function GoalsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Objetivos"
        title="Objetivos"
        description="Objetivos básicos de rendimiento, composición corporal, nutrición y recuperación."
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge tone="accent">{categoryLabels[goal.category]}</Badge>
                <h3 className="mt-3 text-lg font-semibold">{goal.title}</h3>
              </div>
              <Badge>{formatGoalStatus(goal.status)}</Badge>
            </div>
            <div className="mt-5">
              <ProgressBar value={goal.progressPercent} label={`${goal.progressPercent}% completado`} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--muted)]">
              {goal.metric ? <span>{goal.metric}</span> : null}
              {goal.targetDate ? <span>Objetivo {formatDate(goal.targetDate)}</span> : null}
            </div>
          </Card>
        ))}
      </section>
    </>
  );
}
