import {describe,expect,it} from "vitest";
import {Vector3} from "three";
import {commonsRoot,cultureCarryHeight,cultureDestination,cultureSize,durations,heroCells,humanHeroState} from "../components/brand/human-hero-timeline";

describe("Commons and Culture hero stories",()=>{
  it("anchors the Commons root at a foundation junction and leaves the upper emblem open",()=>{
    const base=heroCells("commons").filter(cell=>!cell.satellite);
    expect(base.some(cell=>cell.centre.every((value,axis)=>Math.abs(Math.abs(value-commonsRoot[axis])-cell.size/2)<.001))).toBe(true);
    expect(base.every(cell=>cell.centre[1]+cell.size/2<=1.8)).toBe(true);
    expect(heroCells("commons").filter(cell=>cell.satellite)).toHaveLength(2);
  });
  it("establishes a Culture gap matching the held cube without intersecting neighbouring cubes",()=>{
    for(const cell of heroCells("culture")){
      expect(cell.centre.some((value,axis)=>Math.abs(value-cultureDestination[axis])>=(cell.size+cultureSize)/2-.001)).toBe(true);
    }
  });
  it("establishes the hand before the cube descends and finishes placement before settling",()=>{
    expect(humanHeroState("culture",.8).hand).toBeGreaterThan(0);
    expect(humanHeroState("culture",2.2).heldCube).toBe(1);
    expect(humanHeroState("culture",2.2).drop).toBe(0);
    expect(humanHeroState("culture",3.6).drop).toBe(1);
    expect(humanHeroState("culture",3.6).settle).toBe(0);
  });
  it("leaves half a projected cell of clearance below the held cube",()=>{
    const direction=new Vector3(6,3.5,8).normalize(),right=new Vector3().crossVectors(new Vector3(0,1,0),direction).normalize();
    const up=new Vector3().crossVectors(direction,right).normalize();
    const highest=Math.max(...heroCells("culture").flatMap(cell=>Array.from({length:8},(_,i)=>new Vector3(cell.centre[0]+(i&1?1:-1)*cell.size/2,cell.centre[1]+(i&2?1:-1)*cell.size/2,cell.centre[2]+(i&4?1:-1)*cell.size/2).dot(up))));
    const projectedHeight=cultureSize*(Math.abs(up.x)+Math.abs(up.y)+Math.abs(up.z));
    const gap=cultureCarryHeight*up.y-projectedHeight/2-highest;
    expect(gap/projectedHeight).toBeGreaterThan(.45);expect(gap/projectedHeight).toBeLessThan(.55);
  });
  it("provides completed compositions for reduced motion and clamps oversized elapsed time",()=>{
    for(const kind of ["commons","culture"] as const){
      const s=humanHeroState(kind,0,true);expect(s.done).toBe(true);expect(s.cells.every(value=>value===1)).toBe(true);
      expect(humanHeroState(kind,100).time).toBe(durations[kind]);
    }
  });
});
