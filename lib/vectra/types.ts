export type Source = { id: string; title: string; href: string };
export type Reply = { text: string; sources: Source[]; enquiry: boolean; enquirySummary?: string; model?: string; fallback?: boolean; suggestions?: string[] };
export type Turn = { id: string; question: string; reply: Reply };
export type AnswerStyle = "general" | "conceptual";
export type AnswerOptions = { answerStyle?: AnswerStyle; suggestQuestions?: boolean };
export function isAnswerStyle(value: unknown): value is AnswerStyle {
  return value === "general" || value === "conceptual";
}
export const messageLimit = 1500;
// Temporarily disabled at the owner's request. Retain values for easy restoration.
export const chatCapsEnabled = false;
export const dailyReplyLimit = 350;
export const conversationTurnLimit = 24;
export const draftKey = "voltron-vectra-enquiry";
