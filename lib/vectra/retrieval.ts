import type { Turn } from "./types";

export type Relationship = { id: string; from: string; to: string; relation: string; status: string };
export type KnowledgeRecord = {
  id: string; title: string; href: string; status: string; body: string; terms: string;
  topicId?: string; section?: string; aliases?: string[]; qualification?: string;
  approval?: string; classification?: string; relationships?: Relationship[];
  siteExcerpt?: string;
};
export type RankedHit = { id: string; score: number };
const stop = new Set("what how does do is are the a an to for and in of it that this with can me my about".split(" "));
const tokens = (text: string) => new Set((text.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) || []).filter(word => !stop.has(word)));
const normalized = (text: string) => text.toLowerCase().replace(/\bindian\b/g, "india").replace(/[^a-z0-9]+/g, " ").trim();

export function selectEvidence(question: string, history: Turn[], records: KnowledgeRecord[], hits: RankedHit[] = []) {
  const approved = records.filter(record => record.approval === "approved" && record.classification === "public_safe");
  const words = tokens(question);
  const followUp = words.size < 5 || /\b(that|this|those|it|they|their)\b/i.test(question);
  const previous = followUp ? tokens(history.at(-1)?.question || "") : new Set<string>();
  const hitScores = new Map(hits.map(hit => [hit.id, hit.score]));
  const query = " " + normalized(question) + " ";
  const ranked = approved.map(record => {
    const body = tokens(record.body + " " + record.title + " " + record.terms);
    let score = hitScores.get(record.id) || 0;
    for (const word of words) if (body.has(word)) score += 2;
    for (const word of previous) if (body.has(word)) score += .5;
    for (const alias of record.aliases || []) {
      if (query.includes(" " + normalized(alias) + " ")) score += 9;
    }
    if (record.section === "Short answer") score += .1;
    return { record, score };
  }).sort((a, b) => b.score - a.score || a.record.id.localeCompare(b.record.id));
  const direct = ranked.filter(item => item.score > .2).slice(0, 5).map(item => item.record);
  if (!direct.length) {
    const identity = approved.find(record => record.id === "voltron");
    if (identity) direct.push(identity);
  }
  const topics = new Set(direct.map(record => record.topicId));
  const edges = direct.flatMap(record => record.relationships || []);
  const related = new Set(edges.flatMap(edge => [edge.from, edge.to]).filter(id => !topics.has(id)));
  const expanded = ranked.filter(item => related.has(item.record.topicId || "") && item.record.section === "Short answer")
    .slice(0, 2).map(item => item.record);
  const chosen: KnowledgeRecord[] = [];
  let characters = 0;
  for (const record of [...direct, ...expanded]) {
    if (chosen.some(item => item.id === record.id)) continue;
    // Qualifications travel with the claim, including when found through an edge.
    const size = record.body.length + (record.qualification?.length || 0);
    if (characters + size > 16000 && chosen.length) continue;
    chosen.push(record);
    characters += size;
  }
  return chosen;
}
