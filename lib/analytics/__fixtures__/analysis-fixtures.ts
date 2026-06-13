import type { MuscleName, SessionMuscleSummary, SessionMetrics, TrainingSession, TrainingSessionType } from "@/types/training";

type FixtureSessionOptions = {
  id: string;
  date: string;
  title: string;
  type: TrainingSessionType;
  durationMinutes?: number | null;
  rpe?: number | null;
  status?: TrainingSession["status"];
  dataQuality?: TrainingSession["dataQuality"];
  equipment?: TrainingSession["equipment"];
  tags?: string[];
  metrics?: Partial<SessionMetrics>;
  muscles?: Partial<SessionMuscleSummary>;
  pendingFields?: TrainingSession["pendingFields"];
};

export type AnalysisFixture = {
  id: string;
  title: string;
  intent: string;
  expectedSignals: string[];
  sessions: TrainingSession[];
};

const muscleNames: MuscleName[] = [
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "hipFlexors",
  "adductors",
  "core",
  "lowerBack",
  "lats",
  "upperBack",
  "traps",
  "shoulders",
  "chest",
  "triceps",
  "biceps",
  "forearms",
];

const emptyMuscles = Object.fromEntries(muscleNames.map((muscle) => [muscle, 0])) as SessionMuscleSummary;

const defaultMetrics: SessionMetrics = {
  totalRunMeters: 0,
  totalBikeMeters: 0,
  totalRowMeters: 0,
  totalSkiMeters: 0,
  totalCalories: null,
  totalExternalLoadKg: 0,
  totalBarbellReps: 0,
  totalDumbbellReps: 0,
  totalKettlebellReps: 0,
  totalGymnasticsReps: 0,
  hardSetsEstimate: null,
  impactScore: 20,
  cardioLoad: 30,
  strengthLoad: 20,
  technicalLoad: 15,
  fatigueCost: 35,
};

function makeSession(options: FixtureSessionOptions): TrainingSession {
  return {
    id: options.id,
    date: options.date,
    reportedAt: `${options.date}T12:00:00+02:00`,
    dateConfidence: "exact",
    dateRule: "manual",
    source: "manual",
    status: options.status ?? "completed",
    title: options.title,
    type: options.type,
    subtypes: options.type === "running" ? ["running", "z2"] : ["mixed_modal"],
    durationMinutes: options.durationMinutes === undefined ? 45 : options.durationMinutes,
    rpe: options.rpe === undefined ? 6 : options.rpe,
    location: "Fixture",
    objective: null,
    rawText: options.title,
    blocks: [],
    result: { type: "none", score: null },
    sessionMetrics: { ...defaultMetrics, ...options.metrics },
    equipment: options.equipment,
    sessionMuscleSummary: { ...emptyMuscles, ...options.muscles },
    tags: options.tags ?? [],
    soreness: [],
    injuryNotes: null,
    feeling: null,
    notes: null,
    pendingFields: options.pendingFields ?? [],
    dataQuality: options.dataQuality ?? "high",
    importNotes: null,
  };
}

