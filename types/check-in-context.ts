import type { BodyCheck } from "@/types/body";
import type { DailyEntry } from "@/types/daily";
import type { GoalBlock, GoalProgressSignal } from "@/types/goals";
import type { NutritionCheck } from "@/types/nutrition";
import type { PlannedSession } from "@/types/planning";
import type { TrainingSession } from "@/types/training";

export type CheckInContextPeriod = {
  label: string;
  startDate: string;
  endDate: string;
};

export type CheckInTrainingSummary = {
  sessionsCount: number;
  totalDurationMinutes: number | null;
  averageRpe: number | null;
  highIntensitySessions: number | null;
  totalRunKm: number | null;
  structuredRunKm: number | null;
  mixedRunKm: number | null;
  strengthSessions: number;
  hyroxSessions: number;
  crossfitSessions: number;
  mobilitySessions: number;
};

export type CheckInMuscleSummary = {
  topMuscles: Array<{
    muscle: string;
    load: number;
    label: string;
  }>;
  watchSignals: string[];
};

export type CheckInDailySummary = {
  dailyEntriesCount: number;
  mobilityDays: number;
  prioritiesTotal: number;
  prioritiesCompleted: number;
  prioritiesDiscarded: number;
  prioritiesPostponed: number;
  openPriorities: number;
};

export type CheckInGoalSummary = {
  title: string | null;
  profile: string | null;
  status: string | null;
  positiveSignals: string[];
  negativeSignals: string[];
  insufficientData: string[];
};

export type CheckInDataQualitySummary = {
  partialSessions: number;
  sessionsWithoutRpe: number;
  sessionsWithoutResult: number;
  sessionsWithoutDuration: number;
  runningWithoutShoes?: number;
  notes: string[];
};

export type CheckInContextData = {
  generatedAt: string;
  period: CheckInContextPeriod;
  goal: CheckInGoalSummary;
  training: CheckInTrainingSummary;
  muscle: CheckInMuscleSummary;
  daily: CheckInDailySummary;
  body?: {
    latestWeightKg?: number | null;
    latestWaistCm?: number | null;
    weightTrendLabel?: string | null;
    waistTrendLabel?: string | null;
  };
  nutrition?: {
    available: boolean;
    notes: string[];
  };
  dataQuality: CheckInDataQualitySummary;
  signals: {
    positive: string[];
    negative: string[];
    insufficient: string[];
  };
};

export type CheckInContextInput = {
  activeGoal?: GoalBlock | null;
  goalProfileLabel?: string | null;
  period?: CheckInContextPeriod;
  generatedAt?: string;
  referenceDate?: Date;
  sessions: TrainingSession[];
  dailyEntries?: DailyEntry[];
  bodyChecks?: BodyCheck[];
  nutritionChecks?: NutritionCheck[];
  plannedSessions?: PlannedSession[];
  positiveSignals?: GoalProgressSignal[];
  negativeSignals?: GoalProgressSignal[];
  insufficientData?: GoalProgressSignal[];
};
