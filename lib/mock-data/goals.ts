import type { Goal } from "@/types/goals";

export const goals: Goal[] = [
  {
    id: "goal-hyrox-run",
    title: "Mantener 4:35/km en bloques HYROX",
    category: "performance",
    status: "active",
    progressPercent: 68,
    targetDate: "2026-07-15",
    metric: "Ritmo bajo fatiga",
  },
  {
    id: "goal-waist",
    title: "Bajar cintura a 81.5 cm",
    category: "body",
    status: "active",
    progressPercent: 56,
    targetDate: "2026-08-01",
    metric: "Cintura",
  },
  {
    id: "goal-protein",
    title: "Cumplir proteína 6 días por semana",
    category: "nutrition",
    status: "active",
    progressPercent: 83,
    metric: "Adherencia",
  },
  {
    id: "goal-sleep",
    title: "Dormir 7 h de media",
    category: "recovery",
    status: "active",
    progressPercent: 74,
    metric: "Sueño",
  },
];
