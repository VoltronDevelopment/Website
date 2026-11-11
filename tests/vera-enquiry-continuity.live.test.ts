import { mkdir, writeFile } from "node:fs/promises";
import { describe, it, expect } from "vitest";
import { vectraGraph } from "@/lib/vectra/graph";
import records from "@/lib/vectra/published.json";
import type { Turn } from "@/lib/vectra/types";
describe.skipIf(process.env.VERA_LIVE_VOICE!=="1")("Vera exact hosted enquiry regression",()=>{
 for(const model of ["mini","luna"] as const) for(const repeat of [1,2]) {
  it.concurrent(`${model}-${repeat}`,async()=>{
   const history:Turn[]=[];
   for(const question of [
    "Summarise this ticket: The trial is blocked because two thickness gauges disagree.",
    "Prepare an enquiry for 200 steel brackets needing CED coating.",
    "Make that 300 and powder-coated, keep the material.",
    "Actually I withdraw the enquiry. Just restate the requirement.",
    "Was the form ever submitted?"
   ]) {
    const {reply}=await vectraGraph.invoke({question,history,records,preference:model,options:{answerStyle:"general",suggestQuestions:true}});
    history.push({id:String(history.length+1),question,reply});
    await mkdir("data/vera-evaluation/enquiry-hybrid-confirmation",{recursive:true});
    await writeFile(`data/vera-evaluation/enquiry-hybrid-confirmation/${model}-${repeat}.json`,JSON.stringify(history,null,2));
   }
   expect(history.map(t=>t.reply.enquiry)).toEqual([false,true,true,false,false]);
   for(const index of [2,3]) {expect(history[index].reply.text).toMatch(/300/);expect(history[index].reply.text).toMatch(/powder/i);}
   expect(history[2].reply.enquirySummary).toMatch(/steel/i);
  },120000);
 }
});
