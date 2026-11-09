import {factoryBathGeometry} from '../components/technology/factory-bath-model';
import {describe,it,expect} from 'vitest';
import {operatingState,operatingEntities,operatingEdges,OPERATING_DURATION,operatingTimes as T,handlingGeometry as H} from '../components/technology/operating-model';
import {digitalGraphState,twinPoint} from '../components/technology/digital-graph-model';
import {factoryLayout,factoryStations,FACTORY_PROCESS_PATH} from '../components/technology/operating-model';
describe('connected operation and physical clearances',()=>{
 it('holds at CED until review and releases only after a stationary quality scan',()=>{expect(operatingState(41).carrier).toEqual(operatingState(49.9).carrier);for(let t=62;t<65;t+=.1){const s=operatingState(t);expect(s.part).toEqual({x:-4,y:1.055,z:factoryLayout.returnLineZ});expect(s.scanning).toBe(true);expect(s.released).toBe(false);expect(s.clamp).toBe(1);}expect(operatingState(66).released).toBe(true);});
 it('uses the same aligned cargo opening for both handoffs',()=>{
  const pickup=operatingState(3),delivery=operatingState(79.55);
  expect(delivery.part.x).toBeCloseTo(pickup.part.x);expect(delivery.part.z).toBeCloseTo(pickup.part.z);
  expect(delivery.part.y).toBeCloseTo(pickup.part.y);
  for(let t=75;t<79.5;t+=.025){const s=operatingState(t);if(s.part.x-.75>s.logistics.truckX+1.42)continue;expect(s.part.z).toBeCloseTo(0);expect(s.logistics.door).toBe(1);}
 });
 it('keeps forks above the cargo floor and directly beneath their load',()=>{expect(H.dispatchForkHeight-H.forkThickness/2).toBeCloseTo(H.cargoFloor,8);expect(H.dispatchForkHeight+H.forkThickness/2).toBeCloseTo(.62,8);expect(H.receiveForkOffset+H.forkThickness/2).toBeCloseTo(H.palletDeckUnderside,8);});
 it('closes doors and removes the loader before departure',()=>{for(let t=82;t<=90;t+=.1){expect(operatingState(t).logistics.door).toBe(0);}expect(operatingState(87).dispatched).toBe(true);});
 it('preserves a continuous supported part path through every handover',()=>{for(const t of [10,11,14,14.7,16.5,17.3,18,20,22,24,41,50,58,59,60.5,61.5,62,65,66,67,68,70,73,75,78,82,87]){const a=operatingState(t-.00001).part,b=operatingState(t+.00001).part;expect(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)).toBeLessThan(.001);}});
 it('inspects directly at the oven exit without a remote transfer',()=>{for(let t=58;t<=67;t+=.1)expect(operatingState(t).part).toEqual({x:-4,y:1.055,z:factoryLayout.returnLineZ});});
 it('uses a separate four-tank factory and holds at CED during coating',()=>{expect(factoryStations.filter(s=>s.kind==='tank')).toHaveLength(4);const station=factoryStations.find(s=>s.id==='T04')!;expect(operatingState(42).carrier).toEqual({x:station.x,z:station.z});expect(twinPoint(station.x,station.z)).toEqual(twinPoint(operatingState(42).carrier.x,operatingState(42).carrier.z));});
 it('puts MES arrival and completion on the same five milestone centres',()=>{for(const [idx,time]of [[0,24],[3,26],[6,31],[10,37],[14,58]]){const p=digitalGraphState(operatingState(time),'V-MES').mesProgress;expect(p).toBeCloseTo([0,3,6,10,14].indexOf(idx)/4,6);}});
 it('lifts before traversing and never moves diagonally between process poses',()=>{
  for(let t=24.005;t<58;t+=.005){const a=operatingState(t-.005).part,b=operatingState(t).part;const axes=[Math.abs(a.x-b.x),Math.abs(a.y-b.y),Math.abs(a.z-b.z)].filter(d=>d>1e-7);if(t<52.495||t>=56.5)expect(axes.length).toBeLessThanOrEqual(1);else expect(Math.abs(a.z-b.z)).toBeLessThan(1e-7);if(Math.abs(a.x-b.x)>1e-7&&b.z<0)expect(b.y-.325).toBeGreaterThan(1.54);}
  for(const [t] of FACTORY_PROCESS_PATH){const a=operatingState(t-.00001).part,b=operatingState(t+.00001).part;expect(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)).toBeLessThan(.001);}
 });
 it('closes the oven only around a stationary part and opens before unloading',()=>{for(let t=54;t<56;t+=.1){const s=operatingState(t);expect(s.ovenActive).toBe(true);expect(s.ovenDoor).toBe(0);expect(s.part).toEqual({x:2,y:factoryLayout.ovenLoadHeight,z:factoryLayout.returnLineZ});}expect(operatingState(56.5).ovenDoor).toBe(1);expect(operatingState(57).part.x).toBeLessThan(2);});
 it('indexes two quarter-turns while stationary at the U corners',()=>{for(const [start,end,z,yaw]of [[39.4,39.9,factoryLayout.wetLineZ,-Math.PI/2],[52.3,52.8,factoryLayout.returnLineZ,-Math.PI]]){const a=operatingState(start),b=operatingState(end);expect(a.carrier.x).toBeCloseTo(b.carrier.x);expect(a.carrier.z).toBeCloseTo(b.carrier.z);expect(b.carrier.x).toBe(8);expect(b.carrier.z).toBeCloseTo(z);expect(b.carrierYaw).toBeCloseTo(yaw);}expect(operatingState(54).carrierYaw).toBeCloseTo(-Math.PI);});
 it('opens the receiving oven door before entry, interlocks curing, and opens the exit before departure',()=>{expect(operatingState(53).ovenEntryOpen).toBe(1);expect(operatingState(53).ovenExitOpen).toBe(0);for(let t=54;t<56;t+=.1){const s=operatingState(t);expect(s.ovenEntryOpen).toBe(0);expect(s.ovenExitOpen).toBe(0);expect(s.ovenActive).toBe(true);}expect(operatingState(56.5).ovenExitOpen).toBe(1);expect(operatingState(58).ovenExitOpen).toBe(0);});
 it('clears lowered oven floor and roof and crosses open door apertures',()=>{for(let t=52.8;t<57.4;t+=.002){const s=operatingState(t),p=s.part;if(p.x>=-2.15&&p.x<=4.15){expect(p.y-factoryBathGeometry.partHalfHeight).toBeGreaterThan(2.14*factoryLayout.ovenScale);expect(p.y+factoryBathGeometry.partHalfHeight).toBeLessThan(3.17*factoryLayout.ovenScale);}if(Math.abs(p.x-4.15)<.3)expect(s.ovenEntryOpen).toBeGreaterThan(.99);if(Math.abs(p.x+2.15)<.3)expect(s.ovenExitOpen).toBeGreaterThan(.99);}});
 it('keeps identities valid and clamps chapter jumps',()=>{const ids=new Set(operatingEntities.map(e=>e.id));operatingEdges.forEach(([a,b])=>{expect(ids.has(a)&&ids.has(b)).toBe(true);});expect(operatingState(100).time).toBe(OPERATING_DURATION);expect(operatingState(T.hold).hold).toBe(true);});
});

