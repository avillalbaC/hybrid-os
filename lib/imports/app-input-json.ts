function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function patchInputShoes(input: unknown, sessionId: string, shoes: string) {
  if (!isRecord(input) || !isRecord(input.trainingSession) || input.trainingSession.id !== sessionId) {
    return input;
  }

  const equipment = isRecord(input.trainingSession.equipment) ? input.trainingSession.equipment : {};

  return {
    ...input,
    appInputVersion: "1.1",
    trainingSession: {
      ...input.trainingSession,
      equipment: {
        ...equipment,
        shoes,
      },
    },
  };
}

export function addShoesToHybridOSJson(rawJson: string, inputIndex: number, sessionId: string, shoes: string, repairedText?: string) {
  const sourceJson = repairedText ?? rawJson;
  const parsed = JSON.parse(sourceJson) as unknown;
  const nextInput = Array.isArray(parsed)
    ? parsed.map((input, index) => (index === inputIndex ? patchInputShoes(input, sessionId, shoes) : input))
    : patchInputShoes(parsed, sessionId, shoes);

  return JSON.stringify(nextInput, null, 2);
}
