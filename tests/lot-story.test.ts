import { describe, expect, it } from "vitest";
import { lotEvidence, lotStageTimes, lotStoryDuration, lotStoryStateAt } from "../components/home/lot-story-timeline";

describe("one lot and connected evidence", () => {
  it("starts with a known lot and pending records", () => {
    const state = lotStoryStateAt(0); expect(state.stage).toBe(0); expect(state.phase).toBe("receive");
    expect(state.evidence).toEqual([false, false, false, false]);
  });
  it("accumulates requirements, process history and quality evidence in order", () => {
    expect(lotStoryStateAt(1.6).evidence).toEqual([true, false, false, false]);
    expect(lotStoryStateAt(4.2).evidence).toEqual([true, true, false, false]);
    expect(lotStoryStateAt(7.4).evidence).toEqual([true, true, true, false]);
  });
  it("keeps the lot at Verify until it is cleared for dispatch", () => {
    const state = lotStoryStateAt(7.4); expect(state.phase).toBe("verify"); expect(state.stage).toBe(2); expect(state.activeEvidence).toBe(2);
    expect(state.released).toBe(false); expect(state.evidence[3]).toBe(false); expect(state.position).toBe(2); expect(state.moving).toBe(false);
  });
  it("requires the dispatch record only after the earlier evidence, including arbitrary seek positions", () => {
    expect(lotEvidence.indexOf("Quality evidence")).toBeLessThan(lotEvidence.indexOf("Dispatch record"));
    expect(lotEvidence).toHaveLength(4);
    for (let time = 0; time < 15; time += .031) {
      const state = lotStoryStateAt(time);
      if (state.stage === 3) expect(state.released).toBe(true);
      if (state.evidence[3]) expect(state.evidence.slice(0, 3).every(Boolean)).toBe(true);
      for (let i = 1; i < state.evidence.length; i++) if (state.evidence[i]) expect(state.evidence[i - 1]).toBe(true);
    }
  });
  it("provides coherent static snapshots for navigation", () => {
    expect(lotStageTimes.map(time => lotStoryStateAt(time).stage)).toEqual([0, 1, 2, 3]);
    expect(lotStageTimes.map(time => lotStoryStateAt(time).phase)).toEqual(["receive", "process", "verify", "dispatch"]);
    const dispatch = lotStoryStateAt(lotStageTimes[3]); expect(dispatch.evidence.every(Boolean)).toBe(true); expect(dispatch.departure).toBe(0);
  });
  it("holds a completed Dispatch composition after the departure particles clear", () => {
    const state = lotStoryStateAt(lotStoryDuration); expect(state.phase).toBe("settled"); expect(state.settled).toBe(true);
    expect(state.stage).toBe(3); expect(state.evidence.every(Boolean)).toBe(true);
    expect(lotStoryStateAt(100)).toEqual(state); expect(lotStoryStateAt(NaN).time).toBe(0);
  });
  it('forms at Receive, travels monotonically and dissolves only after dispatch evidence',()=>{
    expect(lotStoryStateAt(0).formation).toBe(0);expect(lotStoryStateAt(1.35).formation).toBe(1);let previous=0;
    for(let t=0;t<=lotStoryDuration;t+=.025){const s=lotStoryStateAt(t);expect(s.position).toBeGreaterThanOrEqual(previous);previous=s.position;if(t<8.7)expect(s.position).toBeLessThanOrEqual(2);if(s.departure>0){expect(s.released).toBe(true);expect(s.evidence.every(Boolean)).toBe(true);}}
    expect(lotStoryStateAt(7.4).position).toBe(2);expect(lotStoryStateAt(7.4).moving).toBe(false);expect(lotStoryStateAt(lotStoryDuration).departure).toBe(1);
  });
});