it('keeps the CED station tag on the immersed part throughout evidence gathering and review',()=>{
 for(let t=41;t<50;t+=.125){
  const state=operatingState(t);
  expect(state.processStage).toBe('CED · T04');
  expect(state.part).toEqual({x:8,y:.9,z:-1.25});
  expect(state.hold && state.products['V-AI']).toBe(true);
 }
 expect(operatingState(57.5).processStage).toBe('Transfer to quality');
 expect(operatingState(58).processStage).toBe('Inspection');
});

it('backs the load and fork tips completely past the trailer before turning',()=>{
 for(let t=4;t<10.8;t+=.01){
  const {logistics:{pose,truckX}}=operatingState(t);
  if(Math.abs(pose.heading-Math.PI)<.001)continue;
  for(const forward of [.7,2.31])for(const side of [-.75,.75]){
   expect(pose.x+forward*Math.cos(pose.heading)-side*Math.sin(pose.heading)).toBeGreaterThan(truckX+1.42+.12);
  }
 }
});
it('approaches and withdraws straight while forks overlap the outfeed',()=>{
 for(let t=66;t<74;t+=.01){
  const {pose}=operatingState(t).logistics;
  if(pose.x+2.28*Math.cos(pose.heading)>-4.75 && Math.abs(pose.z-4.95)<1){
   expect(pose.heading).toBeCloseTo(0,6);expect(pose.z).toBeCloseTo(4.95);
  }
 }
});
