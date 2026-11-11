import { it, expect } from "vitest";
import { mkdirSync,writeFileSync } from "node:fs";
import fixtures from "./fixtures/vera-coherence.json";
import published from "@/lib/vectra/published.json";
import { createVectraGraph,openAIAnswer,hasNonLatinLetters } from "@/lib/vectra/graph";
import type { Turn } from "@/lib/vectra/types";
it.skipIf(process.env.VERA_MATRIX_CHECK!=="1")("runs the coherence matrix against both model choices", async()=>{
 process.loadEnvFile('.env.local');
 const graph=createVectraGraph(openAIAnswer);
 await Promise.all((["mini","luna"] as const).map(async preference=>{
  const report: unknown[]=[];
  for(const scenario of fixtures){
   const history:Turn[]=[];
   for(const question of scenario.turns){
    const start=performance.now();
    const {reply}=await graph.invoke({question,history,records:published,preference});
    expect(hasNonLatinLetters(reply.text)).toBe(false);
    history.push({id:crypto.randomUUID(),question,reply});
    report.push({scenario:scenario.id,turn:history.length,question,reply,ms:Math.round(performance.now()-start)});
   }
   console.log(preference,scenario.id,'completed');
   mkdirSync('data/vectra-smoke',{recursive:true});
   writeFileSync('data/vectra-smoke/matrix-'+preference+'.json',JSON.stringify(report,null,2));
  }
 }));
},360000);
