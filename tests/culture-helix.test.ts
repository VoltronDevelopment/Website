import {describe,it,expect} from 'vitest';
import {cultureHelixDuration,cultureHelixState as state} from '../components/brand/culture-helix-timeline';
describe('Culture contribution story',()=>{
 it('keeps approach, entwining, values and contribution in order',()=>{
  expect(state(.7).arrival).toBeGreaterThan(0);expect(state(.7).twist).toBe(0);
  expect(state(2.5).twist).toBeGreaterThan(0);expect(state(2.5).bridges.every(v=>v===0)).toBe(true);
  expect(state(4.05).bridges[0]).toBeGreaterThan(state(4.05).bridges[4]);expect(state(4.05).gather).toBe(0);
  expect(state(6).gather).toBeGreaterThan(0);expect(state(6).bridges.every(v=>v===0)).toBe(true);
  expect(state(cultureHelixDuration)).toMatchObject({done:true,phase:'settled',gather:1,enclosure:1});
 });
 it('is bounded, finite and stable when seeking or given invalid input',()=>{
  expect(state(NaN)).toEqual(state(0));expect(state(Infinity)).toEqual(state(0));expect(state(-1)).toEqual(state(0));expect(state(99)).toEqual(state(7.5));
  const before=state(4.5);state(7.5);expect(state(4.5)).toEqual(before);
  for(let t=0;t<9;t+=.03){const s=state(t);for(const v of [s.arrival,s.twist,s.gather,s.enclosure,...s.bridges]){expect(v).toBeGreaterThanOrEqual(0);expect(v).toBeLessThanOrEqual(1);}}
 });
});
