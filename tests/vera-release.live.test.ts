import { mkdir, writeFile } from "node:fs/promises";
import { describe, it, expect } from "vitest";
import fixtures from "./fixtures/vera-synthesis-release.json";
import { createVectraGraph, openAIAnswer, hasNonLatinLetters } from "@/lib/vectra/graph";
import records from "@/lib/vectra/published.json";
import type { Turn } from "@/lib/vectra/types";
const output = process.env.VERA_RELEASE_OUTPUT || "data/vera-evaluation/release-synthesis";
describe.skipIf(process.env.VERA_RELEASE_MATRIX !== "1")("Vera release conversations",()=>{
 for(const model of ["mini","luna"] as const) for(const scenario of fixtures) {
  it.concurrent(`${scenario.id}-${model}`,async()=>{
   const history:Turn[]=[]; const timings:number[]=[];
   const graph=createVectraGraph(openAIAnswer);
   for(const question of scenario.turns) {
    const start=performance.now();
    const {reply}=await graph.invoke({question,history,records,preference:model,options:{answerStyle:"general",suggestQuestions:true}});
    history.push({id:String(history.length+1),question,reply});
    timings.push(Math.round(performance.now()-start));
    await mkdir(output,{recursive:true});
    await writeFile(`${output}/${scenario.id}-${model}.json`,JSON.stringify({model,expect:scenario.expect,timings,history},null,2));
    expect(reply.text.trim().length).toBeGreaterThan(0);
    expect(hasNonLatinLetters(reply.text)).toBe(false);
    expect(reply.sources.every((s:{id:string})=>records.some(r=>r.id===s.id))).toBe(true);
    expect(reply.suggestions?.length??0).toBeLessThanOrEqual(2);
    const checks = (scenario as {checks?: {turn:number; maxWords?:number; maxLines?:number; includes?:string[]; excludes?:string[]; excludesWords?:string[]; enquiry?:boolean}[]}).checks || [];
    for(const check of checks.filter(c=>c.turn===history.length)) {
     if(check.maxWords!==undefined) expect(reply.text.trim().split(/\s+/).length).toBeLessThanOrEqual(check.maxWords);
     if(check.maxLines!==undefined) expect(reply.text.trim().split(/\n/).length).toBeLessThanOrEqual(check.maxLines);
     for(const word of check.includes||[]) expect(reply.text.toLowerCase()).toContain(word.toLowerCase());
     for(const word of check.excludes||[]) expect(reply.text.toLowerCase()).not.toContain(word.toLowerCase());
     for(const word of check.excludesWords||[]) expect(reply.text.toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]).not.toContain(word.toLowerCase());
     if(check.enquiry!==undefined) expect(reply.enquiry).toBe(check.enquiry);
    }
   }
   // Semantic review uses the saved expectations and full transcripts, not these structural checks.
  },180_000);
 }
});
