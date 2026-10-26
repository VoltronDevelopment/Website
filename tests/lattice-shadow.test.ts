import {describe,it,expect} from "vitest";
import {contactShadow} from "@/components/home/lattice-lighting";
import {stateAt,starts} from "@/components/home/hero-timeline";
import {stateAt as technologyState} from "@/components/home/technology-hero-timeline";

describe("Cube-attached contact shadows",()=>{
  it("never precedes its arriving cube",()=>{
    for(const time of [0,.1,.3,.8,1.8,3,5,11]){
      for(const state of [stateAt(time),technologyState(time)])for(const arrival of state.arrivals){
        if(!arrival.visible)expect(contactShadow(arrival.progress,.2).opacity).toBe(0);
      }
    }
  });
  it("reveals each shadow on its own arrival schedule",()=>{
    const first=stateAt(starts[0]+.05),second=first.arrivals[1];
    expect(contactShadow(first.arrivals[0].progress,.1).opacity).toBeGreaterThan(0);
    expect(contactShadow(second.progress,.1).opacity).toBe(0);
  });
  it("softens while raised and becomes a tight contact shadow on landing",()=>{
    expect(contactShadow(1,0)).toEqual({opacity:1,scale:1});
    expect(contactShadow(1,.4).opacity).toBeLessThan(1);
    expect(contactShadow(1,.4).scale).toBeGreaterThan(1);
    expect(contactShadow(1,-.2)).toEqual(contactShadow(1,0));
  });
});
