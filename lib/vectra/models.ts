export const modelPreferences = ["auto", "mini", "luna"] as const;
export type ModelPreference = typeof modelPreferences[number];
export function isModelPreference(value: unknown): value is ModelPreference {
  return typeof value === "string" && modelPreferences.includes(value as ModelPreference);
}
export const modelIds = { mini: "gpt-5.4-mini-2026-03-17", luna: "gpt-5.4-2026-03-05" } as const;
export function routeModel(preference: ModelPreference = "auto", question: string, _historyLength: number, contextualSynthesis = false) {
  if (preference !== "auto") return { model: modelIds[preference], reason: "visitor_choice" };
  const extended = /\b(deep analysis|comprehensive evaluation|exhaustive analysis|deep dive)\b/i.test(question) || question.length > 900;
  if (extended) return { model: modelIds.luna, reason: "extended_synthesis" };
  const complex = contextualSynthesis || question.length > 500 || /\b(compare|trade.?offs?|evaluate|strategy|contradiction|reconcile|constraints?|implementation plan)\b/i.test(question);
  return { model: modelIds.mini, reason: complex ? "context_and_synthesis" : "everyday_conversation" };
}

// Keep the historic preference key for existing saved selections and cached clients.
export function modelLabel(id?: string) {
  if (id?.includes("5.4-mini")) return "GPT-5.4 Mini";
  if (id?.includes("5.4")) return "GPT-5.4";
  return id?.includes("luna") ? "GPT-6 Luna" : "the alternate model";
}
