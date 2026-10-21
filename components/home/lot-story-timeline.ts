export const lotStoryDuration = 14;
export type LotPhase = "receive" | "process" | "verify" | "review" | "dispatch" | "settle" | "settled";
export const lotStageTimes = [1.9, 4.9, 7.9, 14] as const;
export const lotStoryStages = [
  { title: "Receive", caption: "Identifies the lot.", detail: "The lot identity and its requirements establish the context for everything that follows." },
  { title: "Process", caption: "Tracks execution.", detail: "Process events remain associated with VL-001, its equipment and operating conditions." },
  { title: "Verify", caption: "Connects quality evidence.", detail: "Inspection evidence is connected to the lot and its requirements before human review." },
  { title: "Dispatch", caption: "Preserves traceability.", detail: "After human release, the dispatch record preserves the lot’s connected manufacturing history." },
] as const;
export const lotEvidence = ["Requirements", "Process history", "Quality evidence", "Human review and release", "Dispatch record"] as const;
const progress = (time: number, start: number, end: number) => Math.max(0, Math.min(1, (time - start) / (end - start)));

/** One clock owns physical action, evidence availability and the release boundary. */
export function lotStoryStateAt(seconds: number) {
  const time = Math.max(0, Math.min(lotStoryDuration, Number.isFinite(seconds) ? seconds : 0));
  const phase: LotPhase = time < 2 ? "receive" : time < 5 ? "process" : time < 8 ? "verify" : time < 10.5 ? "review" : time < 13 ? "dispatch" : time < 14 ? "settle" : "settled";
  const stage = time < 2 ? 0 : time < 5 ? 1 : time < 10.5 ? 2 : 3;
  const evidence = [1.35, 4.6, 7.7, 10.5, 12.4].map(at => time >= at);
  const activeEvidence = phase === "review" ? 3 : stage === 3 ? 4 : stage;
  return {
    time, phase, stage, evidence, activeEvidence, released: evidence[3], settled: time === lotStoryDuration,
    process: progress(time, 2, 5), inspection: progress(time, 5, 8), review: progress(time, 8, 10.5),
    history: time < 2 ? 0 : time < 5 ? progress(time, 2, 2.6) : time < 10.5 ? 1 + progress(time, 5, 5.6) : 2 + progress(time, 10.5, 11.1),
  };
}
export type LotStoryState = ReturnType<typeof lotStoryStateAt>;
