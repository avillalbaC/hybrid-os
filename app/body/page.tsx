import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { bodyChecks } from "@/lib/mock-data";
import { getLatestBodyCheck } from "@/lib/selectors/body";
import { formatDate } from "@/lib/utils/format";

export default function BodyPage() {
  const latest = getLatestBodyCheck(bodyChecks);

  return (
    <>
      <PageHeader
        eyebrow="Body Check"
        title="Control corporal"
        description="Seguimiento de peso, cintura, pasos, sueño, energía y hambre."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Peso" value={`${latest.weightKg} kg`} detail={formatDate(latest.date)} />
        <MetricCard label="Cintura" value={`${latest.waistCm} cm`} detail="Última medición" />
        <MetricCard label="Pasos" value={latest.steps.toLocaleString("es-ES")} detail="Día registrado" />
        <MetricCard label="Sueño" value={`${latest.sleepHours} h`} detail="Recuperación" />
        <MetricCard label="Energía" value={`${latest.energy}/10`} detail="Percepción diaria" />
        <MetricCard label="Hambre" value={`${latest.hunger}/10`} detail="Control de apetito" />
      </section>

      <Card className="mt-6">
        <h3 className="text-lg font-semibold">Evolución reciente</h3>
        <div className="mt-4 divide-y divide-[var(--line)]">
          {bodyChecks.map((check) => (
            <div key={check.id} className="grid gap-2 py-4 text-sm sm:grid-cols-6">
              <p className="font-semibold">{formatDate(check.date)}</p>
              <p>Peso {check.weightKg} kg</p>
              <p>Cintura {check.waistCm} cm</p>
              <p>Pasos {check.steps.toLocaleString("es-ES")}</p>
              <p>Sueño {check.sleepHours} h</p>
              <p className="text-[var(--muted)]">{check.notes}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
