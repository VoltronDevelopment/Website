import {describe,it,expect} from "vitest";
import {cellsAt,homeCells,transitionMix,canMorph,viewForPath} from "@/components/navigation/lattice-transition";
import {cells as technologyCells} from "@/components/home/technology-hero-timeline";
describe("Persistent lattice transition",()=>{
  it("preserves each logical cube at the approved endpoints",()=>{
    expect(cellsAt(0)).toEqual(homeCells);expect(cellsAt(1)).toEqual(technologyCells);
    expect(cellsAt(.5)).toHaveLength(7);
  });
  it("can reverse smoothly from an interrupted intermediate composition",()=>{
    const intermediate=transitionMix(0,1,.4);
    expect(transitionMix(intermediate,0,0)).toBe(intermediate);
    expect(transitionMix(intermediate,0,1)).toBe(0);
    expect(transitionMix(0,1,-1)).toBe(0);expect(transitionMix(0,1,2)).toBe(1);
  });
  it("uses the rich transition only when the hero can participate",()=>{
    const ready={width:1440,reduced:false,saveData:false,visible:1,settled:true,fallback:false};
    expect(canMorph(ready)).toBe(true);
    for(const change of [{width:390},{reduced:true},{saveData:true},{visible:.2},{settled:false},{fallback:true}])expect(canMorph({...ready,...change})).toBe(false);
  });
  it("does not morph the Home lattice into the new object-based Technology scene",()=>{
    expect(viewForPath("/")).toBe("home");expect(viewForPath("/technology")).toBeNull();expect(viewForPath("/enter")).toBeNull();expect(viewForPath("/ontology")).toBeNull();
  });
});
