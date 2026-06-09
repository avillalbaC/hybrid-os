"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { isPureRunningSession } from "@/lib/domain/training/session-kind";
import { addShoesToHybridOSJson } from "@/lib/imports/app-input-json";
import { getTopMuscles } from "@/lib/selectors/training";
import {
  dryRunRemoteAppInputs,
  RemoteAppInputImportError,
  saveRemoteAppInputs,
  type RemoteAppInputDryRunResult,
  type RemoteAppInputImportErrorDetail,
} from "@/lib/storage/training-storage";
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
- No exijas zapatillas salvo que trainingSession.type === "running".
- Para HYROX, CrossFit o mixed con carrera, no exijas zapatillas salvo que el usuario las indique explícitamente.
- Pádel, rutas, caminatas largas y senderismo son actividades secundarias: usa trainingSession.type "actividad_funcional", no "running".
- Pádel debe llevar tags ["padel", "racket-sport", "secondary-activity"].
- Ruta, caminata o senderismo debe llevar tags ["hiking" o "walking", "route", "secondary-activity"] según el caso.
- No registres rutas andando, caminatas o senderismo como running aunque tengan distancia.
- Si una actividad secundaria aporta duración, distancia o intensidad, estima sessionMetrics y sessionMuscleSummary de forma razonable y explica la estimación en importNotes.
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
  normalizationChanges: ImportIssue[];
  duplicates: string[];
  repairedText?: string;
  normalizedText?: string;
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

type ImportSaveStatus = "idle" | "validating" | "ready" | "simulating" | "saving" | "saved" | "error" | "duplicate";

type SaveSuccessState = {
  message: string;
  savedSessionIds: string[];
  savedExercises: number;
  savedBodyChecks: number;
  savedNutritionChecks: number;
};

type DryRunSuccessState = {
  message: string;
  result: RemoteAppInputDryRunResult;
};

type MainFeedbackTone = "neutral" | "success" | "warning" | "danger";

type MainFeedback = {
  tone: MainFeedbackTone;
  indicator: string;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
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

function LoadingSpinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent align-[-2px]"
    />
  );
}

function feedbackToneClasses(tone: MainFeedbackTone) {
  if (tone === "success") {
    return {
      container: "border-[var(--accent-secondary-border)] bg-[var(--accent-secondary-soft)]",
      indicator: "border-[var(--accent-secondary-border)] bg-[var(--accent-secondary-soft)] text-[var(--accent-secondary-text)]",
      text: "text-[var(--accent-secondary-text)]",
    };
  }

  if (tone === "danger") {
    return {
      container: "border-[rgba(255,99,99,0.34)] bg-[rgba(255,99,99,0.08)]",
      indicator: "border-[rgba(255,99,99,0.38)] bg-[rgba(255,99,99,0.12)] text-[#ff9f9f]",
      text: "text-[#ffb4b4]",
    };
  }

  if (tone === "warning") {
    return {
      container: "border-[rgba(240,196,107,0.32)] bg-[var(--warning-soft)]",
      indicator: "border-[rgba(240,196,107,0.38)] bg-[rgba(240,196,107,0.12)] text-[var(--warning)]",
      text: "text-[var(--warning)]",
    };
  }

  return {
    container: "border-[var(--line)] bg-[rgba(244,247,244,0.025)]",
    indicator: "border-[var(--line)] bg-[var(--panel-soft)] text-[var(--muted-strong)]",
    text: "text-[var(--muted-strong)]",
  };
}

