import { trainingSessions as seedTrainingSessions } from "@/lib/mock-data/training";
import { realTrainingSessions } from "@/src/data/seed/realTrainingSessions";

export const trainingSessions =
  realTrainingSessions.length > 0 ? realTrainingSessions : seedTrainingSessions;
