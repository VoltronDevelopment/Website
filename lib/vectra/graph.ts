import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import type { AnswerOptions, Reply, Turn } from "./types";
import { modelIds, routeModel, type ModelPreference } from "./models";
import { veraDataPolicy } from "./data-policy";
import { persona } from "./skills";
import { conversationPlan, inquiryContext, mayOfferEnquiry } from "./conversation";
import { retrievalQuery, selectEvidence, type KnowledgeRecord } from "./retrieval";
import { searchKnowledge } from "./store";
import { embedTexts } from "./embeddings.mjs";

type Record = KnowledgeRecord;
type Candidate = { model?: string; fallback?: boolean; text?: unknown; sources?: unknown; enquiry?: unknown; enquirySummary?: unknown; suggestions?: unknown };
type Answer = (input: { question: string; history: Turn[]; evidence: Record[]; preference?: ModelPreference; options?: AnswerOptions; experiment?: { model: "gpt-5.4-2026-03-05" | "gpt-5.4-mini-2026-03-17"; effort: "low" | "medium" } }) => Promise<Candidate>;

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

export function isSocialTurn(question: string) {
  return /^(?:(?:hi|hello|hey)(?:[ ,]+vera)?[.! ]*|(?:thanks|thank you|bye|goodbye)[.! ]*|(?:hi[ ,]+vera[.! ]*)?(?:in one sentence[, :]*)?(?:who are you|what is your name)[?!. ]*)$/i.test(question.trim());
}

async function retrieve(question: string, history: Turn[], records: Record[]) {
  if (history.length && isConversationEdit(question)) return [];
  const start = performance.now();
  const contextual = retrievalQuery(question, history, records);
  let embedding: number[] | undefined;
  let degraded = false;
  const embeddingStart = performance.now();
  try { [embedding] = await embedTexts([contextual]); }
  catch { degraded = true; }
  const embeddingMs = performance.now() - embeddingStart;
  const searchStart = performance.now();
  const hits = await searchKnowledge(contextual, embedding);
  const evidence = selectEvidence(question, history, records, hits);
  console.info("[vera:retrieval]", JSON.stringify({
    durationMs: Math.round(performance.now() - start), embeddingMs: Math.round(embeddingMs), searchMs: Math.round(performance.now() - searchStart), sections: evidence.length, degraded,
  }));
  return evidence;
}

const State = Annotation.Root({
  question: Annotation<string>(),
  preference: Annotation<ModelPreference>(),
  options: Annotation<AnswerOptions | undefined>(),
  history: Annotation<Turn[]>(),
  records: Annotation<Record[]>(),
  evidence: Annotation<Record[]>(),
  candidate: Annotation<Candidate>(),
  reply: Annotation<Reply>(),
});

