import {describe,expect,it} from "vitest";
import {localRect,placedRect,sceneClip} from "@/components/navigation/lattice-placement";

describe("Panel-local lattice placement",()=>{
  const panel={x:24,y:24,width:1382,height:3800};
  const from={x:715,y:220,width:536,height:470};
  const to={x:715,y:203,width:536,height:480};
  it("converts viewport bounds to presentation-local coordinates",()=>{
    expect(localRect({x:739,y:227,width:536,height:480},panel)).toEqual(to);
  });
  it("follows scroll throughout the transition rather than snapping at its end",()=>{
    for(const progress of [0,.15,.5,.85,1]){
      const before=placedRect(from,to,panel,progress);
      const after=placedRect(from,to,{...panel,y:panel.y-350},progress);
      expect(after.y).toBeCloseTo(before.y-350);expect(after.x).toBe(before.x);
    }
  });
  it("follows horizontal offsets and uses live destination dimensions",()=>{
    const result=placedRect(from,{...to,width:400},{...panel,x:10},1);
    expect(result).toEqual({x:725,y:227,width:400,height:480});
    expect(placedRect(from,to,panel,2)).toEqual(placedRect(from,to,panel,1));
  });
  it("clips the artwork against its panel and sticky header",()=>{
    expect(sceneClip({x:0,y:-123,width:540,height:480},{x:24,y:-326,width:500,height:600},80)).toEqual({top:203,right:16,bottom:83,left:24});
  });
});
