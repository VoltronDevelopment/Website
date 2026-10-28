export const lotStoryDuration = 16;
export type LotPhase = "receive" | "process" | "verify" | "dispatch" | "settle" | "settled";
export const lotStageTimes = [1.6, 4.2, 7.4, 10.2] as const;
export const lotStoryStages = [
  { title: "Receive", caption: "Identifies the lot.", detail: "The lot identity and its requirements establish the context for everything that follows." },
  { title: "Process", caption: "Tracks execution.", detail: "Process events remain associated with VL-001, its equipment and operating conditions." },
  { title: "Verify", caption: "Connects quality evidence.", detail: "Inspection evidence is connected to the lot and its requirements." },
  { title: "Dispatch", caption: "Preserves traceability.", detail: "The dispatch record preserves the lot’s connected manufacturing history." },
] as const;
export const lotEvidence = ["Requirements", "Process history", "Quality evidence", "Dispatch record"] as const;
const progress = (time: number, start: number, end: number) => Math.max(0, Math.min(1, (time - start) / (end - start)));
const ease=(v:number)=>v*v*(3-2*v);

/** One clock owns the four stations. Quality evidence is recorded before the lot leaves Verify. */
export function lotStoryStateAt(seconds: number) {
  const time = Math.max(0, Math.min(lotStoryDuration, Number.isFinite(seconds) ? seconds : 0));
  const phase: LotPhase = time < 2.9 ? "receive" : time < 6.2 ? "process" : time < 9.6 ? "verify" : time < 15.2 ? "dispatch" : time < 16 ? "settle" : "settled";
  const stage = time < 2.9 ? 0 : time < 6.2 ? 1 : time < 9.6 ? 2 : 3;
  const evidence = [1.5, 4, 7.2, 10].map(at => time >= at);
  const moves=[[1.9,2.7],[5.15,5.95],[8.7,9.5]].map(([a,b])=>ease(progress(time,a,b)));
  const position=moves.reduce((a,b)=>a+b,0),formation=ease(progress(time,0,1.35)),departure=ease(progress(time,11.2,14.6));
  return {
    time, phase, stage, evidence, activeEvidence: stage, released: time >= 9.5, settled: time === lotStoryDuration,
    process: progress(time, 2.9, 5.05), inspection: progress(time, 6.2, 8.5),
    history:position,position,formation,departure,belt:position+departure*.65,
    moving:moves.some(v=>v>0&&v<1),
  };
}
export type LotStoryState = ReturnType<typeof lotStoryStateAt>;
