import type { KnowledgeRecord } from "../lib/vectra/retrieval";
export const corpusRoot: URL;
export function parseRecord(text: string): { metadata: Record<string, unknown>; body: string };
export function compileCorpus(): Promise<{
  records: (KnowledgeRecord & { relationships: NonNullable<KnowledgeRecord["relationships"]> })[];
  topics: Record<string, { href: string; siteIds: string[]; status: string }>;
}>;
