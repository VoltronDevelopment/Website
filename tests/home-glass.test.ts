import {describe,expect,it} from "vitest";
import {glassFace,setGlass} from "../components/home/lattice-materials";
import {cloneArtworkMaterial,homePaneRole,homeCellTone} from "../components/home/home-glass";
import {homeCells} from "../components/navigation/lattice-transition";

describe("Home glass isolation and theme continuity",()=>{
  it('balances two pearl and two smoked cells in the retained base',()=>{
    expect(homeCells.filter(cell=>homeCellTone(cell)==='light')).toEqual([[.5,.5,-.5],[.5,.5,.5],[.5,1.5,-.5],[-.5,1.5,.5]]);
    expect(homeCells.filter(cell=>homeCellTone(cell)==='dark')).toHaveLength(3);
    const ink=glassFace('front',false,true,'home','backing'),ice=glassFace('front',true,true,'home','near');
    ink.userData.homeCellTone='dark';ice.userData.homeCellTone='light';
    for(const night of [false,true]){setGlass(ink,'front',night);setGlass(ice,'front',night);expect(ink.color.getHSL({h:0,s:0,l:0}).l).toBeLessThan(.04);expect(ice.color.getHSL({h:0,s:0,l:0}).l).toBeGreaterThan(.8);}
    ink.dispose();ice.dispose();
  });
  it('assigns the two real panes behind the missing cell a quiet optical backing',()=>{
    expect(homePaneRole([.5,1.5,-.5],[0,0,1])).toBe('backing');expect(homePaneRole([-.5,1.5,.5],[1,0,0])).toBe('backing');
    expect(homePaneRole([.5,.5,.5],[0,0,1])).toBe('near');expect(homePaneRole([-.5,1.5,-.5],[0,1,0])).toBe('crown');
    const pane=glassFace('front',true,true,'home','backing');expect(pane.opacity).toBeGreaterThan(.5);pane.dispose();
  });
  it("keeps the optical preset and reflection hooks on arrival/illuminated clones",()=>{
    const source=glassFace("side",false,true,"home"),copy=cloneArtworkMaterial(source);
    const reflection=source.onBeforeCompile;
    expect(copy.onBeforeCompile).toBe(reflection);expect(copy.customProgramCacheKey()).toBe(source.customProgramCacheKey());
    setGlass(source,"side",true);copy.copy(source);
    expect(copy.userData.glassProfile).toBe("home");expect(copy.onBeforeCompile).toBe(reflection);
    expect(copy.color.equals(source.color)).toBe(true);expect(copy.opacity).toBe(source.opacity);
    setGlass(source,"side",false);expect(source.opacity).toBeLessThan(copy.opacity);
    source.dispose();copy.dispose();
  });
  it('uses dark quiet backing in night mode and milky white backing in daylight',()=>{
    const dark=glassFace('front',true,true,'home','backing'),light=glassFace('front',false,true,'home','backing');
    const luma=(m:typeof dark)=>m.color.r*.2126+m.color.g*.7152+m.color.b*.0722;
    expect(luma(dark)).toBeLessThan(.02);expect(luma(light)).toBeGreaterThan(.9);
    expect(dark.envMapIntensity).toBeLessThan(.1);expect(dark.emissiveIntensity).toBeLessThan(.01);
    expect(dark.opacity).toBeGreaterThan(.9);expect(light.opacity).toBeGreaterThan(.8);
    dark.dispose();light.dispose();
  });
  it("preserves the existing studio profile for scenes that have not been reviewed",()=>{
    const standard=glassFace("side",false,true),home=glassFace("side",false,true,"home"),front=glassFace("front",false,true,"home");
    expect(standard.opacity).toBe(.46);expect(standard.envMapIntensity).toBe(1.15);
    expect(home.customProgramCacheKey()).not.toBe(standard.customProgramCacheKey());
    expect(front.opacity).toBeLessThan(home.opacity);expect(home.envMapIntensity).toBeGreaterThan(standard.envMapIntensity);
    standard.dispose();home.dispose();front.dispose();
  });
});
