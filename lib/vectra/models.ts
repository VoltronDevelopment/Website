export const modelPreferences = ["auto", "mini", "luna"] as const;
export type ModelPreference = typeof modelPreferences[number];
export function isModelPreference(value: unknown): value is ModelPreference {
  return typeof value === "string" && modelPreferences.includes(value as ModelPreference);
}
export const modelIds = { mini: "gpt-5.4-mini-2026-03-17", luna: "gpt-6-luna" } as const;
export function routeModel(preference: ModelPreference = "auto", question: string, historyLength: number) {
  if (preference !== "auto") return { model: modelIds[preference], reason: "visitor_choice" };
  const complex = question.length > 500 || /\b(compare|trade.?offs?|evaluate|strategy|contradiction|reconcile|constraints?|implementation plan)\b/i.test(question) || historyLength >= 8;
  return { model: complex ? modelIds.mini : modelIds.luna, reason: complex ? "context_and_synthesis" : "everyday_conversation" };
}
