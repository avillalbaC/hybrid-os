import { Card } from "@/components/ui/card";

export function PlanningEmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <Card>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Plan semanal</p>
      <h3 className="mt-2 text-2xl font-black tracking-tight">No hay plan semanal</h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        Aquí defines qué pretendes hacer esta semana para comparar intención y ejecución sin mezclarlo con entrenamientos reales.
      </p>
      {onCreate ? (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          Crear sesión planificada
        </button>
      ) : null}
    </Card>
  );
}
