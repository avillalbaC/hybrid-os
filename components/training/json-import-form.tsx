"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { isPureRunningSession } from "@/lib/domain/training/session-kind";
import { addShoesToHybridOSJson } from "@/lib/imports/app-input-json";
import { getTopMuscles } from "@/lib/selectors/training";
import { RemoteAppInputImportError, saveRemoteAppInputs, type RemoteAppInputImportErrorDetail } from "@/lib/storage/training-storage";
import { useTrainingSessions } from "@/lib/storage/use-training-sessions";
import { repairJsonText, validateHybridOSImport, type ImportIssue } from "@/lib/validation/hybrid-os-input";
import { formatMuscleName, formatTrainingType } from "@/lib/utils/format";
import type { HybridOSAppInput, TrainingSession } from "@/types/training";

const sampleInput = `{
  "appInputVersion": "1.0",
  "generatedBy": "gpt",
  "generatedAt": "2026-05-26T00:00:00+02:00",
  "trainingSession": {
    "id": "hyrox-2026-05-26-pairs-workout",
    "date": "2026-05-26",
    "reportedAt": "2026-05-26",
    "dateConfidence": "exact",
    "dateRule": "today_explicit",
    "source": "chatgpt",
    "status": "partial",
    "title": "HYROX Pairs Workout",
    "type": "hyrox",
    "subtypes": ["pairs", "engine", "mixed_modal", "lower_body", "core"],
    "durationMinutes": 45,
    "rpe": null,
    "location": "box",
    "objective": "Sesión HYROX por parejas con carrera, ergómetros y trabajo de core.",
    "rawText": "HYROX Pairs Workout: 2 rondas con carrera, row, ski, KB swing, bike y sit-up.",
    "blocks": [],
    "result": { "type": "partial", "score": null },
    "sessionMetrics": {
      "totalRunMeters": 2500,
      "totalBikeMeters": 2000,
      "totalRowMeters": 2000,
      "totalSkiMeters": 2000,
      "totalCalories": null,
      "totalExternalLoadKg": null,
      "totalBarbellReps": 0,
      "totalDumbbellReps": 0,
      "totalKettlebellReps": 50,
      "totalGymnasticsReps": 50,
      "hardSetsEstimate": null,
      "impactScore": 65,
      "cardioLoad": 80,
      "strengthLoad": 45,
      "technicalLoad": 25,
      "fatigueCost": 75
    },
    "sessionMuscleSummary": {
      "quadriceps": 75,
      "hamstrings": 58,
      "glutes": 72,
      "calves": 65,
      "hipFlexors": 45,
      "adductors": 38,
      "core": 70,
      "lowerBack": 35,
      "lats": 45,
      "upperBack": 45,
      "traps": 35,
      "shoulders": 30,
      "chest": 0,
      "triceps": 0,
      "biceps": 15,
      "forearms": 40
    },
    "tags": ["hyrox", "pairs"],
    "soreness": [],
    "injuryNotes": null,
    "feeling": null,
    "notes": null,
    "pendingFields": ["RPE exacto", "Reparto individual"],
    "dataQuality": "partial",
    "importNotes": "Ejemplo mínimo de contrato v1.0."
  }
}`;

