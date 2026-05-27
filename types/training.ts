export type DateConfidence = "exact" | "inferred" | "unknown";

export type DateRule = "today_explicit" | "yesterday_from_check" | "manual" | "inferred";

export type SessionStatus = "completed" | "partial" | "planned" | "cancelled";

export type DataQuality = "high" | "partial" | "low";

export type TrainingSessionType =
  | "crossfit"
  | "hyrox"
  | "halterofilia"
  | "gimnasticos"
  | "running"
  | "fuerza"
  | "movilidad"
  | "actividad_funcional"
  | "mixed";

export type TrainingSubtype =
  | "pairs"
  | "team"
  | "individual"
  | "engine"
  | "mixed_modal"
  | "strength"
  | "gymnastics"
  | "weightlifting"
  | "olympic_lift"
  | "running"
  | "z2"
  | "intervals"
  | "for_time"
  | "amrap"
  | "emom"
  | "sets"
  | "accessory"
  | "mobility"
  | "lower_body"
  | "upper_body"
  | "core"
  | "full_body"
  | "technical";

export type MovementPattern =
  | "squat"
  | "hinge"
  | "lunge"
  | "push"
  | "pull"
  | "carry"
  | "run"
  | "jump"
  | "erg"
  | "core"
  | "olympic_lift"
  | "gymnastics"
  | "mobility"
  | "mixed";

export type MuscleName =
  | "quadriceps"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "hipFlexors"
  | "adductors"
  | "core"
  | "lowerBack"
  | "lats"
  | "upperBack"
  | "traps"
  | "shoulders"
  | "chest"
  | "triceps"
  | "biceps"
  | "forearms";

export type MuscleRole = "primary" | "secondary" | "stabilizer";

export type PendingField =
  | "RPE exacto"
  | "Duración exacta"
  | "Tiempo exacto"
  | "Resultado exacto"
  | "Reparto individual"
  | "Carga exacta"
  | "Repeticiones exactas"
  | "Distancia exacta"
  | "Molestias durante/después"
  | "Escalado/variantes"
  | "Fecha exacta"
  | "Otro";

export type MuscleLoad = {
  muscle: MuscleName;
  role: MuscleRole;
  load: number;
};

export type SessionMuscleSummary = Record<MuscleName, number>;

export type SessionMetrics = {
  totalRunMeters: number;
  totalBikeMeters: number;
  totalRowMeters: number;
  totalSkiMeters: number;
  totalCalories: number | null;
  totalExternalLoadKg: number | null;
  totalBarbellReps: number;
  totalDumbbellReps: number;
  totalKettlebellReps: number;
  totalGymnasticsReps: number;
  hardSetsEstimate: number | null;
  impactScore: number;
  cardioLoad: number;
  strengthLoad: number;
  technicalLoad: number;
  fatigueCost: number;
};

export type TrainingResult = {
  type: "time" | "rounds_reps" | "load" | "distance" | "calories" | "cap" | "partial" | "none";
  score: string | null;
  timeSeconds?: number | null;
  capMinutes?: number | null;
  completedAsPlanned?: boolean | null;
  notes?: string | null;
};

export type TrainingExercise = {
  name: string;
  canonicalName: string;
  sets?: number | null;
  reps?: number | null;
  distanceMeters?: number | null;
  durationSeconds?: number | null;
  calories?: number | null;
  loadKg?: number | null;
  completed?: boolean;
  synch?: boolean;
  sharedWork?: boolean;
  unilateral?: boolean;
  movementPattern: MovementPattern;
  intensity: "low" | "moderate" | "high" | "max" | null;
  muscleLoad: MuscleLoad[];
  notes?: string | null;
};

export type TrainingBlock = {
  id: string;
  name: string;
  format: "sets" | "emom" | "amrap" | "for_time" | "intervals" | "hyrox" | "running" | "accessory" | "mobility" | "other";
  roundsPlanned?: number | null;
  roundsCompleted?: number | null;
  timeCapMinutes?: number | null;
  restSeconds?: number | null;
  exercises: TrainingExercise[];
  blockResult?: string | null;
  notes?: string | null;
};

export type TrainingSession = {
  id: string;
  date: string;
  reportedAt: string;
  dateConfidence: DateConfidence;
  dateRule: DateRule;
  source: "chatgpt" | "manual" | "import";
  status: SessionStatus;
  title: string;
  type: TrainingSessionType;
  subtypes: TrainingSubtype[];
  durationMinutes: number | null;
  rpe: number | null;
  location: string | null;
  objective: string | null;
  rawText: string;
  blocks: TrainingBlock[];
  result: TrainingResult | null;
  sessionMetrics: SessionMetrics;
  sessionMuscleSummary: SessionMuscleSummary;
  tags: string[];
  soreness: string[];
  injuryNotes: string | null;
  feeling: string | null;
  notes: string | null;
  pendingFields: PendingField[];
  dataQuality: DataQuality;
  importNotes: string | null;
};

export type WeeklyTrainingLoad = {
  weekKey: string;
  sessions: number;
  hardSessions: number;
  durationMinutes: number;
  runMeters: number;
  bikeMeters: number;
  rowMeters: number;
  skiMeters: number;
  externalLoadKg: number;
  impactScore: number;
  cardioLoad: number;
  strengthLoad: number;
  technicalLoad: number;
  fatigueCost: number;
};

export type WeeklyMuscleBalance = {
  weekKey: string;
  muscles: SessionMuscleSummary;
  overloaded: MuscleName[];
  neglected: MuscleName[];
};

export type TrainingAlert = {
  level: "yellow" | "red";
  title: string;
  factors: string[];
  recommendation: string;
};

export type HybridOSAppInput = {
  appInputVersion: "1.0";
  generatedBy: "gpt";
  generatedAt: string;
  trainingSession: TrainingSession;
  bodyCheck?: import("./body").BodyCheck;
  nutritionCheck?: import("./nutrition").NutritionCheck;
};

export type TrainingType = TrainingSessionType;
export type Exercise = TrainingExercise;
export type MuscleLoadEntry = MuscleLoad;
