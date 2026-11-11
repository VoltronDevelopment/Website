import { it, expect } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { openAIAnswer } from "@/lib/vectra/graph";
import type { Turn } from "@/lib/vectra/types";
it.skipIf(process.env.VERA_MODEL_CHECK !== "1")("checks both models with Vera's actual personality and multi-turn context", async () => {
 process.loadEnvFile('.env.local');
 const results: unknown[]=[];
 for(const preference of ["mini","luna"] as const) {
  const history: Turn[]=[];
  for(const question of ["Hi Vera. One sentence: who are you?", "My factory cube demanded a holiday. Give me one tiny joke.", "Our lot is 240 steel brackets, not 420. Remember that for this chat.", "How many brackets did I say? Just the number."]) {
   const start=performance.now();
   const candidate=await openAIAnswer({question,history,evidence:[],preference});
   const text=String(candidate.text);
   results.push({preference,question,text,ms:Math.round(performance.now()-start),model:candidate.model});
   expect(text.length).toBeGreaterThan(0);
   if(question.startsWith("How many")) expect(text.trim()).toMatch(/^240[.!]?$/);
   history.push({id:crypto.randomUUID(),question,reply:{text,sources:[],enquiry:false}});
  }
 }
 mkdirSync('data/vectra-smoke',{recursive:true});
 writeFileSync('data/vectra-smoke/actual-personality-models.json',JSON.stringify(results,null,2));
},120000);
