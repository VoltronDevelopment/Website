import {describe,it,expect} from 'vitest';
import {placeOperatingLabel,operatingLabelPort} from '../components/technology/operating-label-layout';
import {operatingState,operatingEvents,lastFactoryEvent} from '../components/technology/operating-model';
describe('operating artwork refinement',()=>{
 it('keeps labels within the artwork and away from occupied reading space',()=>{const bounds={width:390,height:440},first=placeOperatingLabel(160,200,110,44,bounds,[]);expect(first).not.toBeNull();const second=placeOperatingLabel(160,200,110,44,bounds,[first!]);expect(second).not.toBeNull();expect(second).not.toEqual(first);for(const r of [first!,second!]){expect(r.x).toBeGreaterThanOrEqual(12);expect(r.x+r.width).toBeLessThanOrEqual(378);expect(r.y+r.height).toBeLessThanOrEqual(374);}});
 it('suppresses a label if no safe slot exists',()=>expect(placeOperatingLabel(50,50,150,44,{width:100,height:100},[])).toBeNull());
 it('keeps one panel continuous across processing and inspection transfers',()=>{for(const boundary of [10,11,14,17,20,24,41,50,58,65,66,67,82]){const a=operatingState(boundary-.0001).part,b=operatingState(boundary+.0001).part;expect(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)).toBeLessThan(.01);}});
 it('emits signals only inside a defined event window and ends them in stillness',()=>{for(let t=0;t<90;t+=.1){const state=operatingState(t);if(state.signals.length){expect(operatingEvents.some(([time])=>t>=time&&t<time+2)).toBe(true);state.signals.forEach(signal=>expect(operatingEvents.some(([time,entity,products])=>t>=time&&t<time+2&&entity===signal.entity&&products.includes(signal.product))).toBe(true));}}expect(operatingState(90).signals).toHaveLength(0);});
 it('holds the truck and the staged lot while MES enrols and calls production',()=>{
  const dock=operatingState(0).logistics.truckX,rack=operatingState(12).part;
  for(let t=0;t<=82;t+=.25)expect(operatingState(t).logistics.truckX).toBe(dock);
  for(let t=12;t<17.6;t+=.1)expect(operatingState(t).part).toEqual(rack);
  expect(operatingState(15).lotStatus).toBe('Enrolled in MES');
  expect(operatingState(16).eventText).toContain('Production call');
  expect(operatingState(84).logistics.truckX).toBeLessThan(dock);
 });
});

it('keeps a safe label stable and terminates its leader on the nearest edge',()=>{const r={x:200,y:100,width:100,height:44};expect(placeOperatingLabel(180,170,100,44,{width:500,height:400},[],r)).toEqual(r);expect(operatingLabelPort(350,122,r)).toEqual({x:300,y:122});const next=placeOperatingLabel(180,170,100,44,{width:500,height:400},[r],r);expect(next).not.toEqual(r);});

it('retains the physical exchange while individual apps browse their own most recent record',()=>{
 expect(operatingState(12.5).exchange?.[4]).toEqual({from:'Rack scanner',to:'V SCADA',record:'017'});
 expect(operatingState(15.5).exchange?.[0]).toBe(12);
 expect(lastFactoryEvent(15.5,'V-MES')?.[1]).toBe('lot');
 expect(operatingState(16.5).exchange?.[4]?.to).toBe('Loading bay');
 expect(lastFactoryEvent(66.5,'SCADA')?.[3]).toBe('Inspection started');
 expect(lastFactoryEvent(66.5,'V-MES')?.[3]).toBe('Lot released');
 expect(operatingState(66.5).exchange?.[4]).toEqual({from:'V MES',to:'Dispatch bay',record:'003'});
});
