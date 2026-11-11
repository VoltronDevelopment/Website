import { expect, it, vi, afterEach } from "vitest";
import { conversationPlan, inquiryAnchors, inquiryContext, mayOfferEnquiry, requestedWordLimit } from "@/lib/vectra/conversation";
import { createVectraGraph, openAIAnswer } from "@/lib/vectra/graph";
import type { Turn } from "@/lib/vectra/types";
import { retrievalQuery, selectEvidence } from "@/lib/vectra/retrieval";
import records from "@/lib/vectra/published.json";
const turn = (id: string, question: string): Turn => ({ id, question, reply: { text: "A proposed interpretation", sources: [], enquiry: false } });
afterEach(() => vi.unstubAllGlobals());
it("keeps source transport markers out of visible answers",async()=>{
 const graph=createVectraGraph(async()=>({text:"A linked reading. 【vl-foundations--industrial-historian】 [1] (vl-vos--context, vl-vos--short-answer) <voltron sources>",sources:["vl-foundations--industrial-historian"],enquiry:false}));
 const {reply}=await graph.invoke({question:"Explain a historian",history:[],records});
 expect(reply.text).toBe("A linked reading.");
});
it("permits forms only for contact intent or active draft edits",()=>{
 expect(mayOfferEnquiry("Summarise this ticket: the two gauges disagree.",[])).toBe(false);
 expect(mayOfferEnquiry("Draft an enquiry for 200 steel brackets",[])).toBe(true);
 const history=[turn("1","Draft an enquiry")]; history[0].reply.enquiry=true;
 expect(mayOfferEnquiry("Make that 220 and powder-coated",history)).toBe(true);
 expect(inquiryContext("Make that 220 and powder-coated",history).activeEnquiry?.editRule).toContain("single most recent");
 expect(mayOfferEnquiry("Was it ever submitted?",history)).toBe(false);
 expect(mayOfferEnquiry("I am not enquiring anymore",history)).toBe(false);
 expect(requestedWordLimit("Three plain English words if possible.")).toBe(3);
});
it("keeps company readiness out of a visitor project while allowing an explicit company detour", () => {
 const history=[turn("1","Remember my sample name in this chat: blue-mango-72. It is our stainless tray, 240 pieces.")];
 expect(selectEvidence("Can I honestly promise delivery next Thursday?",history,records).every(r=>r.topicId==="VL-FOUNDATIONS")).toBe(true);
 expect(selectEvidence("Is Voltron Alpha commissioned?",history,records).some(r=>r.topicId==="VL-ALPHA")).toBe(true);
});
it("retrieves the returned scenario instead of inheriting a readiness detour", () => {
 const history = [turn("1", "Suppose our pumping station uses requirement D"), turn("2", "Is Alpha commissioned today?")];
 const query = retrievalQuery("Back to our pumping station: synthesize its context problem",history,[]);
 expect(query).toContain("requirement D");
 expect(query).not.toContain("Alpha");
});
it("carries exploratory intent into terse follow-ups while honoring brevity and readiness", () => {
 const history = [turn("1", "Explore coherence through an orchestra analogy")];
 expect(conversationPlan("And then?", history).task).toBe("explore");
 expect(conversationPlan("I mean shared understanding. What changes?", history).task).toBe("revise");
 expect(conversationPlan("Explore this in one sentence", history).substantial).toBe(false);
 expect(conversationPlan("Explore this in one sentence", history).reasoningEffort).toBe("medium");
 expect(conversationPlan("Can I book production today?", history).task).toBe("readiness");
 expect(conversationPlan("Thanks, but why does that matter?", history).task).toBe("explore");
});
it("retains exact, attributed corrections without manufacturing adopted beliefs", () => {
 const history = [turn("1", "Suppose our batch is B-12"), turn("2", "Correction: B-13, not B-12")];
 expect(inquiryAnchors(history)).toEqual(history.map(t => ({ turnId: t.id, introducedBy: "visitor", wording: t.question })));
 expect(JSON.stringify(inquiryAnchors(history))).not.toContain("proposed interpretation");
 const context = inquiryContext("What changed?",history);
 expect(context.priorContributions[0].introducedBy).toBe("vera");
 expect(context.priorContributions[0].status).toContain("adoption must be explicit");
 expect(context.visitorStatements).toHaveLength(2);
});
it("gives synthesis a complete output budget and current task instructions", async () => {
 const fetcher = vi.fn(async () => Response.json({ status: "completed", output: [{content:[{type:"output_text",text:JSON.stringify({text:"An explanation.",sources:[],enquiry:false})}]}] }));
 vi.stubGlobal("fetch", fetcher);
 await openAIAnswer({question:"Synthesize our discussion of coherence",history:[],evidence:[]});
 const request = JSON.parse((fetcher.mock.calls as unknown as [string, {body:string}][])[0][1].body);
 expect(request.max_output_tokens).toBeGreaterThan(2000);
 expect(request.instructions).toContain("claim-scoped");
 expect(request.reasoning.effort).toBe("medium");
 expect(request.input.at(-1)).toEqual({role:"user",content:"Synthesize our discussion of coherence"});
});
it("rejects oversized answers intact instead of returning a clipped sentence", async () => {
 const graph = createVectraGraph(async () => ({text:"a".repeat(7000),sources:[],enquiry:false}));
 await expect(graph.invoke({question:"Synthesize this",history:[],records:[]})).rejects.toThrow("complete-answer budget");
});
