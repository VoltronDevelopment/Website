import {describe, expect, it} from "vitest";
import {homeCubeDuration, homeCubeHold, homeCubeScramble, homeCubeScrambleEnd} from "../components/home/home-cube-timeline";

describe("Home picture cube", () => {
  it("turns for about six seconds and then takes the same time to solve", () => {
    const scramble = homeCubeScrambleEnd - homeCubeHold;
    const solve = homeCubeDuration - homeCubeScrambleEnd;
    expect(homeCubeScramble).toHaveLength(12);
    expect(scramble).toBeGreaterThan(5);
    expect(scramble).toBeLessThan(6.2);
    expect(solve).toBeCloseTo(scramble);
  });
});
