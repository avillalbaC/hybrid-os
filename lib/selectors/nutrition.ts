import type { NutritionCheck } from "@/types/nutrition";

export function getLatestNutritionCheck(checks: NutritionCheck[]) {
  return [...checks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
}
