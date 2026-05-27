import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { saveAppInputs } from "@/lib/imports/save-app-input";
import { isTrainingSessionsDatabaseConfigured } from "@/lib/supabase/training-sessions";
import { historicalTrainingAppInputs } from "@/src/data/seed/realTrainingSessions";

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#") || !trimmedLine.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmedLine.split("=");
    const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadLocalEnv();

  if (!isTrainingSessionsDatabaseConfigured()) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const result = await saveAppInputs(historicalTrainingAppInputs, {
    duplicateMode: "skip",
    sourceLabel: "historical-seed-import",
  });

  console.log("Historical seed import report");
  console.log(JSON.stringify(
    {
      totalFound: result.totalFound,
      imported: result.imported,
      skippedDuplicate: result.skippedDuplicate.length,
      skippedInvalidStatusCount: result.skippedInvalidStatus.length,
      errors: result.errors.length,
      importedIds: result.importedIds,
      skippedDuplicateIds: result.skippedDuplicate,
      skippedInvalidStatus: result.skippedInvalidStatus,
      errorDetails: result.errors,
      savedExercises: result.savedExercises,
      savedBodyCheckIds: result.savedBodyCheckIds,
      savedNutritionCheckIds: result.savedNutritionCheckIds,
    },
    null,
    2,
  ));

  if (result.errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
