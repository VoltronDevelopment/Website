export type Source = { id: string; title: string; href: string };
export type Reply = { text: string; sources: Source[]; enquiry: boolean; enquirySummary?: string };
export type Turn = { id: string; question: string; reply: Reply };
export const messageLimit = 1500;
export const conversationTurnLimit = 24;
export const draftKey = "voltron-vectra-enquiry";
