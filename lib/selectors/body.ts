import type { BodyCheck } from "@/types/body";

export function getLatestBodyCheck(checks: BodyCheck[]) {
  return [...checks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
}
