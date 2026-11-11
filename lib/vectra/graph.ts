import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import type { Reply, Turn } from "./types";
import { routeModel, type ModelPreference } from "./models";
import { persona } from "./skills";
import { selectEvidence, type KnowledgeRecord } from "./retrieval";
import { searchKnowledge } from "./store";
import { embedTexts } from "./embeddings.mjs";

type Record = KnowledgeRecord;
type Candidate = { model?: string; fallback?: boolean; text?: unknown; sources?: unknown; enquiry?: unknown; enquirySummary?: unknown };
type Answer = (input: { question: string; history: Turn[]; evidence: Record[]; preference?: ModelPreference }) => Promise<Candidate>;

type Retriever = (question: string, history: Turn[], records: Record[]) => Promise<Record[]>;

const revisionRequest = /^(?:rewrite|rephrase|reword|shorten|expand|summari[sz]e)\s+(?:that\b|it\b|(?:your|the)\s+(?:first|second|third|middle|last|previous|preceding|answer|reply|sentence|paragraph|line)\b)/i;
const requestText = (question: string) => question.trim().replace(/^(?:(?:now|please)[, ]+)+/i, "");

export function isConversationEdit(question: string) {
  const request = requestText(question);
  const breakdown = /^(?:separate|break (?:it|that) down into|split (?:it|that) into)\b(?=.*\b(?:observations?|facts?)\b)(?=.*\b(?:inferences?|interpretations?|assumptions?)\b)/i;
  const companyContext = /\b(?:Voltron|VOS|V-MO|Alpha|roadmap|public sources?)\b/i;
  return !companyContext.test(request) && (revisionRequest.test(request) || breakdown.test(request));
}

export function isPlayfulAside(question: string) {
  const text = question.trim();
  if (text.length > 200 || /\b(?:seriously|actually|in practice|define|explain|compare|how does|what is)\b/i.test(text)) return false;
  return /^(?:please )?(?:tell (?:me|us)|give (?:me|us)|make) (?:a |one )?(?:short |tiny |quick |small )?joke\b/i.test(text) ||
    /\b(?:spreadsheet|dashboard|pivot table|cube|conveyor|factory)\b[^.!?]{0,30}\b(?:ate|swallowed|declared itself|demanded a raise|filed for divorce)\b/i.test(text);
}

async function retrieve(question: string, history: Turn[], records: Record[]) {
  if (history.length && isConversationEdit(question)) return [];
  const start = performance.now();
  const contextual = /\b(that|this|those|it|they|their)\b/i.test(question)
    ? `${history.at(-1)?.question || ""}\n${question}` : question;
  let embedding: number[] | undefined;
  let degraded = false;
  try { [embedding] = await embedTexts([contextual]); }
  catch { degraded = true; }
  const hits = await searchKnowledge(contextual, embedding);
  const evidence = selectEvidence(question, history, records, hits);
  console.info("[vera:retrieval]", JSON.stringify({
    durationMs: Math.round(performance.now() - start), sections: evidence.length, degraded,
  }));
  return evidence;
}

const State = Annotation.Root({
  question: Annotation<string>(),
  preference: Annotation<ModelPreference>(),
  history: Annotation<Turn[]>(),
  records: Annotation<Record[]>(),
  evidence: Annotation<Record[]>(),
  candidate: Annotation<Candidate>(),
  reply: Annotation<Reply>(),
});

export function createVectraGraph(answer: Answer, retriever: Retriever = async (question, history, records) => selectEvidence(question, history, records)) {
  return new StateGraph(State)
    .addNode("public_context", async state => ({
      evidence: isPlayfulAside(state.question) ? [] : await retriever(state.question, state.history, state.records),
    }))
    .addNode("conversation_skills", async state => ({
      candidate: await answer({ question: state.question, history: state.history, evidence: state.evidence, preference: state.preference }),
    }))
    .addNode("review_reply", state => {
      const { candidate, evidence } = state;
      if (typeof candidate?.text !== "string" || !candidate.text.trim()) throw new Error("Empty Vectra reply");
      const ids = Array.isArray(candidate.sources) ? candidate.sources : [];
      const sources = evidence.filter(item => ids.includes(item.id))
        .filter((item, index, all) => all.findIndex(other => other.href === item.href) === index).slice(0, 3)
        .map(({ id, title, href }) => ({ id, title, href }));
      const enquiry = candidate.enquiry === true;
      const enquirySummary = enquiry && typeof candidate.enquirySummary === "string"
        ? candidate.enquirySummary.trim().slice(0, 800) : "";
      return { reply: { text: candidate.text.trim().slice(0, 4000), sources, enquiry,
        ...(candidate.model && { model: candidate.model }), ...(candidate.fallback && { fallback: true }),
        ...(enquirySummary && { enquirySummary }),
      } };
    })
    .addEdge(START, "public_context")
    .addEdge("public_context", "conversation_skills")
    .addEdge("conversation_skills", "review_reply")
    .addEdge("review_reply", END)
    .compile();
}

