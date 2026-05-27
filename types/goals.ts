export type GoalCategory = "performance" | "body" | "nutrition" | "habit" | "recovery";
export type GoalStatus = "active" | "paused" | "completed";

export type Goal = {
  id: string;
  title: string;
  category: GoalCategory;
  status: GoalStatus;
  progressPercent: number;
  targetDate?: string;
  metric?: string;
};
