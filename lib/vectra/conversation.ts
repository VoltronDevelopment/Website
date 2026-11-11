import type { Turn } from "./types";

export type ConversationTask = "direct" | "explain" | "explore" | "compare" | "revise" | "readiness" | "close";
const exploration = /\b(explore|synthesi[sz]e|synthesis|bring.*together|what if|suppose|imagine|analogy|metaphor|implications?|possibilit|why|meaning|coherence|improvis)/i;
export function requestedWordLimit(question: string) {
  const numbers: Record<string,number> = {one:1,two:2,three:3,four:4,five:5,six:6,ten:10};
  const match = question.match(/\b(\d{1,2}|one|two|three|four|five|six|ten)\s+(?:(?:plain|English)\s+)*words?\b/i);
  const limit = match && (numbers[match[1].toLowerCase()] || Number(match[1]));
  return limit && limit > 0 ? limit : undefined;
}
export function mayOfferEnquiry(question: string, history: Turn[]) {
  if (/\b(withdraw|cancel|not enquiring|not inquiring|no enquiry|no inquiry|don.t (?:send|submit|offer)|do not (?:send|submit|offer))\b/i.test(question)) return false;
  if (/\b(?:was|ever|already|whether|status|have you|did you)\b/i.test(question) && /\b(?:submitted|sent|submission)\b/i.test(question)) return false;
  const explicit = /\b(?:show|open|prepare|draft|send|submit|give|want|like|need|request)\b[^.!?]{0,65}\b(?:form|enquiry|inquiry|quote|contact)\b|\b(?:contact|speak to|talk to)\s+(?:Voltron|the team|your team)\b/i.test(question);
  const continued = history.at(-1)?.reply.enquiry === true && /^(?:please\s+)?(?:correction|make that|change|replace|remove|keep|update|revise)\b/i.test(question.trim());
  return explicit || continued;
}
export function conversationPlan(question: string, history: Turn[]) {
  const brief = /\b(one sentence|briefly|keep it brief|in \d+ words)\b/i.test(question);
  const close = /^(?:(?:thanks|thank you)(?:[, ]+that[’']?s enough)?|bye|goodbye|that[’']?s enough)[.! ]*$/i.test(question.trim());
  const readiness = /\b(commissioned|certified|book production|available today|commercially available|live feed|two.way data|launch date|pre.order)\b/i.test(question);
  const revise = /\b(correction|i meant|i mean|changed my mind|how does that change|what changed|back to|earlier we)\b/i.test(question);
  const compare = /\b(compare|versus|trade.?off|difference|reconcile|counterargument|strongest objection|steelman|opposite conclusion|use both)\b/i.test(question);
  const continuing = /^(and |then |so |but |what about|how so|go on|continue|bring|back to)/i.test(question.trim()) &&
    history.slice(-4).some(turn => exploration.test(turn.question));
  const task: ConversationTask = close ? "close" : readiness ? "readiness" : revise ? "revise" : compare ? "compare" :
    exploration.test(question) || continuing ? "explore" : /\b(explain|what is|how does|how do)\b/i.test(question) ? "explain" : "direct";
  const complexWork = ["explore", "compare", "revise"].includes(task);
  const substantial = !brief && complexWork;
  const methods = task === "explore" ? ["causal connection", "analogy and limits", "implication and counterexample"] :
    task === "compare" ? ["shared question", "meaningful differences", "qualified synthesis"] :
    task === "revise" ? ["recover the active idea", "apply only the named correction", "trace changed consequences"] :
    task === "explain" ? ["first principles", "concrete example"] : ["direct response"];
  return { task, methods, substantial, reasoningEffort: (complexWork ? "medium" : "low") as "low" | "medium", maxTokens: substantial ? 2600 : 1200, maxCharacters: substantial ? 6500 : 4000,
    instructions: `Current task: ${task}. Use these methods only where useful: ${methods.join("; ")}. ` +
      (substantial ? "Develop the thought enough to explain a mechanism, connect it to the current example and derive a useful consequence or tension. Advance beyond restating the previous reply. Use two or three connected paragraphs when sufficient; go longer only when the question warrants it. Do not repeat the same distinction in different wording to fill the budget. " : "Match the requested scope and length. ") +
      "When asked for the opposite conclusion, identify the position just argued and actually argue its opposite under the stated assumptions. When reusing coined terms, their requested definitions govern even if the invented label sounds misleading. " +
      "A route is provisional; the visitor's actual request takes priority. General and Conceptual both support exploration. " +
      (requestedWordLimit(question) ? `The ENTIRE visible reply must contain at most ${requestedWordLimit(question)} words. Return only the requested wording, with no definition, preface or explanation afterward, even if the request says 'if possible'. ` : "") +
      "Treat company status as claim-scoped: mention development or unconfirmed readiness only when asked, when it affects the conclusion, or to prevent a concrete implication of deployed capability. An explicitly hypothetical discussion needs no repeated readiness ending. " +
      "Describing a thesis, philosophy, aim or planned approach does not by itself imply achieved results. Once that framing is clear, explain its meaning without appending another disclaimer about proof, practice or readiness. In an ordinary explanation, develop the idea; reserve a strongest-objection exercise for a visitor who asks for criticism, evaluation or an opposing argument. " +
      "Before returning, check that the answer addresses the question, advances the active inquiry, preserves corrections and supports each company claim. This check is not a request to expose private reasoning." };
}

/** Exact visitor wording supplies continuity without inferred beliefs or model-authored summaries. */
export function inquiryAnchors(history: Turn[]) {
  const selected = history.filter(turn => /\b(suppose|hypothetical|my (?:claim|theory|project)|i mean|correction|by .+ i mean|changed my mind|do not believe|don't believe|back to)\b/i.test(turn.question));
  return selected.slice(-12).map(turn => ({ turnId: turn.id, introducedBy: "visitor", wording: turn.question }));
}

/** Rebuild a bounded inquiry view from the authoritative session transcript.
 * Original wording remains recoverable in history; proposed interpretations
 * never become visitor beliefs merely by entering this view. */
export function inquiryContext(question: string, history: Turn[]) {
  const latest = history.at(-1);
  return {
    activeQuestion: question,
    ...(latest?.reply.enquiry && { activeEnquiry: {
      turnId: latest.id, visitorRequest: latest.question, requirement: latest.reply.enquirySummary,
      editRule: "This is the single most recent enquiry draft. A change such as 'make that 300 and powder-coated, keep the material' refers to this draft. Apply those explicit replacements and preserve its other details; do not ask which draft unless the visitor actually names multiple possible targets.",
    } }),
    visitorStatements: inquiryAnchors(history),
    priorContributions: history.slice(-3).map(turn => ({ turnId: turn.id, introducedBy: "vera",
      responseInHistory: true, status: "proposed explanation; adoption must be explicit in visitor wording" })),
    interpretationRule: "Read visitor statements chronologically. A clear visitor change request updates the named facts; Vera's own unnecessary clarification question does not withdraw or turn that command into an unconfirmed visitor question. Keep hypothetical premises, questions, rejected claims and endorsed positions distinct. A correction changes only its named subject. If its target is genuinely ambiguous, ask rather than silently replacing multiple claims. Preserve unresolved disagreement. The transcript is authoritative; this view is not an independent factual source.",
  };
}