function buildMainFeedback(
  validation: ValidationState,
  saveStatus: ImportSaveStatus,
  dryRunSuccess: DryRunSuccessState | null,
  saveSuccess: SaveSuccessState | null,
  saveError: SaveErrorState | null,
): MainFeedback {
  if (saveSuccess) {
    return {
      tone: "success",
      indicator: "OK",
      eyebrow: "Guardado",
      title: "Guardado correctamente en Supabase",
      description: saveSuccess.message,
      action: "Siguiente: revisa el Training Log o importa otra sesión.",
    };
  }

  if (dryRunSuccess && dryRunSuccess.result.duplicates.length > 0) {
    return {
      tone: "warning",
      indicator: "=",
      eyebrow: "Simulación",
      title: "Duplicado detectado",
      description: "La simulación encontró una sesión existente con el mismo id. No se han escrito datos.",
      action: "Siguiente: abre la sesión existente o cambia el id solo si realmente es una sesión distinta.",
    };
  }

  if (dryRunSuccess) {
    return {
      tone: "success",
      indicator: "OK",
      eyebrow: "Simulación",
      title: "Simulación correcta",
      description: dryRunSuccess.message,
      action: "Siguiente: puedes guardar en Supabase cuando quieras hacer la importación real.",
    };
  }

  if (saveStatus === "saving") {
    return {
      tone: "success",
      indicator: "...",
      eyebrow: "Guardando",
      title: "Guardando en Supabase...",
      description: "Estamos guardando la sesión y sus datos asociados. No cierres esta vista todavía.",
      action: "Siguiente: espera a que termine el guardado.",
    };
  }

  if (saveStatus === "simulating") {
    return {
      tone: "neutral",
      indicator: "...",
      eyebrow: "Simulación",
      title: "Simulando guardado",
      description: "Validando en servidor y comprobando duplicados sin escribir datos en Supabase.",
      action: "Siguiente: espera a que termine la simulación.",
    };
  }

  if (saveStatus === "duplicate" || validation.duplicates.length > 0) {
    return {
      tone: "warning",
      indicator: "=",
      eyebrow: "Duplicado detectado",
      title: "Sesión duplicada",
      description: "El JSON es válido, pero una sesión con el mismo id ya existe. No se guardará otro duplicado desde este importador.",
      action: "Siguiente: abre la sesión existente o cambia el id solo si realmente es una sesión distinta.",
    };
  }

  if (saveError) {
    return {
      tone: "danger",
      indicator: "!",
      eyebrow: "Guardado bloqueado",
      title: "Error al guardar",
      description: saveError.message,
      action: "Siguiente: revisa el detalle técnico y vuelve a intentar cuando esté corregido.",
    };
  }

  if (validation.status === "error") {
    return {
      tone: "danger",
      indicator: "!",
      eyebrow: "JSON inválido",
      title: "JSON inválido",
      description: "Hay errores críticos en el contrato. El guardado queda bloqueado hasta corregirlos.",
      action: "Siguiente: corrige los errores críticos y vuelve a validar el JSON.",
    };
  }

  if (validation.status === "valid" && validation.warnings.length > 0) {
    return {
      tone: "warning",
      indicator: "!",
      eyebrow: "JSON válido",
      title: "JSON válido con warnings",
      description: "Los avisos no bloquean el guardado.",
      action: "Siguiente: revisa los warnings si quieres mejorar la calidad de datos, o guarda en Supabase.",
    };
  }

  if (validation.status === "valid") {
    return {
      tone: "success",
      indicator: "OK",
      eyebrow: "JSON válido",
      title: "JSON válido",
      description: "El contrato es válido y no hay warnings.",
      action: "Siguiente: guarda la sesión en Supabase.",
    };
  }

  return {
    tone: "neutral",
    indicator: "?",
    eyebrow: "Sin validar",
    title: "Valida el JSON",
    description: "Pega o edita un HybridOSAppInput y valida el contrato antes de guardar.",
    action: "Siguiente: pulsa Validar JSON.",
  };
}

