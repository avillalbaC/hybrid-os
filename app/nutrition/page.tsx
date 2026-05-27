import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { nutritionChecks } from "@/lib/mock-data";
import { getLatestNutritionCheck } from "@/lib/selectors/nutrition";
import { formatDate, formatDayType, formatDigestion } from "@/lib/utils/format";

export default function NutritionPage() {
  const latest = getLatestNutritionCheck(nutritionChecks);
  const calorieDelta = latest.estimatedCalories - latest.targetCalories;
  const proteinDelta = latest.estimatedProteinGrams - latest.targetProteinGrams;

  return (
    <>
      <PageHeader
        eyebrow="Nutrición"
        title="Control nutricional"
        description="Comparativa de objetivos frente a estimaciones, hidratación, adherencia y digestión."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Calorías objetivo" value={`${latest.targetCalories} kcal`} detail={`Estimadas ${latest.estimatedCalories} kcal`} />
        <MetricCard label="Delta calórico" value={`${calorieDelta > 0 ? "+" : ""}${calorieDelta} kcal`} detail={formatDate(latest.date)} />
        <MetricCard label="Proteína" value={`${latest.estimatedProteinGrams} g`} detail={`Objetivo ${latest.targetProteinGrams} g`} />
        <MetricCard label="Delta proteína" value={`${proteinDelta > 0 ? "+" : ""}${proteinDelta} g`} detail="Estimación diaria" />
        <MetricCard label="Agua" value={`${latest.waterLiters} L`} detail="Hidratación" />
        <MetricCard label="Tipo de día" value={formatDayType(latest.dayType)} detail={`Digestión ${formatDigestion(latest.digestion)}`} />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card>
          <h3 className="text-lg font-semibold">Adherencia</h3>
          <div className="mt-5">
            <ProgressBar value={latest.adherencePercent} label={`${latest.adherencePercent}% del plan`} />
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{latest.notes}</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Registros recientes</h3>
          <div className="mt-4 divide-y divide-[var(--line)]">
            {nutritionChecks.map((check) => (
              <div key={check.id} className="grid gap-2 py-4 text-sm sm:grid-cols-5">
                <p className="font-semibold">{formatDate(check.date)}</p>
                <p>{check.estimatedCalories} kcal</p>
                <p>{check.estimatedProteinGrams} g proteína</p>
                <p>{check.waterLiters} L agua</p>
                <p className="text-[var(--muted)]">{check.adherencePercent}% adherencia</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}
