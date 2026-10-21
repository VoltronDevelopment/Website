import { describe, expect, it } from "vitest";
import { duration, gridOpacityAt, latticeWaveAt, offsets, stateAt } from "../components/home/hero-timeline";

describe("approved homepage hero sequence", () => {
  it("assembles four base cells before the three upper cells", () => {
    const state=stateAt(3);
    expect(offsets).toHaveLength(7);
    expect(state.arrivals.slice(0,4).every(cell=>cell.travel===1)).toBe(true);
    expect(state.arrivals.slice(4).every(cell=>cell.travel<1)).toBe(true);
  });
  it("reveals the logo only after all seven cells have settled", () => {
    expect(stateAt(5).arrivals.every(cell=>cell.travel===1)).toBe(true);
    expect(stateAt(5.4).logo).toBe(0);
    expect(stateAt(6).logo).toBe(1);
    expect(stateAt(6).resolve).toBe(1);
  });
  it("sends a finite illumination wave outwards without pulsing the logo", () => {
    expect(latticeWaveAt(5.7,0)).toBeGreaterThan(0);
    expect(latticeWaveAt(5.7,3)).toBe(0);
    expect(latticeWaveAt(duration,0)).toBe(0);
    expect(latticeWaveAt(duration,3)).toBe(0);
    expect(stateAt(7).pulse).toBe(0);
  });
  it("keeps a faint grid in both themes after breathing finishes", () => {
    expect(gridOpacityAt(duration)).toBe(.03);
    expect(gridOpacityAt(duration,true)).toBe(.035);
    expect(gridOpacityAt(2.75)).toBeGreaterThan(gridOpacityAt(duration));
  });
  it("clamps elapsed time and supplies a complete reduced-motion state", () => {
    expect(stateAt(-1).time).toBe(0);
    expect(stateAt(100).time).toBe(duration);
    expect(stateAt(duration).done).toBe(true);
    expect(stateAt(duration).logo).toBe(1);
  });
});
