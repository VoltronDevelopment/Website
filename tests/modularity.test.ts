import {describe,it,expect,afterEach} from 'vitest';
import * as T from 'three';
import {modularityFrame,modularitySelectionFrame,MODULARITY_DURATION,modularityCells,processPacks,processPackExchange,processSocket} from '../components/brand/modularity-model';
import {createLotReveal} from '../components/home/lot-story-particles';
const resources=new Set<{dispose:()=>void}>();
const own=<R extends {dispose:()=>void}>(resource:R)=>{resources.add(resource);return resource;};
afterEach(()=>{resources.forEach(r=>r.dispose());resources.clear();});
describe('manufacturing modularity sequence',()=>{
 it('continues a direct choice without losing formation order or exposing details before docking',()=>{
  for(const start of [.35,3,6.2,7.6,9.2,11.5]){
   const from=modularityFrame(start),to=modularityFrame(MODULARITY_DURATION,3),initial=modularitySelectionFrame(from,to,0);
   expect(initial.core).toBe(from.core);expect(initial.packs).toEqual(from.packs);expect(initial.descent).toBe(from.descent);
   let previous=initial;
   for(let i=1;i<=100;i++){
    const next=modularitySelectionFrame(from,to,i/100);expect(next.core).toBeGreaterThanOrEqual(previous.core);expect(next.descent).toBeGreaterThanOrEqual(previous.descent);
    if(next.descent>0)expect(next.extension).toBe(1);if(next.configuration>0)expect(next.descent).toBe(1);
    expect(next.detailsReady).toBe(i===100);previous=next;
   }
   expect(previous).toMatchObject({core:1,descent:1,configuration:1,selected:3,detailsReady:true});
  }
 });
 it('forms the shared core before the process cells',()=>{const start=modularityFrame(0),core=modularityFrame(1.2);expect(start.core).toBe(0);expect(start.packs.every(p=>p===0)).toBe(true);expect(core.core).toBeGreaterThan(.8);expect(core.packs.every(p=>p===0)).toBe(true);});
 it('preserves a six-cell lattice across five process families',()=>{expect(modularityCells).toHaveLength(6);expect(processPacks).toHaveLength(5);expect(new Set(modularityCells.map(p=>p.join(','))).size).toBe(6);});
 it('forms the extension before descending and completes configuration last',()=>{const formed=modularityFrame(6.9),landed=modularityFrame(8.5),end=modularityFrame(MODULARITY_DURATION);expect(formed.extension).toBe(1);expect(formed.descent).toBe(0);expect(landed.descent).toBe(1);expect(end.configuration).toBe(1);expect(end.selected).toBe(0);expect(end.packs.every(p=>p===1)).toBe(true);});
 it('reveals Machining details only after docking and activation',()=>{expect(modularityFrame(8.5).detailsReady).toBe(false);expect(modularityFrame(8.5).configuration).toBe(0);expect(modularityFrame(10.3).detailsReady).toBe(true);expect(modularityFrame(10.3).selected).toBe(0);});
 it('ends in stillness and permits a direct selection',()=>{const end=modularityFrame(MODULARITY_DURATION),selected=modularityFrame(MODULARITY_DURATION,4);expect(end.complete).toBe(true);expect(selected.selected).toBe(4);expect(selected.configuration).toBe(1);expect(selected.core).toBe(1);});
});
describe('Connected Lot surface deposition reuse',()=>{
 it('preserves the original lot sample count by default',()=>{const root=new T.Group(),box=own(new T.BoxGeometry(1,1,1));const reveal=createLotReveal(root,box,own,own);expect(reveal.points.geometry.attributes.position.count).toBe(6134);});
 it('forms just cube surfaces when no component is requested',()=>{const root=new T.Group(),box=own(new T.BoxGeometry(1,1,1)),reveal=createLotReveal(root,box,own,own,{surfaceSamples:1800,componentSamples:0});expect(reveal.points.geometry.attributes.position.count).toBe(2400);reveal.update(.5,0,1,false,1);expect(reveal.points.visible).toBe(true);reveal.update(1,0,2,false,1);expect(reveal.points.visible).toBe(false);});
});

describe('process pack exchange clearance',()=>{
 it('clears neighbouring cells before travelling and keeps both packs separated',()=>{
  let previous=processPackExchange(0);
  for(let i=0;i<=1000;i++){
   const pose=processPackExchange(i/1000);
   if(pose.outgoing[0]!==processSocket[0])expect(pose.outgoing[1]-processSocket[1]).toBeGreaterThan(1.65);
   if(pose.incoming[2]!==processSocket[2])expect(pose.incoming[1]-processSocket[1]).toBeGreaterThan(1.65);
   if(pose.incomingOpacity>.01&&pose.outgoingOpacity>.01)expect(pose.incoming.some((n,axis)=>Math.abs(n-pose.outgoing[axis])>=1.65)).toBe(true);
   expect(Math.hypot(...pose.incoming.map((n,j)=>n-previous.incoming[j]))).toBeLessThan(.1);
   expect(pose.detailsReady).toBe(i===1000);previous=pose;
  }
  expect(processPackExchange(1).incoming).toEqual([...processSocket]);
 });
});