export const analysisFixtures: AnalysisFixture[] = [
  {
    id: "hyroxMixedRunNoStructuredRunning",
    title: "HYROX con carrera mixta y sin running estructurado",
    intent: "Debe detectar carrera acumulada sin sesiones running y contexto HYROX.",
    expectedSignals: ["mixed-running-only", "hyrox-without-structured-run"],
    sessions: [
      makeSession({
        id: "fixture-hyrox-1",
        date: "2026-06-09",
        title: "HYROX intervals with run",
        type: "hyrox",
        rpe: 8,
        metrics: { totalRunMeters: 3000, fatigueCost: 85, impactScore: 80, cardioLoad: 85, strengthLoad: 65 },
        muscles: { quadriceps: 80, glutes: 75, calves: 70, core: 65 },
        tags: ["hyrox", "running"],
      }),
      makeSession({
        id: "fixture-hyrox-2",
        date: "2026-06-11",
        title: "HYROX sled and shuttle",
        type: "hyrox",
        rpe: 8,
        metrics: { totalRunMeters: 2500, fatigueCost: 80, impactScore: 76, cardioLoad: 80, strengthLoad: 70 },
        muscles: { quadriceps: 75, glutes: 70, calves: 65, forearms: 60 },
        tags: ["hyrox", "running"],
      }),
    ],
  },
  {
    id: "normalStructuredRunningWeek",
    title: "Semana normal con running estructurado",
    intent: "Debe evitar warnings exagerados con volumen moderado y RPE normal.",
    expectedSignals: [],
    sessions: [
      makeSession({
        id: "fixture-run-1",
        date: "2026-06-09",
        title: "Running Z2 2 km",
        type: "running",
        rpe: 5,
        metrics: { totalRunMeters: 2000, fatigueCost: 30, impactScore: 30, cardioLoad: 45, strengthLoad: 5 },
        equipment: { shoes: "fixture daily trainer" },
        muscles: { quadriceps: 25, hamstrings: 20, glutes: 20, calves: 15, core: 15 },
        tags: ["running", "z2"],
      }),
      makeSession({
        id: "fixture-run-2",
        date: "2026-06-12",
        title: "Running Z2 2 km",
        type: "running",
        rpe: 5,
        metrics: { totalRunMeters: 2000, fatigueCost: 30, impactScore: 30, cardioLoad: 45, strengthLoad: 5 },
        equipment: { shoes: "fixture daily trainer" },
        muscles: { quadriceps: 25, hamstrings: 20, glutes: 20, calves: 15, core: 15 },
        tags: ["running", "z2"],
      }),
    ],
  },
  {
    id: "padelHighImpactWeek",
    title: "Pádel con impacto alto",
    intent: "Debe tratar el pádel como actividad secundaria real, no como running.",
    expectedSignals: ["secondary-fatigue", "padel-secondary-load", "adductors-hyrox-padel"],
    sessions: [
      makeSession({
        id: "fixture-padel",
        date: "2026-06-10",
        title: "Torneo de padel",
        type: "actividad_funcional",
        durationMinutes: 180,
        rpe: 8,
        metrics: { fatigueCost: 95, impactScore: 90, cardioLoad: 85, strengthLoad: 35 },
        muscles: { quadriceps: 80, calves: 80, glutes: 70, adductors: 75, core: 65, forearms: 55 },
        tags: ["padel", "secondary-activity", "cambios de direccion"],
      }),
      makeSession({
        id: "fixture-recovery",
        date: "2026-06-12",
        title: "Movilidad suave",
        type: "movilidad",
        durationMinutes: 20,
        rpe: 2,
        metrics: { fatigueCost: 8, impactScore: 2, cardioLoad: 5, strengthLoad: 5 },
        muscles: { core: 10, lowerBack: 10, hipFlexors: 10 },
        tags: ["mobility", "recovery"],
      }),
    ],
  },
  {
    id: "strengthDominantWeek",
    title: "Semana orientada a fuerza",
    intent: "Debe leer fuerza alta sin marcar como problema la baja carrera.",
    expectedSignals: ["strength-dominant-week"],
    sessions: [
      makeSession({
        id: "fixture-strength-1",
        date: "2026-06-09",
        title: "Back squat strength",
        type: "fuerza",
        rpe: 7,
        metrics: { totalExternalLoadKg: 4500, strengthLoad: 90, fatigueCost: 70, impactScore: 20, cardioLoad: 20 },
        muscles: { quadriceps: 90, glutes: 85, hamstrings: 70, core: 50 },
        tags: ["strength"],
      }),
      makeSession({
        id: "fixture-strength-2",
        date: "2026-06-12",
        title: "Press and pull strength",
        type: "fuerza",
        rpe: 7,
        metrics: { totalExternalLoadKg: 3800, strengthLoad: 85, fatigueCost: 65, impactScore: 18, cardioLoad: 20 },
        muscles: { chest: 70, shoulders: 70, triceps: 65, lats: 70, upperBack: 70 },
        tags: ["strength"],
      }),
    ],
  },
  {
    id: "lowDataWeek",
    title: "Periodo con pocos datos",
    intent: "Debe marcar datos insuficientes y evitar conclusiones fuertes.",
    expectedSignals: ["reference-insufficient"],
    sessions: [
      makeSession({
        id: "fixture-low-data",
        date: "2026-06-10",
        title: "Sesion suelta",
        type: "crossfit",
        durationMinutes: null,
        rpe: null,
        dataQuality: "partial",
        pendingFields: ["RPE exacto", "Duración exacta"],
      }),
    ],
  },
  {
    id: "partialDataWeek",
    title: "Periodo con datos parciales",
    intent: "Debe detectar calidad parcial y RPE insuficiente.",
    expectedSignals: ["partial-data", "missing-rpe", "pending-fields"],
    sessions: [
      makeSession({
        id: "fixture-partial-1",
        date: "2026-06-08",
        title: "CrossFit partial",
        type: "crossfit",
        status: "partial",
        dataQuality: "partial",
        rpe: null,
        pendingFields: ["RPE exacto"],
      }),
      makeSession({
        id: "fixture-partial-2",
        date: "2026-06-10",
        title: "HYROX partial",
        type: "hyrox",
        status: "partial",
        dataQuality: "partial",
        rpe: null,
        metrics: { totalRunMeters: 1200 },
        pendingFields: ["Resultado exacto"],
      }),
      makeSession({
        id: "fixture-partial-3",
        date: "2026-06-12",
        title: "Fuerza partial",
        type: "fuerza",
        status: "partial",
        dataQuality: "partial",
        rpe: null,
        pendingFields: ["Carga exacta"],
      }),
    ],
  },
];