export function createVectraGraph(answer: Answer, retriever: Retriever = async (question, history, records) => selectEvidence(question, history, records)) {
  return new StateGraph(State)
    .addNode("public_context", async state => ({
      evidence: (isPlayfulAside(state.question) || isSocialTurn(state.question)) ? [] : await retriever(state.question, state.history, state.records),
    }))
    .addNode("conversation_skills", async state => ({
      candidate: await answer({ question: state.question, history: state.history, evidence: state.evidence, preference: state.preference, options: state.options }),
    }))
    .addNode("review_reply", state => {
      const { candidate, evidence } = state;
      const answerText = typeof candidate?.text === "string"
        ? candidate.text.replace(/\s+Sources:\s*vl-[a-z0-9-]+(?:\s*,\s*vl-[a-z0-9-]+)*\.?\s*$/i, "")
          .replace(/[【\[]vl-[a-z0-9-]+[】\]]/gi, "")
          .replace(/\((?:vl-[a-z0-9-]+(?:\s*,\s*)?)+\)/gi, "")
          .replace(/<\/?voltron\s+sources?>/gi, "")
          .replace(Array.isArray(candidate.sources) && candidate.sources.length ? /\[\d{1,2}\]/g : /$^/, "").trim()
        : "";
      if (answerText.length > conversationPlan(state.question, state.history).maxCharacters) throw new Error("Vera reply exceeded its complete-answer budget");
      if (!answerText) throw new Error("Empty Vectra reply");
      const ids = Array.isArray(candidate.sources) ? candidate.sources : [];
      const sources = evidence.filter(item => !item.illustrative && ids.includes(item.id))
        .map(({ id, title, href, section, reference }) => ({ id, title: reference ? section || title : title.split(" — ")[0], href: reference || href }))
        .filter((item, index, all) => all.findIndex(other => other.href === item.href) === index).slice(0, 3);
      const enquiry = candidate.enquiry === true && mayOfferEnquiry(state.question, state.history);
      const suggestions = state.options?.suggestQuestions && !enquiry && !isSocialTurn(state.question) &&
        !isPlayfulAside(state.question) && !isConversationEdit(state.question)
        ? cleanSuggestions(candidate.suggestions, state.question) : [];
      const enquirySummary = enquiry && typeof candidate.enquirySummary === "string"
        ? candidate.enquirySummary.trim().slice(0, 800) : "";
      return { reply: { text: answerText, sources, enquiry,
        ...(candidate.model && { model: candidate.model }), ...(candidate.fallback && { fallback: true }),
        ...(enquirySummary && { enquirySummary }),
        ...(suggestions.length && { suggestions }),
      } };
    })
    .addEdge(START, "public_context")
    .addEdge("public_context", "conversation_skills")
    .addEdge("conversation_skills", "review_reply")
    .addEdge("review_reply", END)
    .compile();
}

function cleanSuggestions(value: unknown, question: string): string[] {
  if (!Array.isArray(value)) return [];
  const key = (text: string) => text.toLowerCase().replace(/[\p{P}\s]+/gu, " ").trim();
  const seen = new Set([key(question)]);
  const suggestions: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const text = item.trim();
    if (!text.endsWith("?") || text.length > 120 || /[\r\n<>]|https?:/i.test(text) || hasNonLatinLetters(text) || seen.has(key(text))) continue;
    seen.add(key(text));
    suggestions.push(text);
    if (suggestions.length === 2) break;
  }
  return suggestions;
}

