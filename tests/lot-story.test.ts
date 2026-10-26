import { describe, expect, it } from "vitest";
import { lotEvidence, lotStageTimes, lotStoryDuration, lotStoryStateAt } from "../components/home/lot-story-timeline";

describe("one lot and connected evidence", () => {
  it("starts with a known lot and pending records", () => {
    const state = lotStoryStateAt(0); expect(state.stage).toBe(0); expect(state.phase).toBe("receive");
    expect(state.evidence).toEqual([false, false, false, false, false]);
  });
  it("accumulates requirements, process history and quality evidence in order", () => {
    expect(lotStoryStateAt(1.9).evidence).toEqual([true, false, false, false, false]);
    expect(lotStoryStateAt(4.9).evidence).toEqual([true, true, false, false, false]);
    expect(lotStoryStateAt(8).evidence).toEqual([true, true, true, false, false]);
  });
  it("keeps review on Verify until human release is recorded", () => {
    const state = lotStoryStateAt(9); expect(state.phase).toBe("review"); expect(state.stage).toBe(2); expect(state.activeEvidence).toBe(3);
    expect(state.released).toBe(false); expect(state.evidence[4]).toBe(false);
  });
  it("requires release before dispatch, including arbitrary seek positions", () => {
    expect(lotEvidence.indexOf("Human review and release")).toBeLessThan(lotEvidence.indexOf("Dispatch record"));
    for (let time = 0; time < 15; time += .031) {
      const state = lotStoryStateAt(time);
      if (state.stage === 3) expect(state.released).toBe(true);
      if (state.evidence[4]) expect(state.evidence.slice(0, 4).every(Boolean)).toBe(true);
      for (let i = 1; i < state.evidence.length; i++) if (state.evidence[i]) expect(state.evidence[i - 1]).toBe(true);
    }
  });
  it("provides coherent static snapshots for navigation", () => {
    expect(lotStageTimes.map(time => lotStoryStateAt(time).stage)).toEqual([0, 1, 2, 3]);
    expect(lotStageTimes.map(time => lotStoryStateAt(time).phase)).toEqual(["receive", "process", "verify", "dispatch"]);
    const dispatch = lotStoryStateAt(lotStageTimes[3]); expect(dispatch.evidence.every(Boolean)).toBe(true);
  });
  it("holds a completed Dispatch composition after fourteen seconds", () => {
    const state = lotStoryStateAt(lotStoryDuration); expect(state.phase).toBe("settled"); expect(state.settled).toBe(true);
    expect(state.stage).toBe(3); expect(state.evidence.every(Boolean)).toBe(true);
    expect(lotStoryStateAt(100)).toEqual(state); expect(lotStoryStateAt(NaN).time).toBe(0);
  });
  it('forms at Receive, travels monotonically and dissolves only after release and dispatch evidence',()=>{
    expect(lotStoryStateAt(0).formation).toBe(0);expect(lotStoryStateAt(1.3).formation).toBe(1);let previous=0;
    for(let t=0;t<=14;t+=.025){const s=lotStoryStateAt(t);expect(s.position).toBeGreaterThanOrEqual(previous);previous=s.position;if(t<10.5)expect(s.position).toBeLessThanOrEqual(2);if(s.departure>0){expect(s.released).toBe(true);expect(s.evidence.every(Boolean)).toBe(true);}}
    expect(lotStoryStateAt(9).position).toBe(2);expect(lotStoryStateAt(9).moving).toBe(false);expect(lotStoryStateAt(14).departure).toBe(1);
  });
});
