import { describe, it, expect, vi, afterEach } from "vitest";
import { routeModel, isModelPreference } from "@/lib/vectra/models";
import { openAIAnswer } from "@/lib/vectra/graph";
afterEach(() => vi.unstubAllGlobals());
describe("Vera model routing", () => {
 it("validates preferences and preserves explicit selections", () => {
  expect(isModelPreference("gpt-arbitrary")).toBe(false);
  expect(routeModel("luna", "Compare manufacturing strategies", 12).model).toBe("gpt-6-luna");
  expect(routeModel("mini", "Hello", 0).model).toContain("5.4-mini");
  expect(routeModel("auto", "Hello", 0).model).toBe("gpt-6-luna");
  expect(routeModel("auto", "Compare constraints and tradeoffs", 0).model).toContain("5.4-mini");
  expect(routeModel("auto", "What about that?", 10).model).toContain("5.4-mini");
 });
 it("falls back once on transient failure and reports the actual model", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(new Response("", {status:503})).mockResolvedValueOnce(Response.json({status:"completed",output:[{content:[{type:"output_text",text:JSON.stringify({text:"Hello.",sources:[],enquiry:false,enquirySummary:""})}]}]}));
  vi.stubGlobal("fetch", fetcher);
  const reply = await openAIAnswer({question:"Hello",history:[],evidence:[],preference:"luna"});
  expect(reply.fallback).toBe(true); expect(reply.model).toContain("5.4-mini");
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(JSON.parse(fetcher.mock.calls[0][1].body).store).toBe(false);
 });
 it("does not retry authentication failures", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response("",{status:401}));
  vi.stubGlobal("fetch",fetcher);
  await expect(openAIAnswer({question:"Hello",history:[],evidence:[]})).rejects.toThrow("401");
  expect(fetcher).toHaveBeenCalledTimes(1);
 });
});
