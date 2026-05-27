// Hybrid OS — seed histórico v1.0
// Auto-generado por GPT a partir de realTrainingSessions_formatted_HYBRID_OS_CURRENT_2026-05-26.ts
// Objetivo: usar el nuevo contrato JSON HybridOSAppInput v1.0.
//
// Nota para Codex:
// - Este archivo es autocontenido para facilitar la migración.
// - Si ya existen tipos en la app, se puede eliminar el bloque de tipos e importar `HybridOSAppInput` desde el dominio.
// - Mantiene `rawText` en todas las sesiones para no perder trazabilidad.
// - La app NO debe parsear lenguaje natural; recibe objetos ya parseados.

export type HybridOSAppInput = {
  appInputVersion: "1.0";
  generatedBy: "gpt";
  generatedAt: string;
  trainingSession: TrainingSession;
};

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

export type MuscleLoad = {
  muscle: MuscleName;
  role: MuscleRole;
  load: number;
};

export type SessionMuscleSummary = {
  quadriceps: number;
  hamstrings: number;
  glutes: number;
  calves: number;
  hipFlexors: number;
  adductors: number;
  core: number;
  lowerBack: number;
  lats: number;
  upperBack: number;
  traps: number;
  shoulders: number;
  chest: number;
  triceps: number;
  biceps: number;
  forearms: number;
};

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

