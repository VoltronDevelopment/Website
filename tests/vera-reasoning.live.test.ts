import { mkdir, writeFile } from "node:fs/promises";
import { describe, it, expect } from "vitest";
import { openAIAnswer, createVectraGraph } from "@/lib/vectra/graph";
import records from "@/lib/vectra/published.json";
import type { Turn } from "@/lib/vectra/types";

const cases = [
 { id:"coherence", questions:[
  "Why might shared understanding matter more than identical methods across factories? Explore this through a jazz ensemble analogy.",
  "But a wrong note is reversible; a defective part may not be. What does this change in our analogy?",
  "I mean freedom within justified process limits, not unrestricted improvisation. Synthesize what changed and give a practical example.",
  "Bring that together in two sentences for a non-engineer."
 ] },
 { id:"return", questions:[
  "Suppose my pumping station records lot R-91 under requirement revision B. How do a historian and ontology contribute different things?",
  "Correction: revision E. I do not think more sensors alone solve missing context. What is the strongest counterargument?",
  "Quick detour: can I assume Voltron Alpha is commissioned today?",
  "Return to my pumping station and corrected revision. What survived the counterargument, and what information is still missing?"
 ] },
 { id:"learning", questions:[
  "Explain SCADA to a beginner using a bakery analogy.",
  "How could a simulation there help people ask better questions even without a live feed?",
  "So is prediction always a higher level of twin? Clarify without restarting the whole explanation.",
  "What is the useful synthesis of that distinction for someone deciding what to build first?"
 ] }
];
describe.skipIf(process.env.VERA_REASONING_MATRIX !== "1")("Vera reasoning comparison", () => {
 for(const model of ["gpt-5.4-mini-2026-03-17","gpt-5.4-2026-03-05"] as const)
 for(const effort of ["low","medium"] as const) {
  it(`${model}-${effort}`,async()=>{
   for(const scenario of cases) {
    const history:Turn[]=[]; const timings:number[]=[];
    const graph=createVectraGraph(input=>openAIAnswer({...input,experiment:{model,effort}},false,false,Date.now()+32_000));
    for(const question of scenario.questions) {
     const start=performance.now();
     const {reply}=await graph.invoke({question,history,records,options:{answerStyle:"general",suggestQuestions:true}});
     timings.push(Math.round(performance.now()-start));
     history.push({id:String(history.length+1),question,reply});
     await mkdir("data/vera-evaluation/reasoning",{recursive:true});
     await writeFile(`data/vera-evaluation/reasoning/${scenario.id}-${model}-${effort}.json`,JSON.stringify({model,effort,evaluationDeadlineMs:32000,timings,history},null,2));
     expect(reply.enquiry).toBe(false);
    }
    if(scenario.id==="return") {
     expect(history[3].reply.text).toMatch(/revision E/i);
     expect(history[3].reply.text).toMatch(/R-91/i);
    }
   }
  },240_000);
 }
});
