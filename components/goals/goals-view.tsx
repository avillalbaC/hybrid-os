"use client";

import { useEffect, useMemo, useState } from "react";
import { ActiveGoalSummaryCard } from "@/components/goals/active-goal-summary-card";
import { CheckInContextCard } from "@/components/goals/check-in-context-card";
import { GoalEmptyState } from "@/components/goals/goal-empty-state";
import { GoalPlanningBetaSection } from "@/components/goals/goal-planning-beta-section";
import { GoalProgressOverview } from "@/components/goals/goal-progress-overview";
import { createGoalFormState, GoalProfileSelector, type GoalFormState } from "@/components/goals/goal-profile-selector";
import { GoalSignalList } from "@/components/goals/goal-signal-list";
import { PlannedSessionForm } from "@/components/planning/planned-session-form";
import { WeeklyPlanCard } from "@/components/planning/weekly-plan-card";
import { WeeklyPlanList } from "@/components/planning/weekly-plan-list";
import { WeeklyPlanSummaryCard } from "@/components/planning/weekly-plan-summary-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonBlock, SkeletonText } from "@/components/ui/skeleton";
import { evaluateGoalBlock } from "@/lib/analytics/goal-evaluation";
import { getGoalProgressSummary } from "@/lib/analytics/goal-progress";
import { getPeriodRange } from "@/lib/domain/dashboard/periods";
import { useWeeklyPlanning } from "@/lib/planning/use-weekly-planning";
import { useDashboardData } from "@/lib/storage/use-dashboard-data";
import type { BodyCheck } from "@/types/body";
import type { DailyEntry } from "@/types/daily";
import type { GoalBlock } from "@/types/goals";
import type { NutritionCheck } from "@/types/nutrition";
import type { PlannedSession, PlannedSessionInput, PlannedSessionStatus } from "@/types/planning";
import type { TrainingSession } from "@/types/training";

type GoalsResponse = {
  activeGoal: GoalBlock | null;
  goals: GoalBlock[];
};

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentWeekRange() {
  const range = getPeriodRange("week", new Date());

  if (!range) {
    const today = getLocalDateKey();
    return { start: today, end: today };
  }

  return {
    start: getLocalDateKey(range.start),
    end: getLocalDateKey(range.end),
  };
}

async function readResponseError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: unknown };
    return typeof payload.error === "string" ? payload.error : fallback;
  } catch {
    return fallback;
  }
}

function GoalsSkeleton() {
  return (
    <div className="grid gap-5">
      <Card>
        <SkeletonBlock className="h-5 w-40" />
        <SkeletonBlock className="mt-4 h-8 w-3/4" />
        <div className="mt-4">
          <SkeletonText lines={3} />
        </div>
      </Card>
    </div>
  );
}

