import { Card } from "@/components/ui/card";

const modules = [
  "Importador de programaciones",
  "Plantillas semanales",
  "Calendario",
];

export function FuturePlanningCard() {
  return (
    <Card>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Próximos módulos</p>
      <h3 className="mt-2 text-2xl font-black tracking-tight">Planificación dentro de Objetivos</h3>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        La base manual ya existe. Los siguientes módulos ampliarán cómo crear, mover y reutilizar programaciones.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {modules.map((module) => (
          <div key={module} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
            <p className="text-sm font-black text-[var(--foreground)]">{module}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Pendiente</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
