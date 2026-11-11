import { mkdir, writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { createVectraGraph, openAIAnswer } from "@/lib/vectra/graph";
import records from "@/lib/vectra/published.json";
import type { ModelPreference } from "@/lib/vectra/models";
import type { AnswerStyle, Reply, Turn } from "@/lib/vectra/types";

type Step = {
  question: string;
  style: AnswerStyle;
  model: ModelPreference;
  suggest?: boolean;
  check: (reply: Reply) => void;
};

const scenarios: { id: string; steps: Step[] }[] = [
  { id: "concept-to-demo", steps: [
    { question: "Explain a digital twin for a beginner using a coating line and a delivery-map analogy.", style: "conceptual", model: "luna", suggest: true,
      check: reply => { expect(reply.text).toMatch(/map/i); expect(reply.text).toMatch(/coat/i); } },
    { question: "Compare a digital model, digital shadow and twin in the same example. Is that about data flow or prediction?", style: "conceptual", model: "mini", suggest: true,
      check: reply => { expect(reply.text).toMatch(/one.way|one direction|physical[^.;]{0,45}to (?:the )?digital/i); expect(reply.text).toMatch(/two.way|both ways|bidirectional|both directions/i); expect(reply.text).toMatch(/predict/i); } },
    { question: "Now give me the practical takeaway in one sentence. Can I assume V Twin in Voltron's public demo has a live feed?", style: "general", model: "luna",
      check: reply => { expect(reply.text).toMatch(/demo|walkthrough/i); expect(reply.text).toMatch(/no|unconfirmed|doesn.t establish|can.t confirm/i); expect(reply.text.trim().split(/\s+/).length).toBeLessThanOrEqual(42); } },
    { question: "Then where does ontology fit alongside SCADA and MES in that coating line?", style: "conceptual", model: "mini",
      check: reply => { for (const term of [/ontology/i, /SCADA/, /MES/, /batch/i]) expect(reply.text).toMatch(term); } },
  ] },
  { id: "correction-and-synthesis", steps: [
    { question: "Use a hypothetical line called Harbor. Batch H-71 uses drawing revision C. How do an industrial historian and a digital thread differ there?", style: "conceptual", model: "mini", suggest: true,
      check: reply => { expect(reply.text).toMatch(/time|trend/i); expect(reply.text).toMatch(/drawing|revision/i); expect(reply.text).not.toMatch(/coating.line/i); } },
    { question: "Correction: the drawing is revision D, not C. Same batch. Can a sensor value alone tell me which requirement applied?", style: "general", model: "luna",
      check: reply => { expect(reply.text).toMatch(/\bno\b|can.t|cannot|doesn.t|not enough|not by itself|not (?:tell|show|identify|which)/i); } },
    { question: "Quick detour: what is Voltron Commons in one sentence?", style: "general", model: "mini",
      check: reply => { expect(reply.text).toMatch(/Commons/i); expect(reply.text).not.toMatch(/H-71|Harbor|drawing revision/i); } },
    { question: "Back to Harbor. Use our corrected batch and drawing revision to synthesize what the historian, ontology and thread each contribute.", style: "conceptual", model: "luna", suggest: true,
      check: reply => { for (const term of [/H-71/i, /revision D/i, /historian/i, /ontology/i, /thread/i]) expect(reply.text).toMatch(term); } },
  ] },
  { id: "new-example-and-boundaries", steps: [
    { question: "Use a bakery as my analogy: what is the difference between a PLC and SCADA?", style: "conceptual", model: "luna", suggest: true,
      check: reply => { expect(reply.text).toMatch(/bakery|bread|oven/i); expect(reply.text).toMatch(/PLC/); expect(reply.text).toMatch(/SCADA/); } },
    { question: "Switch the example to a water pumping station. Explain the same difference simply.", style: "conceptual", model: "mini", suggest: true,
      check: reply => { expect(reply.text).toMatch(/pump/i); expect(reply.text).not.toMatch(/bakery|coating line/i); } },
    { question: "What about a historian there? One sentence please.", style: "general", model: "luna",
      check: reply => { expect(reply.text).toMatch(/pump|station/i); expect(reply.text).toMatch(/time|trend|past/i); } },
    { question: "Thanks, that’s enough.", style: "general", model: "mini", suggest: true,
      check: reply => { expect(reply.suggestions).toBeUndefined(); expect(reply.text.split(/\s+/).length).toBeLessThanOrEqual(18); } },
  ] },
];

describe.skipIf(process.env.VERA_LIVE_VOICE !== "1")("Vera industrial learning conversations", () => {
  const graph = createVectraGraph(openAIAnswer);
  const directory = process.env.VERA_VOICE_OUTPUT || "data/vera-evaluation/industrial-learning";
  for (const { id, steps } of scenarios) {
    it(id, async () => {
      const history: Turn[] = [];
      for (const { question, style, model, suggest, check } of steps) {
        const { reply } = await graph.invoke({ question, history, records, preference: model,
          options: { answerStyle: style, suggestQuestions: suggest ?? false } });
        history.push({ id: String(history.length + 1), question, reply });
        await mkdir(directory, { recursive: true });
        await writeFile(`${directory}/${id}.json`, JSON.stringify(history, null, 2));
        expect(reply.enquiry).toBe(false);
        expect(reply.text).not.toMatch(/vl-foundations--/i);
        expect(reply.suggestions?.length ?? 0).toBeLessThanOrEqual(suggest ? 2 : 0);
        check(reply);
      }
    }, 100_000);
  }
});
