export type NutritionDayType = "training" | "rest" | "high-carb" | "low-carb";

export type NutritionCheck = {
  id: string;
  date: string;
  targetCalories: number;
  estimatedCalories: number;
  targetProteinGrams: number;
  estimatedProteinGrams: number;
  waterLiters: number;
  adherencePercent: number;
  digestion: "good" | "normal" | "heavy";
  dayType: NutritionDayType;
  notes?: string;
  pendingFields: string[];
};
