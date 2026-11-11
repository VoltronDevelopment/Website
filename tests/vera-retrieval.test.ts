import { describe, expect, it, vi } from "vitest";
import published from "@/lib/vectra/published.json";
import { retrievalQuery, selectEvidence, type KnowledgeRecord } from "@/lib/vectra/retrieval";
import { compileCorpus } from "../scripts/vera-corpus.mjs";
import { knowledgeVersion } from "@/lib/vectra/knowledge-version.mjs";
import { createVectraGraph, isSocialTurn, hasNonLatinLetters, isConversationEdit, openAIAnswer } from "@/lib/vectra/graph";

describe("Vera evidence selection", () => {
  it("recovers unique public spelling slips without guessing short acronyms or identifiers", () => {
    const records = [{ ...published[0], aliases: ["ontology", "manufacturing"] }];
    expect(retrievalQuery("Explain ontolgy", [], records)).toContain("ontology");
    expect(retrievalQuery("Explain V-M and lot-452", [], records)).toBe("Explain V-M and lot-452");
    expect(retrievalQuery("Explain ontolgy", [{id:"a",question:"Our project is named ontolgy",reply:{text:"Understood",sources:[],enquiry:false}}], records)).toBe("Explain ontolgy");
  });
  it("uses cited context across thanks but respects an explicit new topic", () => {
    const record = published.find(r => r.topicId === "VL-ONTOLOGY")!;
    const history = [{id:"a",question:"Explain V-MO",reply:{text:"Shared meaning",sources:[{id:record.id,title:record.title,href:record.href}],enquiry:false}}, {id:"b",question:"Thanks",reply:{text:"Welcome",sources:[],enquiry:false}}];
    expect(retrievalQuery("How does that work?",history,published)).toContain(record.title);
    expect(retrievalQuery("What is Commons?",history,published)).not.toContain(record.title);
  });
  it("keeps simple social turns separate from mixed factual requests", () => {
    expect(isSocialTurn("Hi Vera. In one sentence, who are you?")).toBe(true);
    expect(isSocialTurn("Thanks!")).toBe(true);
    expect(isSocialTurn("Hi Vera, explain Alpha readiness.")).toBe(false);
  });
  it("keeps product evidence out of banter and restores it for a factual follow-up", async () => {
    const retrieve = vi.fn(async () => [published[0]]);
    const answer = vi.fn(async () => ({ text: "A test reply.", sources: [], enquiry: false }));
    const graph = createVectraGraph(answer, retrieve);
    await graph.invoke({
      question: "My dashboard swallowed the factory. Did the shift report survive?",
      history: [], records: published,
    });
    expect(retrieve).not.toHaveBeenCalled();
    expect(answer.mock.calls).toHaveLength(1);
    await graph.invoke({
      question: "Seriously, how does the dashboard link evidence to a lot?",
      history: [], records: published,
    });
    expect(retrieve).toHaveBeenCalledTimes(1);
  });

  it("distinguishes edits of the conversation from requests for company facts", () => {
    expect(isConversationEdit("Now rewrite the middle one only, without using the word cause.")).toBe(true);
    expect(isConversationEdit("Separate observation, inference, and next check, each in one short sentence.")).toBe(true);
    expect(isConversationEdit("Expand that with public sources about the Voltron roadmap.")).toBe(false);
    expect(isConversationEdit("Summarise the operating model.")).toBe(false);
  });

  it("preserves early visitor facts and distinguishes speakers in long conversations", async () => {
    const history = Array.from({ length: 23 }, (_, index) => ({
      id: String(index),
      question: index === 0 ? "The tray project is blue-mango-72." : "Side question " + index,
      reply: { text: "Vera response " + index, enquiry: false, sources: [] },
    }));
    const provider = vi.spyOn(globalThis, "fetch").mockImplementation(async () => Response.json({
      status: "completed",
      output: [{ content: [{
        type: "output_text",
        text: JSON.stringify({ text: "blue-mango-72", enquiry: false, sources: [] }),
      }] }],
    }));
    try {
      await openAIAnswer({ question: "What was the tray project called?", history, evidence: [] });
      const body = JSON.parse(String(provider.mock.calls[0][1]?.body));
      const input = JSON.parse(body.input);
      expect(input.history).toHaveLength(23);
      expect(input.history[0]).toEqual({
        visitorMessage: "The tray project is blue-mango-72.",
        veraReply: "Vera response 0",
      });
      expect(input.history.at(-1).visitorMessage).toBe("Side question 22");
      await openAIAnswer({
        question: "Now rewrite the middle one only, without using the word cause.",
        history,
        evidence: [],
      });
      const rewrite = JSON.parse(JSON.parse(String(provider.mock.calls[1][1]?.body)).input);
      expect(rewrite.history).toEqual([{ visitorMessage: "Side question 22", veraReply: "Vera response 22" }]);
    } finally {
      provider.mockRestore();
    }
  });

  it("rejects mixed-script replies but allows English punctuation and units", () => {
    expect(hasNonLatinLetters("I cannot पुष्टि confirm that.")).toBe(true);
    expect(hasNonLatinLetters("Vera’s answer: 5,000 parts — 25°C.")).toBe(false);
  });
  it("verifies releases after Postgres reorders nested JSON object keys", () => {
    expect(knowledgeVersion([{ id: "one", relationships: [{ from: "A", to: "B" }] }]))
      .toBe(knowledgeVersion([{ relationships: [{ to: "B", from: "A" }], id: "one" }]));
  });
  it.each([
    ["What is V-MO?", "VL-ONTOLOGY"],
    ["Explain the founder thesis and what would change your mind", "VL-THESIS"],
    ["Is Alpha commissioned and certified for CED?", "VL-ALPHA"],
    ["How does Commons support learning?", "VL-COMMONS"],
    ["When does original product development start?", "VL-PRODUCTS"],
    ["Why does Indian manufacturing need coherence?", "VL-VISION"],
  ])("retrieves the specific topic for %s", (question, topic) => {
    const evidence = selectEvidence(question, [], published);
    expect(evidence.some(record => record.topicId === topic)).toBe(true);
    expect(evidence.length).toBeLessThanOrEqual(7);
  });

  it("keeps readiness qualifications attached and excludes unapproved records", () => {
    const blocked: KnowledgeRecord = { ...published[0], id: "private", body: "Alpha CED certified live commissioned", approval: "pending", classification: "private" };
    const result = selectEvidence("Is Alpha live?", [], [...published, blocked], [{ id: "private", score: 999 }]);
    expect(result.some(record => record.id === "private")).toBe(false);
    expect(result.some(record => record.topicId === "VL-ALPHA" && /commission/i.test(record.qualification || ""))).toBe(true);
  });

  it("resolves a follow-up from the previous question", () => {
    const result = selectEvidence("How does that work?", [{
      id: "previous", question: "What is V-MO?", reply: { text: "Shared manufacturing meaning.", enquiry: false, sources: [] },
    }], published);
    expect(result.some(record => record.topicId === "VL-ONTOLOGY")).toBe(true);
  });

  it.each([
    ["What are the levels of a twin and where does the Voltron demo fit?", ["twin-levels-and-data-flow", "voltron-s-public-walkthrough"]],
    ["How are SCADA and ontology different?", ["scada-and-plc", "manufacturing-ontology"]],
    ["What's the difference between a digital thread and a historian?", ["digital-thread", "industrial-historian"]],
  ])("retrieves separate explanations for %s", (question, sections) => {
    const evidence = selectEvidence(question, [], published);
    expect(evidence.map(record => record.id)).toEqual(expect.arrayContaining(sections.map(section => `vl-foundations--${section}`)));
  });

  it("keeps suggestions optional and exposes only curated source links", async () => {
    const record = published.find(item => item.id === "vl-foundations--digital-twin")!;
    const illustration = published.find(item => item.id === "vl-foundations--one-batch-through-the-coating-line")!;
    const question = "What is a digital twin?";
    const graph = createVectraGraph(async () => ({ text: `A connected representation of a physical system. Sources: ${record.id}`, sources: [record.id, illustration.id, "invented"], enquiry: false,
      suggestions: [question, "How is it different from a simulation?", "How is it different from a simulation?", "What data would an oven twin use?", "Is there another example?"] }));
    const input = { question, records: [record, illustration], history: [] };
    const enabled = await graph.invoke({ ...input, options: { answerStyle: "conceptual", suggestQuestions: true } });
    expect(enabled.reply.text).toBe("A connected representation of a physical system.");
    expect(enabled.reply.sources).toEqual([{ id: record.id, title: "Digital twin", href: record.reference }]);
    expect(enabled.reply.suggestions).toEqual(["How is it different from a simulation?", "What data would an oven twin use?"]);
    const disabled = await graph.invoke({ ...input, options: { suggestQuestions: false } });
    expect(disabled.reply.suggestions).toBeUndefined();
  });

  it("compiles all approved topics with valid graph endpoints and bounded sections", async () => {
    const { records, topics } = await compileCorpus();
    expect(new Set(records.map(record => record.topicId)).size).toBe(16);
    expect(new Set(records.map(record => record.id)).size).toBe(records.length);
    for (const record of records) {
      expect(record.body.length).toBeLessThan(7000);
      for (const edge of record.relationships) {
        expect(topics).toHaveProperty(edge.from);
        expect(topics).toHaveProperty(edge.to);
      }
    }
  });
});