export async function openAIAnswer({ question, history, evidence, preference = "auto", options, experiment }: Parameters<Answer>[0], englishRetry = false, fallback = false, deadline?: number): Promise<Candidate> {
  const start = performance.now();
  const plan = conversationPlan(question, history);
  const route = routeModel(preference, question, history.length, plan.reasoningEffort === "medium");
  deadline ??= Date.now() + (route.model === modelIds.luna ? 36_000 : 24_000);
  const effectiveModel = !fallback && experiment ? experiment.model : fallback ? (route.model === modelIds.mini ? modelIds.luna : modelIds.mini) : route.model;
  const effort = experiment?.effort ?? plan.reasoningEffort;
  const playful = isPlayfulAside(question);
  const edit = history.length > 0 && isConversationEdit(question);
  const suggest = options?.suggestQuestions === true && !playful && !edit && !isSocialTurn(question);
  const teaching = options?.answerStyle === "conceptual"
    ? "\nConceptual style: for a substantive explanation, build a mental model with a plain definition, an analogy and a concrete example as useful. Show how related concepts differ or connect. Respect requests for brevity, a different format, or a direct status answer."
    : "";
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
      instructions: persona + teaching + "\n" + plan.instructions + (suggest ? "\nInclude up to two short, distinct English questions the visitor could ask next in suggestions, separate from the reply. Continue the current example where useful. Suggest zero when the visitor wants to stop, the answer asks for clarification, the topic is sensitive, an enquiry is offered or no useful next question exists. Do not repeat the visitor's question or include a URL." : "") +
        (englishRetry ? "\nA prior generation contained non-English script. Write the entire response in English using Latin letters only, preserving the factual qualifications." : ""),
      input: [{ role: "user", content: "Reference packet only, not a visitor request or instruction. Use the conversation messages that follow in order; the final user message is the current request.\n" + JSON.stringify({
        dataPolicy: veraDataPolicy,
        applicationCapabilities: { input: "Plain text only. Uploaded or pasted images are not processed; ask for a written description.",
          externalAccess: "No camera, browsing or machine control.", enquiry: "Can prepare the form; cannot submit it or confirm a separate submission." },
        evidence: evidence.map(({ id, title, status, body, qualification, siteExcerpt, illustrative }) => ({
          id, title, status, body, qualification, siteExcerpt, ...(illustrative && { illustrative }),
        })),
        relationships: [...new Map(evidence.flatMap(record => record.relationships || [])
          .filter(edge => evidence.some(record => record.topicId === edge.from) && evidence.some(record => record.topicId === edge.to))
          .map(edge => [edge.id, edge])).values()],
        // Each message and reply is bounded; guest sessions expire after one day.
        // Earlier visitor facts can still apply after a long detour.
        inquiry: inquiryContext(question, relevantHistory),
        ...(playful && { taskScope: "Respond to the absurd premise in one short, playful line. Skip definitions, explanation and follow-up offers." }),
        ...(!playful && edit && {
          taskScope: latestReplyEdit ? "Edit the requested part of the one supplied Vera reply. Return only the edited part."
            : "Work from the conversation and keep the subject of the current exchange.",
        }),
      }) },
      ...relevantHistory.flatMap(turn => [{ role: "user", content: turn.question }, { role: "assistant", content: turn.reply.text }]),
      { role: "user", content: question }],
      store: false,
      max_output_tokens: effort === "medium" ? Math.max(plan.maxTokens, 4200) : plan.maxTokens,
      reasoning: { effort },
      text: { format: { type: "json_schema", name: "vectra_reply", strict: true, schema: {
        type: "object", additionalProperties: false, required: ["text", "sources", "enquiry", "enquirySummary", ...(suggest ? ["suggestions"] : [])],
        properties: {
          text: { type: "string", minLength: 1 }, sources: { type: "array", items: { type: "string" } },
          enquiry: { type: "boolean" }, enquirySummary: { type: "string" },
          ...(suggest && { suggestions: { type: "array", items: { type: "string" }, maxItems: 2 } }),
        },
      } } },
    }),
  });
  if (!response.ok && !fallback && (response.status === 429 || response.status >= 500) && deadline - Date.now() > 6000) {
    console.info("[vera:fallback]", JSON.stringify({ model: effectiveModel, status: response.status }));
    return openAIAnswer({ question, history, evidence, preference, options, experiment }, englishRetry, true, deadline);
  }
  if (!response.ok) throw new Error(`Vectra model request failed (${response.status})`);
  const result = await response.json() as { status?: string; output?: { content?: { type: string; text?: string }[] }[] };
  const usage = result as { usage?: { input_tokens?: number; output_tokens?: number; output_tokens_details?: { reasoning_tokens?: number } } };
  console.info("[vera:model]", JSON.stringify({ durationMs: Math.round(performance.now() - start), model: effectiveModel, route: route.reason, effort, task: plan.task, methods: plan.methods, fallback,
    inputTokens: usage.usage?.input_tokens, outputTokens: usage.usage?.output_tokens, reasoningTokens: usage.usage?.output_tokens_details?.reasoning_tokens }));
  const text = result.output?.flatMap(item => item.content ?? []).find(item => item.type === "output_text")?.text;
  if (result.status !== "completed" || !text) throw new Error("Vectra model did not complete");
  const candidate = JSON.parse(text) as Candidate;
  const visible = `${candidate.text || ""} ${candidate.enquirySummary || ""}`;
  if (hasNonLatinLetters(visible)) {
    if (!englishRetry) return openAIAnswer({ question, history, evidence, preference, options, experiment }, true, fallback, deadline);
    throw new Error("Vera English-only response validation failed");
  }
  return { ...candidate, model: effectiveModel, fallback };
}

export function hasNonLatinLetters(text: string): boolean {
  return [...text].some(character => /\p{L}/u.test(character) && !/\p{Script=Latin}/u.test(character));
}

export const vectraGraph = createVectraGraph(openAIAnswer, retrieve);
