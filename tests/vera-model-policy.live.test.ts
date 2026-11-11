import {mkdir,writeFile} from "node:fs/promises";
import {it,describe,expect} from "vitest";
import {vectraGraph} from "@/lib/vectra/graph";
import records from "@/lib/vectra/published.json";
import type {Turn} from "@/lib/vectra/types";
describe.skipIf(process.env.VERA_LIVE_VOICE!=="1")("Vera requested models and retention",()=>{
 for(const preference of ["mini","luna"] as const) it(preference,async()=>{
  const history:Turn[]=[];
  for(const question of ["Explain a manufacturing ontology with one simple example.","If I start a new conversation, does Voltron delete the old records? Keep it brief."]){
   const {reply}=await vectraGraph.invoke({question,history,records,preference});
   history.push({id:String(history.length+1),question,reply});
   await mkdir("data/vera-evaluation/model-policy",{recursive:true});
   await writeFile(`data/vera-evaluation/model-policy/${preference}.json`,JSON.stringify(history,null,2));
   expect(reply.model).toBe(preference==="mini"?"gpt-5.4-mini-2026-03-17":"gpt-5.4-2026-03-05");
  }
  expect(history[1].reply.text).toMatch(/retain|keeps|stored/i);
  expect(history[1].reply.text).not.toMatch(/old records (?:are|will be) deleted/i);
 },120000);
});
