import type { CalendarDiscipline } from "@/types/calendar";
import { activityTheme } from "@/lib/calendar/day-activity-style";

type DisciplineConfig = {
  code: string;
  label: string;
  className: string;
};

export const disciplineConfig: Record<CalendarDiscipline, DisciplineConfig> = {
  running: {
    code: "RUN",
    label: "Running",
    className: activityTheme.running.badgeClassName,
  },
  hyrox: {
    code: "HX",
    label: "HYROX",
    className: activityTheme.hyrox.badgeClassName,
  },
  crossfit: {
    code: "CF",
    label: "CrossFit",
    className: activityTheme.crossfit.badgeClassName,
  },
  fuerza: {
    code: "STR",
    label: "Fuerza",
    className: activityTheme.support.badgeClassName,
  },
  halterofilia: {
    code: "WL",
    label: "Haltero",
    className: activityTheme.support.badgeClassName,
  },
  gimnasticos: {
    code: "GYM",
    label: "Gimnásticos",
    className: activityTheme.support.badgeClassName,
  },
  movilidad: {
    code: "MOB",
    label: "Movilidad",
    className: activityTheme.support.badgeClassName,
  },
  actividad_funcional: {
    code: "ACT",
    label: "Actividad funcional",
    className: activityTheme.support.badgeClassName,
  },
  mixed: {
    code: "MIX",
    label: "Mixto",
    className: "border-[var(--line-strong)] bg-[rgba(244,247,244,0.06)] text-[var(--foreground)]",
  },
  other: {
    code: "OTR",
    label: "Otro",
    className: "border-[var(--line)] bg-[rgba(244,247,244,0.035)] text-[var(--muted-strong)]",
  },
};

export function getCalendarDisciplineLabel(discipline: CalendarDiscipline | "mixed" | null) {
  if (!discipline) {
    return "-";
  }

  return disciplineConfig[discipline].label;
}

export function DisciplineBadge({
  discipline,
  compact = false,
}: {
  discipline: CalendarDiscipline;
  compact?: boolean;
}) {
  const config = disciplineConfig[discipline];

  return (
    <span
      title={config.label}
      className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono font-black uppercase tracking-[0.08em] ${config.className} ${
        compact ? "text-[0.52rem]" : "text-[0.66rem]"
      }`}
    >
      {config.code}
    </span>
  );
}