const gptParserPrompt = `Quiero que conviertas el entrenamiento que te voy a pegar en un JSON valido para importar en Hybrid OS.

Devuelve SOLO JSON puro. No uses Markdown, no uses bloque de codigo, no expliques nada antes ni despues.

Formato de salida aceptado:
- Un objeto HybridOSAppInput si hay una sola sesion.
- Un array HybridOSAppInput[] si hay varias sesiones.

Contrato raiz:
{
  "appInputVersion": "1.1",
  "generatedBy": "gpt",
  "generatedAt": "ISO string",
  "trainingSession": TrainingSession,
  "bodyCheck": BodyCheck opcional,
  "nutritionCheck": NutritionCheck opcional
}

Reglas criticas:
- Usa numeros sin unidades. Ejemplo: 5000, no "5 km".
- Usa null cuando un valor numerico opcional sea desconocido.
- No inventes datos exactos si no aparecen. Si estimas algo, deja constancia en "pendingFields" o "importNotes".
- Mantén "rawText" con el texto original o un resumen fiel del texto original.
- "sessionMuscleSummary" debe incluir siempre todos los musculos con valores de 0 a 100.
- "sessionMetrics" debe incluir siempre todas sus claves.
- Para running puro (trainingSession.type === "running"), si el usuario indica zapatillas, rellena "trainingSession.equipment.shoes".
- Para running puro sin zapatillas indicadas, no las inventes y añade en "importNotes": "Zapatillas no indicadas; pendiente para seguimiento de volumen por modelo."
- No añadas zapatillas a "pendingFields".
- Para HYROX, CrossFit o mixed con carrera, no exijas zapatillas salvo que el usuario las indique explícitamente.
- "blocks" puede estar vacio solo si no hay detalle suficiente, pero si hay ejercicios debes crear bloques y ejercicios.
- Los ids deben ser estables, en kebab-case, preferiblemente con tipo-fecha-titulo. Ejemplo: "hyrox-2026-05-26-pairs-workout".

Valores permitidos:
dateConfidence: "exact" | "inferred" | "unknown"
dateRule: "today_explicit" | "yesterday_from_check" | "manual" | "inferred"
source: "chatgpt" | "manual" | "import"
status: "completed" | "partial" | "planned" | "cancelled"
type: "crossfit" | "hyrox" | "halterofilia" | "gimnasticos" | "running" | "fuerza" | "movilidad" | "actividad_funcional" | "mixed"
subtypes: "pairs" | "team" | "individual" | "engine" | "mixed_modal" | "strength" | "gymnastics" | "weightlifting" | "olympic_lift" | "running" | "z2" | "intervals" | "for_time" | "amrap" | "emom" | "sets" | "accessory" | "mobility" | "lower_body" | "upper_body" | "core" | "full_body" | "technical"
HYROX va en trainingSession.type. No uses "hyrox" dentro de subtypes.
dataQuality: "high" | "partial" | "low"
result.type: "time" | "rounds_reps" | "load" | "distance" | "calories" | "cap" | "partial" | "none"
block.format: "sets" | "emom" | "amrap" | "for_time" | "intervals" | "hyrox" | "running" | "accessory" | "mobility" | "other"
exercise.movementPattern: "squat" | "hinge" | "lunge" | "push" | "pull" | "carry" | "run" | "jump" | "erg" | "core" | "olympic_lift" | "gymnastics" | "mobility" | "mixed"
exercise.intensity: "low" | "moderate" | "high" | "max" | null
muscleLoad.role: "primary" | "secondary" | "stabilizer"
muscle names: "quadriceps" | "hamstrings" | "glutes" | "calves" | "hipFlexors" | "adductors" | "core" | "lowerBack" | "lats" | "upperBack" | "traps" | "shoulders" | "chest" | "triceps" | "biceps" | "forearms"
pendingFields: "RPE exacto" | "Duración exacta" | "Tiempo exacto" | "Resultado exacto" | "Reparto individual" | "Carga exacta" | "Repeticiones exactas" | "Distancia exacta" | "Molestias durante/después" | "Escalado/variantes" | "Fecha exacta" | "Otro"
nutritionCheck.digestion: "good" | "normal" | "heavy"
nutritionCheck.dayType: "training" | "rest" | "high-carb" | "low-carb"

TrainingSession completo:
{
  "id": "string",
  "date": "YYYY-MM-DD",
  "reportedAt": "YYYY-MM-DD o ISO string",
  "dateConfidence": "exact | inferred | unknown",
  "dateRule": "today_explicit | yesterday_from_check | manual | inferred",
  "source": "chatgpt",
  "status": "completed | partial | planned | cancelled",
  "title": "string",
  "type": "valor permitido",
  "subtypes": ["valores permitidos"],
  "durationMinutes": number | null,
  "rpe": number | null,
  "location": string | null,
  "objective": string | null,
  "rawText": "string",
  "blocks": [
    {
      "id": "string",
      "name": "string",
      "format": "valor permitido",
      "roundsPlanned": number | null,
      "roundsCompleted": number | null,
      "timeCapMinutes": number | null,
      "restSeconds": number | null,
      "exercises": [
        {
          "name": "string",
          "canonicalName": "string",
          "sets": number | null,
          "reps": number | null,
          "distanceMeters": number | null,
          "durationSeconds": number | null,
          "calories": number | null,
          "loadKg": number | null,
          "completed": true,
          "synch": false,
          "sharedWork": false,
          "unilateral": false,
          "movementPattern": "valor permitido",
          "intensity": "low | moderate | high | max | null",
          "muscleLoad": [
            { "muscle": "valor permitido", "role": "primary | secondary | stabilizer", "load": 0 }
          ],
          "notes": string | null
        }
      ],
      "blockResult": string | null,
      "notes": string | null
    }
  ],
  "result": {
    "type": "valor permitido",
    "score": string | null,
    "timeSeconds": number | null,
    "capMinutes": number | null,
    "completedAsPlanned": boolean | null,
    "notes": string | null
  } | null,
  "sessionMetrics": {
    "totalRunMeters": number,
    "totalBikeMeters": number,
    "totalRowMeters": number,
    "totalSkiMeters": number,
    "totalCalories": number | null,
    "totalExternalLoadKg": number | null,
    "totalBarbellReps": number,
    "totalDumbbellReps": number,
    "totalKettlebellReps": number,
    "totalGymnasticsReps": number,
    "hardSetsEstimate": number | null,
    "impactScore": number,
    "cardioLoad": number,
    "strengthLoad": number,
    "technicalLoad": number,
    "fatigueCost": number
  },
  "equipment": {
    "shoes": string | null
  } opcional,
  "sessionMuscleSummary": {
    "quadriceps": number,
    "hamstrings": number,
    "glutes": number,
    "calves": number,
    "hipFlexors": number,
    "adductors": number,
    "core": number,
    "lowerBack": number,
    "lats": number,
    "upperBack": number,
    "traps": number,
    "shoulders": number,
    "chest": number,
    "triceps": number,
    "biceps": number,
    "forearms": number
  },
  "tags": ["string"],
  "soreness": ["string"],
  "injuryNotes": string | null,
  "feeling": string | null,
  "notes": string | null,
  "pendingFields": ["valores permitidos"],
  "dataQuality": "high | partial | low",
  "importNotes": string | null
}

Ahora parsea este entrenamiento:

`;

