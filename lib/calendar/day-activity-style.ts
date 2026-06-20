import type { CSSProperties } from "react";
import type { CalendarDiscipline } from "@/types/calendar";

export type CalendarActivityVisualKey = "running" | "crossfit" | "hyrox" | "support";

type ActivitySource = {
  type: CalendarDiscipline | string;
};

type CalendarDayActivityInput = {
  sessions?: ActivitySource[];
  disciplines?: Array<CalendarDiscipline | string>;
  mobilityDone?: boolean;
};

type ActivityTheme = {
  label: string;
  shortLabel: string;
  rgb: string;
  border: string;
  badgeClassName: string;
};

export const activityTheme: Record<CalendarActivityVisualKey, ActivityTheme> = {
  running: {
    label: "Running",
    shortLabel: "RUN",
    rgb: "34, 211, 238",
    border: "rgba(34, 211, 238, 0.34)",
    badgeClassName: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
  },
  crossfit: {
    label: "CrossFit",
    shortLabel: "CF",
    rgb: "185, 130, 92",
    border: "rgba(185, 130, 92, 0.36)",
    badgeClassName: "border-stone-300/30 bg-stone-300/10 text-stone-100",
  },
  hyrox: {
    label: "HYROX",
    shortLabel: "HX",
    rgb: "45, 212, 191",
    border: "rgba(45, 212, 191, 0.34)",
    badgeClassName: "border-teal-300/30 bg-teal-300/10 text-teal-100",
  },
  support: {
    label: "Fuerza / Haltero / Gimnásticos / Movilidad",
    shortLabel: "SUP",
    rgb: "251, 146, 60",
    border: "rgba(251, 146, 60, 0.34)",
    badgeClassName: "border-orange-300/30 bg-orange-300/10 text-orange-100",
  },
};

export const activityLegendItems = [
  { key: "running", label: "Running" },
  { key: "crossfit", label: "CrossFit" },
  { key: "hyrox", label: "HYROX" },
  { key: "support", label: "Fuerza / Haltero / Gimnásticos / Movilidad" },
] satisfies Array<{ key: CalendarActivityVisualKey; label: string }>;

const visualOrder: CalendarActivityVisualKey[] = ["running", "crossfit", "hyrox", "support"];

const supportDisciplines = new Set(["fuerza", "halterofilia", "gimnasticos", "movilidad", "actividad_funcional"]);

const activityLabels: Record<string, string> = {
  running: "Running",
  crossfit: "CrossFit",
  hyrox: "HYROX",
  fuerza: "Fuerza",
  halterofilia: "Haltero",
  gimnasticos: "Gimnásticos",
  movilidad: "Movilidad",
  actividad_funcional: "Actividad funcional",
};

export function getActivityVisualKey(type: CalendarDiscipline | string): CalendarActivityVisualKey | null {
  if (type === "running" || type === "crossfit" || type === "hyrox") {
    return type;
  }

  if (supportDisciplines.has(type)) {
    return "support";
  }

  return null;
}

function getUniqueActivityTypes(input: CalendarDayActivityInput): CalendarActivityVisualKey[] {
  const rawTypes = input.disciplines ?? input.sessions?.map((session) => session.type) ?? [];
  const activityTypes = new Set<CalendarActivityVisualKey>();

  rawTypes.forEach((type) => {
    const visualKey = getActivityVisualKey(type);

    if (visualKey) {
      activityTypes.add(visualKey);
    }
  });

  if (input.mobilityDone) {
    activityTypes.add("support");
  }

  return visualOrder.filter((type) => activityTypes.has(type));
}

function getActivityLabel(input: CalendarDayActivityInput) {
  const rawTypes = input.disciplines ?? input.sessions?.map((session) => session.type) ?? [];
  const labels = new Set<string>();

  rawTypes.forEach((type) => {
    const label = activityLabels[type];

    if (label) {
      labels.add(label);
    }
  });

  if (input.mobilityDone) {
    labels.add(activityLabels.movilidad);
  }

  return labels.size > 0 ? Array.from(labels).join(" + ") : null;
}

function rgba(type: CalendarActivityVisualKey, alpha: number) {
  return `rgba(${activityTheme[type].rgb}, ${alpha})`;
}

export function buildActivityGradient(activityTypes: CalendarActivityVisualKey[]) {
  if (activityTypes.length === 0) {
    return null;
  }

  if (activityTypes.length === 1) {
    const [activityType] = activityTypes;

    return `linear-gradient(135deg, ${rgba(activityType, 0.3)}, ${rgba(activityType, 0.16)})`;
  }

  const stops = activityTypes.map((activityType, index) => {
    const position = Math.round((index / (activityTypes.length - 1)) * 100);
    return `${rgba(activityType, 0.3)} ${position}%`;
  });

  return `linear-gradient(135deg, ${stops.join(", ")})`;
}

export function getActivityColor(type: CalendarDiscipline | string) {
  const visualKey = getActivityVisualKey(type);

  return visualKey ? activityTheme[visualKey] : null;
}

export function getCalendarDayActivityVisual(input: CalendarDayActivityInput): {
  activityTypes: CalendarActivityVisualKey[];
  backgroundStyle: CSSProperties | undefined;
  borderColor: string | undefined;
  label: string | null;
  legendKeys: CalendarActivityVisualKey[];
} {
  const activityTypes = getUniqueActivityTypes(input);
  const activityGradient = buildActivityGradient(activityTypes);

  if (!activityGradient) {
    return {
      activityTypes,
      backgroundStyle: undefined,
      borderColor: undefined,
      label: null,
      legendKeys: activityTypes,
    };
  }

  return {
    activityTypes,
    backgroundStyle: {
      backgroundImage: [
        "linear-gradient(180deg, rgba(7, 10, 9, 0.1), rgba(7, 10, 9, 0.44))",
        activityGradient,
      ].join(", "),
    },
    borderColor: activityTheme[activityTypes[0]].border,
    label: getActivityLabel(input),
    legendKeys: activityTypes,
  };
}
