import { describe, expect, it } from "vitest";
import { alphaDuration, alphaImmersedY, alphaLoadingX, alphaRaisedY, alphaStateAt, alphaStations, alphaUnloadY, alphaUnloadingX } from "../components/home/alpha-process-timeline";

describe("Alpha treatment choreography", () => {
  it.each([2.5, 8.9, 15.3])("holds fully immersed for two seconds at station starting %s", start => {
    for (const offset of [1.1, 2.1, 3.099]) {
      const state = alphaStateAt(start + offset);
      expect(state.phase).toBe("hold");
      expect(state.y).toBe(alphaImmersedY);
      expect(state.attached).toBe(true);
    }
    expect(alphaStateAt(start + 3.101).phase).toBe("raise");
  });
  it("allows horizontal transfers only at clearance height with the panel attached", () => {
    for (let time = 0; time < 22.8; time += .025) {
      const state = alphaStateAt(time);
      if (state.phase === "travel") {
        expect(state.y).toBe(alphaRaisedY);
        expect(state.attached).toBe(true);
      }
      if (["lower", "hold", "raise", "drain"].includes(state.phase)) {
        expect(state.x).toBe(alphaStations[state.stage - 1]);
      }
    }
  });
  it("coats during Tank 2, retaining the finished material through unloading", () => {
    expect(alphaStateAt(7).coating).toBe(0);
    expect(alphaStateAt(10).coating).toBeCloseTo(0);
    expect(alphaStateAt(11).coating).toBeCloseTo(.5);
    expect(alphaStateAt(12.1).coating).toBe(1);
    expect(alphaStateAt(22.8).coating).toBe(1);
  });
  it("releases only after reaching the receiving platform, then lifts the empty fixture", () => {
    const release = alphaStateAt(22.8);
    expect(release.x).toBe(alphaUnloadingX);
    expect(release.y).toBe(alphaUnloadY);
    expect(release.attached).toBe(false);
    expect(release.finishedOpacity).toBe(1);
    expect(alphaStateAt(23).jawOpen).toBe(1);
    expect(alphaStateAt(23).y).toBeGreaterThan(alphaUnloadY);
    expect(alphaStateAt(24).y).toBeGreaterThan(alphaUnloadY);
    expect(alphaStateAt(25).attached).toBe(false);
  });
  it("returns and removes the finished part before the seamless 28-second reset", () => {
    const end = alphaStateAt(alphaDuration - .001);
    expect(end.x).toBe(alphaLoadingX);
    expect(end.y).toBe(alphaRaisedY);
    expect(end.finishedOpacity).toBe(0);
    expect(alphaStateAt(alphaDuration)).toEqual(alphaStateAt(0));
    expect(alphaStateAt(alphaDuration + 11).coating).toBeCloseTo(.5);
  });
});
