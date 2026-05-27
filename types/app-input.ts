import type { BodyCheck } from "./body";
import type { Goal } from "./goals";
import type { NutritionCheck } from "./nutrition";
import type { HybridOSAppInput, TrainingSession } from "./training";

export type { HybridOSAppInput };

export type AppInput = {
  trainingSession?: TrainingSession;
  bodyCheck?: BodyCheck;
  nutritionCheck?: NutritionCheck;
  goals?: Goal[];
};
