export type BodyCheck = {
  id: string;
  date: string;
  weightKg: number;
  waistCm: number;
  steps: number;
  sleepHours: number;
  energy: number;
  hunger: number;
  notes?: string;
  pendingFields: string[];
};
