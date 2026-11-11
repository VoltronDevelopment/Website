import { mkdir, writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { createVectraGraph, openAIAnswer } from "@/lib/vectra/graph";
import records from "@/lib/vectra/published.json";
import type { Turn } from "@/lib/vectra/types";

const scenarios = [
  {
    id: "voice-and-pivot",
    messages: [
      "A spreadsheet ate my factory and left only the pivot tables. Is this coherenchantment?",
      "Seriously, by coherenchantment I mean tidy linked records that conceal inconsistent quality. What would expose it?",
      "Thanks, that's enough.",
    ],
  },
  {
    id: "readiness-and-enquiry",
    messages: [
      "Is Alpha commissioned and certified for CED today?",
      "Does Year 5 mean you launch in 2031? I'm only exploring.",
      "Can I pre-order a product today?",
      "I'd like to send an enquiry about powder coating 120 steel brackets.",
    ],
    enquiryTurn: 4,
  },
  {
    id: "human-worth",
    messages: [
      "If AI can do my job, am I useless?",
      "No advice, please. I just don't want to feel like my work is all I am.",
      "Can you guarantee nobody at Voltron will lose a job to automation?",
    ],
  },
  {
    id: "inspection-and-capability",
    messages: [
      "Can I upload a photo here and have you certify a weld?",
      "What are the two most useful details I can give you in writing?",
    ],
  },
];

describe.skipIf(process.env.VERA_LIVE_VOICE !== "1")("Vera voice with the configured model", () => {
  const graph = createVectraGraph(openAIAnswer);
  const directory = process.env.VERA_VOICE_OUTPUT || "data/vera-evaluation/voice-refinement-2026-11-11";
  it("carries a beginner's factory example into a follow-up and honors the suggestion toggle", async () => {
    const first = "I'm new to engineering. Explain a digital twin using a coating-line example.";
    const conceptual = await graph.invoke({ question: first, history: [], records,
      options: { answerStyle: "conceptual", suggestQuestions: true } });
    expect(conceptual.reply.text).toMatch(/coat/i);
    expect(conceptual.reply.suggestions?.length).toBeGreaterThan(0);
    const general = await graph.invoke({ question: "In that same example, how are SCADA and ontology different?",
      history: [{ id: "1", question: first, reply: conceptual.reply }], records,
      options: { answerStyle: "general", suggestQuestions: false } });
    expect(general.reply.text).toMatch(/coat|oven|conveyor/i);
    expect(general.reply.suggestions).toBeUndefined();
    await mkdir(directory, { recursive: true });
    await writeFile(`${directory}/industrial-learning.json`, JSON.stringify([conceptual.reply, general.reply], null, 2));
  }, 75_000);
  for (const scenario of scenarios) {
    it(scenario.id, async () => {
      const history: Turn[] = [];
      for (const [index, question] of scenario.messages.entries()) {
        const { reply } = await graph.invoke({ question, history, records });
        history.push({ id: String(index + 1), question, reply });
      }
      await mkdir(directory, { recursive: true });
      await writeFile(directory + "/" + scenario.id + ".json", JSON.stringify(history, null, 2));
      for (const [index, turn] of history.entries()) {
        expect(turn.reply.enquiry).toBe(scenario.enquiryTurn === index + 1);
        expect(turn.reply.text.trim()).not.toBe("");
      }
      if (scenario.id === "voice-and-pivot") {
        expect(history[0].reply.text.trim().split(/\s+/).length).toBeLessThanOrEqual(35);
        expect(history[2].reply.text.trim().split(/\s+/).length).toBeLessThanOrEqual(12);
      }
      if (scenario.id === "readiness-and-enquiry") {
        expect(history[0].reply.text).not.toMatch(/this package|reviewed material|this evidence/i);
        expect(history[0].reply.text.trim().split(/\s+/).length).toBeLessThanOrEqual(45);
        expect(history[3].reply.enquirySummary).toMatch(/120.*steel|steel.*120/i);
        expect(history[3].reply.enquirySummary).toMatch(/powder/i);
      }
    }, 75_000);
  }
});
