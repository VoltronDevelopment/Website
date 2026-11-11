import { mkdir, writeFile } from "node:fs/promises";
import { expect, it, describe } from "vitest";
import { createVectraGraph, openAIAnswer } from "@/lib/vectra/graph";
import records from "@/lib/vectra/published.json";
import type { Turn } from "@/lib/vectra/types";

const scenarios = [
 { id: "orchestra", questions: [
  "Explore why shared context might matter more than another dashboard in a factory. Use an orchestra analogy.",
  "But factories improvise. Does the fixed score weaken that analogy? Develop the distinction.",
  "I mean shared understanding without identical methods. How does that change our conclusion?",
  "Bring this together for Indian manufacturing. Explore the possibility, not Voltron's deployment status."
 ] },
 { id: "correction-detour", questions: [
  "Suppose my water pumping station has batch P-12 and requirement revision C. Connect historian, ontology and digital thread through this example.",
  "Correction: revision D. I suspect recording more sensor values alone solves the context problem. Challenge that assumption.",
  "Quick detour: is Voltron Alpha commissioned and accepting production today?",
  "Back to my pumping station. Synthesize our corrected example and explain what the extra sensor data would still leave unresolved."
 ] },
 { id: "analogy-limits", questions: [
  "Could a digital twin be a rehearsal room for a bakery? Explain the analogy and what it makes possible.",
  "Now suppose that model has no current sensor feed. What changes in the analogy and its practical usefulness?",
  "I do not believe simulation guarantees a good decision. I am asking whether it can improve the questions people ask.",
  "What have we established and what remains open? Give a synthesis with a concrete example, not a repeated glossary."
 ] }
];
describe.skipIf(process.env.VERA_LIVE_VOICE !== "1")("Vera exploratory synthesis", () => {
 for (const model of ["mini", "luna"] as const) for (const scenario of scenarios) {
  it(`${scenario.id}-${model}`, async () => {
   const history: Turn[] = [];
   for (const question of scenario.questions) {
    const start = performance.now();
    const {reply} = await createVectraGraph(openAIAnswer).invoke({question,history,records,preference:model,options:{answerStyle:"general",suggestQuestions:true}});
    history.push({id:String(history.length+1),question,reply});
    await mkdir("data/vera-evaluation/synthesis",{recursive:true});
    await writeFile(`data/vera-evaluation/synthesis/${scenario.id}-${model}.json`,JSON.stringify(history,null,2));
    console.info(JSON.stringify({scenario:scenario.id,model,turn:history.length,ms:Math.round(performance.now()-start)}));
    expect(reply.enquiry).toBe(false);
    expect(reply.text.length).toBeLessThanOrEqual(6500);
   }
   if(scenario.id==="orchestra") {
    expect(history[3].reply.text).toMatch(/india/i);
    expect(history[3].reply.text).not.toMatch(/still in development|not (?:an established|a proven) result|readiness (?:is )?unconfirmed/i);
   }
   if(scenario.id==="correction-detour") {
    expect(history[2].reply.text).toMatch(/unconfirmed|can.t confirm|development|not confirm/i);
    expect(history[3].reply.text).toMatch(/revision D/i);
    expect(history[3].reply.text).toMatch(/P-12/i);
    expect(history[3].reply.text).not.toMatch(/coating line/i);
   }
   // These checks are structural checkpoints. Full transcripts require semantic review.
  },120_000);
 }
});
