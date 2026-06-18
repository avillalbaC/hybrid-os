import { Card } from "@/components/ui/card";
import { formatMuscleName } from "@/lib/utils/format";
import type { GoalBlock } from "@/types/goals";

export function GoalWatchCard({ goal }: { goal: GoalBlock | null }) {
  const muscles = goal?.targets.watch?.muscles ?? [];
  const notes = goal?.targets.watch?.notes ?? [];

  return (
    <Card>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Señales a vigilar</p>
      <h3 className="mt-2 text-2xl font-black tracking-tight">Vigilancia del bloque</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
          <p className="text-sm font-black text-[var(--foreground)]">Músculos</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {muscles.length > 0 ? (
              muscles.map((muscle) => (
                <span key={muscle} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.035)] px-2 py-1 text-xs font-bold text-[var(--muted-strong)]">
                  {formatMuscleName(muscle)}
                </span>
              ))
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">Sin músculos definidos.</p>
            )}
          </div>
        </div>
        <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
          <p className="text-sm font-black text-[var(--foreground)]">Notas</p>
          <div className="mt-3 space-y-2">
            {notes.length > 0 ? (
              notes.map((note) => (
                <p key={note} className="text-sm leading-6 text-[var(--muted-strong)]">{note}</p>
              ))
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">Sin notas de vigilancia.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
