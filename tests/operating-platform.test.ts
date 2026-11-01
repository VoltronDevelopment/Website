import {describe,it,expect} from 'vitest';
import {operatingState,operatingEntities,operatingEdges,OPERATING_DURATION,operatingTimes as T,handlingGeometry as H,receivingBridgeBounds as bridge} from '../components/technology/operating-model';
import {digitalGraphState,twinPoint} from '../components/technology/digital-graph-model';
import {alphaLineStations} from '../components/manufacturing/alpha-line-config';
describe('connected operation and physical clearances',()=>{
 it('holds at T06 until review and releases only after a stationary quality scan',()=>{expect(operatingState(41).carrier).toEqual(operatingState(49.9).carrier);for(let t=62;t<65;t+=.1){const s=operatingState(t);expect(s.part).toEqual({x:10,y:1.055,z:1.8});expect(s.scanning).toBe(true);expect(s.released).toBe(false);expect(s.clamp).toBe(1);}expect(operatingState(66).released).toBe(true);});
 it('keeps the dock bridge clear of the truck floor',()=>{expect(bridge.minX-bridge.cargoRear).toBeGreaterThanOrEqual(.049);expect(bridge.top).toBe(.6);for(let t=6;t<10;t+=.1)expect(operatingState(t).bridge).toBe(0);expect(operatingState(17).bridge).toBe(0);});
 it('enters the outbound cargo only through the rear opening',()=>{for(let t=67;t<=82;t+=.025){const s=operatingState(t),p=s.part;if(t>=73&&p.x>=8.58){expect(p.z).toBeCloseTo(6,7);if(t<78)expect(s.outboundDoor).toBeGreaterThan(.99);expect(p.y-.335).toBeGreaterThanOrEqual(.6);}if(t>=73&&p.z<5.31)expect(p.x).toBeLessThan(8.58);}});
 it('keeps forks above the cargo floor and directly beneath their load',()=>{expect(H.dispatchForkHeight-H.forkThickness/2).toBeCloseTo(H.cargoFloor,8);expect(H.dispatchForkHeight+H.forkThickness/2).toBeCloseTo(.62,8);expect(H.receiveForkOffset+H.forkThickness/2).toBeCloseTo(H.palletDeckUnderside,8);});
 it('closes doors and removes the loader before departure',()=>{for(let t=82;t<=90;t+=.1){expect(operatingState(t).outboundDoor).toBe(0);}expect(operatingState(87).dispatched).toBe(true);});
 it('preserves a continuous supported part path through every handover',()=>{for(const t of [10,11,14,14.7,16.5,17.3,18,20,22,24,41,50,58,59,60.5,61.5,62,65,66,67,68,70,73,75,78,82,87]){const a=operatingState(t-.00001).part,b=operatingState(t+.00001).part;expect(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)).toBeLessThan(.001);}});
 it('routes inspection transfer outside the production tank row',()=>{for(let t=59;t<=60;t+=.1)expect(operatingState(t).part.z).toBe(3.5);});
 it('uses the same station transform for every Twin station and carrier stop',()=>{for(let i=0;i<alphaLineStations.length;i++){const station=alphaLineStations[i],point=twinPoint(station.x*.42-4,station.z*.42-1);expect(Number.isFinite(point.x+point.y)).toBe(true);if(i===6){const s=operatingState(42);expect(twinPoint(s.carrier.x,s.carrier.z)).toEqual(point);}}expect(alphaLineStations).toHaveLength(15);});
 it('puts MES arrival and completion on the same five milestone centres',()=>{for(const [idx,time]of [[0,24],[3,32.5],[6,41],[10,54],[14,58]]){const p=digitalGraphState(operatingState(time),'V-MES').mesProgress;expect(p).toBeCloseTo([0,3,6,10,14].indexOf(idx)/4,6);}});
 it('traverses both outer rail corners one axis at a time with a dwell',()=>{
  for(const [start,end,corner]of [[38.1666667,41,[4.694,-3.898]],[52,53,[4.694,1.898]]] as const){
   let previous=operatingState(start).carrier;let stationary=0;
   for(let t=start+.001;t<end;t+=.001){const p=operatingState(t).carrier,dx=Math.abs(p.x-previous.x),dz=Math.abs(p.z-previous.z);expect(dx>.00000001&&dz>.00000001).toBe(false);if(Math.abs(p.x-corner[0])<.00001&&Math.abs(p.z-corner[1])<.00001)stationary++;previous=p;}
   expect(stationary).toBeGreaterThan(50);
  }
 });
 it('keeps identities valid and clamps chapter jumps',()=>{const ids=new Set(operatingEntities.map(e=>e.id));operatingEdges.forEach(([a,b])=>{expect(ids.has(a)&&ids.has(b)).toBe(true);});expect(operatingState(100).time).toBe(OPERATING_DURATION);expect(operatingState(T.hold).hold).toBe(true);});
});
