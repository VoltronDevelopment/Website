export type Source = { id: string; title: string; href: string };
export type Reply = { text: string; sources: Source[]; enquiry: boolean; enquirySummary?: string; model?: string; fallback?: boolean };
export type Turn = { id: string; question: string; reply: Reply };
export const messageLimit = 1500;
// Temporarily disabled at the owner's request. Retain values for easy restoration.
export const chatCapsEnabled = false;
export const dailyReplyLimit = 350;
export const conversationTurnLimit = 24;
export const draftKey = "voltron-vectra-enquiry";
