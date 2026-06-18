export type CalendarDiscipline =
  | "running"
  | "hyrox"
  | "crossfit"
  | "fuerza"
  | "halterofilia"
  | "gimnasticos"
  | "movilidad"
  | "actividad_funcional"
  | "mixed"
  | "other";

export type CalendarDayIntensity =
  | "none"
  | "low"
  | "moderate"
  | "high"
  | "very_high";

export type CalendarDaySession = {
  id: string;
  title: string;
  type: CalendarDiscipline;
  date: string;
  durationMinutes: number | null;
  rpe: number | null;
  runningDistanceMeters: number | null;
  resultLabel?: string | null;
};

export type CalendarDay = {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  sessions: CalendarDaySession[];
  disciplines: CalendarDiscipline[];
  primaryDiscipline: CalendarDiscipline | null;
  hasTraining: boolean;
  hasMovement: boolean;
  mobilityDone: boolean;
  mobilityMinutes: number | null;
  dailyNote: string | null;
  prioritiesTotal: number;
  prioritiesCompleted: number;
  totalDurationMinutes: number;
  averageRpe: number | null;
  totalRunMeters: number;
  intensity: CalendarDayIntensity;
};

export type CalendarMonthSummary = {
  monthLabel: string;
  monthStart: string;
  monthEnd: string;
  trainingDays: number;
  movementDays: number;
  sessionsCount: number;
  mobilityDays: number;
  currentTrainingStreak: number;
  currentMovementStreak: number;
  bestTrainingStreakInMonth: number;
  disciplineCounts: Record<CalendarDiscipline, number>;
  dominantDiscipline: CalendarDiscipline | "mixed" | null;
};

export type CalendarMonthData = {
  days: CalendarDay[];
  summary: CalendarMonthSummary;
};
