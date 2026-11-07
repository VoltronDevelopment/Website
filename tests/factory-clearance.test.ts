import {expect,it} from 'vitest';
import {factoryLayout as layout,factoryMechanicalGeometry as g,inspectionJawClosedCenter,operatingState} from '../components/technology/operating-model';

it('keeps the suspended part inside the chamber above its floor and below its roof',()=>{
 const floor=(g.ovenFloorCenter+g.ovenFloorThickness/2)*layout.ovenScale;
 const roof=(g.ovenRoofCenter-g.ovenRoofThickness/2)*layout.ovenScale;
 for(let t=52.8;t<=57.4;t+=.002){const {part}=operatingState(t);if(Math.abs(part.x-layout.ovenX)>1.575*layout.ovenLengthScale)continue;
  expect(part.y-(g.partHeight/2+g.partBevel)*g.partScale-floor).toBeGreaterThan(.015);
  expect(roof-part.y-(g.partHeight/2+g.partBevel)*g.partScale).toBeGreaterThan(.025);
 }
});
it('opens the appropriate leaf pair before the part overlaps either door plane',()=>{
 const halfWidth=(g.partWidth/2+g.partBevel)*g.partScale;
 for(let t=52.8;t<=57.4;t+=.001){const s=operatingState(t);
  for(const direction of [-1,1]){const doorX=layout.ovenX+direction*g.ovenDoorX*layout.ovenLengthScale;
   if(Math.abs(s.part.x-doorX)<halfWidth+g.ovenDoorThickness*layout.ovenLengthScale/2){
    const opening=direction===1?s.ovenEntryOpen:s.ovenExitOpen;
    expect(opening*1.2).toBeGreaterThan(g.partDepth*g.partScale/2+.04);
   }
  }
 }
});
it('leaves a continuous clear suspension slot through the roof and door guides',()=>{
 const outerHanger=g.hangerOffset+g.hangerThickness/2;
 expect(g.ovenGuideSlot/2-outerHanger).toBeGreaterThan(.07);
 expect(g.ovenRoofSlot/2-outerHanger).toBeGreaterThan(.07);
});
it('brings inspection jaws to the part without interpenetration or a visible loose gap',()=>{
 const partEdge=(g.partWidth/2+g.partBevel)*g.partScale;
 expect(inspectionJawClosedCenter-g.jawWidth/2-partEdge).toBeCloseTo(.005);
 for(let t=61.5;t<=67;t+=.01){const {clamp}=operatingState(t),center=g.jawOpenCenter+(inspectionJawClosedCenter-g.jawOpenCenter)*clamp;
  expect(center-g.jawWidth/2).toBeGreaterThanOrEqual(partEdge);
 }
 expect(operatingState(62).clamp).toBe(1);expect(operatingState(66.5).clamp).toBe(1);expect(operatingState(67).clamp).toBe(0);
});