export async function openAIAnswer({ question, history, evidence, preference = "auto" }: Parameters<Answer>[0], englishRetry = false, fallback = false, deadline = Date.now() + 24_000): Promise<Candidate> {
  const start = performance.now();
  const route = routeModel(preference, question, history.length);
  const effectiveModel = fallback ? (route.model.includes("luna") ? "gpt-5.4-mini-2026-03-17" : "gpt-6-luna") : route.model;
  const playful = isPlayfulAside(question);
  const edit = history.length > 0 && isConversationEdit(question);
  const latestReplyEdit = edit && revisionRequest.test(requestText(question)) &&
    /^(?:rewrite|rephrase|reword|shorten)\b/i.test(requestText(question)) &&
    !/\b(?:earlier|initial|first (?:answer|reply|response)|from before|include|add)\b/i.test(question);
  const relevantHistory = latestReplyEdit ? history.slice(-1) : history;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(Math.max(1, deadline - Date.now())),
    body: JSON.stringify({
      model: effectiveModel,
      instructions: persona + (englishRetry ? "\nA prior generation contained non-English script. Write the entire response in English using Latin letters only, preserving the factual qualifications." : ""),
      input: JSON.stringify({
        evidence: evidence.map(({ id, title, status, body, qualification, siteExcerpt }) => ({
          id, title, status, body, qualification, siteExcerpt,
        })),
        relationships: [...new Map(evidence.flatMap(record => record.relationships || [])
          .filter(edge => evidence.some(record => record.topicId === edge.from) && evidence.some(record => record.topicId === edge.to))
          .map(edge => [edge.id, edge])).values()],
        // Each message and reply is bounded; guest sessions expire after one day.
        // Earlier visitor facts can still apply after a long detour.
        history: relevantHistory.map(turn => ({ visitorMessage: turn.question, veraReply: turn.reply.text })),
        ...(playful && { taskScope: "Respond to the absurd premise in one short, playful line. Skip definitions, explanation and follow-up offers." }),
        ...(!playful && edit && {
          taskScope: latestReplyEdit ? "Edit the requested part of the one supplied Vera reply. Return only the edited part."
            : "Work from the conversation and keep the subject of the current exchange.",
        }),
        question,
      }),
      store: false,
      max_output_tokens: 950,
      reasoning: { effort: "low" },
      text: { format: { type: "json_schema", name: "vectra_reply", strict: true, schema: {
        type: "object", additionalProperties: false, required: ["text", "sources", "enquiry", "enquirySummary"],
        properties: {
          text: { type: "string" }, sources: { type: "array", items: { type: "string" } },
          enquiry: { type: "boolean" }, enquirySummary: { type: "string" },
        },
      } } },
    }),
  });
  if (!response.ok && !fallback && (response.status === 429 || response.status >= 500) && deadline - Date.now() > 6000) {
    console.info("[vera:fallback]", JSON.stringify({ model: effectiveModel, status: response.status }));
    return openAIAnswer({ question, history, evidence, preference }, englishRetry, true, deadline);
  }
  if (!response.ok) throw new Error(`Vectra model request failed (${response.status})`);
  const result = await response.json() as { status?: string; output?: { content?: { type: string; text?: string }[] }[] };
  const usage = result as { usage?: { input_tokens?: number; output_tokens?: number } };
  console.info("[vera:model]", JSON.stringify({ durationMs: Math.round(performance.now() - start), model: effectiveModel, route: route.reason, fallback,
    inputTokens: usage.usage?.input_tokens, outputTokens: usage.usage?.output_tokens }));
  const text = result.output?.flatMap(item => item.content ?? []).find(item => item.type === "output_text")?.text;
  if (result.status !== "completed" || !text) throw new Error("Vectra model did not complete");
  const candidate = JSON.parse(text) as Candidate;
  const visible = `${candidate.text || ""} ${candidate.enquirySummary || ""}`;
  if (hasNonLatinLetters(visible)) {
    if (!englishRetry) return openAIAnswer({ question, history, evidence, preference }, true, fallback, deadline);
    throw new Error("Vera English-only response validation failed");
  }
  return { ...candidate, model: effectiveModel, fallback };
}

export function hasNonLatinLetters(text: string): boolean {
  return [...text].some(character => /\p{L}/u.test(character) && !/\p{Script=Latin}/u.test(character));
}

export const vectraGraph = createVectraGraph(openAIAnswer, retrieve);
