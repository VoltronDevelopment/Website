import { describe, expect, it } from "vitest";
import { entryDuration, entryFlipDuration, entryHoldDuration, entryStateAt } from "../components/entry/entry-timeline";

describe("face-flip brand entry",()=>{
  it("holds the original logo until five seconds",()=>{
    expect(entryStateAt(2)).toMatchObject({logo:1,wordmark:0,face:0,turn:0});
    expect(entryStateAt(5)).toMatchObject({face:0,turn:0,entrance:0});
  });
  it("reveals the fourteen-letter wordmark horizontally",()=>{
    expect(entryStateAt(2.6).wordmark).toBe(0);
    expect(entryStateAt(3.7).wordmark).toBeCloseTo(.5);
    expect(entryStateAt(4.8).wordmark).toBe(1);
  });
  it("holds each campaign phrase for three seconds between face turns",()=>{
    for(let face=1;face<=3;face++){
      const settled=5+(face-1)*(entryFlipDuration+entryHoldDuration)+entryFlipDuration;
      expect(entryStateAt(settled+.001)).toMatchObject({face,turn:face,entrance:0});
      expect(entryStateAt(settled+entryHoldDuration-.001)).toMatchObject({face,turn:face,entrance:0});
    }
  });
  it("changes face content only at the edge-on midpoint",()=>{
    expect(entryStateAt(5.39).face).toBe(0);
    expect(entryStateAt(5.41).face).toBe(1);
    expect(entryStateAt(5.4).turn).toBeCloseTo(.5);
  });
  it("enables the final clickable face only when the last turn settles",()=>{
    expect(entryStateAt(entryDuration-.01)).toMatchObject({face:4,entrance:0,done:false});
    expect(entryStateAt(entryDuration)).toMatchObject({face:4,turn:4,entrance:1,done:true});
  });
  it("provides a complete reduced-motion state",()=>{
    expect(entryStateAt(entryDuration)).toMatchObject({done:true,phase:8,logo:1,wordmark:1,face:4,entrance:1});
    expect(entryStateAt(100)).toEqual(entryStateAt(entryDuration));
    expect(entryStateAt(-1).time).toBe(0);
  });
});