type ValidationState = {
  status: "idle" | "valid" | "error";
  message: string;
  preview?: HybridOSAppInput[];
  errors: ImportIssue[];
  warnings: ImportIssue[];
  duplicates: string[];
  repairedText?: string;
  autoRepaired?: boolean;
  repairFixes?: string[];
  rawParseError?: string;
};

type IssueSection =
  | "JSON raíz"
  | "Training Session"
  | "Blocks"
  | "Exercises"
  | "Muscle Load"
  | "Body Check"
  | "Nutrition Check"
  | "Supabase / guardado";

type GroupedIssue = {
  key: string;
  section: IssueSection;
  title: string;
  count: number;
  issues: ImportIssue[];
};

type SaveErrorState = {
  message: string;
  details: RemoteAppInputImportErrorDetail[];
};

function issueSection(path: string): IssueSection {
  const normalizedPath = path.replace(/^\d+\./, "").replace(/^\[\d+\]\./, "");

  if (normalizedPath.startsWith("bodyCheck")) return "Body Check";
  if (normalizedPath.startsWith("nutritionCheck")) return "Nutrition Check";
  if (normalizedPath === "json" || normalizedPath === "root" || !normalizedPath.startsWith("trainingSession")) return "JSON raíz";
  if (normalizedPath.includes(".muscleLoad")) return "Muscle Load";
  if (normalizedPath.includes(".exercises")) return "Exercises";
  if (normalizedPath.includes(".blocks")) return "Blocks";
  return "Training Session";
}

function pathPart(path: string, part: string) {
  const match = path.match(new RegExp(`${part}(?:\\.|\\[)(\\d+)\\]?`));
  return match ? Number(match[1]) + 1 : null;
}

function fieldName(path: string) {
  return path.split(".").at(-1)?.replace(/\[\d+\]$/, "") ?? path;
}

function readableLocation(issue: ImportIssue) {
  const blockNumber = pathPart(issue.path, "blocks");
  const exerciseNumber = pathPart(issue.path, "exercises");
  const section = issueSection(issue.path);
  const field = fieldName(issue.path);

  if (section === "Muscle Load" && exerciseNumber) return `Ejercicio ${exerciseNumber} · Muscle Load`;
  if (section === "Exercises" && exerciseNumber) return `Ejercicio ${exerciseNumber}`;
  if (section === "Blocks" && blockNumber) return `Bloque ${blockNumber}`;
  if (section === "Training Session") return field;
  return field;
}

function readableIssueTitle(issue: ImportIssue) {
  const location = readableLocation(issue);
  const field = fieldName(issue.path);

  if (issue.severity === "warning") {
    return `${location}: ${issue.message}`;
  }

  if (issue.allowedValues) {
    return `${location}: valor no válido.`;
  }

  if (issue.message.toLowerCase().includes("obligatorio")) {
    return `${location}: falta el campo obligatorio ${field}.`;
  }

  if (issue.path.includes(".muscleLoad.") && field === "load") {
    return `${location}: la carga debe ser un número entre 0 y 100.`;
  }

  return `${location}: ${issue.message}`;
}

function issueGroupKey(issue: ImportIssue) {
  const section = issueSection(issue.path);
  const field = fieldName(issue.path);

  if (section === "Muscle Load") return `${section}:${field}:${issue.message}`;
  return `${section}:${issue.path}:${issue.message}`;
}

function groupIssues(issues: ImportIssue[]): GroupedIssue[] {
  const groups = new Map<string, GroupedIssue>();

  issues.forEach((issue) => {
    const key = issueGroupKey(issue);
    const section = issueSection(issue.path);
    const existing = groups.get(key);

    if (existing) {
      existing.count += 1;
      existing.issues.push(issue);
      return;
    }

    groups.set(key, {
      key,
      section,
      title: readableIssueTitle(issue),
      count: 1,
      issues: [issue],
    });
  });

  return Array.from(groups.values());
}

function formatValue(value: unknown) {
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  return JSON.stringify(value);
}

function lastPathToken(path: string) {
  const match = path.match(/(?:\.|^)([A-Za-z][A-Za-z0-9]*)(?:\[\d+\])?$/);
  return match?.[1] ?? path.split(".").at(-1) ?? path;
}

