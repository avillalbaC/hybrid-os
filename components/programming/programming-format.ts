import type { ProgrammingBlockStatus, ProgrammingSessionStatus, ProgrammingSessionType } from "@/types/programming";

export const programmingTypeLabels: Record<ProgrammingSessionType, string> = {
  gimnasticos: "Gimnásticos",
  running: "Running",
  fuerza: "Fuerza",
  halterofilia: "Halterofilia",
  crossfit: "CrossFit",
  hyrox: "HYROX",
  movilidad: "Movilidad",
  mixed: "Mixto",
  other: "Otro",
};

export const programmingStatusLabels: Record<ProgrammingSessionStatus, string> = {
  planned: "Planificada",
  in_progress: "En curso",
  completed: "Completada",
  partially_completed: "Parcial",
  skipped: "Saltada",
};

export const programmingBlockStatusLabels: Record<ProgrammingBlockStatus, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  completed: "Completado",
  skipped: "Saltado",
};

export function formatProgrammingDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function formatCompactProgrammingDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${date}T00:00:00`));
}

export function getProgrammingProgress(blocks: Array<{ status: ProgrammingBlockStatus }>) {
  const completed = blocks.filter((block) => block.status === "completed").length;
  const actionable = blocks.filter((block) => block.status === "completed" || block.status === "pending" || block.status === "in_progress").length;
  const total = blocks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    completed,
    actionable,
    total,
    percentage,
  };
}
