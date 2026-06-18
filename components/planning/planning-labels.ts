import type { PlannedSessionPriority, PlannedSessionStatus, PlannedSessionType } from "@/types/planning";

export const plannedSessionTypeLabels: Record<PlannedSessionType, string> = {
  crossfit: "CrossFit",
  hyrox: "HYROX",
  halterofilia: "Halterofilia",
  gimnasticos: "Gimnásticos",
  running: "Running",
  fuerza: "Fuerza",
  movilidad: "Movilidad",
  actividad_funcional: "Actividad funcional",
  mixed: "Mixto",
  descanso: "Descanso",
};

export const plannedSessionStatusLabels: Record<PlannedSessionStatus, string> = {
  planned: "Planificada",
  completed: "Completada",
  skipped: "Saltada",
  moved: "Movida",
  cancelled: "Cancelada",
};

export const plannedSessionPriorityLabels: Record<PlannedSessionPriority, string> = {
  low: "Baja",
  normal: "Normal",
  high: "Alta",
};