export function GoalsView({
  sessions,
  bodyChecks,
  nutritionChecks,
}: {
  sessions: TrainingSession[];
  bodyChecks: BodyCheck[];
  nutritionChecks: NutritionCheck[];
}) {
  const [activeGoal, setActiveGoal] = useState<GoalBlock | null>(null);
  const [goals, setGoals] = useState<GoalBlock[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [isGoalsLoading, setIsGoalsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormState>(() => createGoalFormState(null, getLocalDateKey()));
  const [editingPlannedSession, setEditingPlannedSession] = useState<PlannedSession | null>(null);
  const [isPlanningFormOpen, setIsPlanningFormOpen] = useState(false);
  const [isPlanSaving, setIsPlanSaving] = useState(false);
  const [planningError, setPlanningError] = useState<string | null>(null);
  const weeklyPlanning = useWeeklyPlanning();
  const {
    sessions: dashboardSessions,
    bodyChecks: dashboardBodyChecks,
    nutritionChecks: dashboardNutritionChecks,
    source,
    isLoading,
    isReady,
  } = useDashboardData({
    seedSessions: sessions,
    seedBodyChecks: bodyChecks,
    seedNutritionChecks: nutritionChecks,
  });
  const evaluation = useMemo(
    () => evaluateGoalBlock({ activeGoal, sessions: dashboardSessions, dailyEntries }),
    [activeGoal, dailyEntries, dashboardSessions],
  );
  const progress = useMemo(
    () => getGoalProgressSummary({
      activeGoal,
      sessions: dashboardSessions,
      dailyEntries,
      bodyChecks: dashboardBodyChecks,
      nutritionChecks: dashboardNutritionChecks,
      plannedSessions: weeklyPlanning.plannedSessions,
    }),
    [activeGoal, dailyEntries, dashboardBodyChecks, dashboardNutritionChecks, dashboardSessions, weeklyPlanning.plannedSessions],
  );
  const isMetricsLoading = isLoading || !isReady;

  useEffect(() => {
    let isMounted = true;

    async function loadGoals() {
      setIsGoalsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/goals", { cache: "no-store" });

        if (!response.ok) {
          throw new Error(await readResponseError(response, "No se pudieron cargar los objetivos."));
        }

        const payload = (await response.json()) as GoalsResponse;

        if (!isMounted) {
          return;
        }

        setActiveGoal(payload.activeGoal);
        setGoals(payload.goals);
        setForm(createGoalFormState(payload.activeGoal, getLocalDateKey()));
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los objetivos.");
      } finally {
        if (isMounted) {
          setIsGoalsLoading(false);
        }
      }
    }

    async function loadDailyEntries() {
      const range = getCurrentWeekRange();

      try {
        const response = await fetch(`/api/daily-entry/range?start=${range.start}&end=${range.end}`, { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { entries: DailyEntry[] };

        if (isMounted) {
          setDailyEntries(payload.entries);
        }
      } catch {
        if (isMounted) {
          setDailyEntries([]);
        }
      }
    }

    void loadGoals();
    void loadDailyEntries();

    return () => {
      isMounted = false;
    };
  }, []);

  async function saveActiveGoal() {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/goals/active", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: form.profile,
          title: form.title,
          startDate: form.startDate,
          endDate: form.endDate || null,
          notes: form.notes || null,
          targets: form.targets,
        }),
      });

      if (!response.ok) {
        throw new Error(await readResponseError(response, "No se pudo guardar el objetivo activo."));
      }

      const payload = (await response.json()) as { activeGoal: GoalBlock };
      setActiveGoal(payload.activeGoal);
      setForm(createGoalFormState(payload.activeGoal, getLocalDateKey()));

      const goalsResponse = await fetch("/api/goals", { cache: "no-store" });

      if (goalsResponse.ok) {
        const goalsPayload = (await goalsResponse.json()) as GoalsResponse;
        setGoals(goalsPayload.goals);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el objetivo activo.");
    } finally {
      setIsSaving(false);
    }
  }

  async function savePlannedSession(input: PlannedSessionInput, editingSession?: PlannedSession | null) {
    setIsPlanSaving(true);
    setPlanningError(null);

    try {
      const response = await fetch(editingSession ? `/api/planned-sessions/${editingSession.id}` : "/api/planned-sessions", {
        method: editingSession ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(await readResponseError(response, "No se pudo guardar la sesión planificada."));
      }

      setEditingPlannedSession(null);
      setIsPlanningFormOpen(false);
      await weeklyPlanning.refresh();
    } catch (saveError) {
      setPlanningError(saveError instanceof Error ? saveError.message : "No se pudo guardar la sesión planificada.");
    } finally {
      setIsPlanSaving(false);
    }
  }

  async function updatePlannedSessionStatus(plannedSession: PlannedSession, status: PlannedSessionStatus) {
    setPlanningError(null);

    try {
      const response = await fetch(`/api/planned-sessions/${plannedSession.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(await readResponseError(response, "No se pudo actualizar la sesión planificada."));
      }

      await weeklyPlanning.refresh();
    } catch (saveError) {
      setPlanningError(saveError instanceof Error ? saveError.message : "No se pudo actualizar la sesión planificada.");
    }
  }

  async function deletePlannedSession(plannedSession: PlannedSession) {
    setPlanningError(null);

    try {
      const response = await fetch(`/api/planned-sessions/${plannedSession.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await readResponseError(response, "No se pudo borrar la sesión planificada."));
      }

      await weeklyPlanning.refresh();
    } catch (deleteError) {
      setPlanningError(deleteError instanceof Error ? deleteError.message : "No se pudo borrar la sesión planificada.");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Objetivos"
        title="Objetivos"
        description="Seguimiento del objetivo activo y contexto para el check diario."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <Badge tone={source === "remote" ? "accent" : source === "seed-fallback" ? "warning" : "neutral"}>
          {source === "remote" ? "Datos reales" : source === "seed-fallback" ? "Fallback seed" : "sincronizando"}
        </Badge>
        <Badge>{goals.length} bloques guardados</Badge>
        <Badge>{evaluation.periodLabel}</Badge>
      </div>

      {isGoalsLoading ? (
        <GoalsSkeleton />
      ) : (
        <div className="grid gap-6">
          {!activeGoal ? <GoalEmptyState onCreate={() => setForm(createGoalFormState(null, getLocalDateKey()))} /> : null}

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <ActiveGoalSummaryCard goal={activeGoal} evaluation={evaluation} onEdit={() => setForm(createGoalFormState(activeGoal, getLocalDateKey()))} />
            <Card>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Crear / editar objetivo</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight">Bloque activo</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Ajusta perfil, fechas, notas y targets. Esta configuración da contexto a las señales, pero no decide el entrenamiento del día.
              </p>
              <div className="mt-4">
                <GoalProfileSelector form={form} onChange={setForm} onSubmit={saveActiveGoal} isSaving={isSaving} error={error} />
              </div>
            </Card>
          </section>

          {isMetricsLoading ? <GoalsSkeleton /> : <GoalProgressOverview progress={progress} />}

          <section className="grid gap-5 xl:grid-cols-2">
            <GoalSignalList
              eyebrow="Señales a favor"
              title="Lo que está sumando"
              empty="Sin señales positivas claras con los datos actuales."
              signals={progress.positiveSignals}
            />
            <GoalSignalList
              eyebrow="Señales en contra"
              title="Lo que está restando"
              empty="Sin señales negativas claras con los datos actuales."
              signals={progress.negativeSignals}
            />
          </section>

          <GoalSignalList
            eyebrow="Datos insuficientes"
            title="Qué falta para evaluar mejor"
            empty="No hay huecos relevantes de datos para esta lectura."
            signals={progress.insufficientData}
          />

          <CheckInContextCard context={progress.checkInContext} />

          <GoalPlanningBetaSection
            forceOpen={isPlanningFormOpen || Boolean(editingPlannedSession)}
            plannedCount={weeklyPlanning.plannedSessions.length}
            isLoading={weeklyPlanning.isLoading}
            onCreate={() => setIsPlanningFormOpen(true)}
          >
            <WeeklyPlanCard plannedSessions={weeklyPlanning.plannedSessions} summary={weeklyPlanning.summary} isLoading={weeklyPlanning.isLoading} />

            <Card>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Sesión planificada</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight">{editingPlannedSession ? "Editar planificación" : "Programación manual"}</h3>
                </div>
                {!isPlanningFormOpen && !editingPlannedSession ? (
                  <button
                    type="button"
                    onClick={() => setIsPlanningFormOpen(true)}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--accent-border)] bg-[var(--accent)] px-4 py-2 text-sm font-black text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
                  >
                    Crear sesión
                  </button>
                ) : null}
              </div>
              {weeklyPlanning.error ? (
                <p className="mt-4 rounded-md border border-[rgba(255,110,110,0.28)] bg-[rgba(255,110,110,0.08)] p-3 text-sm font-semibold text-[#ff9b9b]">
                  {weeklyPlanning.error}
                </p>
              ) : null}
              {isPlanningFormOpen || editingPlannedSession ? (
                <div className="mt-4">
                  <PlannedSessionForm
                    defaultDate={getLocalDateKey()}
                    editingSession={editingPlannedSession}
                    goalBlockId={activeGoal?.id ?? null}
                    isSaving={isPlanSaving}
                    error={planningError}
                    onCancel={() => {
                      setEditingPlannedSession(null);
                      setIsPlanningFormOpen(false);
                      setPlanningError(null);
                    }}
                    onSubmit={savePlannedSession}
                  />
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Las sesiones previstas son opcionales y sirven solo para comparar intención semanal con ejecución real.
                </p>
              )}
            </Card>

            <WeeklyPlanList
              weekStart={weeklyPlanning.weekStart}
              plannedSessions={weeklyPlanning.plannedSessions}
              matches={weeklyPlanning.matches}
              isLoading={weeklyPlanning.isLoading}
              onEdit={(plannedSession) => {
                setEditingPlannedSession(plannedSession);
                setIsPlanningFormOpen(true);
              }}
              onStatusChange={updatePlannedSessionStatus}
              onDelete={deletePlannedSession}
            />

            <WeeklyPlanSummaryCard summary={weeklyPlanning.summary} isLoading={weeklyPlanning.isLoading} />
          </GoalPlanningBetaSection>

          <div className="sr-only">
            {dashboardBodyChecks.length} body checks y {dashboardNutritionChecks.length} nutrition checks disponibles para futuras fases.
          </div>
        </div>
      )}
    </>
  );
}
