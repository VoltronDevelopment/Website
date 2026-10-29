import {describe,it,expect,afterEach} from 'vitest';
import * as T from 'three';
import {modularityFrame,MODULARITY_DURATION,modularityCells,processPacks} from '../components/brand/modularity-model';
import {createLotReveal} from '../components/home/lot-story-particles';
const resources=new Set<{dispose:()=>void}>();
const own=<R extends {dispose:()=>void}>(resource:R)=>{resources.add(resource);return resource;};
afterEach(()=>{resources.forEach(r=>r.dispose());resources.clear();});
describe('manufacturing modularity sequence',()=>{
 it('forms the shared core before the process cells',()=>{const start=modularityFrame(0),core=modularityFrame(1.2);expect(start.core).toBe(0);expect(start.packs.every(p=>p===0)).toBe(true);expect(core.core).toBeGreaterThan(.8);expect(core.packs.every(p=>p===0)).toBe(true);});
 it('preserves a six-cell lattice across five process families',()=>{expect(modularityCells).toHaveLength(6);expect(processPacks).toHaveLength(5);expect(new Set(modularityCells.map(p=>p.join(','))).size).toBe(6);});
 it('configures two examples without rebuilding the completed core',()=>{const first=modularityFrame(6.8),second=modularityFrame(10.3);expect(first.selected).toBe(0);expect(second.selected).toBe(1);for(const state of [first,second]){expect(state.core).toBe(1);expect(state.packs.every(p=>p===1)).toBe(true);expect(state.configuration).toBe(1);}});
 it('ends in stillness and permits a direct selection',()=>{const end=modularityFrame(MODULARITY_DURATION),selected=modularityFrame(MODULARITY_DURATION,4);expect(end.complete).toBe(true);expect(selected.selected).toBe(4);expect(selected.configuration).toBe(1);expect(selected.core).toBe(1);});
});
describe('Connected Lot surface deposition reuse',()=>{
 it('preserves the original lot sample count by default',()=>{const root=new T.Group(),box=own(new T.BoxGeometry(1,1,1));const reveal=createLotReveal(root,box,own,own);expect(reveal.points.geometry.attributes.position.count).toBe(6134);});
 it('forms just cube surfaces when no component is requested',()=>{const root=new T.Group(),box=own(new T.BoxGeometry(1,1,1)),reveal=createLotReveal(root,box,own,own,{surfaceSamples:1800,componentSamples:0});expect(reveal.points.geometry.attributes.position.count).toBe(2400);reveal.update(.5,0,1,false,1);expect(reveal.points.visible).toBe(true);reveal.update(1,0,2,false,1);expect(reveal.points.visible).toBe(false);});
});