function MainFeedbackPanel({
  feedback,
  dryRunSuccess,
  saveSuccess,
  duplicateIds,
  duplicateSessions,
  onImportAnother,
  onClear,
}: {
  feedback: MainFeedback;
  dryRunSuccess: DryRunSuccessState | null;
  saveSuccess: SaveSuccessState | null;
  duplicateIds: string[];
  duplicateSessions: TrainingSession[];
  onImportAnother: () => void;
  onClear: () => void;
}) {
  const classes = feedbackToneClasses(feedback.tone);
  const firstDuplicate = duplicateSessions[0];
  const firstDuplicateId = firstDuplicate?.id ?? duplicateIds[0];
  const isLoadingFeedback = feedback.title === "Guardando en Supabase..." || feedback.title === "Simulando guardado";

  return (
    <section className={`mt-4 rounded-md border p-4 ${classes.container}`}>
      <div className="flex gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md border text-xs font-black ${classes.indicator}`}>
          {isLoadingFeedback ? <LoadingSpinner /> : feedback.indicator}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-black uppercase tracking-[0.14em] ${classes.text}`}>{feedback.eyebrow}</p>
          <h4 className="mt-1 text-xl font-black tracking-tight text-[var(--foreground)]">{feedback.title}</h4>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">{feedback.description}</p>
          <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{feedback.action}</p>
        </div>
      </div>

      {saveSuccess ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/training"
            className="rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-3 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] focus-visible:bg-[var(--accent-hover)]"
          >
            Ver en Training Log
          </Link>
          <button
            type="button"
            onClick={onImportAnother}
            className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
          >
            Importar otra sesión
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-3 py-2 text-sm font-bold text-[var(--muted-strong)] transition hover:border-[var(--accent-border)]"
          >
            Limpiar
          </button>
        </div>
      ) : null}

      {dryRunSuccess ? (
        <div className="mt-4 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm text-[var(--muted-strong)]">
          <p className="font-semibold text-[var(--foreground)]">
            {dryRunSuccess.result.wouldImport} {dryRunSuccess.result.wouldImport === 1 ? "sesión se podría guardar" : "sesiones se podrían guardar"}.
          </p>
          <p className="mt-1">Fases simuladas: {dryRunSuccess.result.phases.length > 0 ? dryRunSuccess.result.phases.join(", ") : "ninguna"}.</p>
        </div>
      ) : null}

      {!saveSuccess && firstDuplicateId ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/training/${firstDuplicateId}`}
            className="rounded-md border border-[rgba(240,196,107,0.34)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--warning)] focus-visible:border-[var(--warning)]"
          >
            Ver sesión existente
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function IssueList({
  title,
  description,
  issues,
  tone = "neutral",
  onIssueSelect,
}: {
  title: string;
  description: string;
  issues: ImportIssue[];
  tone?: MainFeedbackTone;
  onIssueSelect: (issue: ImportIssue) => void;
}) {
  if (issues.length === 0) return null;

  const groupedIssues = groupIssues(issues);
  const sections: IssueSection[] = ["JSON raíz", "Training Session", "Blocks", "Exercises", "Muscle Load", "Body Check", "Nutrition Check"];
  const classes = feedbackToneClasses(tone);

  return (
    <div className={`mt-4 rounded-md border p-4 ${classes.container}`}>
      <p className={`text-sm font-black ${classes.text}`}>{title}</p>
      <p className="mt-1 text-sm text-[var(--muted-strong)]">{description}</p>
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
                        <span className={`mr-2 font-mono text-[0.7rem] uppercase ${classes.text}`}>{firstIssue.severity}</span>
                        {group.count > 1 ? `${group.count} ${firstIssue.severity === "warning" ? "avisos" : "errores"}: ` : null}
                        {group.title}
                      </p>
                      {firstIssue.receivedValue !== undefined ? (
                        <p className="mt-1">Valor recibido: <span className="font-mono text-[var(--warning)]">{formatValue(firstIssue.receivedValue)}</span></p>
                      ) : null}
                      {firstIssue.normalizedValue !== undefined ? (
                        <p className="mt-1">
                          Normalizado a: <span className="font-mono text-[var(--accent)]">{formatValue(firstIssue.normalizedValue)}</span>
                        </p>
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
                          <ul className="mt-2 space-y-1 font-mono text-xs leading-5 text-[var(--code-text)]">
                            {group.issues.map((issue, index) => (
                              <li key={`${issue.path}-${issue.message}-${index}`}>
                                {issue.path}: {issue.message}
                                {issue.receivedValue !== undefined ? ` · recibido ${formatValue(issue.receivedValue)}` : ""}
                                {issue.normalizedValue !== undefined ? ` · normalizado ${formatValue(issue.normalizedValue)}` : ""}
                              </li>
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

function SaveErrorDetails({ error }: { error: SaveErrorState | null }) {
  if (!error) return null;

  return (
    <div className="mt-4 rounded-md border border-[rgba(255,99,99,0.34)] bg-[rgba(255,99,99,0.08)] p-4">
      <p className="text-sm font-black text-[#ffb4b4]">Errores críticos</p>
      <p className="mt-1 text-sm text-[var(--muted-strong)]">El guardado en Supabase no se completó.</p>
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
                <pre className="mt-2 overflow-auto rounded-md bg-[var(--panel-soft)] p-3 text-xs text-[var(--code-text)]">{JSON.stringify(detail, null, 2)}</pre>
              </details>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function TechnicalDetails({ validation, saveError }: { validation: ValidationState; saveError: SaveErrorState | null }) {
  const hasValidationDetail = Boolean(
    validation.rawParseError ||
    validation.repairFixes?.length ||
    validation.normalizationChanges.length ||
    validation.errors.length ||
    validation.warnings.length,
  );
  const hasSaveDetail = Boolean(saveError);

  if (!hasValidationDetail && !hasSaveDetail) return null;

  return (
    <details className="mt-4 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-4">
      <summary className="cursor-pointer text-sm font-black text-[var(--accent)]">Detalle técnico</summary>
      <div className="mt-3 space-y-3 text-sm text-[var(--muted)]">
        {validation.rawParseError ? (
          <div>
            <p className="font-semibold text-[var(--foreground)]">Error original</p>
            <pre className="mt-2 overflow-auto rounded-md bg-[var(--panel-soft)] p-3 text-xs leading-5 text-[var(--code-text)]">{validation.rawParseError}</pre>
          </div>
        ) : null}
        {validation.repairFixes && validation.repairFixes.length > 0 ? (
          <div>
            <p className="font-semibold text-[var(--foreground)]">Reparaciones automáticas</p>
            <ul className="mt-2 space-y-1 font-mono text-xs leading-5 text-[var(--code-text)]">
              {validation.repairFixes.map((fix) => (
                <li key={fix}>{fix}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {validation.errors.length > 0 || validation.normalizationChanges.length > 0 || validation.warnings.length > 0 ? (
          <div>
            <p className="font-semibold text-[var(--foreground)]">Paths internos</p>
            <ul className="mt-2 space-y-1 font-mono text-xs leading-5 text-[var(--code-text)]">
              {[...validation.errors, ...validation.normalizationChanges, ...validation.warnings].map((issue, index) => (
                <li key={`${issue.path}-${index}`}>{issue.path}: {issue.message}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {saveError ? (
          <div>
            <p className="font-semibold text-[var(--foreground)]">Supabase / guardado</p>
            <pre className="mt-2 overflow-auto rounded-md bg-[var(--panel-soft)] p-3 text-xs leading-5 text-[var(--code-text)]">
              {JSON.stringify(saveError.details.length > 0 ? saveError.details : { message: saveError.message }, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    </details>
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
                  className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--foreground)] transition focus:border-[var(--accent-border-strong)]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={shoeDraft.trim().length === 0}
                  className="rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-3 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShoeDraft("");
                    setIsAddingShoes(false);
                  }}
                  className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
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
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<ImportSaveStatus>("idle");
  const [copyPromptMessage, setCopyPromptMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [dryRunSuccess, setDryRunSuccess] = useState<DryRunSuccessState | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<SaveSuccessState | null>(null);
  const [saveError, setSaveError] = useState<SaveErrorState | null>(null);
  const [validation, setValidation] = useState<ValidationState>({
    status: "idle",
    message: "Pega un HybridOSAppInput v1.0/v1.1 o un array de inputs y valida el JSON.",
    errors: [],
    warnings: [],
    normalizationChanges: [],
    duplicates: [],
  });

  function validateJson(inputOverride?: string) {
    setSaveStatus("validating");
    setSaveMessage(null);
    setDryRunSuccess(null);
    setSaveSuccess(null);
    setSaveError(null);
    const textToValidate = inputOverride ?? rawJson;
    const result = validateHybridOSImport(textToValidate);

    if (!result.valid) {
      setSaveStatus("error");
      setValidation({
        status: "error",
        message: "Hay errores críticos. La importación queda bloqueada hasta corregirlos.",
        errors: result.errors,
        warnings: result.warnings,
        normalizationChanges: result.normalizationChanges,
        duplicates: [],
        repairedText: result.repairedText,
        normalizedText: result.normalizedText,
        autoRepaired: result.autoRepaired,
        repairFixes: result.repairFixes,
        rawParseError: result.rawParseError,
      });
      return;
    }

    const existingIds = new Set(
      existingSessions
        .filter((session) => (session as { dataSource?: string }).dataSource !== "seed")
        .map((session) => session.id),
    );
    const duplicates = (result.parsed ?? [])
      .map((input) => input.trainingSession.id)
      .filter((id) => existingIds.has(id));

    setSaveStatus(duplicates.length > 0 ? "duplicate" : "ready");
    setValidation({
      status: "valid",
      message: duplicates.length > 0
        ? "Contrato válido. Una o más sesiones ya existen; no se guardará un duplicado desde este flujo."
        : result.warnings.length > 0
          ? "Contrato válido con warnings no bloqueantes. Puedes guardar, pero conviene revisar la calidad de datos."
          : "Contrato válido. Ya puedes guardar la sesión en la base de datos.",
      preview: result.parsed,
      errors: [],
      warnings: result.warnings,
      normalizationChanges: result.normalizationChanges,
      duplicates,
      repairedText: result.repairedText,
      normalizedText: result.normalizedText,
      autoRepaired: result.autoRepaired,
      repairFixes: result.repairFixes,
      rawParseError: result.rawParseError,
    });
  }

  function resetValidationAfterEdit(nextRawJson: string) {
    setRawJson(nextRawJson);
    setSaveStatus("idle");
    setSaveMessage(null);
    setDryRunSuccess(null);
    setSaveSuccess(null);
    setSaveError(null);
    setValidation({
      status: "idle",
      message: "El input cambió. Valida de nuevo antes de guardar.",
      errors: [],
      warnings: [],
      normalizationChanges: [],
      duplicates: [],
    });
  }

  function applyRepairedJson() {
    const cleanJson = validation.normalizedText ?? validation.repairedText;

    if (!cleanJson) {
      return;
    }

    setRawJson(cleanJson);
    setSaveMessage(validation.normalizedText ? "JSON normalizado aplicado al input." : "JSON reparado aplicado al input.");
    editorRef.current?.focus();
    validateJson(cleanJson);
  }

  function formatJsonInput() {
    setSaveStatus("idle");
    setDryRunSuccess(null);
    setSaveSuccess(null);
    setSaveError(null);
    const result = validateHybridOSImport(rawJson);
    const cleanJson = result.normalizedText ?? result.repairedText;
    let textToFormat = cleanJson ?? rawJson;

    if (!cleanJson) {
      try {
        JSON.parse(rawJson) as unknown;
      } catch {
        const repairResult = repairJsonText(rawJson);

        try {
          JSON.parse(repairResult.repairedText) as unknown;
          textToFormat = repairResult.repairedText;
        } catch {
          setSaveMessage("No se pudo formatear: el JSON no se puede interpretar. Revisa comillas, llaves y comas.");
          return;
        }
      }
    }

    try {
      setRawJson(JSON.stringify(JSON.parse(textToFormat) as unknown, null, 2));
    } catch {
      setSaveMessage("No se pudo formatear: el JSON no se puede interpretar. Revisa comillas, llaves y comas.");
      return;
    }

    setSaveMessage(cleanJson ? "JSON reparado/normalizado y formateado. Valida antes de guardar." : "JSON formateado.");
    setValidation({
      status: "idle",
      message: "JSON formateado. Valida de nuevo antes de guardar.",
      errors: [],
      warnings: [],
      normalizationChanges: [],
      duplicates: [],
    });
  }

  function addShoesToInput(inputIndex: number, sessionId: string, shoes: string) {
    try {
      const nextRawJson = addShoesToHybridOSJson(rawJson, inputIndex, sessionId, shoes, validation.normalizedText ?? validation.repairedText);
      setRawJson(nextRawJson);
      validateJson(nextRawJson);
      setSaveMessage(`Zapatillas añadidas: ${shoes}.`);
    } catch {
      setSaveMessage("No se pudo actualizar el JSON: valida o repara el input antes de añadir zapatillas.");
    }
  }

  async function copyRepairedJson() {
    const cleanJson = validation.normalizedText ?? validation.repairedText;

    if (!cleanJson) {
      return;
    }

    try {
      await navigator.clipboard.writeText(cleanJson);
      setCopyPromptMessage(validation.normalizedText ? "JSON normalizado copiado." : "JSON reparado copiado.");
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
      setSaveStatus("idle");
      setSaveMessage("Backup cargado en el formulario. Valida antes de guardar.");
      setDryRunSuccess(null);
      setSaveSuccess(null);
      setSaveError(null);
      setValidation({ status: "idle", message: "Backup cargado. Valida el JSON antes de guardar.", errors: [], warnings: [], normalizationChanges: [], duplicates: [] });
    } catch {
      setSaveMessage("No se pudo leer el backup como JSON válido.");
      setSaveStatus("error");
      setDryRunSuccess(null);
      setSaveSuccess(null);
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
    if (!validation.preview || isSaving || isDryRunning || saveStatus === "saved") {
      return;
    }

    setSaveStatus("saving");
    setIsSaving(true);
    setDryRunSuccess(null);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const result = await saveRemoteAppInputs(validation.preview);
      const sessionCount = result.savedSessionIds.length;
      setSaveMessage(null);
      setSaveStatus("saved");
      setSaveSuccess({
        message: `${sessionCount} ${sessionCount === 1 ? "sesión guardada" : "sesiones guardadas"} en Supabase. ${result.savedExercises} ejercicios, ${result.savedBodyCheckIds.length} body checks y ${result.savedNutritionCheckIds.length} nutrition checks guardados.`,
        savedSessionIds: result.savedSessionIds,
        savedExercises: result.savedExercises,
        savedBodyChecks: result.savedBodyCheckIds.length,
        savedNutritionChecks: result.savedNutritionCheckIds.length,
      });
    } catch (error) {
      if (error instanceof RemoteAppInputImportError) {
        setSaveMessage(null);
        setSaveStatus(error.duplicateIds.length > 0 ? "duplicate" : "error");
        if (error.duplicateIds.length > 0) {
          setValidation((current) => ({
            ...current,
            duplicates: Array.from(new Set([...current.duplicates, ...error.duplicateIds])),
          }));
        }
        setSaveSuccess(null);
        setSaveError(error.duplicateIds.length > 0
          ? null
          : {
              message: error.message,
              details: error.details,
            });
        return;
      }

      setSaveMessage(null);
      setSaveStatus("error");
      setSaveSuccess(null);
      setSaveError({
        message: error instanceof Error ? error.message : "No se pudo guardar en Supabase.",
        details: [],
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function dryRunValidSessions() {
    if (!validation.preview || isSaving || isDryRunning) {
      return;
    }

    setSaveStatus("simulating");
    setIsDryRunning(true);
    setSaveMessage(null);
    setDryRunSuccess(null);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const result = await dryRunRemoteAppInputs(validation.preview);
      const duplicates = result.duplicates ?? [];

      if (duplicates.length > 0) {
        setSaveStatus("duplicate");
      } else {
        setSaveStatus("ready");
      }
      setValidation((current) => ({
        ...current,
        duplicates,
      }));

      setDryRunSuccess({
        message: "Esta sesión se podría guardar. No se han escrito datos.",
        result,
      });
    } catch (error) {
      if (error instanceof RemoteAppInputImportError) {
        setSaveStatus(error.duplicateIds.length > 0 ? "duplicate" : "error");
        if (error.duplicateIds.length > 0) {
          setValidation((current) => ({
            ...current,
            duplicates: Array.from(new Set([...current.duplicates, ...error.duplicateIds])),
          }));
        }
        setSaveError({
          message: error.message,
          details: error.details.length > 0
            ? error.details
            : error.duplicateIds.map((id) => ({ id, phase: "duplicate_check", message: "Esta sesión ya existe." })),
        });
        return;
      }

      setSaveStatus("error");
      setSaveError({
        message: error instanceof Error ? error.message : "No se pudo simular el guardado.",
        details: [],
      });
    } finally {
      setIsDryRunning(false);
    }
  }

  function clearImportForm(message = "Pega un HybridOSAppInput v1.0/v1.1 o un array de inputs y valida el JSON.") {
    setRawJson("");
    setSaveStatus("idle");
    setSaveMessage(null);
    setDryRunSuccess(null);
    setSaveSuccess(null);
    setSaveError(null);
    setValidation({ status: "idle", message, errors: [], warnings: [], normalizationChanges: [], duplicates: [] });
  }

  function importAnotherSession() {
    clearImportForm("Listo para importar otra sesión. Pega el JSON y valida antes de guardar.");
    requestAnimationFrame(() => editorRef.current?.focus());
  }

  const duplicateSessions = validation.duplicates
    .map((id) => existingSessions.find((session) => session.id === id))
    .filter((session): session is TrainingSession => Boolean(session));
  const canDryRun = validation.status === "valid" && !isSaving && !isDryRunning;
  const canSave = validation.status === "valid" && validation.duplicates.length === 0 && !isSaving && !isDryRunning && saveStatus !== "saved";
  const mainFeedback = buildMainFeedback(validation, saveStatus, dryRunSuccess, saveSuccess, saveError);
  const saveButtonCopy = validation.duplicates.length > 0
    ? "Duplicado detectado"
    : isSaving
      ? "Guardando..."
      : validation.autoRepaired
        ? "Importar JSON reparado"
        : "Guardar en Supabase";
  const dryRunButtonCopy = isDryRunning ? "Simulando..." : "Simular guardado";
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
              className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)] focus-visible:border-[var(--accent-border)]"
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
          className="mt-3 min-h-[520px] w-full resize-y rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-4 font-mono text-sm leading-6 text-[var(--accent-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition focus:border-[var(--accent-border-strong)]"
          spellCheck={false}
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">La app valida JSON estructurado. No interpreta texto libre.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => validateJson()}
              className="rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] focus-visible:bg-[var(--accent-hover)]"
            >
              Validar JSON
            </button>
            <button
              type="button"
              onClick={formatJsonInput}
              className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
            >
              Formatear JSON
            </button>
            <button
              type="button"
              onClick={() => {
                clearImportForm();
              }}
              className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)]"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={dryRunValidSessions}
              disabled={!canDryRun}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)] focus-visible:border-[var(--accent-border)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDryRunning ? <LoadingSpinner /> : null}
              {dryRunButtonCopy}
            </button>
            <button
              type="button"
              onClick={saveValidSessions}
              disabled={!canSave}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)] focus-visible:border-[var(--accent-border)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? <LoadingSpinner /> : null}
              {saveButtonCopy}
            </button>
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
            <Badge tone={saveStatus === "ready" || saveStatus === "saved" ? "accent" : saveStatus === "error" || saveStatus === "duplicate" ? "warning" : "neutral"}>
              {saveStatus}
            </Badge>
          </div>
        </div>
        <MainFeedbackPanel
          feedback={mainFeedback}
          dryRunSuccess={dryRunSuccess}
          saveSuccess={saveSuccess}
          duplicateIds={validation.duplicates}
          duplicateSessions={duplicateSessions}
          onImportAnother={importAnotherSession}
          onClear={() => clearImportForm()}
        />
        {saveMessage ? (
          <p className="mt-3 rounded-md border border-[var(--line)] bg-[rgba(244,247,244,0.025)] p-3 text-sm font-semibold text-[var(--muted-strong)]">
            {saveMessage}
          </p>
        ) : null}
        <SaveErrorDetails error={saveError} />
        {(validation.autoRepaired && validation.repairedText) || validation.normalizedText ? (
          <div className="mt-4 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--warning)]">
              {validation.normalizedText ? "JSON normalizado automáticamente" : "JSON reparado automáticamente"}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-strong)]">
              {validation.normalizedText
                ? "Se aplicaron normalizaciones seguras. Revisa los cambios antes de dejar esta versión como input definitivo."
                : "Se pudo parsear una versión reparada. Revisa los cambios antes de dejarla como input definitivo."}
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
              {validation.normalizedText ? "Aplicar JSON normalizado al input" : "Aplicar JSON reparado al input"}
            </button>
            <button
              type="button"
              onClick={copyRepairedJson}
              className="ml-2 mt-3 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--accent-border)] focus-visible:border-[var(--accent-border)]"
            >
              {validation.normalizedText ? "Copiar JSON normalizado" : "Copiar JSON reparado"}
            </button>
          </div>
        ) : null}
        <IssueList
          title="Errores críticos"
          description="Bloquean la importación. Corrígelos y valida de nuevo antes de guardar."
          issues={validation.errors}
          tone="danger"
          onIssueSelect={focusIssueInEditor}
        />
        <IssueList
          title="Normalizaciones aplicadas"
          description="Cambios seguros aplicados antes de la validación y el guardado. No bloquean, pero conviene revisarlos."
          issues={validation.normalizationChanges}
          tone="warning"
          onIssueSelect={focusIssueInEditor}
        />
        <IssueList
          title="Warnings no bloqueantes"
          description="DataQuality parcial, importNotes, zapatillas no indicadas y campos opcionales faltantes. Puedes guardar aunque haya avisos."
          issues={validation.warnings}
          tone="warning"
          onIssueSelect={focusIssueInEditor}
        />
        {validation.duplicates.length > 0 ? (
          <div className="mt-4 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-4">
            <p className="text-sm font-black text-[var(--warning)]">Duplicados</p>
            <p className="mt-2 text-sm text-[var(--muted-strong)]">La sesión ya existe. El botón Guardar en Supabase queda deshabilitado para no crear ni reemplazar duplicados desde este flujo.</p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-strong)]">
              {duplicateSessions.map((session) => (
                <li key={session.id} className="rounded-md border border-[var(--line)] p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{session.title}</p>
                      <p className="mt-1">{session.date} · {formatTrainingType(session.type)} · <span className="font-mono">{session.id}</span></p>
                    </div>
                    <Link href={`/training/${session.id}`} className="text-sm font-bold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
                      Ver sesión existente
                    </Link>
                  </div>
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
        <TechnicalDetails validation={validation} saveError={saveError} />
        {validation.preview ? (
          <div className="mt-4 space-y-3">
            {validation.preview.map((input, inputIndex) => (
              <div key={input.trainingSession.id} className="space-y-2">
                <PreviewCard input={input} inputIndex={inputIndex} onSaveShoes={addShoesToInput} />
              </div>
            ))}
            <details>
              <summary className="cursor-pointer text-sm font-bold text-[var(--accent)]">Ver JSON completo</summary>
              <pre className="mt-3 max-h-[360px] overflow-auto rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-4 text-xs leading-5 text-[var(--code-text)]">
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
