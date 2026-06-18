import { Card } from "@/components/ui/card";

export function GoalEmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <Card>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Objetivo activo</p>
      <h3 className="mt-2 text-2xl font-black tracking-tight">No hay objetivo activo</h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        Los análisis actuales siguen siendo descriptivos. Crea un bloque activo para que Hybrid OS compare la semana contra targets concretos.
      </p>
      {onCreate ? (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          Crear objetivo activo
        </button>
      ) : null}
    </Card>
  );
}
