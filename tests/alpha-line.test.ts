import { describe, expect, it } from "vitest";
import { alphaLineChapters, alphaLinePath, alphaLineStations } from "../components/manufacturing/alpha-line-config";
import { alphaLineChapterPreview, alphaLineCorners, alphaLineDeviationDuration, alphaLineDeviationStateAt, alphaLineDuration, alphaLineImmersedY, alphaLineRaisedY, alphaLineSchedule, alphaLineStateAt, alphaLineUnloadY } from "../components/manufacturing/alpha-line-timeline";
import { spaceAlphaLineLabels } from "../components/manufacturing/alpha-line-framing";
import { alphaLineStory } from "../components/manufacturing/alpha-line-story";

describe("Alpha square-U guided plant", () => {
  it("has exactly 13 unique ordered tanks and distinct loading and unloading bays", () => {
    expect(alphaLineStations.filter(s => s.kind === "tank").map(s => s.id)).toEqual(Array.from({length:13}, (_,i) => `T${String(i+1).padStart(2,"0")}`));
    expect(alphaLineStations[0].x).toBe(alphaLineStations[14].x);
    expect(alphaLineStations[0].z).not.toBe(alphaLineStations[14].z);
  });
  it("uses straight axis-aligned runs and two right-angle corners", () => {
    const path = alphaLinePath();
    expect(path.filter(p => p.corner)).toHaveLength(2);
    path.slice(1).forEach((p,i) => expect((p.x === path[i].x) !== (p.z === path[i].z)).toBe(true));
    alphaLineCorners().forEach(c => expect(Math.abs(c.after-c.before)).toBeCloseTo(Math.PI/2));
  });
  it("gives every tank a full two-second hold and a drain before the next transfer", () => {
    const holds = alphaLineSchedule.filter(e => e.kind === "hold");
    expect(holds).toHaveLength(13);
    holds.forEach(e => expect(e.t1-e.t0).toBeCloseTo(2));
    expect(alphaLineSchedule.filter(e => e.kind === "drain")).toHaveLength(13);
    expect(alphaLineDuration).toBeGreaterThan(70); expect(alphaLineDuration).toBeLessThan(85);
  });
  it("stops above both square corners and rotates before continuing", () => {
    const turns = alphaLineSchedule.filter(e => e.kind === "turn"); expect(turns).toHaveLength(2);
    turns.forEach(e => {
      const start = alphaLineStateAt(e.t0 + .001), middle = alphaLineStateAt((e.t0+e.t1)/2), end = alphaLineStateAt(e.t1-.001);
      expect([start.x,start.z]).toEqual([end.x,end.z]); expect(middle.y).toBe(alphaLineRaisedY);
      expect(Math.abs(end.yaw-start.yaw)).toBeCloseTo(Math.PI/2, 4); expect(middle.attached).toBe(true);
      const before = alphaLineStateAt(e.t0-.001), after = alphaLineStateAt(e.t1+.001);
      expect(Math.hypot(before.x-start.x,before.z-start.z)).toBeLessThan(.001);
      expect(Math.abs(after.yaw-end.yaw)).toBeLessThan(.001);
    });
  });
  it("keeps the load attached at clearance through every transfer, turn and drain", () => {
    for(let t=0;t<alphaLineDuration;t+=.013){ const s=alphaLineStateAt(t);
      if(["travel","turn","drain"].includes(s.phase)) { expect(s.y).toBe(alphaLineRaisedY); expect(s.attached).toBe(true); expect(s.y-.83-.63).toBeGreaterThan(2.115); }
      if(s.phase === "hold") { expect(s.y).toBe(alphaLineImmersedY); expect(s.y-.83+.63).toBeLessThan(1.82); }
    }
  });
  it("changes coating only while the panel is immersed at Tank 07", () => {
    const coat=alphaLineSchedule.find(e => e.stationId === "T07" && e.kind === "hold")!;
    expect(alphaLineStateAt(coat.t0).coating).toBe(0); expect(alphaLineStateAt((coat.t0+coat.t1)/2).coating).toBeCloseTo(.5); expect(alphaLineStateAt(coat.t1).coating).toBe(1);
  });
  it("sets the part onto the platform before detaching and lifts the empty fixture clear", () => {
    const release=alphaLineSchedule.find(e => e.kind === "release")!;
    const before=alphaLineStateAt(release.t0+.15*(release.t1-release.t0));
    expect(before.attached).toBe(true); expect(before.y).toBe(alphaLineUnloadY);
    const after=alphaLineStateAt(release.t0+.21*(release.t1-release.t0));
    expect(after.attached).toBe(false); expect(after.finishedOpacity).toBe(1); expect(after.partOpacity).toBe(0);
    expect(alphaLineStateAt(alphaLineDuration).y).toBe(alphaLineRaisedY);
  });
  it("keeps processing completion separate from quality release and dispatch", () => {
    for(let t=0;t<=alphaLineDuration;t+=.11){const s=alphaLineStateAt(t); expect(s.qualityReleased).toBe(false); expect(s.dispatched).toBe(false); expect(s.equipmentCommand).toBeNull();}
    const end=alphaLineStateAt(alphaLineDuration); expect(end.processingComplete).toBe(true); expect(end.finishedOpacity).toBe(1);
  });
  it("provides readable manual chapter poses, including a submerged processing panel", () => {
    alphaLineChapters.forEach(c => expect(alphaLineStateAt(alphaLineChapterPreview(c.id)).chapter).toBe(c.id));
    expect(alphaLineStateAt(alphaLineChapterPreview("processing")).phase).toBe("hold");
  });
  it("keeps one affected lot stationary through all six governed deviation steps", () => {
    const steps=Array.from({length:6},(_,i)=>alphaLineDeviationStateAt(i*3.2));
    expect(steps.map(s=>s.deviationStep)).toEqual([0,1,2,3,4,5]);
    steps.forEach(s => { expect(s.stationId).toBe("T06"); expect([s.x,s.y,s.z]).toEqual([steps[0].x,steps[0].y,steps[0].z]); expect(s.equipmentCommand).toBeNull(); expect(s.qualityReleased).toBe(false); expect(alphaLineStory(s,"intelligence").rows).toHaveLength(3); });
    expect(alphaLineDeviationStateAt(alphaLineDeviationDuration+10).deviationStep).toBe(5);
  });
});

describe("Alpha narrow overview labels", () => {
  it("separates the compressed short-leg labels while retaining their horizontal anchors", () => {
    const labels = [ {x:160,y:115,width:18,height:17}, {x:200,y:120,width:18,height:17}, {x:205,y:132,width:18,height:17}, {x:210,y:144,width:18,height:17}, {x:220,y:159,width:18,height:17} ];
    const spaced = spaceAlphaLineLabels(labels, 248, 250);
    expect(spaced.map(p=>p.x)).toEqual(labels.map(p=>p.x));
    for(let i=0;i<spaced.length;i++) for(let j=i+1;j<spaced.length;j++) {
      const a=spaced[i], b=spaced[j];
      expect(Math.abs(a.x-b.x)>=(a.width+b.width)/2 || Math.abs(a.y-b.y)>=(a.height+b.height)/2).toBe(true);
      expect(a.y+a.height/2).toBeLessThanOrEqual(246);
    }
  });
  it("retains uncrowded station anchors", () => {
    const labels=[{x:30,y:30,width:18,height:17},{x:70,y:40,width:18,height:17},{x:110,y:50,width:18,height:17}];
    expect(spaceAlphaLineLabels(labels,318,265)).toEqual(labels);
  });
});