function issueSearchTokens(issue: ImportIssue) {
  const tokens = [lastPathToken(issue.path)];

  if (typeof issue.receivedValue === "string") {
    tokens.unshift(`"${issue.receivedValue}"`, issue.receivedValue);
  } else if (typeof issue.receivedValue === "number" || typeof issue.receivedValue === "boolean") {
    tokens.unshift(String(issue.receivedValue));
  } else if (issue.receivedValue === null) {
    tokens.unshift("null");
  }

  return tokens.filter((token) => token.length > 0);
}

function IssueList({ title, issues, onIssueSelect }: { title: string; issues: ImportIssue[]; onIssueSelect: (issue: ImportIssue) => void }) {
  if (issues.length === 0) return null;

  const groupedIssues = groupIssues(issues);
  const sections: IssueSection[] = ["JSON raíz", "Training Session", "Blocks", "Exercises", "Muscle Load", "Body Check", "Nutrition Check"];

  return (
    <div className="mt-4 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-4">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3 space-y-4">
        {sections.map((section) => {
          const sectionIssues = groupedIssues.filter((issue) => issue.section === section);
          if (sectionIssues.length === 0) return null;

          return (
            <section key={section}>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--accent)]">{section}</p>
              <ul className="mt-2 space-y-2 text-sm text-[var(--muted)]">
                {sectionIssues.map((group) => {
                  const firstIssue = group.issues[0];

                  return (
                    <li key={group.key} className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3">
                      <p className="font-semibold text-[var(--foreground)]">
                        <span className="mr-2 font-mono text-[0.7rem] uppercase text-[var(--accent)]">{firstIssue.severity}</span>
                        {group.count > 1 ? `${group.count} errores: ` : null}
                        {group.title}
                      </p>
                      <p className="mt-1 font-mono text-xs text-[var(--accent)]">{firstIssue.path}</p>
                      {firstIssue.receivedValue !== undefined ? (
                        <p className="mt-1">Valor recibido: <span className="font-mono text-[var(--warning)]">{formatValue(firstIssue.receivedValue)}</span></p>
                      ) : null}
                      {firstIssue.allowedValues ? (
                        <p className="mt-1">Valores permitidos: <span className="font-mono">{firstIssue.allowedValues.map((value) => `"${value}"`).join(", ")}</span></p>
                      ) : null}
                      {firstIssue.suggestion ? <p className="mt-1 text-[var(--muted-strong)]">{firstIssue.suggestion}</p> : null}
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onIssueSelect(firstIssue)}
                          className="text-xs font-bold text-[var(--accent)] underline-offset-4 hover:underline focus-visible:underline"
                        >
                          Ir al JSON
                        </button>
                        <details>
                          <summary className="cursor-pointer text-xs font-bold text-[var(--accent)]">Ver detalle técnico</summary>
                          <ul className="mt-2 space-y-1 font-mono text-xs leading-5 text-[#d9f2e9]">
                            {group.issues.map((issue, index) => (
                              <li key={`${issue.path}-${issue.message}-${index}`}>{issue.path}: {issue.message}</li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ValidationStatusPanel({ validation }: { validation: ValidationState }) {
  if (validation.status === "idle") {
    return (
      <div className="mt-4 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
        <Badge>Sin validar</Badge>
        <p className="mt-2 text-sm text-[var(--muted)]">Pega o edita el JSON y pulsa Validar JSON.</p>
      </div>
    );
  }

  if (validation.errors.length > 0) {
    return (
      <div className="mt-4 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-4">
        <Badge tone="warning">Errores críticos</Badge>
        <p className="mt-2 text-sm font-semibold text-[var(--warning)]">Hay errores críticos. La importación está bloqueada.</p>
      </div>
    );
  }

  if (validation.warnings.length > 0) {
    return (
      <div className="mt-4 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-4">
        <Badge tone="warning">JSON válido con warnings</Badge>
        <p className="mt-2 text-sm text-[var(--muted-strong)]">Puedes importar, pero conviene revisar los avisos de calidad.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-md border border-[rgba(56,217,159,0.34)] bg-[rgba(56,217,159,0.08)] p-4">
      <Badge tone="accent">JSON válido</Badge>
      <p className="mt-2 text-sm text-[var(--accent)]">El contrato es válido y no hay warnings.</p>
    </div>
  );
}

function SaveErrorDetails({ error }: { error: SaveErrorState | null }) {
  if (!error) return null;

  return (
    <div className="mt-3 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-4">
      <p className="text-sm font-semibold text-[var(--warning)]">Supabase / guardado</p>
      <p className="mt-2 text-sm text-[var(--muted-strong)]">{error.message}</p>
      {error.details.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
          {error.details.map((detail, index) => (
            <li key={`${detail.id ?? "import"}-${detail.phase ?? "unknown"}-${index}`} className="rounded-md border border-[var(--line)] p-3">
              <p className="font-semibold text-[var(--foreground)]">
                Fase {detail.phase ?? "desconocida"}{detail.id ? ` · ${detail.id}` : ""}: {detail.message ?? "No se pudo completar el guardado."}
              </p>
              {detail.hint ? <p className="mt-1">{detail.hint}</p> : null}
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-bold text-[var(--accent)]">Ver detalle técnico</summary>
                <pre className="mt-2 overflow-auto rounded-md bg-[var(--panel-soft)] p-3 text-xs text-[#d9f2e9]">{JSON.stringify(detail, null, 2)}</pre>
              </details>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function PreviewCard({
  input,
  inputIndex,
  onSaveShoes,
}: {
  input: HybridOSAppInput;
  inputIndex: number;
  onSaveShoes: (inputIndex: number, sessionId: string, shoes: string) => void;
}) {
  const session = input.trainingSession;
  const topMuscles = getTopMuscles([session], 4);
  const exerciseCount = session.blocks.reduce((total, block) => total + block.exercises.length, 0);
  const isPureRunning = isPureRunningSession(session);
  const shoes = session.equipment?.shoes?.trim() ?? "";
  const [isAddingShoes, setIsAddingShoes] = useState(false);
  const [shoeDraft, setShoeDraft] = useState("");

  function saveShoes() {
    const nextShoes = shoeDraft.trim();

    if (!nextShoes) {
      return;
    }

    onSaveShoes(inputIndex, session.id, nextShoes);
    setShoeDraft("");
    setIsAddingShoes(false);
  }

  return (
    <article className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{session.date}</p>
          <h4 className="mt-1 font-black text-[var(--foreground)]">{session.title}</h4>
        </div>
        <Badge tone="accent">{formatTrainingType(session.type)}</Badge>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-md border border-[var(--line)] p-2">
          <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Duración</dt>
          <dd className="mt-1 font-mono font-black">{session.durationMinutes ?? "-"}m</dd>
        </div>
        <div className="rounded-md border border-[var(--line)] p-2">
          <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">RPE</dt>
          <dd className="mt-1 font-mono font-black">{session.rpe ?? "-"}/10</dd>
        </div>
        <div className="rounded-md border border-[var(--line)] p-2">
          <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Bloques</dt>
          <dd className="mt-1 font-mono font-black">{session.blocks.length}</dd>
        </div>
        <div className="rounded-md border border-[var(--line)] p-2">
          <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Ejercicios</dt>
          <dd className="mt-1 font-mono font-black">{exerciseCount}</dd>
        </div>
        <div className="rounded-md border border-[var(--line)] p-2">
          <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Running</dt>
          <dd className="mt-1 font-mono font-black">{session.sessionMetrics.totalRunMeters}m</dd>
        </div>
        <div className="rounded-md border border-[var(--line)] p-2">
          <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Calidad</dt>
          <dd className="mt-1 font-mono font-black">{session.dataQuality}</dd>
        </div>
      </dl>
      {topMuscles.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {topMuscles.map((entry) => (
            <Badge key={entry.muscle}>{formatMuscleName(entry.muscle)} {entry.loadScore}</Badge>
          ))}
        </div>
      ) : null}
      {isPureRunning && shoes ? (
        <p className="mt-3 text-sm text-[var(--muted-strong)]">
          Zapatillas: <span className="font-semibold text-[var(--foreground)]">{shoes}</span>
        </p>
      ) : null}
      {isPureRunning && !shoes ? (
        <div className="mt-3 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-3">
          <p className="text-sm font-semibold text-[var(--warning)]">
            Zapatillas no indicadas. Esta sesión de running no podrá sumar volumen por modelo.
          </p>
          {isAddingShoes ? (
            <form
              className="mt-3 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                saveShoes();
              }}
            >
              <div>
                <label htmlFor={`shoes-${session.id}`} className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Modelo de zapatilla
                </label>
                <input
                  id={`shoes-${session.id}`}
                  type="text"
                  value={shoeDraft}
                  onChange={(event) => setShoeDraft(event.target.value)}
                  placeholder="Puma Deviate Nitro 3"
                  className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--foreground)] transition focus:border-[rgba(56,217,159,0.42)]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={shoeDraft.trim().length === 0}
                  className="rounded-md border border-[rgba(56,217,159,0.34)] bg-[var(--accent)] px-3 py-2 text-sm font-black text-[#06100c] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShoeDraft("");
                    setIsAddingShoes(false);
                  }}
                  className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[rgba(56,217,159,0.34)]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingShoes(true)}
              className="mt-3 rounded-md border border-[rgba(240,196,107,0.34)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--warning)] focus-visible:border-[var(--warning)]"
            >
              Añadir zapatillas
            </button>
          )}
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {session.pendingFields.length > 0 ? <Badge tone="warning">pendingFields {session.pendingFields.length}</Badge> : <Badge>sin pendientes</Badge>}
        {input.bodyCheck ? <Badge>body check incluido</Badge> : null}
        {input.nutritionCheck ? <Badge>nutrition check incluido</Badge> : null}
      </div>
      {session.pendingFields.length > 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">Pendiente: {session.pendingFields.join(", ")}</p>
      ) : null}
    </article>
  );
}

export function JsonImportForm({ seedSessions }: { seedSessions: TrainingSession[] }) {
  const { sessions: existingSessions, pendingSessions, source } = useTrainingSessions(seedSessions);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const [rawJson, setRawJson] = useState(sampleInput);
  const [isSaving, setIsSaving] = useState(false);
  const [copyPromptMessage, setCopyPromptMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<SaveErrorState | null>(null);
  const [validation, setValidation] = useState<ValidationState>({
    status: "idle",
    message: "Pega un HybridOSAppInput v1.0/v1.1 o un array de inputs y valida el JSON.",
    errors: [],
    warnings: [],
    duplicates: [],
  });

  function validateJson(inputOverride?: string) {
    setSaveMessage(null);
    setSaveError(null);
    const textToValidate = inputOverride ?? rawJson;
    const result = validateHybridOSImport(textToValidate);

    if (!result.valid) {
      setValidation({
        status: "error",
        message: "Hay errores críticos. La importación queda bloqueada hasta corregirlos.",
        errors: result.errors,
        warnings: result.warnings,
        duplicates: [],
        repairedText: result.repairedText,
        autoRepaired: result.autoRepaired,
        repairFixes: result.repairFixes,
        rawParseError: result.rawParseError,
      });
      return;
    }

    const existingIds = new Set(existingSessions.map((session) => session.id));
    const duplicates = (result.parsed ?? [])
      .map((input) => input.trainingSession.id)
      .filter((id) => existingIds.has(id));

    setValidation({
      status: "valid",
      message: duplicates.length > 0
        ? "Contrato válido. Una o más sesiones ya existen y se actualizarán al importar."
        : result.warnings.length > 0
          ? "Contrato válido con warnings no bloqueantes. Puedes guardar, pero conviene revisar la calidad de datos."
          : "Contrato válido. Ya puedes guardar la sesión en la base de datos.",
      preview: result.parsed,
      errors: [],
      warnings: result.warnings,
      duplicates,
      repairedText: result.repairedText,
      autoRepaired: result.autoRepaired,
      repairFixes: result.repairFixes,
      rawParseError: result.rawParseError,
    });
  }

  function resetValidationAfterEdit(nextRawJson: string) {
    setRawJson(nextRawJson);
    setSaveMessage(null);
    setSaveError(null);
    setValidation({
      status: "idle",
      message: "El input cambió. Valida de nuevo antes de guardar.",
      errors: [],
      warnings: [],
      duplicates: [],
    });
  }

  function applyRepairedJson() {
    if (!validation.repairedText) {
      return;
    }

    setRawJson(validation.repairedText);
    setSaveMessage("JSON reparado aplicado al input.");
    editorRef.current?.focus();
    validateJson(validation.repairedText);
  }

  function formatJsonInput() {
    setSaveError(null);
    let parsed: unknown;
    let textToFormat = rawJson;

    try {
      parsed = JSON.parse(rawJson) as unknown;
    } catch {
      const repairResult = repairJsonText(rawJson);

      try {
        parsed = JSON.parse(repairResult.repairedText) as unknown;
        textToFormat = repairResult.repairedText;
      } catch {
        setSaveMessage("No se pudo formatear: el JSON no parsea ni se puede reparar automáticamente.");
        return;
      }
    }

    setRawJson(JSON.stringify(parsed, null, 2));
    setSaveMessage(textToFormat === rawJson ? "JSON formateado." : "JSON reparado y formateado. Valida antes de guardar.");
    setValidation({
      status: "idle",
      message: "JSON formateado. Valida de nuevo antes de guardar.",
      errors: [],
      warnings: [],
      duplicates: [],
    });
  }

  function addShoesToInput(inputIndex: number, sessionId: string, shoes: string) {
    try {
      const nextRawJson = addShoesToHybridOSJson(rawJson, inputIndex, sessionId, shoes, validation.repairedText);
      setRawJson(nextRawJson);
      validateJson(nextRawJson);
      setSaveMessage(`Zapatillas añadidas: ${shoes}.`);
    } catch {
      setSaveMessage("No se pudo actualizar el JSON: valida o repara el input antes de añadir zapatillas.");
    }
  }

  async function copyRepairedJson() {
    if (!validation.repairedText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(validation.repairedText);
      setCopyPromptMessage("JSON reparado copiado.");
    } catch {
      setCopyPromptMessage("No se pudo copiar el JSON reparado.");
    }
  }

  function focusIssueInEditor(issue: ImportIssue) {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const tokens = issueSearchTokens(issue);
    const matchIndex = tokens.map((token) => rawJson.indexOf(token)).find((index) => index >= 0) ?? -1;

    editor.focus();

    if (matchIndex < 0) {
      editor.setSelectionRange(0, 0);
      editor.scrollTop = 0;
      return;
    }

    const selectedToken = tokens.find((token) => rawJson.indexOf(token) === matchIndex) ?? tokens[0];
    editor.setSelectionRange(matchIndex, matchIndex + selectedToken.length);

    const textBeforeMatch = rawJson.slice(0, matchIndex);
    const lineNumber = textBeforeMatch.split("\n").length;
    const approximateLineHeight = 24;
    editor.scrollTop = Math.max(0, (lineNumber - 8) * approximateLineHeight);
  }

  async function importBackupFile(file: File | null) {
    if (!file) {
      return;
    }

    const text = await file.text();

    try {
      const parsed = JSON.parse(text) as { sessions?: unknown } | unknown;
      const input =
        typeof parsed === "object" && parsed !== null && "sessions" in parsed && Array.isArray((parsed as { sessions: unknown }).sessions)
          ? (parsed as { sessions: TrainingSession[] }).sessions.map((session) => ({
              appInputVersion: "1.0",
              generatedBy: "gpt",
              generatedAt: new Date().toISOString(),
              trainingSession: session,
            }))
          : parsed;
      setRawJson(JSON.stringify(input, null, 2));
      setSaveMessage("Backup cargado en el formulario. Valida antes de guardar.");
      setSaveError(null);
      setValidation({ status: "idle", message: "Backup cargado. Valida el JSON antes de guardar.", errors: [], warnings: [], duplicates: [] });
    } catch {
      setSaveMessage("No se pudo leer el backup como JSON válido.");
      setSaveError(null);
    }
  }

  async function copyParserPrompt() {
    try {
      await navigator.clipboard.writeText(gptParserPrompt);
      setCopyPromptMessage("Prompt copiado.");
    } catch {
      setCopyPromptMessage("No se pudo copiar el prompt.");
    }
  }

  async function saveValidSessions() {
    if (!validation.preview) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await saveRemoteAppInputs(validation.preview);
      const sessionCount = result.savedSessionIds.length;
      setSaveMessage(
        `${sessionCount} ${sessionCount === 1 ? "sesión guardada" : "sesiones guardadas"} en Supabase. ${result.savedExercises} ejercicios, ${result.savedBodyCheckIds.length} body checks y ${result.savedNutritionCheckIds.length} nutrition checks guardados.`,
      );
    } catch (error) {
      if (error instanceof RemoteAppInputImportError) {
        setSaveMessage(null);
        setSaveError({
          message: error.message,
          details: error.details.length > 0
            ? error.details
            : error.duplicateIds.map((id) => ({ id, phase: "duplicate_check", message: "Esta sesión ya existe." })),
        });
        return;
      }

      setSaveMessage(error instanceof Error ? error.message : "No se pudo guardar en Supabase.");
    } finally {
      setIsSaving(false);
    }
  }

  const duplicateSessions = validation.duplicates
    .map((id) => existingSessions.find((session) => session.id === id))
    .filter((session): session is TrainingSession => Boolean(session));
  const canSave = validation.status === "valid" && !isSaving;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label htmlFor="app-input" className="text-sm font-semibold">
            HybridOSAppInput JSON
          </label>
          <div className="flex flex-col gap-2 sm:items-end">
            <button
              type="button"
              onClick={copyParserPrompt}
              className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[rgba(56,217,159,0.34)] focus-visible:border-[rgba(56,217,159,0.34)]"
            >
              Copy prompt
            </button>
            {copyPromptMessage ? <p className="text-xs font-semibold text-[var(--accent)]">{copyPromptMessage}</p> : null}
          </div>
        </div>
        <div className="mt-3 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-3">
          <label htmlFor="backup-file" className="text-sm font-semibold">
            Importar backup JSON
          </label>
          <input
            id="backup-file"
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              void importBackupFile(event.target.files?.[0] ?? null);
              event.currentTarget.value = "";
            }}
            className="mt-2 block w-full text-sm text-[var(--muted-strong)]"
          />
        </div>
        <textarea
          ref={editorRef}
          id="app-input"
          value={rawJson}
          onChange={(event) => resetValidationAfterEdit(event.target.value)}
          className="mt-3 min-h-[520px] w-full resize-y rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-4 font-mono text-sm leading-6 text-[#d6efe4] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition focus:border-[rgba(56,217,159,0.42)]"
          spellCheck={false}
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">La app valida JSON estructurado. No interpreta texto libre.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => validateJson()}
              className="rounded-md border border-[rgba(56,217,159,0.34)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[#06100c] transition hover:bg-[var(--accent-strong)] focus-visible:bg-[var(--accent-strong)]"
            >
              Validar JSON
            </button>
            <button
              type="button"
              onClick={formatJsonInput}
              className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[rgba(56,217,159,0.34)]"
            >
              Formatear JSON
            </button>
            <button
              type="button"
              onClick={() => {
                setRawJson("");
                setSaveMessage(null);
                setSaveError(null);
                setValidation({ status: "idle", message: "Pega un HybridOSAppInput v1.0/v1.1 o un array de inputs y valida el JSON.", errors: [], warnings: [], duplicates: [] });
              }}
              className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[rgba(56,217,159,0.34)]"
            >
              Limpiar
            </button>
            {validation.status === "valid" ? (
              <button
                type="button"
                onClick={saveValidSessions}
                disabled={!canSave}
                className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[rgba(56,217,159,0.34)] focus-visible:border-[rgba(56,217,159,0.34)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Guardando..." : validation.autoRepaired ? "Importar JSON reparado" : "Guardar en Supabase"}
              </button>
            ) : null}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Previsualización</h3>
          <div className="flex flex-wrap justify-end gap-2">
            <Badge tone={source === "remote" ? "accent" : source === "seed-fallback" ? "warning" : "neutral"}>
              {source === "remote" ? "Duplicados contra Supabase" : source === "seed-fallback" ? "Duplicados contra fallback" : "sincronizando"}
            </Badge>
            {pendingSessions.length > 0 ? <Badge tone="warning">Pendientes locales {pendingSessions.length}</Badge> : null}
            <Badge tone={validation.status === "valid" ? "accent" : validation.status === "error" ? "warning" : "neutral"}>
              {validation.status}
            </Badge>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{validation.message}</p>
        <ValidationStatusPanel validation={validation} />
        {saveMessage ? (
          <p className="mt-3 rounded-md border border-[rgba(56,217,159,0.34)] bg-[rgba(56,217,159,0.08)] p-3 text-sm font-semibold text-[var(--accent)]">
            {saveMessage}
          </p>
        ) : null}
        <SaveErrorDetails error={saveError} />
        {validation.autoRepaired && validation.repairedText ? (
          <div className="mt-4 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--warning)]">JSON reparado automáticamente</p>
            <p className="mt-2 text-sm text-[var(--muted-strong)]">
              Se pudo parsear una versión reparada. Revisa los cambios antes de dejarla como input definitivo.
            </p>
            {validation.repairFixes && validation.repairFixes.length > 0 ? (
              <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
                {validation.repairFixes.map((fix) => (
                  <li key={fix}>{fix}</li>
                ))}
              </ul>
            ) : null}
            <button
              type="button"
              onClick={applyRepairedJson}
              className="mt-3 rounded-md border border-[rgba(240,196,107,0.34)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--warning)] focus-visible:border-[var(--warning)]"
            >
              Aplicar JSON reparado al input
            </button>
            <button
              type="button"
              onClick={copyRepairedJson}
              className="ml-2 mt-3 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[rgba(56,217,159,0.34)] focus-visible:border-[rgba(56,217,159,0.34)]"
            >
              Copiar JSON reparado
            </button>
          </div>
        ) : null}
        <IssueList title="Errores críticos" issues={validation.errors} onIssueSelect={focusIssueInEditor} />
        <IssueList title="Warnings" issues={validation.warnings} onIssueSelect={focusIssueInEditor} />
        {validation.duplicates.length > 0 ? (
          <div className="mt-4 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--warning)]">Esta sesión ya existe.</p>
            <p className="mt-2 text-sm text-[var(--muted-strong)]">Al importar se actualizará la sesión principal con el mismo id y se registrará un nuevo raw import histórico.</p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-strong)]">
              {duplicateSessions.map((session) => (
                <li key={session.id} className="rounded-md border border-[var(--line)] p-3">
                  <p className="font-semibold text-[var(--foreground)]">{session.title}</p>
                  <p className="mt-1">{session.date} · {formatTrainingType(session.type)} · <span className="font-mono">{session.id}</span></p>
                </li>
              ))}
              {validation.duplicates.filter((id) => !duplicateSessions.some((session) => session.id === id)).map((id) => (
                <li key={id} className="rounded-md border border-[var(--line)] p-3">
                  <p className="font-semibold text-[var(--foreground)]">Sesión existente</p>
                  <p className="mt-1 font-mono">{id}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {validation.preview ? (
          <div className="mt-4 space-y-3">
            {validation.preview.map((input, inputIndex) => (
              <div key={input.trainingSession.id} className="space-y-2">
                <PreviewCard input={input} inputIndex={inputIndex} onSaveShoes={addShoesToInput} />
              </div>
            ))}
            <details>
              <summary className="cursor-pointer text-sm font-bold text-[var(--accent)]">Ver JSON completo</summary>
              <pre className="mt-3 max-h-[360px] overflow-auto rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-4 text-xs leading-5 text-[#d9f2e9]">
                {JSON.stringify(validation.preview, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-dashed border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-6 text-sm text-[var(--muted)]">
            La previsualización aparecerá aquí cuando el contrato base sea válido.
          </div>
        )}
      </Card>
    </div>
  );
}
