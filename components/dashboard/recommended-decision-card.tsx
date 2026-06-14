import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import { getPrimaryRecommendation } from "@/lib/analytics/insight-surface";
import type { TrainingDataInsightsResult } from "@/lib/analytics/data-insights";

function getAvoidPrioritizeCopy(recommendation: string) {
  const lower = recommendation.toLowerCase();

  if (lower.includes("impacto") || lower.includes("gemelos") || lower.includes("carrera")) {
    return {
      prioritize: "Z2 suave, movilidad, sueño o descanso activo.",
      avoid: "Otra sesión dura con carrera, saltos o trineo si hay rigidez.",
    };
  }

  if (lower.includes("fuerza") || lower.includes("pesada") || lower.includes("carga externa")) {
    return {
      prioritize: "Técnica controlada, accesorios moderados o recuperación activa.",
      avoid: "Combinar otra sesión pesada con alta intensidad metabólica.",
    };
  }

  if (lower.includes("movilidad") || lower.includes("recuperación")) {
    return {
      prioritize: "Movilidad, sueño y una sesión controlada si entrenas.",
      avoid: "Sumar intensidad sin revisar fatiga local, impacto y RPE.",
    };
  }

  return {
    prioritize: "Mantener registro completo y elegir la siguiente sesión según sensaciones.",
    avoid: "Cambiar el bloque solo por una señal aislada.",
  };
}

function getDecisionEvidence(analysis: TrainingDataInsightsResult) {
  const evidence = analysis.summary.topSignals
    .flatMap((signal) => signal.evidence.slice(0, 2))
    .filter(Boolean);

  return Array.from(new Set(evidence)).slice(0, 3);
}

export function RecommendedDecisionCard({
  analysis,
  isLoading,
}: {
  analysis: TrainingDataInsightsResult;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <SkeletonBlock className="h-5 w-44" />
        <SkeletonBlock className="mt-4 h-8 w-4/5" />
        <div className="mt-4">
          <SkeletonText lines={3} />
        </div>
      </Card>
    );
  }

  const recommendation = getPrimaryRecommendation(analysis);
  const evidence = getDecisionEvidence(analysis);
  const actionCopy = getAvoidPrioritizeCopy(recommendation);

  return (
    <Card className="border-[rgba(240,196,107,0.26)]">
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Decisión recomendada</p>
      <h3 className="mt-3 text-2xl font-black tracking-tight">{recommendation}</h3>
      <div className="mt-4 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Por qué</p>
        {evidence.length > 0 ? (
          <ul className="mt-2 space-y-1 text-sm leading-6 text-[var(--muted-strong)]">
            {evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">{analysis.summary.summary}</p>
        )}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Priorizar</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--foreground)]">{actionCopy.prioritize}</p>
        </div>
        <div className="rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-3">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--warning)]">Evitar</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--foreground)]">{actionCopy.avoid}</p>
        </div>
      </div>
      <Link href="/analysis" className="mt-5 inline-flex text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
        Ver evidencia completa
      </Link>
    </Card>
  );
}
