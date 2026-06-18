import type { CalendarDiscipline } from "@/types/calendar";

type DisciplineConfig = {
  code: string;
  label: string;
  className: string;
};

export const disciplineConfig: Record<CalendarDiscipline, DisciplineConfig> = {
  running: {
    code: "RUN",
    label: "Running",
    className: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
  },
  hyrox: {
    code: "HX",
    label: "HYROX",
    className: "border-amber-300/35 bg-amber-300/10 text-amber-100",
  },
  crossfit: {
    code: "CF",
    label: "CrossFit",
    className: "border-sky-300/30 bg-sky-300/10 text-sky-100",
  },
  fuerza: {
    code: "STR",
    label: "Fuerza",
    className: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  },
  halterofilia: {
    code: "WL",
    label: "Haltero",
    className: "border-teal-300/30 bg-teal-300/10 text-teal-100",
  },
  gimnasticos: {
    code: "GYM",
    label: "Gimnásticos",
    className: "border-violet-300/30 bg-violet-300/10 text-violet-100",
  },
  movilidad: {
    code: "MOB",
    label: "Movilidad",
    className: "border-lime-300/30 bg-lime-300/10 text-lime-100",
  },
  actividad_funcional: {
    code: "ACT",
    label: "Actividad funcional",
    className: "border-orange-300/30 bg-orange-300/10 text-orange-100",
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
