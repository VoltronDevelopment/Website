import {describe,expect,it} from 'vitest';
import {factoryBathContacts,factoryBathGeometry as dimensions,factoryBathState} from '../components/technology/factory-bath-model';
import {factoryProcessPosition} from '../components/technology/operating-model';

describe('factory load crossing a liquid surface',()=>{
 it('fully immerses the panel while clearing the vessel bottom',()=>{
  for(const cycle of factoryBathContacts){
   const part=factoryProcessPosition(cycle.dwell);
   expect(part.y+dimensions.partHalfHeight).toBeLessThan(dimensions.surface);
   expect(part.y-dimensions.partHalfHeight).toBeGreaterThan(dimensions.bottom);
  }
 });
 it('emits contact ripples at actual lower and upper edge crossings',()=>{
  for(const cycle of factoryBathContacts){
   expect(cycle.entry).toBeLessThan(cycle.submerged);
   expect(cycle.emergence).toBeLessThan(cycle.exit);
   for(const time of [cycle.entry,cycle.exit])expect(factoryProcessPosition(time).y-dimensions.partHalfHeight).toBeCloseTo(dimensions.surface,7);
   for(const time of [cycle.submerged,cycle.emergence])expect(factoryProcessPosition(time).y+dimensions.partHalfHeight).toBeCloseTo(dimensions.surface,7);
  }
 });
 it('allows drainage only after the panel clears the water, and pauses before travel',()=>{
  factoryBathContacts.forEach((cycle,index)=>{
   expect(factoryBathState(cycle.emergence,index).draining).toBe(false);
   expect(factoryBathState(cycle.exit+.001,index).draining).toBe(true);
   expect(cycle.clear).toBeLessThan(cycle.travel);
   expect(factoryProcessPosition(cycle.clear)).toEqual(factoryProcessPosition(cycle.travel));
   expect(factoryBathState(cycle.travel+.56,index).draining).toBe(false);
  });
 });
 it('decays surface movement during the review hold and reproduces it when seeking',()=>{
  const held=factoryBathState(49,2);
  expect(held.immersion).toBe(1);
  expect(held.ages.slice(0,2).every(age=>age>3)).toBe(true);
  expect(held.ages.slice(2)).toEqual([-1,-1]);
  const first=factoryBathState(29.5,0);
  factoryBathState(65,0);
  expect(factoryBathState(29.5,0)).toEqual(first);
 });
});
