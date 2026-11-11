import type { Turn } from "./types";

export type Relationship = { id: string; from: string; to: string; relation: string; status: string };
export type KnowledgeRecord = {
  id: string; title: string; href: string; status: string; body: string; terms: string;
  topicId?: string; section?: string; aliases?: string[]; qualification?: string;
  approval?: string; classification?: string; relationships?: Relationship[];
  siteExcerpt?: string; reference?: string; illustrative?: boolean;
};
export type RankedHit = { id: string; score: number };
const stop = new Set("what how does do is are the a an to for and in of it that this with can me my about".split(" "));
const tokens = (text: string) => new Set((text.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) || []).filter(word => !stop.has(word)));
const normalized = (text: string) => text.toLowerCase().replace(/\bindian\b/g, "india").replace(/[^a-z0-9]+/g, " ").trim();

function oneEdit(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length >= b.length) i++;
    if (b.length >= a.length) j++;
  }
  return edits + Number(i < a.length || j < b.length) === 1;
}

/** Resolve only unique public-name spelling candidates; never rewrite the visitor's message. */
export function retrievalQuery(question: string, history: Turn[], records: KnowledgeRecord[]) {
  const safe = records.filter(r => r.approval === "approved" && r.classification === "public_safe");
  const vocabulary = new Set(safe.flatMap(r => [...tokens((r.aliases || []).join(" "))]).filter(w => w.length >= 5));
  const additions = new Set<string>();
  for (const word of tokens(question)) {
    if (word.length < 5 || /\d/.test(word) || vocabulary.has(word)) continue;
    // A visitor-defined term takes precedence over a public spelling guess.
    if (history.some(t => new RegExp(`\\b${word}\\b`, "i").test(t.question))) continue;
    const candidates = [...vocabulary].filter(candidate => oneEdit(word, candidate));
    if (candidates.length === 1) additions.add(candidates[0]);
  }
  let context = "";
  const explicit = safe.some(r => (r.aliases || []).some(a => (` ${normalized(question)} `).includes(` ${normalized(a)} `)));
  if (!explicit && /\b(that|this|those|it|they|their|continue|more)\b/i.test(question)) {
    for (const turn of history.slice(-8).reverse()) {
      const cited = safe.filter(r => turn.reply.sources.some(s => s.id === r.id));
      if (cited.length) { context = cited.map(r => r.title).slice(0, 2).join("; "); break; }
      if (!/^(?:hi|hello|hey|thanks|thank you|ok|okay|bye)[.! ]*$/i.test(turn.question.trim())) {
        context = turn.question; break;
      }
    }
  }
  return [question, ...additions, context].filter(Boolean).join("\n");
}

export function selectEvidence(question: string, history: Turn[], records: KnowledgeRecord[], hits: RankedHit[] = []) {
  const approved = records.filter(record => record.approval === "approved" && record.classification === "public_safe");
  const resolved = retrievalQuery(question, history, approved);
  const words = tokens(resolved);
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
