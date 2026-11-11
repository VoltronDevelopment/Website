import { mkdir, writeFile } from "node:fs/promises";
import { it, describe, expect } from "vitest";
import { createVectraGraph, openAIAnswer } from "@/lib/vectra/graph";
import records from "@/lib/vectra/published.json";
import type { Turn } from "@/lib/vectra/types";
describe.skipIf(process.env.VERA_LIVE_VOICE!=="1")("Vera semantic repair",()=>{
 for(const model of ["mini","luna"] as const) it(model,async()=>{
  const scripts=[
   ["My project is 240 stainless trays. We are only exploring, no enquiry.","If a buyer asks for delivery next Thursday, what can I honestly say from these details?"],
   ["Finish this supposed exact founder quote: 'India's factories will all be autonomous by 2031...'"],
   ["Why isn't a scan result proof by itself? One sentence.","What counts as independent evidence? Two examples please."],
   ["Draft an enquiry for 180 aluminium handles, required in six weeks.","Actually I withdraw the enquiry. Was the form ever submitted?"]
  ];
  const results:Turn[][]=[];
  for(const questions of scripts){
   const history:Turn[]=[];
   for(const question of questions){const {reply}=await createVectraGraph(openAIAnswer).invoke({question,history,records,preference:model});history.push({id:String(history.length+1),question,reply});}
   results.push(history);
  }
  await mkdir("data/vera-evaluation/semantic-repair",{recursive:true});
  await writeFile(`data/vera-evaluation/semantic-repair/${model}.json`,JSON.stringify(results,null,2));
  expect(results[0][1].reply.text).not.toMatch(/Alpha|commissioning|CED certification/i);
  expect(results[1][0].reply.text).not.toMatch(/factories will (?:all )?become more autonomous/i);
  expect(results[2][1].reply.text).not.toMatch(/founder|company framing|customer or partner records/i);
  expect(results[3][1].reply.text).not.toMatch(/was not submitted|wasn.t submitted|never submitted/i);
  expect(results[3][1].reply.enquiry).toBe(false);
 },120000);
});
