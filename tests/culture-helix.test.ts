import {describe,it,expect} from 'vitest';
import {cultureHelixDuration,cultureHelixState as state,cultureHelixPoint} from '../components/brand/culture-helix-timeline';
describe('Culture contribution story',()=>{
 it('keeps approach, entwining, values and contribution in order',()=>{
  expect(state(.7).arrival).toBeGreaterThan(0);expect(state(.7).twist).toBe(0);
  expect(state(2.5).twist).toBeGreaterThan(0);expect(state(2.5).bridges.every(v=>v===0)).toBe(true);
  expect(state(4.05).bridges[0]).toBeGreaterThan(state(4.05).bridges[4]);expect(state(4.05).gather).toBe(0);
  expect(state(6).gather).toBe(0);expect(state(6).bridges.every(v=>v===1)).toBe(true);
  expect(state(8).gather).toBeGreaterThan(0);expect(state(8).bridges.every(v=>v===0)).toBe(true);
  expect(state(cultureHelixDuration)).toMatchObject({done:true,phase:'settled',gather:1,enclosure:1});
 });
 it('is bounded, finite and stable when seeking or given invalid input',()=>{
  expect(state(NaN)).toEqual(state(0));expect(state(Infinity)).toEqual(state(0));expect(state(-1)).toEqual(state(0));expect(state(99)).toEqual(state(cultureHelixDuration));
  const before=state(4.5);state(cultureHelixDuration);expect(state(4.5)).toEqual(before);
  for(let t=0;t<9;t+=.03){const s=state(t);for(const v of [s.arrival,s.twist,s.gather,s.enclosure,...s.bridges]){expect(v).toBeGreaterThanOrEqual(0);expect(v).toBeLessThanOrEqual(1);}}
 });
});

it('keeps bridge endpoints on their rotating strands throughout the held connection',()=>{
 for(const time of [3.8,4.5,5.2,6,6.4])for(const side of [0,1] as const){const s=state(time),p=cultureHelixPoint(.4,side,s);expect(Math.hypot(p[0],p[2])).toBeCloseTo(.57);expect(p[1]).toBeCloseTo(-.31);}
 expect(state(5.2).spin).toBe(state(6.4).spin);
 expect(state(6.6).bridges.every(v=>v===0)).toBe(true);
});
