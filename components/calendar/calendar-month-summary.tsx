import { Card } from "@/components/ui/card";
import { getCalendarDisciplineLabel } from "@/components/calendar/discipline-badge";
import type { CalendarMonthSummary } from "@/types/calendar";

function SummaryItem({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "neutral" | "accent" | "warning";
}) {
  const toneClass = tone === "accent"
    ? "text-[var(--accent-strong)]"
    : tone === "warning"
      ? "text-[var(--warning)]"
      : "text-[var(--foreground)]";

  return (
    <div className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-black ${toneClass}`}>{value}</p>
      {detail ? <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{detail}</p> : null}
    </div>
  );
}

export function CalendarMonthSummary({ summary }: { summary: CalendarMonthSummary }) {
  const daysInMonth = Number(summary.monthEnd.slice(-2));

  return (
    <Card className="p-3">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryItem
          label="Racha entreno"
          value={`${summary.currentTrainingStreak} d`}
          detail={`Mejor mes: ${summary.bestTrainingStreakInMonth} d`}
          tone={summary.currentTrainingStreak > 0 ? "accent" : "neutral"}
        />
        <SummaryItem
          label="Racha movimiento"
          value={`${summary.currentMovementStreak} d`}
          detail={`${summary.movementDays}/${daysInMonth} días con movimiento`}
          tone={summary.currentMovementStreak > 0 ? "accent" : "neutral"}
        />
        <SummaryItem
          label="Días activos"
          value={`${summary.trainingDays}/${daysInMonth}`}
          detail="Con al menos una sesión real"
        />
        <SummaryItem
          label="Sesiones"
          value={`${summary.sessionsCount}`}
          detail="Training sessions del mes"
        />
        <SummaryItem
          label="Movilidad"
          value={`${summary.mobilityDays} d`}
          detail="Marcada o sesión de movilidad"
        />
        <SummaryItem
          label="Disciplina top"
          value={getCalendarDisciplineLabel(summary.dominantDiscipline)}
          detail={summary.dominantDiscipline === "mixed" ? "Empate entre disciplinas" : "Por número de sesiones"}
          tone={summary.dominantDiscipline ? "accent" : "neutral"}
        />
      </div>
    </Card>
  );
}
