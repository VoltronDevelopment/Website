import { describe, expect, it } from "vitest";
import { cells, coreCentre, coreSize, duration, latticeWaveAt, missingCell, outerGap, stateAt, upperHeight } from "../components/home/technology-hero-timeline";

describe("Technology lattice composition and sequence", () => {
  it("spaces seven outer cubes around the exact centre of an eight-position envelope", () => {
    const keys=new Set(cells.map(cell=>cell.join(",")));
    expect(cells).toHaveLength(7);
    expect(cells.filter(cell=>cell[1]===.5)).toHaveLength(4);
    expect(cells.filter(cell=>cell[1]===upperHeight)).toHaveLength(3);
    expect(coreSize).toBeLessThan(1);
    expect(keys.has(coreCentre.join(","))).toBe(false);
    expect(keys.size).toBe(cells.length);
    expect(outerGap).toBeCloseTo(coreSize);
    const envelope=[...cells,missingCell];
    for(const axis of [0,1,2]) {
      const centre=envelope.reduce((sum,cell)=>sum+cell[axis],0)/8;
      expect(centre).toBeCloseTo(coreCentre[axis]);
    }
    for(const [index,cell] of cells.entries()) {
      const intersectsCore=cell.every((value,axis)=>Math.abs(value-coreCentre[axis])<(1+coreSize)/2-1e-9);
      expect(intersectsCore).toBe(false);
      const nearestCorner=cell.map((value,axis)=>value-Math.sign(value-coreCentre[axis])*.5);
      for(const axis of [0,1,2])expect(Math.abs(nearestCorner[axis]-coreCentre[axis])).toBeCloseTo(coreSize/2);
      for(const other of cells.slice(index+1)) {
        const faceGap=Math.max(...cell.map((value,axis)=>Math.abs(value-other[axis])))-1;
        expect(faceGap).toBeGreaterThanOrEqual(outerGap-1e-9);
      }
    }
  });
  it("reveals the core first and holds it while outer cubes assemble", () => {
    expect(stateAt(.15).core).toBe(0);
    expect(stateAt(.5).core).toBeGreaterThan(0);
    const first=stateAt(.9);
    expect(first.core).toBe(1);
    expect(first.arrivals.every(cell=>!cell.visible)).toBe(true);
    expect(first.connection).toBe(0);
    expect(first.logo).toBe(0);
    const state=stateAt(3.9);
    expect(state.arrivals.slice(0,4).every(cell=>cell.travel===1)).toBe(true);
    expect(state.arrivals[6].visible).toBe(false);
    expect(state.core).toBe(1);
    expect(state.logo).toBe(0);
  });
  it("resolves shared geometry after arrival and reveals the logo afterward", () => {
    expect(stateAt(5.5).resolve).toBe(0);
    expect(stateAt(5.6).arrivals.every(cell=>cell.travel===1)).toBe(true);
    expect(stateAt(6.05).resolve).toBe(1);
    expect(stateAt(6.05).core).toBe(1);
    expect(stateAt(6.05).connection).toBe(0);
    expect(stateAt(6.7).connection).toBe(1);
    expect(stateAt(6.7).logo).toBe(0);
    expect(stateAt(7.5).logo).toBe(1);
  });
  it("settles illumination and motion into the reduced-motion final composition", () => {
    const final=stateAt(duration);
    expect(final.done).toBe(true);
    expect(final.resolve).toBe(1);
    expect(final.logo).toBe(1);
    expect(final.core).toBe(1);
    expect(final.connection).toBe(1);
    expect(final.arrivals.every(cell=>cell.travel===1)).toBe(true);
    expect(latticeWaveAt(7.5,0)).toBeGreaterThan(0);
    expect(latticeWaveAt(duration,0)).toBe(0);
    expect(latticeWaveAt(duration,3)).toBe(0);
    expect(stateAt(-1).time).toBe(0);
    expect(stateAt(100).time).toBe(duration);
  });
});