export const hybridOSHistoricalSeedV1 = [
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-001",
      "date": "2025-01-01",
      "reportedAt": "2025-01-01",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "HYROX lower body + mixed engine",
      "type": "hyrox",
      "subtypes": [
        "lower_body",
        "engine",
        "mixed_modal"
      ],
      "durationMinutes": 70,
      "rpe": 8,
      "location": "box",
      "objective": "Trabajo de fuerza de pierna, carries y motor HYROX.",
      "rawText": "HYROX lower body + mixed engine\nObjective: Trabajo de fuerza de pierna, carries y motor HYROX.\n\n4 Set — Strength Carry\n- Back Squat | sets: 4 | reps: 5 | load: 80-90 kg / 70%\n- 2KB Front Rack Carry | sets: 4 | distance: 50 m | load: 2 x 24 kg\n- Dynamic Plank | sets: 4 | reps: 15\n\nFor Time — HYROX For Time\n- Run | distance: 600 m\n- Wall Balls | reps: 25 | load: 9 kg\n- Run | distance: 600 m\n- SkiErg | calories: 25 cal\n- Run | distance: 400 m\n- DB Devil Press | reps: 20 | load: 20 kg\n- Run | distance: 400 m\n- Row | calories: 20 cal\n- Run | distance: 400 m",
      "blocks": [
        {
          "id": "hist-2026-001-block-1",
          "name": "Strength Carry",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Back Squat",
              "canonicalName": "Back Squat",
              "sets": 4,
              "reps": 5,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "squat",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": "Carga original no numérica simple: 80-90 kg / 70%"
            },
            {
              "name": "2KB Front Rack Carry",
              "canonicalName": "2kb Front Rack Carry",
              "sets": 4,
              "reps": null,
              "distanceMeters": 50,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 48.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "carry",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "forearms",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "traps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Carga original: 2 x 24 kg"
            },
            {
              "name": "Dynamic Plank",
              "canonicalName": "Dynamic Plank",
              "sets": 4,
              "reps": 15,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-001-block-2",
          "name": "HYROX For Time",
          "format": "for_time",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 600,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Wall Balls",
              "canonicalName": "Wall Ball",
              "sets": null,
              "reps": 25,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 9.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 600,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "SkiErg",
              "canonicalName": "SkiErg",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 400,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "DB Devil Press",
              "canonicalName": "Devil Press",
              "sets": null,
              "reps": 20,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 20.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "chest",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 400,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Row",
              "canonicalName": "RowErg",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 400,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 2400,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": 625.0,
        "totalBarbellReps": 20,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 14,
        "impactScore": 68,
        "cardioLoad": 58,
        "strengthLoad": 10,
        "technicalLoad": 15,
        "fatigueCost": 98
      },
      "sessionMuscleSummary": {
        "quadriceps": 47,
        "hamstrings": 39,
        "glutes": 50,
        "calves": 35,
        "hipFlexors": 24,
        "adductors": 0,
        "core": 61,
        "lowerBack": 5,
        "lats": 16,
        "upperBack": 18,
        "traps": 7,
        "shoulders": 25,
        "chest": 5,
        "triceps": 17,
        "biceps": 6,
        "forearms": 13
      },
      "tags": [
        "lower-body",
        "engine",
        "metcon",
        "hyrox"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Tiempo exacto",
        "RPE exacto"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS. Fecha segura usada para evitar colisión; fecha inferida original: 2026-01-08.\nPending original: Tiempo final del For Time | RPE exacto confirmado"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-002",
      "date": "2025-01-02",
      "reportedAt": "2025-01-02",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "ATHX strict press + partner engine + DB metcon",
      "type": "mixed",
      "subtypes": [
        "mixed_modal",
        "strength",
        "pairs"
      ],
      "durationMinutes": 65,
      "rpe": 8,
      "location": "box",
      "objective": "Fuerza estricta, trabajo en pareja y metcon tipo competición.",
      "rawText": "ATHX strict press + partner engine + DB metcon\nObjective: Fuerza estricta, trabajo en pareja y metcon tipo competición.\n\nEvery 2' x 8' — Strict Press\n- Strict Press | sets: 4 | reps: 5\n\nAMRAP 15' — Partner Engine\n- Run | distance: 500 m | notes: Athlete A\n- Row/Ski | distance: 500 m | notes: Athlete B\n\nFor Time — Metcon\n- 2DB Thruster | reps: 30\n- Box Jump Over | reps: 30\n- Burpee Broad Jump | distance: 30 m\n- 2DB Walking Lunge | distance: 30 m",
      "blocks": [
        {
          "id": "hist-2026-002-block-1",
          "name": "Strict Press",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Strict Press",
              "canonicalName": "Strict Press",
              "sets": 4,
              "reps": 5,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "upperBack",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-002-block-2",
          "name": "Partner Engine",
          "format": "amrap",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Athlete A"
            },
            {
              "name": "Row/Ski",
              "canonicalName": "RowErg",
              "sets": null,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": "Athlete B"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-002-block-3",
          "name": "Metcon",
          "format": "for_time",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "2DB Thruster",
              "canonicalName": "2db Thruster",
              "sets": null,
              "reps": 30,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 70
                }
              ],
              "notes": null
            },
            {
              "name": "Box Jump Over",
              "canonicalName": "Box Jump",
              "sets": null,
              "reps": 30,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "jump",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Burpee Broad Jump",
              "canonicalName": "Burpee Broad Jump",
              "sets": null,
              "reps": null,
              "distanceMeters": 30,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "2DB Walking Lunge",
              "canonicalName": "Lunge",
              "sets": null,
              "reps": null,
              "distanceMeters": 30,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "lunge",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "adductors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 500,
        "totalBikeMeters": 0,
        "totalRowMeters": 500,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 6,
        "impactScore": 30,
        "cardioLoad": 36,
        "strengthLoad": 0,
        "technicalLoad": 5,
        "fatigueCost": 91
      },
      "sessionMuscleSummary": {
        "quadriceps": 36,
        "hamstrings": 18,
        "glutes": 32,
        "calves": 19,
        "hipFlexors": 4,
        "adductors": 5,
        "core": 34,
        "lowerBack": 0,
        "lats": 8,
        "upperBack": 12,
        "traps": 0,
        "shoulders": 23,
        "chest": 6,
        "triceps": 13,
        "biceps": 6,
        "forearms": 5
      },
      "tags": [
        "athx",
        "strength",
        "partner",
        "metcon",
        "hybrid"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Carga exacta",
        "Resultado exacto",
        "Tiempo exacto"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS. Fecha segura usada para evitar colisión; fecha inferida original: 2026-01-12.\nPending original: Cargas DB thruster/lunge | Resultado AMRAP | Tiempo metcon"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-003",
      "date": "2025-01-03",
      "reportedAt": "2025-01-03",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "CrossFit snatch, bike and gymnastics skills",
      "type": "crossfit",
      "subtypes": [
        "weightlifting",
        "mixed_modal",
        "gymnastics"
      ],
      "durationMinutes": 75,
      "rpe": 7,
      "location": "box",
      "objective": "Sesión mixta de CrossFit con snatch, motor y habilidades gimnásticas.",
      "rawText": "CrossFit snatch, bike and gymnastics skills\nObjective: Sesión mixta de CrossFit con snatch, motor y habilidades gimnásticas.\n\nNot detailed — Strength\n- Strength block | notes: Fuerza no detallada en el histórico\n\nMetcon — WOD\n- Snatch\n- Bike | calories: not specified\n- Crossovers / Double Unders | reps: not specified\n\nSkill Work — Accessory + Skills\n- Sumo KB Squat\n- Sandbag Step Up | load: 30 kg\n- Handstand Practice\n- Muscle-Up Transition Practice | reps: 8-10 singles approx.",
      "blocks": [
        {
          "id": "hist-2026-003-block-1",
          "name": "Strength",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Strength block",
              "canonicalName": "Strength Block",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [],
              "notes": "Fuerza no detallada en el histórico"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-003-block-2",
          "name": "WOD",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Snatch",
              "canonicalName": "Snatch",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 70
                }
              ],
              "notes": null
            },
            {
              "name": "Bike",
              "canonicalName": "BikeErg",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Crossovers / Double Unders",
              "canonicalName": "Double Unders",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "jump",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 30
                }
              ],
              "notes": "Reps originales no numéricas: not specified"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-003-block-3",
          "name": "Accessory + Skills",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Sumo KB Squat",
              "canonicalName": "Sumo KB Squat",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "squat",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Sandbag Step Up",
              "canonicalName": "Sandbag Step Up",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 30.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "lunge",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "adductors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Handstand Practice",
              "canonicalName": "Handstand Practice",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "gymnastics",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Muscle-Up Transition Practice",
              "canonicalName": "Muscle Up Transition Practice",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Reps originales no numéricas: 8-10 singles approx."
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 1,
        "impactScore": 20,
        "cardioLoad": 30,
        "strengthLoad": 0,
        "technicalLoad": 15,
        "fatigueCost": 85
      },
      "sessionMuscleSummary": {
        "quadriceps": 31,
        "hamstrings": 14,
        "glutes": 28,
        "calves": 13,
        "hipFlexors": 0,
        "adductors": 5,
        "core": 32,
        "lowerBack": 5,
        "lats": 9,
        "upperBack": 19,
        "traps": 6,
        "shoulders": 20,
        "chest": 0,
        "triceps": 8,
        "biceps": 6,
        "forearms": 10
      },
      "tags": [
        "weightlifting",
        "metcon",
        "gymnastics",
        "crossfit"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Otro",
        "Resultado exacto",
        "Carga exacta"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS. Fecha segura usada para evitar colisión; fecha inferida original: 2026-01-17.\nPending original: Bloque de fuerza exacto | Resultado WOD | Cargas usadas"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-004",
      "date": "2025-01-04",
      "reportedAt": "2025-01-04",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "HYROX 4 rounds cap 28",
      "type": "hyrox",
      "subtypes": [
        "engine",
        "mixed_modal"
      ],
      "durationMinutes": 70,
      "rpe": 8,
      "location": "box",
      "objective": "HYROX específico con sled, wall balls, burpees y carrera.",
      "rawText": "HYROX 4 rounds cap 28\nObjective: HYROX específico con sled, wall balls, burpees y carrera.\n\n2 Rounds — Warm Up\n- Machine | time: 1'\n- Dynamic Plank | reps: 5\n- Baby Burpees | reps: 10\n- Cossack Squat | reps: 10\n- Skipping | reps: 40/leg\n\n3 Set — Strength Stations\n- Backward Sled Drag | distance: 20 m | load: 125/100 kg\n- Mixed KB Rack/OH Carry | distance: 50 m | load: AHAP\n- DB/KB Row | reps: 12+12\n\nBuy-in + 4 Rounds + Cash-out — Main Workout\n- Run/Row or Bike Buy-in | distance: 1 km run/row or 2500 m bike\n- Burpee Broad Jump | distance: 25 m\n- Wall Balls | reps: 30\n- D-Ball Sit Up to Target | reps: 20\n- Run Cash-out | distance: 1 km\nResult: Objetivo sub 25', cap 28'",
      "blocks": [
        {
          "id": "hist-2026-004-block-1",
          "name": "Warm Up",
          "format": "other",
          "roundsPlanned": 2,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Machine",
              "canonicalName": "Machine",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [],
              "notes": "Duración original no parseada: 1'"
            },
            {
              "name": "Dynamic Plank",
              "canonicalName": "Dynamic Plank",
              "sets": null,
              "reps": 5,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Baby Burpees",
              "canonicalName": "Baby Burpees",
              "sets": null,
              "reps": 10,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Cossack Squat",
              "canonicalName": "Cossack Squat",
              "sets": null,
              "reps": 10,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "squat",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "adductors",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Skipping",
              "canonicalName": "SkiErg",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Reps originales no numéricas: 40/leg"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-004-block-2",
          "name": "Strength Stations",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Backward Sled Drag",
              "canonicalName": "Backward Sled Drag",
              "sets": null,
              "reps": null,
              "distanceMeters": 20,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Carga original no numérica simple: 125/100 kg"
            },
            {
              "name": "Mixed KB Rack/OH Carry",
              "canonicalName": "Mixed KB Rack Oh Carry",
              "sets": null,
              "reps": null,
              "distanceMeters": 50,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "carry",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "forearms",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "traps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Carga original no numérica simple: AHAP"
            },
            {
              "name": "DB/KB Row",
              "canonicalName": "RowErg",
              "sets": null,
              "reps": 24,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": "Reps originales: 12+12"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-004-block-3",
          "name": "Main Workout",
          "format": "other",
          "roundsPlanned": 4,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run/Row or Bike Buy-in",
              "canonicalName": "RowErg",
              "sets": null,
              "reps": null,
              "distanceMeters": 1000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Burpee Broad Jump",
              "canonicalName": "Burpee Broad Jump",
              "sets": null,
              "reps": null,
              "distanceMeters": 25,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Wall Balls",
              "canonicalName": "Wall Ball",
              "sets": null,
              "reps": 30,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "D-Ball Sit Up to Target",
              "canonicalName": "Sit Up",
              "sets": null,
              "reps": 20,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Run Cash-out",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 1000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "cap",
        "score": "Objetivo sub 25', cap 28'",
        "timeSeconds": null,
        "capMinutes": 28,
        "completedAsPlanned": null,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 1000,
        "totalBikeMeters": 0,
        "totalRowMeters": 1000,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 10,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 20,
        "hardSetsEstimate": 6,
        "impactScore": 40,
        "cardioLoad": 49,
        "strengthLoad": 5,
        "technicalLoad": 18,
        "fatigueCost": 94
      },
      "sessionMuscleSummary": {
        "quadriceps": 53,
        "hamstrings": 26,
        "glutes": 48,
        "calves": 37,
        "hipFlexors": 17,
        "adductors": 7,
        "core": 64,
        "lowerBack": 0,
        "lats": 8,
        "upperBack": 13,
        "traps": 7,
        "shoulders": 29,
        "chest": 12,
        "triceps": 5,
        "biceps": 6,
        "forearms": 13
      },
      "tags": [
        "engine",
        "stations",
        "conditioning",
        "hyrox"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Tiempo exacto",
        "Carga exacta"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS. Fecha segura usada para evitar colisión; fecha inferida original: 2026-01-22.\nPending original: Tiempo final real | Carga KB carry"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-005",
      "date": "2025-01-05",
      "reportedAt": "2025-01-05",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "HYROX long station sequence",
      "type": "hyrox",
      "subtypes": [
        "engine",
        "mixed_modal",
        "for_time"
      ],
      "durationMinutes": 80,
      "rpe": 8,
      "location": "box",
      "objective": "Secuencia larga tipo HYROX con estaciones y carrera repetida.",
      "rawText": "HYROX long station sequence\nObjective: Secuencia larga tipo HYROX con estaciones y carrera repetida.\n\nFor Time — Main Workout\n- Run | distance: 500 m\n- KB Swing | reps: 30 | load: 24/16 kg\n- Run | distance: 500 m\n- Sled Push | distance: 20 m | load: 150/100 kg\n- Run | distance: 500 m\n- Box Jump Over | reps: 30\n- Run | distance: 500 m\n- Farmer Carry | distance: 100 m\n- Run | distance: 500 m\n- SkiErg | calories: 30/20 cal\n- Run | distance: 500 m\n- Devil Press | reps: 20 | load: 22/15 kg\n- Run | distance: 500 m\n- Sandbag Lunge | distance: 50 m",
      "blocks": [
        {
          "id": "hist-2026-005-block-1",
          "name": "Main Workout",
          "format": "for_time",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "KB Swing",
              "canonicalName": "Kettlebell Swing",
              "sets": null,
              "reps": 30,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "hinge",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "lowerBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Carga original no numérica simple: 24/16 kg"
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Sled Push",
              "canonicalName": "Sled Push",
              "sets": null,
              "reps": null,
              "distanceMeters": 20,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": "Carga original no numérica simple: 150/100 kg"
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Box Jump Over",
              "canonicalName": "Box Jump",
              "sets": null,
              "reps": 30,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "jump",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Farmer Carry",
              "canonicalName": "Farmer Carry",
              "sets": null,
              "reps": null,
              "distanceMeters": 100,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "carry",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "forearms",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "traps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "SkiErg",
              "canonicalName": "SkiErg",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Devil Press",
              "canonicalName": "Devil Press",
              "sets": null,
              "reps": 20,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "chest",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                }
              ],
              "notes": "Carga original no numérica simple: 22/15 kg"
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Sandbag Lunge",
              "canonicalName": "Sandbag Lunge",
              "sets": null,
              "reps": null,
              "distanceMeters": 50,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "lunge",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "adductors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 3500,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 30,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 3,
        "impactScore": 90,
        "cardioLoad": 75,
        "strengthLoad": 6,
        "technicalLoad": 15,
        "fatigueCost": 100
      },
      "sessionMuscleSummary": {
        "quadriceps": 66,
        "hamstrings": 56,
        "glutes": 72,
        "calves": 62,
        "hipFlexors": 32,
        "adductors": 5,
        "core": 63,
        "lowerBack": 5,
        "lats": 8,
        "upperBack": 10,
        "traps": 7,
        "shoulders": 17,
        "chest": 5,
        "triceps": 12,
        "biceps": 0,
        "forearms": 13
      },
      "tags": [
        "engine",
        "stations",
        "for-time",
        "hyrox"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Tiempo exacto",
        "Carga exacta"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS. Fecha segura usada para evitar colisión; fecha inferida original: 2026-01-27.\nPending original: Tiempo final | Peso farmer carry | Peso sandbag"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-006",
      "date": "2025-01-06",
      "reportedAt": "2025-01-06",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "Gymnastics strength + partner CrossFit WOD",
      "type": "crossfit",
      "subtypes": [
        "gymnastics",
        "mixed_modal",
        "pairs"
      ],
      "durationMinutes": 70,
      "rpe": 8,
      "location": "box",
      "objective": "Trabajo gimnástico y WOD de alta demanda de tracción, bisagra y salto.",
      "rawText": "Gymnastics strength + partner CrossFit WOD\nObjective: Trabajo gimnástico y WOD de alta demanda de tracción, bisagra y salto.\n\nSkill/Strength — Gymnastics Strength\n- Handstand Push-Up\n- Handstand Hold\n- Headstand\n\n4 Rounds For Time — Partner WOD\n- Row | calories: 40 cal\n- Rope Climb | reps: 4\n- Box Jump | reps: 40\n- KB Swing | reps: 40",
      "blocks": [
        {
          "id": "hist-2026-006-block-1",
          "name": "Gymnastics Strength",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Handstand Push-Up",
              "canonicalName": "Handstand Push Up",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Handstand Hold",
              "canonicalName": "Handstand Hold",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "gymnastics",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Headstand",
              "canonicalName": "Headstand",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "gymnastics",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-006-block-2",
          "name": "Partner WOD",
          "format": "for_time",
          "roundsPlanned": 4,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Row",
              "canonicalName": "RowErg",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Rope Climb",
              "canonicalName": "Rope Climb",
              "sets": null,
              "reps": 4,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Box Jump",
              "canonicalName": "Box Jump",
              "sets": null,
              "reps": 40,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "jump",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "KB Swing",
              "canonicalName": "Kettlebell Swing",
              "sets": null,
              "reps": 40,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "hinge",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "lowerBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 40,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 3,
        "impactScore": 20,
        "cardioLoad": 28,
        "strengthLoad": 8,
        "technicalLoad": 15,
        "fatigueCost": 91
      },
      "sessionMuscleSummary": {
        "quadriceps": 7,
        "hamstrings": 15,
        "glutes": 15,
        "calves": 7,
        "hipFlexors": 0,
        "adductors": 0,
        "core": 38,
        "lowerBack": 5,
        "lats": 17,
        "upperBack": 26,
        "traps": 0,
        "shoulders": 24,
        "chest": 0,
        "triceps": 20,
        "biceps": 13,
        "forearms": 18
      },
      "tags": [
        "gymnastics",
        "metcon",
        "partner",
        "crossfit"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": "Muy buenas sensaciones; fuerte.",
      "notes": null,
      "pendingFields": [
        "Tiempo exacto",
        "Carga exacta"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS. Fecha segura usada para evitar colisión; fecha inferida original: 2026-02-02.\nPending original: Tiempo final | Peso KB"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-007",
      "date": "2025-01-07",
      "reportedAt": "2025-01-07",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "HYROX row/run intervals with plate snatch",
      "type": "hyrox",
      "subtypes": [
        "intervals",
        "engine",
        "core"
      ],
      "durationMinutes": 65,
      "rpe": 8,
      "location": "box",
      "objective": "Intervalos HYROX con componente de tracción, zancada, motor y core.",
      "rawText": "HYROX row/run intervals with plate snatch\nObjective: Intervalos HYROX con componente de tracción, zancada, motor y core.\n\n4 Set — Row Strength Prep\n- Row | distance: 250 m | notes: RPE 8/10\n- Bent Over Row | reps: 15\n- 2DB Reverse Lunge | reps: 12\n\nEvery 5' x 20' — Main EMOM\n- Run or Bike | distance: 600 m run or 1400 m bike\n- Plate Snatch | reps: 12\n- Burpee to Plate | reps: 14\n- V-Ups | reps: max",
      "blocks": [
        {
          "id": "hist-2026-007-block-1",
          "name": "Row Strength Prep",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Row",
              "canonicalName": "RowErg",
              "sets": null,
              "reps": null,
              "distanceMeters": 250,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": "RPE 8/10"
            },
            {
              "name": "Bent Over Row",
              "canonicalName": "RowErg",
              "sets": null,
              "reps": 15,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "2DB Reverse Lunge",
              "canonicalName": "Lunge",
              "sets": null,
              "reps": 12,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "lunge",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "adductors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-007-block-2",
          "name": "Main EMOM",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run or Bike",
              "canonicalName": "BikeErg",
              "sets": null,
              "reps": null,
              "distanceMeters": 600,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Plate Snatch",
              "canonicalName": "Snatch",
              "sets": null,
              "reps": 12,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 70
                }
              ],
              "notes": null
            },
            {
              "name": "Burpee to Plate",
              "canonicalName": "Burpee To Plate",
              "sets": null,
              "reps": 14,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "V-Ups",
              "canonicalName": "V Ups",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Reps originales no numéricas: max"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 600,
        "totalRowMeters": 250,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 12,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 4,
        "impactScore": 20,
        "cardioLoad": 30,
        "strengthLoad": 6,
        "technicalLoad": 15,
        "fatigueCost": 89
      },
      "sessionMuscleSummary": {
        "quadriceps": 28,
        "hamstrings": 18,
        "glutes": 25,
        "calves": 12,
        "hipFlexors": 9,
        "adductors": 5,
        "core": 39,
        "lowerBack": 0,
        "lats": 16,
        "upperBack": 22,
        "traps": 6,
        "shoulders": 13,
        "chest": 6,
        "triceps": 0,
        "biceps": 12,
        "forearms": 10
      },
      "tags": [
        "intervals",
        "engine",
        "core",
        "hyrox"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Carga exacta",
        "Repeticiones exactas"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS. Fecha segura usada para evitar colisión; fecha inferida original: 2026-02-06.\nPending original: Cargas DB | Carga plate snatch | Reps V-ups"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-008",
      "date": "2025-01-08",
      "reportedAt": "2025-01-08",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "Crosstraining paused front squat + HSPU + EMOM",
      "type": "crossfit",
      "subtypes": [
        "strength",
        "gymnastics",
        "emom"
      ],
      "durationMinutes": 75,
      "rpe": 8,
      "location": "box",
      "objective": "Front squat pausado, trabajo invertido y EMOM mixto.",
      "rawText": "Crosstraining paused front squat + HSPU + EMOM\nObjective: Front squat pausado, trabajo invertido y EMOM mixto.\n\n2 Rounds — Warm Up\n- Jumping Jacks | reps: 30\n- Hip Rotation | reps: 16\n- Scap Push-Up + Shoulder Taps | reps: 15 + 20\n- Step Up + Baby Burpees | reps: 10 + 10\n\nEvery 3' x 12' — Strength + Gymnastics\n- Paused Front Squat | reps: 2 | notes: 3'' pause bottom, RPE 8.5/10\n- Static Handstand + HSPU | reps: 8-16 HSPU option | time: 20''\n\nEMOM 20' — Conditioning\n- Wall Ball high target | reps: 18\n- Machine | calories: 18/14 cal\n- Box Jump | reps: 15-18\n- 2DB Devil Press | reps: 8-10 | load: 2 x 17.5 kg real\n- Rest | time: 1'",
      "blocks": [
        {
          "id": "hist-2026-008-block-1",
          "name": "Warm Up",
          "format": "other",
          "roundsPlanned": 2,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Jumping Jacks",
              "canonicalName": "Jumping Jacks",
              "sets": null,
              "reps": 30,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "jump",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 50
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Hip Rotation",
              "canonicalName": "Hip Rotation",
              "sets": null,
              "reps": 16,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mobility",
              "intensity": "high",
              "muscleLoad": [],
              "notes": null
            },
            {
              "name": "Scap Push-Up + Shoulder Taps",
              "canonicalName": "Scap Push Up Shoulder Taps",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "chest",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: 15 + 20"
            },
            {
              "name": "Step Up + Baby Burpees",
              "canonicalName": "Step Up Baby Burpees",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "adductors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Reps originales no numéricas: 10 + 10"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-008-block-2",
          "name": "Strength + Gymnastics",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Paused Front Squat",
              "canonicalName": "Front Squat",
              "sets": null,
              "reps": 2,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": "3'' pause bottom, RPE 8.5/10"
            },
            {
              "name": "Static Handstand + HSPU",
              "canonicalName": "Static Handstand Hspu",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: 8-16 HSPU option; Duración original no parseada: 20''"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-008-block-3",
          "name": "Conditioning",
          "format": "emom",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Wall Ball high target",
              "canonicalName": "Wall Ball",
              "sets": null,
              "reps": 18,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Machine",
              "canonicalName": "Machine",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Box Jump",
              "canonicalName": "Box Jump",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "jump",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 30
                }
              ],
              "notes": "Reps originales no numéricas: 15-18"
            },
            {
              "name": "2DB Devil Press",
              "canonicalName": "Devil Press",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 35.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "chest",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                }
              ],
              "notes": "Reps originales no numéricas: 8-10; Carga original: 2 x 17.5 kg real"
            },
            {
              "name": "Rest",
              "canonicalName": "Rest",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [],
              "notes": "Duración original no parseada: 1'"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 2,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 5,
        "impactScore": 20,
        "cardioLoad": 30,
        "strengthLoad": 1,
        "technicalLoad": 15,
        "fatigueCost": 93
      },
      "sessionMuscleSummary": {
        "quadriceps": 39,
        "hamstrings": 22,
        "glutes": 40,
        "calves": 17,
        "hipFlexors": 0,
        "adductors": 5,
        "core": 51,
        "lowerBack": 0,
        "lats": 8,
        "upperBack": 19,
        "traps": 0,
        "shoulders": 39,
        "chest": 15,
        "triceps": 19,
        "biceps": 6,
        "forearms": 5
      },
      "tags": [
        "strength",
        "gymnastics",
        "emom",
        "crossfit"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": "Buenas sensaciones; terminó con ganas de más.",
      "notes": null,
      "pendingFields": [
        "Carga exacta"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS. Fecha segura usada para evitar colisión; fecha inferida original: 2026-02-10.\nPending original: Carga front squat"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-011",
      "date": "2025-01-09",
      "reportedAt": "2025-01-09",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "Open Box strict press + gymnastics EMOM",
      "type": "fuerza",
      "subtypes": [
        "strength",
        "gymnastics",
        "emom"
      ],
      "durationMinutes": 55,
      "rpe": 7,
      "location": "box",
      "objective": "Fuerza estricta y volumen gimnástico moderado post competición.",
      "rawText": "Open Box strict press + gymnastics EMOM\nObjective: Fuerza estricta y volumen gimnástico moderado post competición.\n\n4 progressive sets — Strict Press\n- Strict Press | sets: 4 | reps: 5,5,5,3 approx. | load: 40-50 kg\n\nMini WOD / EMOM — Gymnastics EMOM\n- Toes to Bar\n- Pull-Up\n- Handstand Push-Up\n- Rest | time: 1'",
      "blocks": [
        {
          "id": "hist-2026-011-block-1",
          "name": "Strict Press",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Strict Press",
              "canonicalName": "Strict Press",
              "sets": 4,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "upperBack",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": "Reps originales no numéricas: 5,5,5,3 approx.; Carga original no numérica simple: 40-50 kg"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-011-block-2",
          "name": "Gymnastics EMOM",
          "format": "emom",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Toes to Bar",
              "canonicalName": "Toes To Bar",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "lats",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "hipFlexors",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Pull-Up",
              "canonicalName": "Pull Up",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Handstand Push-Up",
              "canonicalName": "Handstand Push Up",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Rest",
              "canonicalName": "Rest",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [],
              "notes": "Duración original no parseada: 1'"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 0,
        "cardioLoad": 22,
        "strengthLoad": 0,
        "technicalLoad": 5,
        "fatigueCost": 75
      },
      "sessionMuscleSummary": {
        "quadriceps": 0,
        "hamstrings": 0,
        "glutes": 0,
        "calves": 0,
        "hipFlexors": 8,
        "adductors": 0,
        "core": 25,
        "lowerBack": 0,
        "lats": 15,
        "upperBack": 17,
        "traps": 0,
        "shoulders": 18,
        "chest": 0,
        "triceps": 15,
        "biceps": 6,
        "forearms": 11
      },
      "tags": [
        "strict-press",
        "gymnastics",
        "emom",
        "strength"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Otro",
        "Repeticiones exactas"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS. Fecha segura usada para evitar colisión; fecha inferida original: 2026-02-18.\nPending original: Estructura exacta EMOM | Reps T2B/Pull-ups/HSPU"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-012",
      "date": "2025-01-10",
      "reportedAt": "2025-01-10",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "Technical weightlifting return",
      "type": "halterofilia",
      "subtypes": [
        "olympic_lift",
        "technical",
        "weightlifting"
      ],
      "durationMinutes": 60,
      "rpe": 6,
      "location": "box",
      "objective": "Retomar halterofilia específica con porcentajes bajos.",
      "rawText": "Technical weightlifting return\nObjective: Retomar halterofilia específica con porcentajes bajos.\n\nTechnique 50-60% — Weightlifting Technique\n- Squat Snatch | load: 50-60%\n- Squat Clean | load: 50-60%\n- Split Jerk | load: 50-60%",
      "blocks": [
        {
          "id": "hist-2026-012-block-1",
          "name": "Weightlifting Technique",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Squat Snatch",
              "canonicalName": "Squat Snatch",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 70
                }
              ],
              "notes": "Carga original no numérica simple: 50-60%"
            },
            {
              "name": "Squat Clean",
              "canonicalName": "Squat Clean",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Carga original no numérica simple: 50-60%"
            },
            {
              "name": "Split Jerk",
              "canonicalName": "Split Jerk",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": "Carga original no numérica simple: 50-60%"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 0,
        "cardioLoad": 24,
        "strengthLoad": 0,
        "technicalLoad": 35,
        "fatigueCost": 69
      },
      "sessionMuscleSummary": {
        "quadriceps": 21,
        "hamstrings": 6,
        "glutes": 20,
        "calves": 0,
        "hipFlexors": 0,
        "adductors": 0,
        "core": 20,
        "lowerBack": 0,
        "lats": 0,
        "upperBack": 11,
        "traps": 12,
        "shoulders": 15,
        "chest": 0,
        "triceps": 7,
        "biceps": 0,
        "forearms": 0
      },
      "tags": [
        "snatch",
        "clean",
        "jerk",
        "technique",
        "weightlifting"
      ],
      "soreness": [],
      "injuryNotes": "Molestia leve de rodilla en split jerk, squat clean y squat snatch; sensación de inseguridad.",
      "feeling": "Sensación técnica baja por llevar unos 2 meses sin halterofilia específica.",
      "notes": null,
      "pendingFields": [
        "Carga exacta",
        "Repeticiones exactas"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS. Fecha segura usada para evitar colisión; fecha inferida original: 2026-02-21.\nPending original: Cargas exactas | Series/reps exactas"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-013",
      "date": "2025-01-11",
      "reportedAt": "2025-01-11",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "HYROX run + burpee intervals and EMOM",
      "type": "hyrox",
      "subtypes": [
        "intervals",
        "emom",
        "engine"
      ],
      "durationMinutes": 60,
      "rpe": 9,
      "location": "box",
      "objective": "HYROX intenso con carrera rápida, burpees y estaciones.",
      "rawText": "HYROX run + burpee intervals and EMOM\nObjective: HYROX intenso con carrera rápida, burpees y estaciones.\n\n4 Set — Run + Burpee Broad Jump\n- Run | distance: 500 m\n- Burpee Broad Jump | distance: 20 m\n\nEMOM 20' / 40'' ON 20'' OFF — Station EMOM\n- Sandbag Lunge | reps: max meters | load: 20/10 kg, Pro 30/20 kg\n- SkiErg | calories: max cal\n- Push-Up | reps: max\n- 2DB Thruster | reps: max | load: 20/12 kg\n- Rest | time: 1'\nResult: FC media aprox. 149; FC máxima aprox. 187.",
      "blocks": [
        {
          "id": "hist-2026-013-block-1",
          "name": "Run + Burpee Broad Jump",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Burpee Broad Jump",
              "canonicalName": "Burpee Broad Jump",
              "sets": null,
              "reps": null,
              "distanceMeters": 20,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-013-block-2",
          "name": "Station EMOM",
          "format": "emom",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Sandbag Lunge",
              "canonicalName": "Sandbag Lunge",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "lunge",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "adductors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Reps originales no numéricas: max meters; Carga original no numérica simple: 20/10 kg, Pro 30/20 kg"
            },
            {
              "name": "SkiErg",
              "canonicalName": "SkiErg",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Push-Up",
              "canonicalName": "Push Up",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Reps originales no numéricas: max"
            },
            {
              "name": "2DB Thruster",
              "canonicalName": "2db Thruster",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 70
                }
              ],
              "notes": "Reps originales no numéricas: max; Carga original no numérica simple: 20/12 kg"
            },
            {
              "name": "Rest",
              "canonicalName": "Rest",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [],
              "notes": "Duración original no parseada: 1'"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "distance",
        "score": "FC media aprox. 149; FC máxima aprox. 187.",
        "timeSeconds": null,
        "capMinutes": null,
        "completedAsPlanned": null,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 500,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 30,
        "cardioLoad": 30,
        "strengthLoad": 0,
        "technicalLoad": 15,
        "fatigueCost": 97
      },
      "sessionMuscleSummary": {
        "quadriceps": 29,
        "hamstrings": 10,
        "glutes": 25,
        "calves": 12,
        "hipFlexors": 8,
        "adductors": 5,
        "core": 33,
        "lowerBack": 0,
        "lats": 8,
        "upperBack": 5,
        "traps": 0,
        "shoulders": 19,
        "chest": 13,
        "triceps": 18,
        "biceps": 0,
        "forearms": 0
      },
      "tags": [
        "intervals",
        "emom",
        "engine",
        "hyrox"
      ],
      "soreness": [],
      "injuryNotes": "0 dolor de rodilla durante y después.",
      "feeling": "Sensaciones increíbles; ritmos competitivos aprox. 3:40/km en carrera.",
      "notes": null,
      "pendingFields": [
        "Repeticiones exactas"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS. Fecha segura usada para evitar colisión; fecha inferida original: 2026-02-24.\nPending original: Metros/reps/cal por estación"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-014",
      "date": "2025-01-12",
      "reportedAt": "2025-01-12",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "ATHX strict press descending reps + run/row DB GTOH",
      "type": "mixed",
      "subtypes": [
        "mixed_modal",
        "strength",
        "engine"
      ],
      "durationMinutes": 65,
      "rpe": 8,
      "location": "box",
      "objective": "Sesión ATHX con fuerza vertical, core y conditioning mixto.",
      "rawText": "ATHX strict press descending reps + run/row DB GTOH\nObjective: Sesión ATHX con fuerza vertical, core y conditioning mixto.\n\nEvery 3' x 12' — Strict Press + T2B\n- Strict Press | reps: 10-8-6-4 | load: 30-35-40-50 kg\n- Strict Toes to Bar | reps: 4-6-8-10\n\n4 Rounds — Conditioning\n- Row | distance: 300 m\n- Run | distance: 300 m\n- 2DB Ground to Overhead | reps: 10 | load: 20 kg",
      "blocks": [
        {
          "id": "hist-2026-014-block-1",
          "name": "Strict Press + T2B",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Strict Press",
              "canonicalName": "Strict Press",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "upperBack",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": "Reps originales no numéricas: 10-8-6-4; Carga original no numérica simple: 30-35-40-50 kg"
            },
            {
              "name": "Strict Toes to Bar",
              "canonicalName": "Toes To Bar",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "lats",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "hipFlexors",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Reps originales no numéricas: 4-6-8-10"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-014-block-2",
          "name": "Conditioning",
          "format": "other",
          "roundsPlanned": 4,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Row",
              "canonicalName": "RowErg",
              "sets": null,
              "reps": null,
              "distanceMeters": 300,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 300,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "2DB Ground to Overhead",
              "canonicalName": "2db Ground To Overhead",
              "sets": null,
              "reps": 10,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 20.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 300,
        "totalBikeMeters": 0,
        "totalRowMeters": 300,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": 200.0,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 1,
        "impactScore": 26,
        "cardioLoad": 32,
        "strengthLoad": 0,
        "technicalLoad": 5,
        "fatigueCost": 90
      },
      "sessionMuscleSummary": {
        "quadriceps": 20,
        "hamstrings": 15,
        "glutes": 18,
        "calves": 7,
        "hipFlexors": 12,
        "adductors": 0,
        "core": 35,
        "lowerBack": 0,
        "lats": 14,
        "upperBack": 17,
        "traps": 6,
        "shoulders": 17,
        "chest": 0,
        "triceps": 14,
        "biceps": 6,
        "forearms": 10
      },
      "tags": [
        "athx",
        "strength",
        "conditioning",
        "hybrid"
      ],
      "soreness": [],
      "injuryNotes": "Ligera molestia de rodilla durante; sin dolor después. Usó Altra Via Olympus/drop 0.",
      "feeling": "Buenas sensaciones.",
      "notes": null,
      "pendingFields": [
        "Tiempo exacto"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS. Fecha segura usada para evitar colisión; fecha inferida original: 2026-02-26.\nPending original: Tiempo total conditioning"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-015",
      "date": "2025-01-13",
      "reportedAt": "2025-01-13",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "Gymnastics skills after ATHX",
      "type": "gimnasticos",
      "subtypes": [
        "gymnastics"
      ],
      "durationMinutes": 45,
      "rpe": 7,
      "location": "box",
      "objective": "Trabajo técnico gimnástico con fatiga acumulada.",
      "rawText": "Gymnastics skills after ATHX\nObjective: Trabajo técnico gimnástico con fatiga acumulada.\n\nSkill Work — Gymnastics Skills\n- Handstand\n- Handstand Walk Progression\n- Bar Muscle-Up | reps: 1 successful single after failed attempts\n- Butterfly Pull-Up Practice",
      "blocks": [
        {
          "id": "hist-2026-015-block-1",
          "name": "Gymnastics Skills",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Handstand",
              "canonicalName": "Handstand",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "gymnastics",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Handstand Walk Progression",
              "canonicalName": "Handstand Walk Progression",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "gymnastics",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Bar Muscle-Up",
              "canonicalName": "Bar Muscle Up",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "chest",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Reps originales no numéricas: 1 successful single after failed attempts"
            },
            {
              "name": "Butterfly Pull-Up Practice",
              "canonicalName": "Pull Up",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 0,
        "cardioLoad": 18,
        "strengthLoad": 0,
        "technicalLoad": 35,
        "fatigueCost": 71
      },
      "sessionMuscleSummary": {
        "quadriceps": 0,
        "hamstrings": 0,
        "glutes": 0,
        "calves": 0,
        "hipFlexors": 0,
        "adductors": 0,
        "core": 22,
        "lowerBack": 0,
        "lats": 18,
        "upperBack": 26,
        "traps": 0,
        "shoulders": 18,
        "chest": 5,
        "triceps": 21,
        "biceps": 12,
        "forearms": 12
      },
      "tags": [
        "handstand",
        "bar-muscle-up",
        "butterfly",
        "gymnastics"
      ],
      "soreness": [
        "shoulders",
        "lats",
        "biceps"
      ],
      "injuryNotes": null,
      "feeling": "Bar Muscle-Ups costaron más de lo habitual; varios fallos iniciales y finalmente 1 BMU sin enlazar.",
      "notes": null,
      "pendingFields": [
        "Otro"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS. Fecha segura usada para evitar colisión; fecha inferida original: 2026-02-26.\nPending original: Volumen total de intentos"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-019",
      "date": "2025-01-14",
      "reportedAt": "2025-01-14",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "HYROX Partner with fiancée",
      "type": "hyrox",
      "subtypes": [
        "pairs",
        "engine",
        "mixed_modal"
      ],
      "durationMinutes": 72,
      "rpe": 7,
      "location": "box",
      "objective": "HYROX partner con carrera y estaciones compartidas.",
      "rawText": "HYROX Partner with fiancée\nObjective: HYROX partner con carrera y estaciones compartidas.\n\nFor Time — Partner For Time\n- Run together | distance: 1 km\n- SkiErg shared | distance: 1 km\n- Run | distance: 1 km\n- Box Jump | reps: 60\n- Run | distance: 1 km\n- Row shared | distance: 1 km\n- Run | distance: 1 km\n- Burpee Broad Jump | distance: 80 m\n- Run | distance: 1 km\nResult: 1:12:16; ritmo medio carrera 5:20/km; FC media 124; FC máxima 168.",
      "blocks": [
        {
          "id": "hist-2026-019-block-1",
          "name": "Partner For Time",
          "format": "for_time",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run together",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 1000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "SkiErg shared",
              "canonicalName": "SkiErg",
              "sets": null,
              "reps": null,
              "distanceMeters": 1000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 1000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Box Jump",
              "canonicalName": "Box Jump",
              "sets": null,
              "reps": 60,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "jump",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 1000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Row shared",
              "canonicalName": "RowErg",
              "sets": null,
              "reps": null,
              "distanceMeters": 1000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 1000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Burpee Broad Jump",
              "canonicalName": "Burpee Broad Jump",
              "sets": null,
              "reps": null,
              "distanceMeters": 80,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 1000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "time",
        "score": "1:12:16; ritmo medio carrera 5:20/km; FC media 124; FC máxima 168.",
        "timeSeconds": null,
        "capMinutes": null,
        "completedAsPlanned": null,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 5000,
        "totalBikeMeters": 0,
        "totalRowMeters": 1000,
        "totalSkiMeters": 1000,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 1,
        "impactScore": 100,
        "cardioLoad": 100,
        "strengthLoad": 0,
        "technicalLoad": 15,
        "fatigueCost": 96
      },
      "sessionMuscleSummary": {
        "quadriceps": 44,
        "hamstrings": 33,
        "glutes": 37,
        "calves": 47,
        "hipFlexors": 24,
        "adductors": 0,
        "core": 36,
        "lowerBack": 0,
        "lats": 16,
        "upperBack": 13,
        "traps": 0,
        "shoulders": 6,
        "chest": 6,
        "triceps": 6,
        "biceps": 6,
        "forearms": 5
      },
      "tags": [
        "partner",
        "engine",
        "stations",
        "hyrox"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": "Se olvidó parar el pulsómetro de brazo. Buen rendimiento aeróbico/híbrido, sin sensación de ahogo tan fuerte como en Open.",
      "pendingFields": [
        "RPE exacto"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS. Fecha segura usada para evitar colisión; fecha inferida original: 2026-03-12.\nPending original: Reparto exacto en ski/row/burpees"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-020",
      "date": "2025-01-15",
      "reportedAt": "2025-01-15",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "planned",
      "title": "Open Box HYROX adapted day",
      "type": "hyrox",
      "subtypes": [
        "accessory",
        "technical",
        "engine"
      ],
      "durationMinutes": 50,
      "rpe": 6,
      "location": "box",
      "objective": "Sesión HYROX adaptada antes de pádel.",
      "rawText": "Open Box HYROX adapted day\nObjective: Sesión HYROX adaptada antes de pádel.\n\nOpen Box — Adapted HYROX Work\n- HYROX adapted session | notes: Entrenamiento adaptado por descanso previo y pádel más tarde",
      "blocks": [
        {
          "id": "hist-2026-020-block-1",
          "name": "Adapted HYROX Work",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "HYROX adapted session",
              "canonicalName": "Hyrox Adapted Session",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [],
              "notes": "Entrenamiento adaptado por descanso previo y pádel más tarde"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 20,
        "cardioLoad": 20,
        "strengthLoad": 0,
        "technicalLoad": 15,
        "fatigueCost": 68
      },
      "sessionMuscleSummary": {
        "quadriceps": 0,
        "hamstrings": 0,
        "glutes": 0,
        "calves": 0,
        "hipFlexors": 0,
        "adductors": 0,
        "core": 0,
        "lowerBack": 0,
        "lats": 0,
        "upperBack": 0,
        "traps": 0,
        "shoulders": 0,
        "chest": 0,
        "triceps": 0,
        "biceps": 0,
        "forearms": 0
      },
      "tags": [
        "hyrox",
        "open-box",
        "adapted",
        "low-quality"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": "Día con pádel 13:30-15:00. No se registró detalle final confirmado, pero se incluye como histórico de baja calidad por petición del usuario.",
      "pendingFields": [
        "Otro"
      ],
      "dataQuality": "low",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Incluido con dataQuality baja; fecha artificial. Fecha segura usada para evitar colisión; fecha inferida original: 2026-03-19.\nPending original: Detalle exacto del entrenamiento | Confirmación de realización"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-021",
      "date": "2025-01-16",
      "reportedAt": "2025-01-16",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "Two-day CrossFit competition — day 1",
      "type": "crossfit",
      "subtypes": [
        "mixed_modal",
        "team"
      ],
      "durationMinutes": 120,
      "rpe": 9,
      "location": "box",
      "objective": "Competición CrossFit de 2 días; primer bloque de WODs.",
      "rawText": "Two-day CrossFit competition — day 1\nObjective: Competición CrossFit de 2 días; primer bloque de WODs.\n\nFor Time — Competition WOD 1\n- Clean & Jerk | reps: 25-15-9 | load: RX 70/52; inter 50/35; scaled 40/25 | notes: Formato de competición; carga exacta usada por Álvaro no confirmada.\n- Synchro Bar Facing Burpees | reps: 25-15-9 | notes: Sincronizado con pareja.\n\nEvery 2:30 x 4 — Competition WOD 2\n- Ring Push Up / Pull Up / TTB / HSPU station | sets: 4 | notes: Estaciones gimnásticas: ring push ups, pull ups, toes to bar, HSPU según estándar.\n- Max DB Snatch or DB Clean & Jerk | sets: 4 | notes: Trabajo máximo con DB al final de cada ventana.",
      "blocks": [
        {
          "id": "hist-2026-021-block-1",
          "name": "Competition WOD 1",
          "format": "for_time",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Clean & Jerk",
              "canonicalName": "Clean",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Formato de competición; carga exacta usada por Álvaro no confirmada.; Reps originales no numéricas: 25-15-9; Carga original no numérica simple: RX 70/52; inter 50/35; scaled 40/25"
            },
            {
              "name": "Synchro Bar Facing Burpees",
              "canonicalName": "Synchro Bar Facing Burpees",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": true,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": "Sincronizado con pareja.; Reps originales no numéricas: 25-15-9"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-021-block-2",
          "name": "Competition WOD 2",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Ring Push Up / Pull Up / TTB / HSPU station",
              "canonicalName": "Pull Up",
              "sets": 4,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "gymnastics",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "biceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": "Estaciones gimnásticas: ring push ups, pull ups, toes to bar, HSPU según estándar."
            },
            {
              "name": "Max DB Snatch or DB Clean & Jerk",
              "canonicalName": "Dumbbell Snatch",
              "sets": 4,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 70
                }
              ],
              "notes": "Trabajo máximo con DB al final de cada ventana."
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 20,
        "cardioLoad": 48,
        "strengthLoad": 0,
        "technicalLoad": 15,
        "fatigueCost": 100
      },
      "sessionMuscleSummary": {
        "quadriceps": 42,
        "hamstrings": 35,
        "glutes": 40,
        "calves": 6,
        "hipFlexors": 0,
        "adductors": 0,
        "core": 56,
        "lowerBack": 0,
        "lats": 36,
        "upperBack": 58,
        "traps": 35,
        "shoulders": 34,
        "chest": 6,
        "triceps": 5,
        "biceps": 28,
        "forearms": 29
      },
      "tags": [
        "competition",
        "crossfit",
        "partner",
        "data-recovered"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": "El usuario reportó competición de dos días con 5 WODs totales; detalle procedente del análisis previo de los WODs de la competición. Resultados exactos no registrados.",
      "pendingFields": [
        "Resultado exacto",
        "Carga exacta"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Añadido desde mensajes recientes, memoria de conversación y Google Sheet Sistema Físico. Revisar fechas marcadas como inferred/planned_or_unconfirmed. Fecha segura usada para evitar colisión; fecha inferida original: 2026-04-25.\nPending original: Resultado exacto de cada WOD | Cargas exactas usadas"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-022",
      "date": "2025-01-17",
      "reportedAt": "2025-01-17",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "Two-day CrossFit competition — day 2",
      "type": "crossfit",
      "subtypes": [
        "mixed_modal",
        "team"
      ],
      "durationMinutes": 120,
      "rpe": 9,
      "location": "box",
      "objective": "Segundo día de competición con WODs restantes.",
      "rawText": "Two-day CrossFit competition — day 2\nObjective: Segundo día de competición con WODs restantes.\n\nStations — Competition WOD 3\n- Shuttle Run | duration: 3 min stations\n- Box Jump Over | reps: max reps\n- KB Swing | reps: max reps\n- Goblet Squat | reps: max reps\n- Front Squat | reps: max load/reps | load: inter 43 kg referenced\n\nSnatch Ladder — Competition WOD 4\n- Snatch Ladder | notes: Every 1:15 + 15 sec; ladder 40/25 to 60/43 then 1RM.\n\n3 Rounds For Time — Competition WOD 5\n- Deadlift | reps: 20 per round\n- Thruster | reps: 20 per round | load: inter 43/30 referenced\n- Synchro holds/squats | notes: Trabajo sincronizado de holds/squats.",
      "blocks": [
        {
          "id": "hist-2026-022-block-1",
          "name": "Competition WOD 3",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Shuttle Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": 180,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Box Jump Over",
              "canonicalName": "Box Jump",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "jump",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "chest",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: max reps"
            },
            {
              "name": "KB Swing",
              "canonicalName": "Kettlebell Swing",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "hinge",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "lowerBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: max reps"
            },
            {
              "name": "Goblet Squat",
              "canonicalName": "Goblet Squat",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "squat",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": "Reps originales no numéricas: max reps"
            },
            {
              "name": "Front Squat",
              "canonicalName": "Front Squat",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 43.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": "Reps originales no numéricas: max load/reps"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-022-block-2",
          "name": "Competition WOD 4",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Snatch Ladder",
              "canonicalName": "Snatch",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 70
                }
              ],
              "notes": "Every 1:15 + 15 sec; ladder 40/25 to 60/43 then 1RM."
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-022-block-3",
          "name": "Competition WOD 5",
          "format": "for_time",
          "roundsPlanned": 3,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Deadlift",
              "canonicalName": "Deadlift",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "lowerBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: 20 per round"
            },
            {
              "name": "Thruster",
              "canonicalName": "Thruster",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: 20 per round; Carga original no numérica simple: inter 43/30 referenced"
            },
            {
              "name": "Synchro holds/squats",
              "canonicalName": "Synchro Holds Squats",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": true,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": "Trabajo sincronizado de holds/squats."
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 1,
        "impactScore": 20,
        "cardioLoad": 48,
        "strengthLoad": 0,
        "technicalLoad": 15,
        "fatigueCost": 100
      },
      "sessionMuscleSummary": {
        "quadriceps": 56,
        "hamstrings": 45,
        "glutes": 68,
        "calves": 14,
        "hipFlexors": 9,
        "adductors": 0,
        "core": 53,
        "lowerBack": 23,
        "lats": 0,
        "upperBack": 11,
        "traps": 12,
        "shoulders": 19,
        "chest": 5,
        "triceps": 5,
        "biceps": 0,
        "forearms": 12
      },
      "tags": [
        "competition",
        "crossfit",
        "partner",
        "data-recovered"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": "El usuario indicó que terminó la competición con muchas agujetas generales. Resultados y cargas exactas no registrados.",
      "pendingFields": [
        "Resultado exacto",
        "Carga exacta"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Añadido desde mensajes recientes, memoria de conversación y Google Sheet Sistema Físico. Revisar fechas marcadas como inferred/planned_or_unconfirmed. Fecha segura usada para evitar colisión; fecha inferida original: 2026-04-26.\nPending original: Resultados exactos | Cargas exactas usadas"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-023",
      "date": "2025-01-18",
      "reportedAt": "2025-01-18",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "Post-competition CrossTraining — paused squat + dual AMRAP",
      "type": "crossfit",
      "subtypes": [
        "strength",
        "mixed_modal",
        "technical"
      ],
      "durationMinutes": 70,
      "rpe": 8,
      "location": "box",
      "objective": "Vuelta a entrenamiento tras competición; fuerza de pierna y dos AMRAPs.",
      "rawText": "Post-competition CrossTraining — paused squat + dual AMRAP\nObjective: Vuelta a entrenamiento tras competición; fuerza de pierna y dos AMRAPs.\n\n4 Set — Strength\n- Back Squat pausa 2\" abajo | sets: 4 | reps: 4 | load: 70-80-90-100 kg\n- Barbell Bent Over Row | sets: 4 | reps: 8 | load: 40-50-60-60 kg\n\nAMRAP 8 min — AMRAP 1\n- DB Snatch | reps: 14/round | load: 22.5 kg\n- Row | calories: 14 cal/round\n- Push Up | reps: 14/round\n\nAMRAP 8 min — AMRAP 2\n- Deadlift | reps: 14/round | load: 60 kg\n- Burpee Over The Bar | reps: 14/round\n- Sit Up | reps: 14/round\nResult: ~4 rounds each AMRAP",
      "blocks": [
        {
          "id": "hist-2026-023-block-1",
          "name": "Strength",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Back Squat pausa 2\" abajo",
              "canonicalName": "Back Squat",
              "sets": 4,
              "reps": 4,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "squat",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": "Carga original no numérica simple: 70-80-90-100 kg"
            },
            {
              "name": "Barbell Bent Over Row",
              "canonicalName": "RowErg",
              "sets": 4,
              "reps": 8,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": "Carga original no numérica simple: 40-50-60-60 kg"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-023-block-2",
          "name": "AMRAP 1",
          "format": "amrap",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "DB Snatch",
              "canonicalName": "Dumbbell Snatch",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 22.5,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 70
                }
              ],
              "notes": "Reps originales no numéricas: 14/round"
            },
            {
              "name": "Row",
              "canonicalName": "RowErg",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Push Up",
              "canonicalName": "Push Up",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "push",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Reps originales no numéricas: 14/round"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-023-block-3",
          "name": "AMRAP 2",
          "format": "amrap",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Deadlift",
              "canonicalName": "Deadlift",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 60.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "lowerBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: 14/round"
            },
            {
              "name": "Burpee Over The Bar",
              "canonicalName": "Burpee Over Bar",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: 14/round"
            },
            {
              "name": "Sit Up",
              "canonicalName": "Sit Up",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Reps originales no numéricas: 14/round"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "rounds_reps",
        "score": "~4 rounds each AMRAP",
        "timeSeconds": null,
        "capMinutes": null,
        "completedAsPlanned": null,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 16,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 10,
        "impactScore": 20,
        "cardioLoad": 28,
        "strengthLoad": 8,
        "technicalLoad": 15,
        "fatigueCost": 91
      },
      "sessionMuscleSummary": {
        "quadriceps": 50,
        "hamstrings": 40,
        "glutes": 49,
        "calves": 6,
        "hipFlexors": 5,
        "adductors": 0,
        "core": 58,
        "lowerBack": 47,
        "lats": 39,
        "upperBack": 45,
        "traps": 7,
        "shoulders": 20,
        "chest": 14,
        "triceps": 12,
        "biceps": 29,
        "forearms": 31
      },
      "tags": [
        "crossfit",
        "post-competition",
        "amrap"
      ],
      "soreness": [
        "post-competition soreness decreasing"
      ],
      "injuryNotes": null,
      "feeling": "Mejor tras entrenar y pasear",
      "notes": "El usuario reportó sentirse mejor tras moverse, aunque la sesión fue exigente para estar post-competición.",
      "pendingFields": [],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Añadido desde mensajes recientes, memoria de conversación y Google Sheet Sistema Físico. Revisar fechas marcadas como inferred/planned_or_unconfirmed. Fecha segura usada para evitar colisión; fecha inferida original: 2026-04-28."
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-024",
      "date": "2025-01-19",
      "reportedAt": "2025-01-19",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "CrossTraining mixed — sandbag + TTB/C2B for time",
      "type": "crossfit",
      "subtypes": [
        "mixed_modal",
        "gymnastics"
      ],
      "durationMinutes": 65,
      "rpe": 8,
      "location": "box",
      "objective": "Sesión mixta con sandbag, tracción gimnástica, carrera y DB snatch.",
      "rawText": "CrossTraining mixed — sandbag + TTB/C2B for time\nObjective: Sesión mixta con sandbag, tracción gimnástica, carrera y DB snatch.\n\n4 Set — Prep / Strength\n- Plate Iso Squat apoyado en pared | sets: 4 | duration: 30 sec | load: 15 kg\n- Sandbag Clean | sets: 4 | reps: 6 | load: 45 kg\n- Strict Toes To Bar | sets: 4 | reps: 6\n- DB Row | sets: 4 | reps: 8+8 | load: 28 kg\n\nFor Time cap 18 — For Time\n- Run | distance: 600 m\n- Toes To Bar | reps: 30\n- DB Snatch | reps: 40 | load: 22.5 kg\n- Machine calories | calories: 30 cal | notes: Máquina no especificada.\n- Chest To Bar Pull Up | reps: 40\n- Front Squat | reps: 30 | load: 22.5 kg\n- Run | distance: 600 m\nResult: 18:00",
      "blocks": [
        {
          "id": "hist-2026-024-block-1",
          "name": "Prep / Strength",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Plate Iso Squat apoyado en pared",
              "canonicalName": "Plate Iso Squat Apoyado En Pared",
              "sets": 4,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": 30,
              "calories": null,
              "loadKg": 15.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "squat",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Sandbag Clean",
              "canonicalName": "Clean",
              "sets": 4,
              "reps": 6,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 45.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Strict Toes To Bar",
              "canonicalName": "Toes To Bar",
              "sets": 4,
              "reps": 6,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "DB Row",
              "canonicalName": "RowErg",
              "sets": 4,
              "reps": 16,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 28.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": "Reps originales: 8+8"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-024-block-2",
          "name": "For Time",
          "format": "for_time",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": 18,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 600,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Toes To Bar",
              "canonicalName": "Toes To Bar",
              "sets": null,
              "reps": 30,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "DB Snatch",
              "canonicalName": "Dumbbell Snatch",
              "sets": null,
              "reps": 40,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 22.5,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 70
                }
              ],
              "notes": null
            },
            {
              "name": "Machine calories",
              "canonicalName": "Machine Calories",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": "Máquina no especificada."
            },
            {
              "name": "Chest To Bar Pull Up",
              "canonicalName": "Chest To Bar",
              "sets": null,
              "reps": 40,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "biceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Front Squat",
              "canonicalName": "Front Squat",
              "sets": null,
              "reps": 30,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 22.5,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 600,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "time",
        "score": "18:00",
        "timeSeconds": null,
        "capMinutes": null,
        "completedAsPlanned": null,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 1200,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": 4447.0,
        "totalBarbellReps": 94,
        "totalDumbbellReps": 40,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 94,
        "hardSetsEstimate": 20,
        "impactScore": 44,
        "cardioLoad": 41,
        "strengthLoad": 62,
        "technicalLoad": 29,
        "fatigueCost": 93
      },
      "sessionMuscleSummary": {
        "quadriceps": 79,
        "hamstrings": 59,
        "glutes": 77,
        "calves": 12,
        "hipFlexors": 34,
        "adductors": 0,
        "core": 100,
        "lowerBack": 34,
        "lats": 41,
        "upperBack": 70,
        "traps": 30,
        "shoulders": 6,
        "chest": 0,
        "triceps": 0,
        "biceps": 31,
        "forearms": 44
      },
      "tags": [
        "crossfit",
        "gymnastics",
        "for-time"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": "El usuario completó el cap en 18 minutos.",
      "pendingFields": [],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Añadido desde mensajes recientes, memoria de conversación y Google Sheet Sistema Físico. Revisar fechas marcadas como inferred/planned_or_unconfirmed. Fecha segura usada para evitar colisión; fecha inferida original: 2026-04-29.\nSessionMuscleSummary normalizado a escala 0-100 desde puntos históricos."
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-025",
      "date": "2025-01-20",
      "reportedAt": "2025-01-20",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "HYROX engine + technical halterofilia",
      "type": "hyrox",
      "subtypes": [
        "engine",
        "mixed_modal",
        "weightlifting",
        "technical"
      ],
      "durationMinutes": 120,
      "rpe": 8,
      "location": "box",
      "objective": "Día doble planteado: HYROX largo + halterofilia técnica.",
      "rawText": "HYROX engine + technical halterofilia\nObjective: Día doble planteado: HYROX largo + halterofilia técnica.\n\nBuy in + 5 Rounds + Cash Out — HYROX\n- Run / Row | distance: 1000 m | notes: Buy in: 1000m Run-row o 2500m bike.\n- Bike | distance: 2500 m option | notes: Opción alternativa al run-row.\n- Burpee Broad Jump | sets: 5 | distance: 25 m/round\n- Wall Balls | sets: 5 | reps: 15/round | load: 9/6 kg\n- KB Swing | sets: 5 | reps: 25/round | load: 24/16 or 28/20 kg\n- Ski/Row | sets: 5 | calories: 25/20 cal/round\n- Run | distance: 1 km cash out\n\nTechnical sets — Haltero\n- Slow pause hip position Squat Snatch from floor | sets: 5 | reps: 3 | load: 60-70%\n- Hip Squat Clean + Hang Squat Clean + Push Press + Split Jerk | sets: 5 | reps: 1 + 2 + 2 + 1 | load: 60-65% | notes: Pausa en el dip.\n- Clean Pull pausa encima de rodilla | sets: 3 | reps: 4 | load: 90%",
      "blocks": [
        {
          "id": "hist-2026-025-block-1",
          "name": "HYROX",
          "format": "other",
          "roundsPlanned": 5,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run / Row",
              "canonicalName": "RowErg",
              "sets": null,
              "reps": null,
              "distanceMeters": 1000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Buy in: 1000m Run-row o 2500m bike."
            },
            {
              "name": "Bike",
              "canonicalName": "BikeErg",
              "sets": null,
              "reps": null,
              "distanceMeters": 2500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": "Opción alternativa al run-row."
            },
            {
              "name": "Burpee Broad Jump",
              "canonicalName": "Burpee Broad Jump",
              "sets": 5,
              "reps": null,
              "distanceMeters": 25,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "chest",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Wall Balls",
              "canonicalName": "Wall Ball",
              "sets": 5,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: 15/round; Carga original no numérica simple: 9/6 kg"
            },
            {
              "name": "KB Swing",
              "canonicalName": "Kettlebell Swing",
              "sets": 5,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "hinge",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "lowerBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: 25/round; Carga original no numérica simple: 24/16 or 28/20 kg"
            },
            {
              "name": "Ski/Row",
              "canonicalName": "RowErg",
              "sets": 5,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 1000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-025-block-2",
          "name": "Haltero",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Slow pause hip position Squat Snatch from floor",
              "canonicalName": "Squat Snatch",
              "sets": 5,
              "reps": 3,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 70
                }
              ],
              "notes": "Carga original no numérica simple: 60-70%"
            },
            {
              "name": "Hip Squat Clean + Hang Squat Clean + Push Press + Split Jerk",
              "canonicalName": "Squat Clean",
              "sets": 5,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Pausa en el dip.; Reps originales no numéricas: 1 + 2 + 2 + 1; Carga original no numérica simple: 60-65%"
            },
            {
              "name": "Clean Pull pausa encima de rodilla",
              "canonicalName": "Clean",
              "sets": 3,
              "reps": 4,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Carga original no numérica simple: 90%"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 1000,
        "totalBikeMeters": 2500,
        "totalRowMeters": 1000,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 27,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 8,
        "impactScore": 40,
        "cardioLoad": 80,
        "strengthLoad": 13,
        "technicalLoad": 15,
        "fatigueCost": 100
      },
      "sessionMuscleSummary": {
        "quadriceps": 81,
        "hamstrings": 75,
        "glutes": 100,
        "calves": 23,
        "hipFlexors": 4,
        "adductors": 0,
        "core": 89,
        "lowerBack": 13,
        "lats": 17,
        "upperBack": 44,
        "traps": 50,
        "shoulders": 51,
        "chest": 11,
        "triceps": 24,
        "biceps": 0,
        "forearms": 30
      },
      "tags": [
        "hyrox",
        "haltero",
        "planned-or-unconfirmed"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": "Entreno publicado como “hoy”; no hay resultado posterior confirmado en el chat recuperado.",
      "pendingFields": [
        "Otro",
        "RPE exacto"
      ],
      "dataQuality": "partial",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Añadido desde mensajes recientes, memoria de conversación y Google Sheet Sistema Físico. Revisar fechas marcadas como inferred/planned_or_unconfirmed. Fecha segura usada para evitar colisión; fecha inferida original: 2026-05-11.\nPending original: Confirmación de realización | Resultado/RPE real\nSessionMuscleSummary normalizado a escala 0-100 desde puntos históricos."
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-026",
      "date": "2025-01-21",
      "reportedAt": "2025-01-21",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "HYROX partner + gymnastics BMU/pino",
      "type": "hyrox",
      "subtypes": [
        "pairs",
        "gymnastics",
        "technical",
        "engine"
      ],
      "durationMinutes": 100,
      "rpe": 8,
      "location": "box",
      "objective": "Día previsto con HYROX partner por la mañana y gimnásticos por la tarde.",
      "rawText": "HYROX partner + gymnastics BMU/pino\nObjective: Día previsto con HYROX partner por la mañana y gimnásticos por la tarde.\n\n3 Set — Forearms / Prep\n- Zercher Reverse Lunge | sets: 3 | reps: 10\n- 2DB Bench Press | sets: 3 | reps: 12\n- Tuck Up | sets: 3 | reps: 12\n\n2 Rounds, split work — Partner WOD 1\n- Row | distance: 800 m\n- 1DB Devil Press | reps: 20\n- Run Synch | distance: 300 m\n- Sled Push | distance: 20 m | load: 150/100\n\n2 Rounds, split work — Partner WOD 2\n- Farmer Carry | distance: 100 m\n- Bike | distance: 1000 m\n- Run Synch | distance: 400 m\n\nTechnique — Gymnastics\n- Bar Muscle Up technique | notes: BMU technical work planned.\n- Handstand / pino technique | notes: Pino technical work planned.",
      "blocks": [
        {
          "id": "hist-2026-026-block-1",
          "name": "Forearms / Prep",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Zercher Reverse Lunge",
              "canonicalName": "Lunge",
              "sets": 3,
              "reps": 10,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "lunge",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "adductors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "2DB Bench Press",
              "canonicalName": "Bench Press",
              "sets": 3,
              "reps": 12,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Tuck Up",
              "canonicalName": "Tuck Up",
              "sets": 3,
              "reps": 12,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-026-block-2",
          "name": "Partner WOD 1",
          "format": "other",
          "roundsPlanned": 2,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Row",
              "canonicalName": "RowErg",
              "sets": null,
              "reps": null,
              "distanceMeters": 800,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "1DB Devil Press",
              "canonicalName": "Devil Press",
              "sets": null,
              "reps": 20,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Run Synch",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 300,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": true,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Sled Push",
              "canonicalName": "Sled Push",
              "sets": null,
              "reps": null,
              "distanceMeters": 20,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Carga original no numérica simple: 150/100"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-026-block-3",
          "name": "Partner WOD 2",
          "format": "other",
          "roundsPlanned": 2,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Farmer Carry",
              "canonicalName": "Farmer Carry",
              "sets": null,
              "reps": null,
              "distanceMeters": 100,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "carry",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "forearms",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "traps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Bike",
              "canonicalName": "BikeErg",
              "sets": null,
              "reps": null,
              "distanceMeters": 1000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Run Synch",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 400,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": true,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-026-block-4",
          "name": "Gymnastics",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Bar Muscle Up technique",
              "canonicalName": "Bar Muscle Up",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "biceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": "BMU technical work planned."
            },
            {
              "name": "Handstand / pino technique",
              "canonicalName": "Handstand Pino Technique",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Pino technical work planned."
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 700,
        "totalBikeMeters": 1000,
        "totalRowMeters": 800,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 36,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 10,
        "impactScore": 34,
        "cardioLoad": 60,
        "strengthLoad": 18,
        "technicalLoad": 15,
        "fatigueCost": 100
      },
      "sessionMuscleSummary": {
        "quadriceps": 59,
        "hamstrings": 33,
        "glutes": 52,
        "calves": 31,
        "hipFlexors": 25,
        "adductors": 15,
        "core": 84,
        "lowerBack": 0,
        "lats": 16,
        "upperBack": 20,
        "traps": 8,
        "shoulders": 39,
        "chest": 38,
        "triceps": 33,
        "biceps": 12,
        "forearms": 20
      },
      "tags": [
        "hyrox",
        "gymnastics",
        "planned-or-unconfirmed"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": "Sesión planificada para el martes; no se conserva confirmación de realización en los datos recuperados.",
      "pendingFields": [
        "Otro",
        "Resultado exacto"
      ],
      "dataQuality": "low",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Añadido desde mensajes recientes, memoria de conversación y Google Sheet Sistema Físico. Revisar fechas marcadas como inferred/planned_or_unconfirmed. Fecha segura usada para evitar colisión; fecha inferida original: 2026-05-12.\nPending original: Confirmación de realización | Resultado real"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-027",
      "date": "2025-01-22",
      "reportedAt": "2025-01-22",
      "dateConfidence": "inferred",
      "dateRule": "inferred",
      "source": "chatgpt",
      "status": "completed",
      "title": "CrossTraining partner + HYROX intervals",
      "type": "crossfit",
      "subtypes": [
        "pairs",
        "engine",
        "technical"
      ],
      "durationMinutes": 110,
      "rpe": 8,
      "location": "box",
      "objective": "Día previsto con CrossTraining por la mañana e HYROX por la tarde.",
      "rawText": "CrossTraining partner + HYROX intervals\nObjective: Día previsto con CrossTraining por la mañana e HYROX por la tarde.\n\n4 Set — Strength / Prep\n- 2DB Row | sets: 4 | reps: 10\n- Split Stance RDL Breakdown | sets: 4 | reps: 10+10\n- Strict Toes To Bar | sets: 4 | reps: 6-8\n- Broad Jump | sets: 4 | reps: 5\n\n4 RFT — Partner WOD\n- Deadlift | reps: 30/round | load: 80/55 kg\n- Synch Toes To Bar | reps: 15/round\n- Wall Ball to partner | reps: 20/round | load: 9/6 kg\n\nEvery 5 min x 20 — HYROX intervals\n- Landmine Rotational Press | sets: 3 | reps: 8+8\n- Row or Ski | sets: 3 | distance: 500/400 m\n- Run nasal breathing | sets: 3 | distance: 400 m\n- Run/Bike interval | distance: 500 m run / 1400 m bike; scale 400 m\n- Burpee Broad Jump | distance: 25 m\n- Sit Up | reps: 15\n- Push Up | reps: 10",
      "blocks": [
        {
          "id": "hist-2026-027-block-1",
          "name": "Strength / Prep",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "2DB Row",
              "canonicalName": "RowErg",
              "sets": 4,
              "reps": 10,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Split Stance RDL Breakdown",
              "canonicalName": "Deadlift",
              "sets": 4,
              "reps": 20,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "hinge",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "lowerBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": "Reps originales: 10+10"
            },
            {
              "name": "Strict Toes To Bar",
              "canonicalName": "Toes To Bar",
              "sets": 4,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Reps originales no numéricas: 6-8"
            },
            {
              "name": "Broad Jump",
              "canonicalName": "Broad Jump",
              "sets": 4,
              "reps": 5,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "jump",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "chest",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-027-block-2",
          "name": "Partner WOD",
          "format": "for_time",
          "roundsPlanned": 4,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Deadlift",
              "canonicalName": "Deadlift",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "lowerBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: 30/round; Carga original no numérica simple: 80/55 kg"
            },
            {
              "name": "Synch Toes To Bar",
              "canonicalName": "Toes To Bar",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": true,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Reps originales no numéricas: 15/round"
            },
            {
              "name": "Wall Ball to partner",
              "canonicalName": "Wall Ball",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: 20/round; Carga original no numérica simple: 9/6 kg"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-027-block-3",
          "name": "HYROX intervals",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Landmine Rotational Press",
              "canonicalName": "Landmine Rotational Press",
              "sets": 3,
              "reps": 16,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Reps originales: 8+8"
            },
            {
              "name": "Row or Ski",
              "canonicalName": "RowErg",
              "sets": 3,
              "reps": null,
              "distanceMeters": 400,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Run nasal breathing",
              "canonicalName": "Run",
              "sets": 3,
              "reps": null,
              "distanceMeters": 400,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Run/Bike interval",
              "canonicalName": "BikeErg",
              "sets": null,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Burpee Broad Jump",
              "canonicalName": "Burpee Broad Jump",
              "sets": null,
              "reps": null,
              "distanceMeters": 25,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "chest",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Sit Up",
              "canonicalName": "Sit Up",
              "sets": null,
              "reps": 15,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Push Up",
              "canonicalName": "Push Up",
              "sets": null,
              "reps": 10,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "push",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 1200,
        "totalBikeMeters": 500,
        "totalRowMeters": 1200,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 80,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 15,
        "hardSetsEstimate": 17,
        "impactScore": 44,
        "cardioLoad": 71,
        "strengthLoad": 40,
        "technicalLoad": 17,
        "fatigueCost": 100
      },
      "sessionMuscleSummary": {
        "quadriceps": 51,
        "hamstrings": 73,
        "glutes": 73,
        "calves": 44,
        "hipFlexors": 35,
        "adductors": 0,
        "core": 100,
        "lowerBack": 36,
        "lats": 37,
        "upperBack": 37,
        "traps": 0,
        "shoulders": 42,
        "chest": 40,
        "triceps": 23,
        "biceps": 27,
        "forearms": 29
      },
      "tags": [
        "crossfit",
        "hyrox",
        "planned-or-unconfirmed"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": "Sesión planificada para miércoles; no se conserva confirmación de realización en los datos recuperados.",
      "pendingFields": [
        "Otro",
        "Resultado exacto"
      ],
      "dataQuality": "low",
      "importNotes": "SAFE_DATES: fecha movida a bloque de archivo para evitar pisar entrenamientos reales. Añadido desde mensajes recientes, memoria de conversación y Google Sheet Sistema Físico. Revisar fechas marcadas como inferred/planned_or_unconfirmed. Fecha segura usada para evitar colisión; fecha inferida original: 2026-05-13.\nPending original: Confirmación de realización | Resultado real\nSessionMuscleSummary normalizado a escala 0-100 desde puntos históricos."
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-009",
      "date": "2026-02-12",
      "reportedAt": "2026-02-12",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "Hybrid Day pre-race knee test",
      "type": "running",
      "subtypes": [
        "mixed_modal",
        "running",
        "technical"
      ],
      "durationMinutes": 35,
      "rpe": 4,
      "location": "outdoor",
      "objective": "Test de tolerancia de rodilla previo a competición.",
      "rawText": "Hybrid Day pre-race knee test\nObjective: Test de tolerancia de rodilla previo a competición.\n\nProgressive — Progressive Run Test\n- Progressive Run | distance: approx. 4-5 km | time: not specified | notes: Tape elástico y rodillera rotuliana probada\n\nActivation — Post-Test Explosive Work\n- Explosive drills | notes: Ejercicios explosivos posteriores sin problema\nResult: Media aproximada 6:20/km; tramos 6:40 a 6:00/km",
      "blocks": [
        {
          "id": "hist-2026-009-block-1",
          "name": "Progressive Run Test",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Progressive Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 5000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "low",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Tape elástico y rodillera rotuliana probada; Duración original no parseada: not specified"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-009-block-2",
          "name": "Post-Test Explosive Work",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Explosive drills",
              "canonicalName": "Explosive Drills",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "jump",
              "intensity": "low",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 30
                }
              ],
              "notes": "Ejercicios explosivos posteriores sin problema"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "time",
        "score": "Media aproximada 6:20/km; tramos 6:40 a 6:00/km",
        "timeSeconds": null,
        "capMinutes": null,
        "completedAsPlanned": null,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 5000,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 100,
        "cardioLoad": 76,
        "strengthLoad": 0,
        "technicalLoad": 5,
        "fatigueCost": 59
      },
      "sessionMuscleSummary": {
        "quadriceps": 13,
        "hamstrings": 9,
        "glutes": 12,
        "calves": 14,
        "hipFlexors": 4,
        "adductors": 0,
        "core": 6,
        "lowerBack": 0,
        "lats": 0,
        "upperBack": 0,
        "traps": 0,
        "shoulders": 0,
        "chest": 0,
        "triceps": 0,
        "biceps": 0,
        "forearms": 0
      },
      "tags": [
        "running",
        "knee-test",
        "taper",
        "hybrid-day"
      ],
      "soreness": [],
      "injuryNotes": "Pinchazos ocasionales; sin dolor progresivo ni dolor post test. Rodillera demasiado apretada generó molestia en gemelo.",
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Distancia exacta",
        "Duración exacta"
      ],
      "dataQuality": "partial",
      "importNotes": "Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS.\nPending original: Distancia exacta | Duración exacta"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-010",
      "date": "2026-02-14",
      "reportedAt": "2026-02-14",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "Hybrid Day Madrid doubles competition",
      "type": "mixed",
      "subtypes": [
        "engine",
        "running",
        "mixed_modal"
      ],
      "durationMinutes": 75,
      "rpe": 9,
      "location": "competition",
      "objective": "Competición híbrida tipo HYROX dobles mixto.",
      "rawText": "Hybrid Day Madrid doubles competition\nObjective: Competición híbrida tipo HYROX dobles mixto.\n\n8 Runs — Race Runs\n- Run 1 | time: 4:35\n- Run 2 | time: 5:07\n- Run 3 | time: 5:20\n- Run 4 | time: 5:20\n- Run 5 | time: 5:45\n- Run 6 | time: 5:39\n- Run 7 | time: 5:45\n- Run 8 | time: 5:39\n\n8 Stations — Workouts\n- Workout 1 | time: 4:12\n- Workout 2 | time: 1:57\n- Workout 3 | time: 3:04\n- Workout 4 | time: 3:41\n- Workout 5 | time: 4:49\n- Workout 6 | time: 2:18\n- Workout 7 | time: 4:05\n- Workout 8 | time: 4:23\nResult: Tiempo total 1:15:17; suma carrera aprox. 43:10; media carrera estimada 5:24/km; suma workouts aprox. 28:29; transiciones aprox. 3:38.",
      "blocks": [
        {
          "id": "hist-2026-010-block-1",
          "name": "Race Runs",
          "format": "running",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run 1",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Duración original no parseada: 4:35"
            },
            {
              "name": "Run 2",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Duración original no parseada: 5:07"
            },
            {
              "name": "Run 3",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Duración original no parseada: 5:20"
            },
            {
              "name": "Run 4",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Duración original no parseada: 5:20"
            },
            {
              "name": "Run 5",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Duración original no parseada: 5:45"
            },
            {
              "name": "Run 6",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Duración original no parseada: 5:39"
            },
            {
              "name": "Run 7",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Duración original no parseada: 5:45"
            },
            {
              "name": "Run 8",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Duración original no parseada: 5:39"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-010-block-2",
          "name": "Workouts",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Workout 1",
              "canonicalName": "Workout 1",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [],
              "notes": "Duración original no parseada: 4:12"
            },
            {
              "name": "Workout 2",
              "canonicalName": "Workout 2",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [],
              "notes": "Duración original no parseada: 1:57"
            },
            {
              "name": "Workout 3",
              "canonicalName": "Workout 3",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [],
              "notes": "Duración original no parseada: 3:04"
            },
            {
              "name": "Workout 4",
              "canonicalName": "Workout 4",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [],
              "notes": "Duración original no parseada: 3:41"
            },
            {
              "name": "Workout 5",
              "canonicalName": "Workout 5",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [],
              "notes": "Duración original no parseada: 4:49"
            },
            {
              "name": "Workout 6",
              "canonicalName": "Workout 6",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [],
              "notes": "Duración original no parseada: 2:18"
            },
            {
              "name": "Workout 7",
              "canonicalName": "Workout 7",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [],
              "notes": "Duración original no parseada: 4:05"
            },
            {
              "name": "Workout 8",
              "canonicalName": "Workout 8",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [],
              "notes": "Duración original no parseada: 4:23"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "time",
        "score": "Tiempo total 1:15:17; suma carrera aprox. 43:10; media carrera estimada 5:24/km; suma workouts aprox. 28:29; transiciones aprox. 3:38.",
        "timeSeconds": null,
        "capMinutes": null,
        "completedAsPlanned": null,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 20,
        "cardioLoad": 30,
        "strengthLoad": 0,
        "technicalLoad": 5,
        "fatigueCost": 100
      },
      "sessionMuscleSummary": {
        "quadriceps": 48,
        "hamstrings": 40,
        "glutes": 40,
        "calves": 56,
        "hipFlexors": 32,
        "adductors": 0,
        "core": 24,
        "lowerBack": 0,
        "lats": 0,
        "upperBack": 0,
        "traps": 0,
        "shoulders": 0,
        "chest": 0,
        "triceps": 0,
        "biceps": 0,
        "forearms": 0
      },
      "tags": [
        "competition",
        "hyrox",
        "hybrid-day",
        "doubles"
      ],
      "soreness": [],
      "injuryNotes": "Rodilla toleró la prueba.",
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Otro"
      ],
      "dataQuality": "partial",
      "importNotes": "Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS.\nPending original: Detalle exacto de estaciones"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-016",
      "date": "2026-02-28",
      "reportedAt": "2026-02-28",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "CrossFit Open 26.1 RX",
      "type": "mixed",
      "subtypes": [
        "mixed_modal"
      ],
      "durationMinutes": 15,
      "rpe": 9,
      "location": "competition",
      "objective": "Competición CrossFit Open 26.1 versión RX.",
      "rawText": "CrossFit Open 26.1 RX\nObjective: Competición CrossFit Open 26.1 versión RX.\n\nCompetition Workout — Open 26.1\n- CrossFit Open 26.1 | reps: 167 reps\nResult: 167 repeticiones",
      "blocks": [
        {
          "id": "hist-2026-016-block-1",
          "name": "Open 26.1",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "CrossFit Open 26.1",
              "canonicalName": "Crossfit Open 26 1",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [],
              "notes": "Reps originales no numéricas: 167 reps"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "rounds_reps",
        "score": "167 repeticiones",
        "timeSeconds": null,
        "capMinutes": null,
        "completedAsPlanned": null,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 20,
        "cardioLoad": 6,
        "strengthLoad": 0,
        "technicalLoad": 5,
        "fatigueCost": 80
      },
      "sessionMuscleSummary": {
        "quadriceps": 0,
        "hamstrings": 0,
        "glutes": 0,
        "calves": 0,
        "hipFlexors": 0,
        "adductors": 0,
        "core": 0,
        "lowerBack": 0,
        "lats": 0,
        "upperBack": 0,
        "traps": 0,
        "shoulders": 0,
        "chest": 0,
        "triceps": 0,
        "biceps": 0,
        "forearms": 0
      },
      "tags": [
        "competition",
        "crossfit-open",
        "26.1",
        "rx"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": "Ahogo; no pudo sacar el cardio real.",
      "notes": "Realizado estando bastante malo/resfriado, con mocos, malestar y posible febrícula.",
      "pendingFields": [
        "Otro"
      ],
      "dataQuality": "partial",
      "importNotes": "Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS.\nPending original: Estructura exacta del workout"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-017",
      "date": "2026-03-01",
      "reportedAt": "2026-03-01",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "Running Z2 after Open 26.1",
      "type": "running",
      "subtypes": [
        "z2",
        "engine",
        "running"
      ],
      "durationMinutes": 53,
      "rpe": 5,
      "location": "outdoor",
      "objective": "Rodaje Z2 aeróbico.",
      "rawText": "Running Z2 after Open 26.1\nObjective: Rodaje Z2 aeróbico.\n\nSteady Run — Zone 2 Run\n- Run | distance: 8.9 km | time: approx. 53:17 | notes: 5:59/km avg; avg HR 136; max HR 151; Running Index 59\nResult: 8.9 km @ 5:59/km; FC media 136; FC máx 151; Running Index 59.",
      "blocks": [
        {
          "id": "hist-2026-017-block-1",
          "name": "Zone 2 Run",
          "format": "running",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 8900,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "low",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "5:59/km avg; avg HR 136; max HR 151; Running Index 59; Duración original no parseada: approx. 53:17"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "time",
        "score": "8.9 km @ 5:59/km; FC media 136; FC máx 151; Running Index 59.",
        "timeSeconds": null,
        "capMinutes": null,
        "completedAsPlanned": null,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 8900,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 100,
        "cardioLoad": 100,
        "strengthLoad": 0,
        "technicalLoad": 5,
        "fatigueCost": 73
      },
      "sessionMuscleSummary": {
        "quadriceps": 6,
        "hamstrings": 5,
        "glutes": 5,
        "calves": 7,
        "hipFlexors": 4,
        "adductors": 0,
        "core": 3,
        "lowerBack": 0,
        "lats": 0,
        "upperBack": 0,
        "traps": 0,
        "shoulders": 0,
        "chest": 0,
        "triceps": 0,
        "biceps": 0,
        "forearms": 0
      },
      "tags": [
        "z2",
        "aerobic",
        "running"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": "Al día siguiente del Open 26.1. Posteriormente DOMS fuertes en cuádriceps/glúteos, interpretado como agujetas no lesión.",
      "pendingFields": [],
      "dataQuality": "high",
      "importNotes": "Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS."
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-018",
      "date": "2026-03-06",
      "reportedAt": "2026-03-06",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "CrossFit Open 26.2 scaled",
      "type": "mixed",
      "subtypes": [
        "mixed_modal",
        "technical"
      ],
      "durationMinutes": 15,
      "rpe": 8,
      "location": "competition",
      "objective": "Competición CrossFit Open 26.2 versión escalada.",
      "rawText": "CrossFit Open 26.2 scaled\nObjective: Competición CrossFit Open 26.2 versión escalada.\n\nCompetition Workout — Open 26.2\n- CrossFit Open 26.2 Scaled | time: 14:20\nResult: 14:20",
      "blocks": [
        {
          "id": "hist-2026-018-block-1",
          "name": "Open 26.2",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "CrossFit Open 26.2 Scaled",
              "canonicalName": "Crossfit Open 26 2 Scaled",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [],
              "notes": "Duración original no parseada: 14:20"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "time",
        "score": "14:20",
        "timeSeconds": null,
        "capMinutes": null,
        "completedAsPlanned": null,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 20,
        "cardioLoad": 6,
        "strengthLoad": 0,
        "technicalLoad": 5,
        "fatigueCost": 72
      },
      "sessionMuscleSummary": {
        "quadriceps": 0,
        "hamstrings": 0,
        "glutes": 0,
        "calves": 0,
        "hipFlexors": 0,
        "adductors": 0,
        "core": 0,
        "lowerBack": 0,
        "lats": 0,
        "upperBack": 0,
        "traps": 0,
        "shoulders": 0,
        "chest": 0,
        "triceps": 0,
        "biceps": 0,
        "forearms": 0
      },
      "tags": [
        "competition",
        "crossfit-open",
        "26.2",
        "scaled"
      ],
      "soreness": [],
      "injuryNotes": "Escalado por dolor cervical con mancuernas de 22.5 kg en overhead.",
      "feeling": "Ahogo similar al 26.1.",
      "notes": "Rendimiento afectado por proceso respiratorio + molestias cervicales.",
      "pendingFields": [
        "Otro"
      ],
      "dataQuality": "partial",
      "importNotes": "Fecha asignada de forma artificial para crear histórico coherente en Hybrid OS.\nPending original: Estructura exacta del workout"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-034",
      "date": "2026-04-05",
      "reportedAt": "2026-04-05",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "11 km Z2 run @5:55/km",
      "type": "running",
      "subtypes": [
        "z2",
        "engine",
        "running"
      ],
      "durationMinutes": 70,
      "rpe": 4,
      "location": "outdoor",
      "objective": "Rodaje zona 2 previo a semana de entrenamiento ATHX/HYROX.",
      "rawText": "11 km Z2 run @5:55/km\nObjective: Rodaje zona 2 previo a semana de entrenamiento ATHX/HYROX.\n\nRun — Z2 Run\n- Run | distance: 11 km | notes: Ritmo medio reportado 5:55/km\nResult: 11 km @5:55/km",
      "blocks": [
        {
          "id": "hist-2026-034-block-1",
          "name": "Z2 Run",
          "format": "running",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 11000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "low",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Ritmo medio reportado 5:55/km"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "time",
        "score": "11 km @5:55/km",
        "timeSeconds": null,
        "capMinutes": null,
        "completedAsPlanned": null,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 11000,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 100,
        "cardioLoad": 100,
        "strengthLoad": 0,
        "technicalLoad": 5,
        "fatigueCost": 71
      },
      "sessionMuscleSummary": {
        "quadriceps": 6,
        "hamstrings": 5,
        "glutes": 5,
        "calves": 7,
        "hipFlexors": 4,
        "adductors": 0,
        "core": 3,
        "lowerBack": 0,
        "lats": 0,
        "upperBack": 0,
        "traps": 0,
        "shoulders": 0,
        "chest": 0,
        "triceps": 0,
        "biceps": 0,
        "forearms": 0
      },
      "tags": [
        "running",
        "z2"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Otro"
      ],
      "dataQuality": "high",
      "importNotes": "Recuperado desde histórico de conversación con estructura concreta de bloques/ejercicios; no procede de la frase-resumen del Drive.\nPending original: FC media exacta"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-035",
      "date": "2026-04-06",
      "reportedAt": "2026-04-06",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "ATHX endurance + two 15-12-9 metcons",
      "type": "hyrox",
      "subtypes": [
        "mixed_modal",
        "engine"
      ],
      "durationMinutes": 75,
      "rpe": 8,
      "location": "box",
      "objective": "Sesión ATHX/endurance con bloques de máquina/carrera y dos metcons 15-12-9.",
      "rawText": "ATHX endurance + two 15-12-9 metcons\nObjective: Sesión ATHX/endurance con bloques de máquina/carrera y dos metcons 15-12-9.\n\n3 Set — Endurance 3 Set\n- Run | sets: 3 | distance: 500 m\n- Ski | sets: 3 | distance: 500 m\n- Row | sets: 3 | distance: 500 m\n\n15-12-9 — Metcon A\n- DB Snatch | reps: 15-12-9\n- Box Jump Over | reps: 15-12-9\n- Burpee | reps: 15-12-9\n\n15-12-9 — Metcon B\n- Machine Calories | calories: 15-12-9 cal\n- Goblet Squat | reps: 15-12-9\n- Push Up | reps: 15-12-9",
      "blocks": [
        {
          "id": "hist-2026-035-block-1",
          "name": "Endurance 3 Set",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": 3,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Ski",
              "canonicalName": "SkiErg",
              "sets": 3,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Row",
              "canonicalName": "RowErg",
              "sets": 3,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-035-block-2",
          "name": "Metcon A",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "DB Snatch",
              "canonicalName": "Dumbbell Snatch",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: 15-12-9"
            },
            {
              "name": "Box Jump Over",
              "canonicalName": "Box Jump",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "jump",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Reps originales no numéricas: 15-12-9"
            },
            {
              "name": "Burpee",
              "canonicalName": "Burpee",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: 15-12-9"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-035-block-3",
          "name": "Metcon B",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Machine Calories",
              "canonicalName": "Machine Calories",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Goblet Squat",
              "canonicalName": "Goblet Squat",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "squat",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": "Reps originales no numéricas: 15-12-9"
            },
            {
              "name": "Push Up",
              "canonicalName": "Push Up",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "push",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Reps originales no numéricas: 15-12-9"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 1500,
        "totalBikeMeters": 0,
        "totalRowMeters": 1500,
        "totalSkiMeters": 1500,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 50,
        "cardioLoad": 76,
        "strengthLoad": 0,
        "technicalLoad": 15,
        "fatigueCost": 97
      },
      "sessionMuscleSummary": {
        "quadriceps": 48,
        "hamstrings": 46,
        "glutes": 52,
        "calves": 34,
        "hipFlexors": 24,
        "adductors": 0,
        "core": 69,
        "lowerBack": 4,
        "lats": 52,
        "upperBack": 49,
        "traps": 6,
        "shoulders": 33,
        "chest": 14,
        "triceps": 30,
        "biceps": 20,
        "forearms": 20
      },
      "tags": [
        "athx",
        "hyrox",
        "metcon"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Carga exacta",
        "Resultado exacto"
      ],
      "dataQuality": "partial",
      "importNotes": "Recuperado desde histórico de conversación con estructura concreta de bloques/ejercicios; no procede de la frase-resumen del Drive.\nPending original: Cargas DB/goblet no recuperadas | Resultado final no recuperado"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-036",
      "date": "2026-04-07",
      "reportedAt": "2026-04-07",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "Back squat 4x8 @80 kg + team WOD",
      "type": "crossfit",
      "subtypes": [
        "strength",
        "team"
      ],
      "durationMinutes": 70,
      "rpe": 7,
      "location": "box",
      "objective": "Sesión con fuerza de sentadilla y WOD en equipo; solo se conserva completo el bloque de fuerza.",
      "rawText": "Back squat 4x8 @80 kg + team WOD\nObjective: Sesión con fuerza de sentadilla y WOD en equipo; solo se conserva completo el bloque de fuerza.\n\n4x8 — Strength\n- Back Squat | sets: 4 | reps: 8 | load: 80 kg\n\nTeam WOD — Team WOD\n- Team WOD | notes: Detalle concreto no recuperado en histórico",
      "blocks": [
        {
          "id": "hist-2026-036-block-1",
          "name": "Strength",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Back Squat",
              "canonicalName": "Back Squat",
              "sets": 4,
              "reps": 8,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 80.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "squat",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-036-block-2",
          "name": "Team WOD",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Team WOD",
              "canonicalName": "Team Wod",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "shoulders",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Detalle concreto no recuperado en histórico"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": 2560.0,
        "totalBarbellReps": 32,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 4,
        "impactScore": 20,
        "cardioLoad": 28,
        "strengthLoad": 19,
        "technicalLoad": 15,
        "fatigueCost": 83
      },
      "sessionMuscleSummary": {
        "quadriceps": 32,
        "hamstrings": 16,
        "glutes": 28,
        "calves": 0,
        "hipFlexors": 5,
        "adductors": 0,
        "core": 28,
        "lowerBack": 16,
        "lats": 0,
        "upperBack": 0,
        "traps": 0,
        "shoulders": 3,
        "chest": 0,
        "triceps": 0,
        "biceps": 0,
        "forearms": 0
      },
      "tags": [
        "crossfit",
        "squat",
        "team-wod"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Otro"
      ],
      "dataQuality": "partial",
      "importNotes": "Recuperado desde histórico de conversación con estructura concreta de bloques/ejercicios; no procede de la frase-resumen del Drive.\nPending original: Detalle del Team WOD"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-037",
      "date": "2026-04-08",
      "reportedAt": "2026-04-08",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "HYROX zercher + sled backward pull + run",
      "type": "hyrox",
      "subtypes": [
        "strength",
        "lower_body",
        "running",
        "engine"
      ],
      "durationMinutes": 65,
      "rpe": 7,
      "location": "box",
      "objective": "HYROX con zercher squat, sled backward pull y carrera; el tramo final del log quedó incompleto en histórico.",
      "rawText": "HYROX zercher + sled backward pull + run\nObjective: HYROX con zercher squat, sled backward pull y carrera; el tramo final del log quedó incompleto en histórico.\n\n3 Set — HYROX Strength/Engine\n- Zercher Squat | sets: 3 | reps: 8 | load: RPE 6\n- Sled Backward Pull | sets: 3 | distance: 25 m | load: 125/90 kg\n- Run | sets: 3 | distance: 300 m\n\n3 RDS — Conditioning\n- Run | sets: 3 | distance: 400 m\n- Unknown stations | sets: 3 | notes: Resto del bloque no conservado completo",
      "blocks": [
        {
          "id": "hist-2026-037-block-1",
          "name": "HYROX Strength/Engine",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Zercher Squat",
              "canonicalName": "Zercher Squat",
              "sets": 3,
              "reps": 8,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "squat",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": "Carga original no numérica simple: RPE 6"
            },
            {
              "name": "Sled Backward Pull",
              "canonicalName": "Sled Pull",
              "sets": 3,
              "reps": null,
              "distanceMeters": 25,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Carga original no numérica simple: 125/90 kg"
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": 3,
              "reps": null,
              "distanceMeters": 300,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-037-block-2",
          "name": "Conditioning",
          "format": "other",
          "roundsPlanned": 3,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": 3,
              "reps": null,
              "distanceMeters": 400,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Unknown stations",
              "canonicalName": "Unknown Stations",
              "sets": 3,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "shoulders",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Resto del bloque no conservado completo"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 2100,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 24,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 3,
        "impactScore": 62,
        "cardioLoad": 52,
        "strengthLoad": 12,
        "technicalLoad": 15,
        "fatigueCost": 88
      },
      "sessionMuscleSummary": {
        "quadriceps": 81,
        "hamstrings": 60,
        "glutes": 72,
        "calves": 42,
        "hipFlexors": 39,
        "adductors": 0,
        "core": 75,
        "lowerBack": 12,
        "lats": 0,
        "upperBack": 18,
        "traps": 0,
        "shoulders": 9,
        "chest": 0,
        "triceps": 0,
        "biceps": 0,
        "forearms": 15
      },
      "tags": [
        "hyrox",
        "sled",
        "run"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Otro"
      ],
      "dataQuality": "partial",
      "importNotes": "Recuperado desde histórico de conversación con estructura concreta de bloques/ejercicios; no procede de la frase-resumen del Drive.\nPending original: Resto del bloque 3 RDS"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-038",
      "date": "2026-04-21",
      "reportedAt": "2026-04-21",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "planned",
      "title": "Power Clean + Push Press + AMRAP 14",
      "type": "crossfit",
      "subtypes": [
        "weightlifting",
        "amrap"
      ],
      "durationMinutes": 70,
      "rpe": 7,
      "location": "box",
      "objective": "CrossTraining publicado en semana con preocupación cervical/competición; queda marcado como no confirmado si no se completó.",
      "rawText": "Power Clean + Push Press + AMRAP 14\nObjective: CrossTraining publicado en semana con preocupación cervical/competición; queda marcado como no confirmado si no se completó.\n\n3 Set 65-70% — Power Clean + Push Press\n- Power Clean + Push Press | sets: 3 | reps: 5 + 5 | load: 65-70%\n- Cuban Rotation | sets: 3 | reps: 8\n\n3 Set 75-78% — Power Clean + Push Press\n- Power Clean + Push Press | sets: 3 | reps: 3 + 3 | load: 75-78%\n\nAMRAP 14 min — AMRAP 14\n- Double Under | reps: 50/round\n- Wall Balls | reps: 30/round\n- V-Up / Toes To Bar | reps: 20/round\n- Wall Walk / Handstand Walk | reps: 3 wall walks / 10 m HSW\n- Rope Climb | reps: 1/round",
      "blocks": [
        {
          "id": "hist-2026-038-block-1",
          "name": "Power Clean + Push Press",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Power Clean + Push Press",
              "canonicalName": "Power Clean",
              "sets": 3,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: 5 + 5; Carga original no numérica simple: 65-70%"
            },
            {
              "name": "Cuban Rotation",
              "canonicalName": "Cuban Rotation",
              "sets": 3,
              "reps": 8,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-038-block-2",
          "name": "Power Clean + Push Press",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Power Clean + Push Press",
              "canonicalName": "Power Clean",
              "sets": 3,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: 3 + 3; Carga original no numérica simple: 75-78%"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-038-block-3",
          "name": "AMRAP 14",
          "format": "amrap",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Double Under",
              "canonicalName": "Double Under",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "jump",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Reps originales no numéricas: 50/round"
            },
            {
              "name": "Wall Balls",
              "canonicalName": "Wall Ball",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": "Reps originales no numéricas: 30/round"
            },
            {
              "name": "V-Up / Toes To Bar",
              "canonicalName": "Toes To Bar",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "shoulders",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Reps originales no numéricas: 20/round"
            },
            {
              "name": "Wall Walk / Handstand Walk",
              "canonicalName": "Wall Walk Handstand Walk",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": "Reps originales no numéricas: 3 wall walks / 10 m HSW"
            },
            {
              "name": "Rope Climb",
              "canonicalName": "Rope Climb",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "biceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": "Reps originales no numéricas: 1/round"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 3,
        "impactScore": 20,
        "cardioLoad": 28,
        "strengthLoad": 0,
        "technicalLoad": 15,
        "fatigueCost": 83
      },
      "sessionMuscleSummary": {
        "quadriceps": 63,
        "hamstrings": 46,
        "glutes": 61,
        "calves": 7,
        "hipFlexors": 5,
        "adductors": 0,
        "core": 77,
        "lowerBack": 0,
        "lats": 9,
        "upperBack": 43,
        "traps": 56,
        "shoulders": 78,
        "chest": 0,
        "triceps": 33,
        "biceps": 7,
        "forearms": 6
      },
      "tags": [
        "crossfit",
        "clean",
        "push-press",
        "amrap"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Otro",
        "Resultado exacto"
      ],
      "dataQuality": "partial",
      "importNotes": "Recuperado desde histórico de conversación con estructura concreta de bloques/ejercicios; no procede de la frase-resumen del Drive.\nPending original: Confirmar si fue realizado | Resultado AMRAP"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-039",
      "date": "2026-05-01",
      "reportedAt": "2026-05-01",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "11 km run",
      "type": "running",
      "subtypes": [
        "engine",
        "running"
      ],
      "durationMinutes": 65,
      "rpe": 5,
      "location": "outdoor",
      "objective": "Rodaje de 11 km reportado en revisión de la semana del 6 de mayo.",
      "rawText": "11 km run\nObjective: Rodaje de 11 km reportado en revisión de la semana del 6 de mayo.\n\nRun — Run\n- Run | distance: 11 km\nResult: 11 km",
      "blocks": [
        {
          "id": "hist-2026-039-block-1",
          "name": "Run",
          "format": "running",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 11000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "low",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "distance",
        "score": "11 km",
        "timeSeconds": null,
        "capMinutes": null,
        "completedAsPlanned": null,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 11000,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 100,
        "cardioLoad": 100,
        "strengthLoad": 0,
        "technicalLoad": 5,
        "fatigueCost": 77
      },
      "sessionMuscleSummary": {
        "quadriceps": 6,
        "hamstrings": 5,
        "glutes": 5,
        "calves": 7,
        "hipFlexors": 4,
        "adductors": 0,
        "core": 3,
        "lowerBack": 0,
        "lats": 0,
        "upperBack": 0,
        "traps": 0,
        "shoulders": 0,
        "chest": 0,
        "triceps": 0,
        "biceps": 0,
        "forearms": 0
      },
      "tags": [
        "running"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Otro"
      ],
      "dataQuality": "partial",
      "importNotes": "Recuperado desde histórico de conversación con estructura concreta de bloques/ejercicios; no procede de la frase-resumen del Drive.\nPending original: Ritmo y FC exactos"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-040",
      "date": "2026-05-02",
      "reportedAt": "2026-05-02",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "Deadlift + deficit strict HSPU EMOM and intervals",
      "type": "crossfit",
      "subtypes": [
        "strength",
        "gymnastics",
        "intervals"
      ],
      "durationMinutes": 80,
      "rpe": 8,
      "location": "box",
      "objective": "Sesión de sábado con EMOM de deadlift/HSPU y bloque interválico con DB hang clean, HSPU y box jump over.",
      "rawText": "Deadlift + deficit strict HSPU EMOM and intervals\nObjective: Sesión de sábado con EMOM de deadlift/HSPU y bloque interválico con DB hang clean, HSPU y box jump over.\n\nEMOM 12 min — EMOM 12\n- Deadlift | load: 100-120 kg | notes: Carga reportada 100-120 kg\n- Deficit Strict HSPU | notes: Reps no recuperadas\n\nIntervals — Intervals\n- 2DB Hang Clean | load: 2 x 22.5 kg\n- HSPU\n- Box Jump Over",
      "blocks": [
        {
          "id": "hist-2026-040-block-1",
          "name": "EMOM 12",
          "format": "emom",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Deadlift",
              "canonicalName": "Deadlift",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "hinge",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "lowerBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": "Carga reportada 100-120 kg; Carga original no numérica simple: 100-120 kg"
            },
            {
              "name": "Deficit Strict HSPU",
              "canonicalName": "Deficit Strict Hspu",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": "Reps no recuperadas"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-040-block-2",
          "name": "Intervals",
          "format": "intervals",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "2DB Hang Clean",
              "canonicalName": "Clean",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 45.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                }
              ],
              "notes": "Carga original: 2 x 22.5 kg"
            },
            {
              "name": "HSPU",
              "canonicalName": "Hspu",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Box Jump Over",
              "canonicalName": "Box Jump",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "jump",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 1,
        "impactScore": 20,
        "cardioLoad": 32,
        "strengthLoad": 0,
        "technicalLoad": 15,
        "fatigueCost": 95
      },
      "sessionMuscleSummary": {
        "quadriceps": 15,
        "hamstrings": 19,
        "glutes": 22,
        "calves": 7,
        "hipFlexors": 0,
        "adductors": 0,
        "core": 24,
        "lowerBack": 6,
        "lats": 0,
        "upperBack": 6,
        "traps": 16,
        "shoulders": 22,
        "chest": 0,
        "triceps": 14,
        "biceps": 0,
        "forearms": 0
      },
      "tags": [
        "deadlift",
        "hspu",
        "crossfit"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Repeticiones exactas",
        "Otro",
        "Resultado exacto"
      ],
      "dataQuality": "partial",
      "importNotes": "Recuperado desde histórico de conversación con estructura concreta de bloques/ejercicios; no procede de la frase-resumen del Drive.\nPending original: Reps exactas del EMOM | Estructura exacta de intervalos | Resultado"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-041",
      "date": "2026-05-03",
      "reportedAt": "2026-05-03",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "7 km run",
      "type": "running",
      "subtypes": [
        "engine",
        "running"
      ],
      "durationMinutes": 42,
      "rpe": 4,
      "location": "outdoor",
      "objective": "Rodaje de 7 km reportado en revisión de la semana del 6 de mayo.",
      "rawText": "7 km run\nObjective: Rodaje de 7 km reportado en revisión de la semana del 6 de mayo.\n\nRun — Run\n- Run | distance: 7 km\nResult: 7 km",
      "blocks": [
        {
          "id": "hist-2026-041-block-1",
          "name": "Run",
          "format": "running",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 7000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "low",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "distance",
        "score": "7 km",
        "timeSeconds": null,
        "capMinutes": null,
        "completedAsPlanned": null,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 7000,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 100,
        "cardioLoad": 100,
        "strengthLoad": 0,
        "technicalLoad": 5,
        "fatigueCost": 61
      },
      "sessionMuscleSummary": {
        "quadriceps": 6,
        "hamstrings": 5,
        "glutes": 5,
        "calves": 7,
        "hipFlexors": 4,
        "adductors": 0,
        "core": 3,
        "lowerBack": 0,
        "lats": 0,
        "upperBack": 0,
        "traps": 0,
        "shoulders": 0,
        "chest": 0,
        "triceps": 0,
        "biceps": 0,
        "forearms": 0
      },
      "tags": [
        "running"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Otro"
      ],
      "dataQuality": "partial",
      "importNotes": "Recuperado desde histórico de conversación con estructura concreta de bloques/ejercicios; no procede de la frase-resumen del Drive.\nPending original: Ritmo y FC exactos"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-042",
      "date": "2026-05-04",
      "reportedAt": "2026-05-04",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "HYROX paused squat + sled + AMRAP 30",
      "type": "hyrox",
      "subtypes": [
        "strength",
        "engine",
        "lower_body"
      ],
      "durationMinutes": 80,
      "rpe": 8,
      "location": "box",
      "objective": "HYROX del lunes reportado con bloque de fuerza y AMRAP 30 muy concreto.",
      "rawText": "HYROX paused squat + sled + AMRAP 30\nObjective: HYROX del lunes reportado con bloque de fuerza y AMRAP 30 muy concreto.\n\n4 Set — Strength / Prep\n- Paused Back Squat | sets: 4 | reps: 6 | load: 60 kg\n- 2DB Floor Press | sets: 4 | reps: 10 | load: 2 x 25 kg\n- Sled Push | sets: 4 | distance: 15 m | load: 150 kg\n\nAMRAP 30 min — AMRAP 30\n- Run | distance: 400 m/round\n- Burpee Broad Jump | distance: 25 m/round\n- Machine Calories | calories: 25 cal/round\n- Push Up | reps: 25/round\n- Farmer Carry | distance: 50 m/round\n- Machine Calories | calories: 25 cal/round",
      "blocks": [
        {
          "id": "hist-2026-042-block-1",
          "name": "Strength / Prep",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Paused Back Squat",
              "canonicalName": "Back Squat",
              "sets": 4,
              "reps": 6,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 60.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "squat",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "2DB Floor Press",
              "canonicalName": "2db Floor Press",
              "sets": 4,
              "reps": 10,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 50.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "push",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Carga original: 2 x 25 kg"
            },
            {
              "name": "Sled Push",
              "canonicalName": "Sled Push",
              "sets": 4,
              "reps": null,
              "distanceMeters": 15,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 150.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-042-block-2",
          "name": "AMRAP 30",
          "format": "amrap",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 400,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Burpee Broad Jump",
              "canonicalName": "Burpee Broad Jump",
              "sets": null,
              "reps": null,
              "distanceMeters": 25,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Machine Calories",
              "canonicalName": "Machine Calories",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Push Up",
              "canonicalName": "Push Up",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "push",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Reps originales no numéricas: 25/round"
            },
            {
              "name": "Farmer Carry",
              "canonicalName": "Farmer Carry",
              "sets": null,
              "reps": null,
              "distanceMeters": 50,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "carry",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "forearms",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "traps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Machine Calories",
              "canonicalName": "Machine Calories",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 400,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": 3440.0,
        "totalBarbellReps": 24,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 12,
        "impactScore": 28,
        "cardioLoad": 37,
        "strengthLoad": 16,
        "technicalLoad": 15,
        "fatigueCost": 96
      },
      "sessionMuscleSummary": {
        "quadriceps": 81,
        "hamstrings": 29,
        "glutes": 77,
        "calves": 37,
        "hipFlexors": 4,
        "adductors": 0,
        "core": 83,
        "lowerBack": 16,
        "lats": 14,
        "upperBack": 19,
        "traps": 7,
        "shoulders": 52,
        "chest": 46,
        "triceps": 40,
        "biceps": 10,
        "forearms": 18
      },
      "tags": [
        "hyrox",
        "sled",
        "amrap30"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Otro",
        "Carga exacta"
      ],
      "dataQuality": "high",
      "importNotes": "Recuperado desde histórico de conversación con estructura concreta de bloques/ejercicios; no procede de la frase-resumen del Drive.\nPending original: Número de rondas completadas | Carga farmer carry no recuperada"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-043",
      "date": "2026-05-05",
      "reportedAt": "2026-05-05",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "HYROX + BMU progressions",
      "type": "hyrox",
      "subtypes": [
        "engine",
        "gymnastics"
      ],
      "durationMinutes": 75,
      "rpe": 7,
      "location": "box",
      "objective": "Sesión del martes con HYROX por la mañana y progresiones de bar muscle-up.",
      "rawText": "HYROX + BMU progressions\nObjective: Sesión del martes con HYROX por la mañana y progresiones de bar muscle-up.\n\nClass — HYROX\n- HYROX class | notes: Detalle exacto no recuperado; registrada como sesión realizada\n\nTechnique — Gymnastics\n- Bar Muscle Up Progressions | notes: Trabajo de progresiones BMU",
      "blocks": [
        {
          "id": "hist-2026-043-block-1",
          "name": "HYROX",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "HYROX class",
              "canonicalName": "Hyrox Class",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "shoulders",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Detalle exacto no recuperado; registrada como sesión realizada"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-043-block-2",
          "name": "Gymnastics",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Bar Muscle Up Progressions",
              "canonicalName": "Bar Muscle Up",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "biceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": "Trabajo de progresiones BMU"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 20,
        "cardioLoad": 30,
        "strengthLoad": 0,
        "technicalLoad": 15,
        "fatigueCost": 85
      },
      "sessionMuscleSummary": {
        "quadriceps": 0,
        "hamstrings": 0,
        "glutes": 0,
        "calves": 0,
        "hipFlexors": 5,
        "adductors": 0,
        "core": 12,
        "lowerBack": 0,
        "lats": 9,
        "upperBack": 7,
        "traps": 0,
        "shoulders": 3,
        "chest": 0,
        "triceps": 0,
        "biceps": 7,
        "forearms": 6
      },
      "tags": [
        "hyrox",
        "gymnastics",
        "bmu"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Otro"
      ],
      "dataQuality": "partial",
      "importNotes": "Recuperado desde histórico de conversación con estructura concreta de bloques/ejercicios; no procede de la frase-resumen del Drive.\nPending original: Detalle exacto de la clase HYROX | Volumen BMU"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-044",
      "date": "2026-05-06",
      "reportedAt": "2026-05-06",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "Crosstraining gymnastics + KB swing/lunges",
      "type": "crossfit",
      "subtypes": [
        "gymnastics",
        "mixed_modal"
      ],
      "durationMinutes": 70,
      "rpe": 7,
      "location": "box",
      "objective": "Crosstraining de miércoles 7:00 con headstand, HSPU, rope climbs, KB swings, goblet lunges y running/machine.",
      "rawText": "Crosstraining gymnastics + KB swing/lunges\nObjective: Crosstraining de miércoles 7:00 con headstand, HSPU, rope climbs, KB swings, goblet lunges y running/machine.\n\nSkill — Gymnastics / Skill\n- Headstand\n- Strict / Free HSPU\n- Rope Climb\n\nMetcon — Conditioning\n- KB Swing | load: 24 kg\n- Goblet Lunge | load: 24 kg\n- Run / Machine",
      "blocks": [
        {
          "id": "hist-2026-044-block-1",
          "name": "Gymnastics / Skill",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Headstand",
              "canonicalName": "Headstand",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Strict / Free HSPU",
              "canonicalName": "Strict Free Hspu",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Rope Climb",
              "canonicalName": "Rope Climb",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "biceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-044-block-2",
          "name": "Conditioning",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "KB Swing",
              "canonicalName": "Kettlebell Swing",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 24.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "hinge",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "lowerBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Goblet Lunge",
              "canonicalName": "Lunge",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 24.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "lunge",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "adductors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Run / Machine",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 2,
        "impactScore": 20,
        "cardioLoad": 28,
        "strengthLoad": 0,
        "technicalLoad": 15,
        "fatigueCost": 83
      },
      "sessionMuscleSummary": {
        "quadriceps": 14,
        "hamstrings": 18,
        "glutes": 21,
        "calves": 7,
        "hipFlexors": 4,
        "adductors": 5,
        "core": 27,
        "lowerBack": 6,
        "lats": 9,
        "upperBack": 7,
        "traps": 10,
        "shoulders": 16,
        "chest": 0,
        "triceps": 14,
        "biceps": 7,
        "forearms": 6
      },
      "tags": [
        "crossfit",
        "gymnastics",
        "hspu",
        "rope-climb"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Repeticiones exactas",
        "Resultado exacto"
      ],
      "dataQuality": "partial",
      "importNotes": "Recuperado desde histórico de conversación con estructura concreta de bloques/ejercicios; no procede de la frase-resumen del Drive.\nPending original: Series/reps exactas | Resultado"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-028",
      "date": "2026-05-18",
      "reportedAt": "2026-05-18",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "HYROX return RPE6 — farmer carry, wall balls, BBJ",
      "type": "hyrox",
      "subtypes": [
        "engine",
        "technical",
        "mixed_modal"
      ],
      "durationMinutes": 60,
      "rpe": 6,
      "location": "box",
      "objective": "Vuelta a HYROX controlada tras semana con sobrecarga cervical.",
      "rawText": "HYROX return RPE6 — farmer carry, wall balls, BBJ\nObjective: Vuelta a HYROX controlada tras semana con sobrecarga cervical.\n\nFor Time — HYROX For Time\n- Run | distance: 500 m\n- Farmer Carry | distance: 100 m | load: 2 x 28 kg\n- Run | distance: 500 m\n- Med Ball Sit Up | reps: 25 | load: 6 kg\n- Run | distance: 500 m\n- Wall Balls | reps: 50\n- Run | distance: 500 m\n- Burpee Broad Jump | distance: 50 m",
      "blocks": [
        {
          "id": "hist-2026-028-block-1",
          "name": "HYROX For Time",
          "format": "for_time",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Farmer Carry",
              "canonicalName": "Farmer Carry",
              "sets": null,
              "reps": null,
              "distanceMeters": 100,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 56.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "carry",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "forearms",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "traps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": "Carga original: 2 x 28 kg"
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Med Ball Sit Up",
              "canonicalName": "Sit Up",
              "sets": null,
              "reps": 25,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 6.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Wall Balls",
              "canonicalName": "Wall Ball",
              "sets": null,
              "reps": 50,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Burpee Broad Jump",
              "canonicalName": "Burpee Broad Jump",
              "sets": null,
              "reps": null,
              "distanceMeters": 50,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "chest",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 2000,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": 150.0,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 25,
        "hardSetsEstimate": null,
        "impactScore": 60,
        "cardioLoad": 49,
        "strengthLoad": 0,
        "technicalLoad": 18,
        "fatigueCost": 78
      },
      "sessionMuscleSummary": {
        "quadriceps": 40,
        "hamstrings": 26,
        "glutes": 39,
        "calves": 35,
        "hipFlexors": 25,
        "adductors": 0,
        "core": 39,
        "lowerBack": 0,
        "lats": 0,
        "upperBack": 6,
        "traps": 8,
        "shoulders": 12,
        "chest": 5,
        "triceps": 5,
        "biceps": 0,
        "forearms": 9
      },
      "tags": [
        "hyrox",
        "cervical-watch",
        "completed"
      ],
      "soreness": [],
      "injuryNotes": "Sobrecarga cervical/trapecio reciente; ligera sensación de mareo al finalizar.",
      "feeling": null,
      "notes": "El usuario lo realizó a RPE ~6 y terminó con ligera sensación de mareo al mirar hacia arriba. Venía de sobrecarga trapecio/cervical.",
      "pendingFields": [],
      "dataQuality": "high",
      "importNotes": "Fecha corregida: sesión confirmada el 2026-05-18 por check/revisión del usuario; detalle concreto recuperado del chat, no de la frase-resumen del Drive."
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-045",
      "date": "2026-05-19",
      "reportedAt": "2026-05-19",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "HYROX deadlift + sandbag lunge for time",
      "type": "hyrox",
      "subtypes": [
        "strength",
        "engine",
        "for_time"
      ],
      "durationMinutes": 75,
      "rpe": 7,
      "location": "box",
      "objective": "HYROX 7:00 del martes con deadlift, box jumps, plank dinámico y for time de carrera/row/lunges/push press.",
      "rawText": "HYROX deadlift + sandbag lunge for time\nObjective: HYROX 7:00 del martes con deadlift, box jumps, plank dinámico y for time de carrera/row/lunges/push press.\n\n4 Set — 4 Set Strength / Prep\n- Deadlift | sets: 4 | reps: 6 | load: 70-70-70-90 kg\n- Box Jump | sets: 4 | reps: 10 | load: max box height\n- Dynamic Plank | sets: 4 | reps: 10\n\n2 Rounds For Time — For Time\n- Run | sets: 2 | distance: 600 m\n- Row | sets: 2 | distance: 500 m\n- Sandbag Lunge | sets: 2 | distance: 50 m | load: 30 kg\n- 2DB Push Press | sets: 2 | reps: 25 | load: 2 x 15 kg",
      "blocks": [
        {
          "id": "hist-2026-045-block-1",
          "name": "4 Set Strength / Prep",
          "format": "sets",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Deadlift",
              "canonicalName": "Deadlift",
              "sets": 4,
              "reps": 6,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "hinge",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "lowerBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": "Carga original no numérica simple: 70-70-70-90 kg"
            },
            {
              "name": "Box Jump",
              "canonicalName": "Box Jump",
              "sets": 4,
              "reps": 10,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "jump",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Carga original no numérica simple: max box height"
            },
            {
              "name": "Dynamic Plank",
              "canonicalName": "Dynamic Plank",
              "sets": 4,
              "reps": 10,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "core",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "shoulders",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-045-block-2",
          "name": "For Time",
          "format": "for_time",
          "roundsPlanned": 2,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": 2,
              "reps": null,
              "distanceMeters": 600,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            },
            {
              "name": "Row",
              "canonicalName": "RowErg",
              "sets": 2,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Sandbag Lunge",
              "canonicalName": "Sandbag Lunge",
              "sets": 2,
              "reps": null,
              "distanceMeters": 50,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 30.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "lunge",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "adductors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "2DB Push Press",
              "canonicalName": "Push Press",
              "sets": 2,
              "reps": 25,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 30.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": "Carga original: 2 x 15 kg"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 1200,
        "totalBikeMeters": 0,
        "totalRowMeters": 1000,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": 1500.0,
        "totalBarbellReps": 24,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": 16,
        "impactScore": 44,
        "cardioLoad": 53,
        "strengthLoad": 13,
        "technicalLoad": 15,
        "fatigueCost": 88
      },
      "sessionMuscleSummary": {
        "quadriceps": 56,
        "hamstrings": 76,
        "glutes": 90,
        "calves": 42,
        "hipFlexors": 28,
        "adductors": 10,
        "core": 98,
        "lowerBack": 24,
        "lats": 14,
        "upperBack": 14,
        "traps": 10,
        "shoulders": 28,
        "chest": 0,
        "triceps": 14,
        "biceps": 10,
        "forearms": 10
      },
      "tags": [
        "hyrox",
        "deadlift",
        "sandbag",
        "push-press"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": null,
      "pendingFields": [
        "Tiempo exacto"
      ],
      "dataQuality": "high",
      "importNotes": "Recuperado desde histórico de conversación con estructura concreta de bloques/ejercicios; no procede de la frase-resumen del Drive.\nPending original: Tiempo final"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-029",
      "date": "2026-05-21",
      "reportedAt": "2026-05-21",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "5 km Z2 controlled run",
      "type": "running",
      "subtypes": [
        "z2",
        "mixed_modal",
        "running"
      ],
      "durationMinutes": 31,
      "rpe": 4,
      "location": "outdoor",
      "objective": "Rodaje controlado de zona 2 para base aeróbica y gasto bajo en fatiga.",
      "rawText": "5 km Z2 controlled run\nObjective: Rodaje controlado de zona 2 para base aeróbica y gasto bajo en fatiga.\n\nZ2 — Run\n- Run | distance: 5 km | duration: 31 min | notes: 130 ppm media aprox.; ritmo 6:15/km.\nResult: 5 km · 31 min · 6:15/km · 130 ppm",
      "blocks": [
        {
          "id": "hist-2026-029-block-1",
          "name": "Run",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 5000,
              "durationSeconds": 1860,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "low",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "130 ppm media aprox.; ritmo 6:15/km."
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "time",
        "score": "5 km · 31 min · 6:15/km · 130 ppm",
        "timeSeconds": null,
        "capMinutes": null,
        "completedAsPlanned": null,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 5000,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 100,
        "cardioLoad": 74,
        "strengthLoad": 0,
        "technicalLoad": 5,
        "fatigueCost": 57
      },
      "sessionMuscleSummary": {
        "quadriceps": 6,
        "hamstrings": 5,
        "glutes": 5,
        "calves": 7,
        "hipFlexors": 5,
        "adductors": 0,
        "core": 3,
        "lowerBack": 0,
        "lats": 0,
        "upperBack": 0,
        "traps": 0,
        "shoulders": 0,
        "chest": 0,
        "triceps": 0,
        "biceps": 0,
        "forearms": 0
      },
      "tags": [
        "running",
        "z2",
        "google-sheet"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": "Registro procedente de Google Sheet Sistema Físico, pestaña ENTRENAMIENTO.",
      "pendingFields": [],
      "dataQuality": "high",
      "importNotes": "Añadido desde mensajes recientes, memoria de conversación y Google Sheet Sistema Físico. Revisar fechas marcadas como inferred/planned_or_unconfirmed."
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-030",
      "date": "2026-05-22",
      "reportedAt": "2026-05-22",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "CrossFit EMOM + For Time + open box accessories",
      "type": "crossfit",
      "subtypes": [
        "emom",
        "for_time",
        "gymnastics",
        "strength"
      ],
      "durationMinutes": 90,
      "rpe": 8,
      "location": "box",
      "objective": "Sesión de CrossFit con tracción, cleans y accesorios posteriores en open box.",
      "rawText": "CrossFit EMOM + For Time + open box accessories\nObjective: Sesión de CrossFit con tracción, cleans y accesorios posteriores en open box.\n\nEMOM 15 min — EMOM 15\n- Weighted Strict Pull Up | sets: 3 | reps: 4 | load: 12 kg\n- Row | sets: 3 | calories: 20/15 cal\n- Barbell Bent Over Row | sets: 3 | reps: 12 | load: 50 kg\n- Bike | sets: 3 | calories: 16/12 cal\n- 2DB Bench Press | sets: 3 | reps: 12 | load: 25 kg each DB\n\nFor Time — For Time\n- Pull Up | reps: 20\n- Double Under | reps: 50\n- Clean | reps: 20 | load: 40 kg\n- Pull Up | reps: 15\n- Double Under | reps: 50\n- Clean | reps: 15 | load: 50 kg\n- Pull Up | reps: 10\n- Double Under | reps: 50\n- Clean | reps: 10 | load: 60 kg\n\nAccessory — Open Box Accessories\n- Hip Thrust | sets: 4 | reps: 12 | load: 65 kg\n- Band Pull Apart | notes: Accesorio escapular.\n- Calf Raise | notes: Trabajo de gemelo.",
      "blocks": [
        {
          "id": "hist-2026-030-block-1",
          "name": "EMOM 15",
          "format": "emom",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Weighted Strict Pull Up",
              "canonicalName": "Strict Pull Up",
              "sets": 3,
              "reps": 4,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 12.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "biceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Row",
              "canonicalName": "RowErg",
              "sets": 3,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Barbell Bent Over Row",
              "canonicalName": "RowErg",
              "sets": 3,
              "reps": 12,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 50.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Bike",
              "canonicalName": "BikeErg",
              "sets": 3,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "2DB Bench Press",
              "canonicalName": "Bench Press",
              "sets": 3,
              "reps": 12,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 25.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-030-block-2",
          "name": "For Time",
          "format": "for_time",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Pull Up",
              "canonicalName": "Pull Up",
              "sets": null,
              "reps": 20,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "biceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Double Under",
              "canonicalName": "Double Under",
              "sets": null,
              "reps": 50,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Clean",
              "canonicalName": "Clean",
              "sets": null,
              "reps": 20,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 40.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Pull Up",
              "canonicalName": "Pull Up",
              "sets": null,
              "reps": 15,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "biceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Double Under",
              "canonicalName": "Double Under",
              "sets": null,
              "reps": 50,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Clean",
              "canonicalName": "Clean",
              "sets": null,
              "reps": 15,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 50.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Pull Up",
              "canonicalName": "Pull Up",
              "sets": null,
              "reps": 10,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "biceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Double Under",
              "canonicalName": "Double Under",
              "sets": null,
              "reps": 50,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            },
            {
              "name": "Clean",
              "canonicalName": "Clean",
              "sets": null,
              "reps": 10,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 60.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-030-block-3",
          "name": "Open Box Accessories",
          "format": "accessory",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Hip Thrust",
              "canonicalName": "Hip Thrust",
              "sets": 4,
              "reps": 12,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 65.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "hinge",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "lowerBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Band Pull Apart",
              "canonicalName": "Band Pull Apart",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "biceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 50
                }
              ],
              "notes": "Accesorio escapular."
            },
            {
              "name": "Calf Raise",
              "canonicalName": "Calf Raise",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": "Trabajo de gemelo."
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": 8114.0,
        "totalBarbellReps": 81,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 57,
        "hardSetsEstimate": 22,
        "impactScore": 20,
        "cardioLoad": 36,
        "strengthLoad": 50,
        "technicalLoad": 23,
        "fatigueCost": 98
      },
      "sessionMuscleSummary": {
        "quadriceps": 33,
        "hamstrings": 64,
        "glutes": 60,
        "calves": 35,
        "hipFlexors": 0,
        "adductors": 0,
        "core": 82,
        "lowerBack": 38,
        "lats": 85,
        "upperBack": 90,
        "traps": 17,
        "shoulders": 29,
        "chest": 19,
        "triceps": 17,
        "biceps": 64,
        "forearms": 100
      },
      "tags": [
        "crossfit",
        "pullups",
        "cleans",
        "google-sheet"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": "Registro consolidado desde conversación y Google Sheet. La sheet lo marca como doble sesión con bastante tracción y coste de fatiga.",
      "pendingFields": [],
      "dataQuality": "high",
      "importNotes": "Añadido desde mensajes recientes, memoria de conversación y Google Sheet Sistema Físico. Revisar fechas marcadas como inferred/planned_or_unconfirmed.\nSessionMuscleSummary normalizado a escala 0-100 desde puntos históricos."
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-031",
      "date": "2026-05-23",
      "reportedAt": "2026-05-23",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "5 km easy run",
      "type": "running",
      "subtypes": [
        "z2",
        "running"
      ],
      "durationMinutes": 30,
      "rpe": 4,
      "location": "outdoor",
      "objective": "Segundo rodaje suave del bloque viernes-sábado.",
      "rawText": "5 km easy run\nObjective: Segundo rodaje suave del bloque viernes-sábado.\n\nEasy — Run\n- Run | distance: 5 km | duration: ~30 min | notes: Ritmo medio reportado cercano a 4:57/km en mensaje semanal; sheet lo registró como 5 km suave.\nResult: 5 km",
      "blocks": [
        {
          "id": "hist-2026-031-block-1",
          "name": "Run",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": null,
              "reps": null,
              "distanceMeters": 5000,
              "durationSeconds": 1800,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "low",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Ritmo medio reportado cercano a 4:57/km en mensaje semanal; sheet lo registró como 5 km suave."
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "distance",
        "score": "5 km",
        "timeSeconds": null,
        "capMinutes": null,
        "completedAsPlanned": null,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 5000,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 100,
        "cardioLoad": 74,
        "strengthLoad": 0,
        "technicalLoad": 5,
        "fatigueCost": 57
      },
      "sessionMuscleSummary": {
        "quadriceps": 6,
        "hamstrings": 5,
        "glutes": 5,
        "calves": 7,
        "hipFlexors": 5,
        "adductors": 0,
        "core": 3,
        "lowerBack": 0,
        "lats": 0,
        "upperBack": 0,
        "traps": 0,
        "shoulders": 0,
        "chest": 0,
        "triceps": 0,
        "biceps": 0,
        "forearms": 0
      },
      "tags": [
        "running",
        "google-sheet"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": "Dato recuperado de revisión semanal y Google Sheet. Intensidad exacta algo ambigua: reportó buen ritmo 4:57/km pero se registró como suave.",
      "pendingFields": [
        "Otro"
      ],
      "dataQuality": "partial",
      "importNotes": "Añadido desde mensajes recientes, memoria de conversación y Google Sheet Sistema Físico. Revisar fechas marcadas como inferred/planned_or_unconfirmed.\nPending original: Confirmar ritmo final e intensidad real"
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-032",
      "date": "2026-05-24",
      "reportedAt": "2026-05-24",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "Mudanza / obra — functional load",
      "type": "actividad_funcional",
      "subtypes": [
        "full_body",
        "mobility"
      ],
      "durationMinutes": 180,
      "rpe": 6,
      "location": "home",
      "objective": "Actividad no estructurada: mudanza/obra, carga postural y gasto funcional.",
      "rawText": "Mudanza / obra — functional load\nObjective: Actividad no estructurada: mudanza/obra, carga postural y gasto funcional.\n\nManual work — Functional work\n- Mueble/suelo/pintura/carga | duration: ~180 min | notes: Ayuda en obra: suelo, pintura y carga.",
      "blocks": [
        {
          "id": "hist-2026-032-block-1",
          "name": "Functional work",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Mueble/suelo/pintura/carga",
              "canonicalName": "Mueble Suelo Pintura Carga",
              "sets": null,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": 10800,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "lowerBack",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": "Ayuda en obra: suelo, pintura y carga."
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": null,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 0,
        "hardSetsEstimate": null,
        "impactScore": 0,
        "cardioLoad": 72,
        "strengthLoad": 0,
        "technicalLoad": 5,
        "fatigueCost": 100
      },
      "sessionMuscleSummary": {
        "quadriceps": 0,
        "hamstrings": 0,
        "glutes": 5,
        "calves": 0,
        "hipFlexors": 0,
        "adductors": 0,
        "core": 5,
        "lowerBack": 6,
        "lats": 0,
        "upperBack": 0,
        "traps": 5,
        "shoulders": 4,
        "chest": 0,
        "triceps": 0,
        "biceps": 0,
        "forearms": 6
      },
      "tags": [
        "functional-work",
        "google-sheet",
        "recovery-cost"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": null,
      "notes": "Incluido porque la propia sheet lo registró en ENTRENAMIENTO como fatiga funcional que afecta recuperación.",
      "pendingFields": [],
      "dataQuality": "high",
      "importNotes": "Añadido desde mensajes recientes, memoria de conversación y Google Sheet Sistema Físico. Revisar fechas marcadas como inferred/planned_or_unconfirmed."
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-033",
      "date": "2026-05-25",
      "reportedAt": "2026-05-25",
      "dateConfidence": "exact",
      "dateRule": "manual",
      "source": "chatgpt",
      "status": "completed",
      "title": "Strength + technical halterofilia",
      "type": "halterofilia",
      "subtypes": [
        "strength",
        "olympic_lift",
        "technical",
        "weightlifting"
      ],
      "durationMinutes": 120,
      "rpe": 7,
      "location": "box",
      "objective": "Sesión de fuerza y halterofilia técnica: banca, dominadas, snatch y clean & jerk.",
      "rawText": "Strength + technical halterofilia\nObjective: Sesión de fuerza y halterofilia técnica: banca, dominadas, snatch y clean & jerk.\n\nPyramid + Pull Ups — Strength\n- Bench Press | sets: 7 | reps: 12-12-12-10-8-6-4 | load: 30-40-50-60-65-70-75 kg\n- Pull Up | sets: 3 | reps: 9\n\nTechnical complex — Snatch technique\n- Pause 2\" Hang Squat Snatch + 2 Low Squat Snatch | sets: 5 | reps: 1 + 2 | load: 30-30-35-35-40 kg\n\nTechnical drills — Clean & Jerk technique\n- Tall Clean | sets: 3 | reps: 3 | load: 35 kg\n- Tall Jerk | sets: 3 | reps: 3 | load: 35 kg\n- Jerk Balance | sets: 3 | reps: 3 | load: 35 kg\n- Slow Hang Squat Clean + Squat Clean + Jerk Drive + Split Jerk | sets: 3 | reps: 1 + 1 + 1 + 1 | load: 40-50-50 kg",
      "blocks": [
        {
          "id": "hist-2026-033-block-1",
          "name": "Strength",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Bench Press",
              "canonicalName": "Bench Press",
              "sets": 7,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "chest",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Reps originales no numéricas: 12-12-12-10-8-6-4; Carga original no numérica simple: 30-40-50-60-65-70-75 kg"
            },
            {
              "name": "Pull Up",
              "canonicalName": "Pull Up",
              "sets": 3,
              "reps": 9,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "pull",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 90
                },
                {
                  "muscle": "biceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 40
                }
              ],
              "notes": null
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-033-block-2",
          "name": "Snatch technique",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Pause 2\" Hang Squat Snatch + 2 Low Squat Snatch",
              "canonicalName": "Squat Snatch",
              "sets": 5,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 70
                }
              ],
              "notes": "Reps originales no numéricas: 1 + 2; Carga original no numérica simple: 30-30-35-35-40 kg"
            }
          ],
          "blockResult": null,
          "notes": null
        },
        {
          "id": "hist-2026-033-block-3",
          "name": "Clean & Jerk technique",
          "format": "other",
          "roundsPlanned": null,
          "roundsCompleted": null,
          "timeCapMinutes": null,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Tall Clean",
              "canonicalName": "Clean",
              "sets": 3,
              "reps": 3,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 35.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": null
            },
            {
              "name": "Tall Jerk",
              "canonicalName": "Tall Jerk",
              "sets": 3,
              "reps": 3,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 35.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Jerk Balance",
              "canonicalName": "Jerk Balance",
              "sets": 3,
              "reps": 3,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 35.0,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "shoulders",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "triceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                }
              ],
              "notes": null
            },
            {
              "name": "Slow Hang Squat Clean + Squat Clean + Jerk Drive + Split Jerk",
              "canonicalName": "Squat Clean",
              "sets": 3,
              "reps": null,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": true,
              "movementPattern": "mixed",
              "intensity": "moderate",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 60
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Reps originales no numéricas: 1 + 1 + 1 + 1; Carga original no numérica simple: 40-50-50 kg"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": null,
      "sessionMetrics": {
        "totalRunMeters": 0,
        "totalBikeMeters": 0,
        "totalRowMeters": 0,
        "totalSkiMeters": 0,
        "totalCalories": null,
        "totalExternalLoadKg": 945.0,
        "totalBarbellReps": 27,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 0,
        "totalGymnasticsReps": 27,
        "hardSetsEstimate": 12,
        "impactScore": 0,
        "cardioLoad": 48,
        "strengthLoad": 14,
        "technicalLoad": 39,
        "fatigueCost": 98
      },
      "sessionMuscleSummary": {
        "quadriceps": 81,
        "hamstrings": 55,
        "glutes": 84,
        "calves": 0,
        "hipFlexors": 0,
        "adductors": 0,
        "core": 100,
        "lowerBack": 0,
        "lats": 19,
        "upperBack": 62,
        "traps": 55,
        "shoulders": 94,
        "chest": 40,
        "triceps": 65,
        "biceps": 15,
        "forearms": 34
      },
      "tags": [
        "halterofilia",
        "bench",
        "pullups",
        "google-sheet"
      ],
      "soreness": [
        "ligera molestia psoas/cadera izquierda"
      ],
      "injuryNotes": "Vigilar psoas/cadera izquierda.",
      "feeling": "Energía buena; hambre controlada.",
      "notes": "Registro confirmado por el usuario como entrenamiento realizado el día anterior al check del 26/05/2026; fecha real corregida a 2026-05-25.",
      "pendingFields": [],
      "dataQuality": "high",
      "importNotes": "Añadido desde mensajes recientes, memoria de conversación y Google Sheet Sistema Físico. Fecha 2026-05-25 confirmada por el usuario; no inferida.\nSessionMuscleSummary normalizado a escala 0-100 desde puntos históricos."
    }
  },
  {
    "appInputVersion": "1.0",
    "generatedBy": "gpt",
    "generatedAt": "2026-05-26T13:45:00+02:00",
    "trainingSession": {
      "id": "hist-2026-046",
      "date": "2026-05-26",
      "reportedAt": "2026-05-26",
      "dateConfidence": "exact",
      "dateRule": "today_explicit",
      "source": "chatgpt",
      "status": "partial",
      "title": "HYROX pairs workout — run/row/sandbag lunge/ski/KB/bike/sit-up",
      "type": "hyrox",
      "subtypes": [
        "pairs",
        "engine",
        "mixed_modal",
        "lower_body",
        "core"
      ],
      "durationMinutes": 45,
      "rpe": 8,
      "location": "box",
      "objective": "Sesión HYROX por parejas con carrera sincronizada, ergómetros, sandbag lunges, KB swings y sit-ups dentro de cap de 45 minutos.",
      "rawText": "HYROX\nPairs Workout:\n2 RONDAS\n500m run (Synch)\n1000m row\n50m Sandbag Lunge 20kg\n500m run (Synch)\n1000m Ski\n50 Kb Swing 24kg\n500m Run (synch)\n2000m Bike\n50 Sit Up\n\nCap 45'\n\nNos quedamos antes de las KB swing de la segunda ronda",
      "blocks": [
        {
          "id": "hist-2026-046-block-1",
          "name": "Pairs Workout",
          "format": "other",
          "roundsPlanned": 2,
          "roundsCompleted": null,
          "timeCapMinutes": 45,
          "restSeconds": null,
          "exercises": [
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": 2,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Sincronizado; primer run de cada ronda"
            },
            {
              "name": "Row",
              "canonicalName": "RowErg",
              "sets": 2,
              "reps": null,
              "distanceMeters": 1000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": true,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "upperBack",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "quadriceps",
                  "role": "secondary",
                  "load": 30
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Pairs workout; reparto por atleta no especificado"
            },
            {
              "name": "Sandbag Lunge",
              "canonicalName": "Sandbag Lunge",
              "sets": 2,
              "reps": null,
              "distanceMeters": 50,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 20.0,
              "completed": true,
              "synch": false,
              "sharedWork": true,
              "unilateral": true,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 30
                }
              ],
              "notes": "Pairs workout; reparto por atleta no especificado"
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": 2,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Sincronizado; segundo run de cada ronda"
            },
            {
              "name": "SkiErg",
              "canonicalName": "SkiErg",
              "sets": 2,
              "reps": null,
              "distanceMeters": 1000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": true,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "lats",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "upperBack",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "shoulders",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "triceps",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 50
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": "Pairs workout; reparto por atleta no especificado"
            },
            {
              "name": "Kettlebell Swing",
              "canonicalName": "Kettlebell Swing",
              "sets": 2,
              "reps": 50,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": 24.0,
              "completed": true,
              "synch": false,
              "sharedWork": true,
              "unilateral": false,
              "movementPattern": "hinge",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "glutes",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "hamstrings",
                  "role": "primary",
                  "load": 80
                },
                {
                  "muscle": "core",
                  "role": "secondary",
                  "load": 60
                },
                {
                  "muscle": "lowerBack",
                  "role": "stabilizer",
                  "load": 50
                },
                {
                  "muscle": "forearms",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "traps",
                  "role": "secondary",
                  "load": 40
                }
              ],
              "notes": "Pairs workout; no iniciado en segunda ronda según score"
            },
            {
              "name": "Run",
              "canonicalName": "Run",
              "sets": 2,
              "reps": null,
              "distanceMeters": 500,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": false,
              "unilateral": false,
              "movementPattern": "run",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "calves",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 60
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 30
                }
              ],
              "notes": "Sincronizado; tercer run de cada ronda"
            },
            {
              "name": "BikeErg",
              "canonicalName": "BikeErg",
              "sets": 2,
              "reps": null,
              "distanceMeters": 2000,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": true,
              "unilateral": false,
              "movementPattern": "erg",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "quadriceps",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "glutes",
                  "role": "secondary",
                  "load": 50
                },
                {
                  "muscle": "hamstrings",
                  "role": "secondary",
                  "load": 40
                },
                {
                  "muscle": "calves",
                  "role": "secondary",
                  "load": 30
                },
                {
                  "muscle": "core",
                  "role": "stabilizer",
                  "load": 20
                }
              ],
              "notes": "Pairs workout; reparto por atleta no especificado"
            },
            {
              "name": "Sit Up",
              "canonicalName": "Sit Up",
              "sets": 2,
              "reps": 50,
              "distanceMeters": null,
              "durationSeconds": null,
              "calories": null,
              "loadKg": null,
              "completed": true,
              "synch": false,
              "sharedWork": true,
              "unilateral": false,
              "movementPattern": "mixed",
              "intensity": "high",
              "muscleLoad": [
                {
                  "muscle": "core",
                  "role": "primary",
                  "load": 70
                },
                {
                  "muscle": "hipFlexors",
                  "role": "secondary",
                  "load": 50
                }
              ],
              "notes": "Pairs workout; reparto por atleta no especificado"
            }
          ],
          "blockResult": null,
          "notes": null
        }
      ],
      "result": {
        "type": "cap",
        "score": "Antes de KB Swing de la segunda ronda",
        "timeSeconds": null,
        "capMinutes": 45,
        "completedAsPlanned": false,
        "notes": null
      },
      "sessionMetrics": {
        "totalRunMeters": 2500,
        "totalBikeMeters": 2000,
        "totalRowMeters": 2000,
        "totalSkiMeters": 2000,
        "totalCalories": null,
        "totalExternalLoadKg": 2400.0,
        "totalBarbellReps": 0,
        "totalDumbbellReps": 0,
        "totalKettlebellReps": 50,
        "totalGymnasticsReps": 50,
        "hardSetsEstimate": 6,
        "impactScore": 65,
        "cardioLoad": 80,
        "strengthLoad": 45,
        "technicalLoad": 25,
        "fatigueCost": 75
      },
      "sessionMuscleSummary": {
        "quadriceps": 78,
        "hamstrings": 58,
        "glutes": 74,
        "calves": 42,
        "hipFlexors": 29,
        "adductors": 0,
        "core": 63,
        "lowerBack": 20,
        "lats": 39,
        "upperBack": 35,
        "traps": 22,
        "shoulders": 21,
        "chest": 0,
        "triceps": 15,
        "biceps": 0,
        "forearms": 23
      },
      "tags": [
        "hyrox",
        "pairs",
        "run",
        "row",
        "ski",
        "bike",
        "sandbag-lunge",
        "kb-swing",
        "sit-up",
        "engine"
      ],
      "soreness": [],
      "injuryNotes": null,
      "feeling": "No reportado.",
      "notes": "Entrenamiento reportado explícitamente como 'hoy hice HYROX', por tanto fecha exacta 2026-05-26. El volumen prescrito se guarda completo y el resultado especifica el punto alcanzado.",
      "pendingFields": [
        "RPE exacto",
        "Reparto individual",
        "Molestias durante/después"
      ],
      "dataQuality": "partial",
      "importNotes": "Añadido desde mensaje directo de Álvaro. Regla de fecha aplicada: 'hoy hice' = entrenamiento del día actual. RPE numérico estimado en 8 para mantener compatibilidad con Hybrid OS; pendiente de confirmación.\nPending original: RPE exacto confirmado por Álvaro | Reparto por atleta en Row/Ski/Bike/Sandbag Lunge/KB Swing/Sit Up | Molestias durante o después de la sesión"
    }
  }
] satisfies HybridOSAppInput[];

export const realTrainingSessions = hybridOSHistoricalSeedV1.map((entry) => entry.trainingSession);
