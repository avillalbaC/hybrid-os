"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getTopMuscles } from "@/lib/selectors/training";
import { saveRemoteAppInputs } from "@/lib/storage/training-storage";
import { useTrainingSessions } from "@/lib/storage/use-training-sessions";
import { parseHybridOSJsonInput, type ValidationIssue } from "@/lib/validation/hybrid-os-input";
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

type ValidationState = {
  status: "idle" | "valid" | "error";
  message: string;
  preview?: HybridOSAppInput[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  duplicates: string[];
};

function IssueList({ title, issues }: { title: string; issues: ValidationIssue[] }) {
  if (issues.length === 0) return null;

  return (
    <div className="mt-4 rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-4">
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
        {issues.map((issue) => (
          <li key={`${issue.path}-${issue.message}`}>
            <span className="font-mono text-[var(--accent)]">{issue.path}</span>: {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PreviewCard({ session }: { session: TrainingSession }) {
  const topMuscles = getTopMuscles([session], 4);

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
      </dl>
      {topMuscles.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {topMuscles.map((entry) => (
            <Badge key={entry.muscle}>{formatMuscleName(entry.muscle)} {entry.loadScore}</Badge>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function JsonImportForm({ seedSessions }: { seedSessions: TrainingSession[] }) {
  const { sessions: existingSessions, pendingSessions, source } = useTrainingSessions(seedSessions);
  const [rawJson, setRawJson] = useState(sampleInput);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationState>({
    status: "idle",
    message: "Pega un HybridOSAppInput v1.0 o un array de inputs y valida el JSON.",
    errors: [],
    warnings: [],
    duplicates: [],
  });

  function validateJson() {
    setSaveMessage(null);
    const result = parseHybridOSJsonInput(rawJson);

    if (!result.ok) {
      setValidation({
        status: "error",
        message: "Hay errores críticos. La importación queda bloqueada hasta corregirlos.",
        errors: result.errors,
        warnings: result.warnings,
        duplicates: [],
      });
      return;
    }

    const existingIds = new Set(existingSessions.map((session) => session.id));
    const duplicates = (result.value ?? [])
      .map((input) => input.trainingSession.id)
      .filter((id) => existingIds.has(id));

    setValidation({
      status: "valid",
      message: duplicates.length > 0
        ? "Contrato válido, pero hay ids que ya existen. Confirma si quieres sobrescribirlos."
        : "Contrato válido. Ya puedes guardar la sesión en la base de datos.",
      preview: result.value,
      errors: [],
      warnings: result.warnings,
      duplicates,
    });
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
      setValidation({ status: "idle", message: "Backup cargado. Valida el JSON antes de guardar.", errors: [], warnings: [], duplicates: [] });
    } catch {
      setSaveMessage("No se pudo leer el backup como JSON válido.");
    }
  }

  async function saveValidSessions() {
    if (!validation.preview) {
      return;
    }

    setIsSaving(true);

    try {
      const result = await saveRemoteAppInputs(validation.preview);
      const sessionCount = result.savedSessionIds.length;
      setSaveMessage(
        `${sessionCount} ${sessionCount === 1 ? "sesión guardada" : "sesiones guardadas"} en Supabase. ${result.savedExercises} ejercicios, ${result.savedBodyCheckIds.length} body checks y ${result.savedNutritionCheckIds.length} nutrition checks guardados.`,
      );
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "No se pudo guardar en Supabase.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <Card>
        <label htmlFor="app-input" className="text-sm font-semibold">
          HybridOSAppInput JSON
        </label>
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
          id="app-input"
          value={rawJson}
          onChange={(event) => setRawJson(event.target.value)}
          className="mt-3 min-h-[520px] w-full resize-y rounded-md border border-[var(--line)] bg-[var(--panel-soft)] p-4 font-mono text-sm leading-6 text-[#d6efe4] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition focus:border-[rgba(56,217,159,0.42)]"
          spellCheck={false}
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">La app valida JSON estructurado. No interpreta texto libre.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={validateJson}
              className="rounded-md border border-[rgba(56,217,159,0.34)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[#06100c] transition hover:bg-[var(--accent-strong)] focus-visible:bg-[var(--accent-strong)]"
            >
              Validar JSON
            </button>
            <button
              type="button"
              onClick={() => {
                setRawJson("");
                setSaveMessage(null);
                setValidation({ status: "idle", message: "Pega un HybridOSAppInput v1.0 o un array de inputs y valida el JSON.", errors: [], warnings: [], duplicates: [] });
              }}
              className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[rgba(56,217,159,0.34)]"
            >
              Limpiar
            </button>
            {validation.status === "valid" ? (
              <button
                type="button"
                onClick={saveValidSessions}
                disabled={isSaving}
                className="rounded-md border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[rgba(56,217,159,0.34)] focus-visible:border-[rgba(56,217,159,0.34)]"
              >
                {isSaving ? "Guardando..." : "Guardar en Supabase"}
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
        {saveMessage ? (
          <p className="mt-3 rounded-md border border-[rgba(56,217,159,0.34)] bg-[rgba(56,217,159,0.08)] p-3 text-sm font-semibold text-[var(--accent)]">
            {saveMessage}
          </p>
        ) : null}
        <IssueList title="Errores críticos" issues={validation.errors} />
        <IssueList title="Campos pendientes / avisos" issues={validation.warnings} />
        {validation.duplicates.length > 0 ? (
          <div className="mt-4 rounded-md border border-[rgba(240,196,107,0.24)] bg-[var(--warning-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--warning)]">Ids duplicados</p>
            <ul className="mt-2 space-y-1 text-sm text-[var(--muted-strong)]">
              {validation.duplicates.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {validation.preview ? (
          <div className="mt-4 space-y-3">
            {validation.preview.map((input) => (
              <div key={input.trainingSession.id} className="space-y-2">
                <PreviewCard session={input.trainingSession} />
                <div className="flex flex-wrap gap-2">
                  {input.bodyCheck ? <Badge>body check incluido</Badge> : null}
                  {input.nutritionCheck ? <Badge>nutrition check incluido</Badge> : null}
                </div>
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
