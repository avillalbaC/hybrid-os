import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function GoalPlanningBetaSection({
  children,
  forceOpen = false,
  plannedCount,
  isLoading,
  onCreate,
}: {
  children: ReactNode;
  forceOpen?: boolean;
  plannedCount: number;
  isLoading?: boolean;
  onCreate?: () => void;
}) {
  return (
    <section>
      <details className="group" open={forceOpen || undefined}>
        <summary className="list-none [&::-webkit-details-marker]:hidden">
          <Card className="cursor-pointer transition hover:border-[var(--accent-border)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Plan semanal beta</p>
                  <Badge tone="neutral">Opcional</Badge>
                </div>
                <h3 className="mt-2 text-2xl font-black tracking-tight">Comparar intención semanal con ejecución real</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                  Úsalo solo si quieres contrastar planificación y entrenamiento real. Puede estar vacío sin penalizar el objetivo.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Badge>{isLoading ? "Cargando" : `${plannedCount} sesiones`}</Badge>
                <span className="text-sm font-bold text-[var(--accent)] group-open:hidden">Abrir</span>
                <span className="hidden text-sm font-bold text-[var(--accent)] group-open:inline">Cerrar</span>
              </div>
            </div>
            {!isLoading && plannedCount === 0 ? (
              <div className="mt-4 flex flex-col gap-3 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.02)] p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-[var(--muted)]">Sin sesiones planificadas esta semana.</p>
                {onCreate ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      onCreate();
                    }}
                    className="inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
                  >
                    Crear sesión
                  </button>
                ) : null}
              </div>
            ) : null}
          </Card>
        </summary>
        <div className="mt-5 grid gap-5">{children}</div>
      </details>
    </section>
  );
}
