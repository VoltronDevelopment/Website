import {describe,it,expect} from 'vitest';
import {alphaLineCameraOffset} from '../components/manufacturing/alpha-line-framing';
import {factoryCameraOffset,factoryCameraShot} from '../components/technology/factory-camera';
import {operatingState} from '../components/technology/operating-model';

describe('directed factory camera',()=>{
 it('keeps overview and every guided shot at the 13-tank elevation and on the same side of the rail',()=>{
  const base=alphaLineCameraOffset(0,0);
  expect(factoryCameraOffset()).toEqual([base.x,base.y,base.z]);
  const reference=base.y/Math.hypot(base.x,base.z);
  for(let t=0;t<=90;t+=.25){
   const [x,y,z]=factoryCameraShot(operatingState(t),false,1.6).offset;
   expect(y/Math.hypot(x,z)).toBeCloseTo(reference,6);
   expect(x).toBeLessThan(0);
   expect(z).toBeGreaterThan(0);
  }
 });
 it('holds a fixed viewing height through immersion and stationary inspection',()=>{
  for(const phone of [true,false]){
   const shot=(time:number)=>factoryCameraShot(operatingState(time),phone,.75);
   for(const start of [27,32,38]){
    expect(shot(start+.4).target[1]).toBe(shot(start).target[1]);
    expect(shot(start+.4).offset).toEqual(shot(start).offset);
   }
   expect(shot(62).target).toEqual(shot(65).target);
   expect(shot(62).span).toBe(shot(65).span);
  }
 });
 it('keeps authored cuts continuous when scrubbing across chapter and shot boundaries',()=>{
  for(const time of [6,10,17,23,26,50.5,52,53.5,56.5,58,61.5,66.5,70,78,83]){
   const a=factoryCameraShot(operatingState(time-.0001),true,.75);
   const b=factoryCameraShot(operatingState(time+.0001),true,.75);
   expect(Math.hypot(...a.offset.map((n,i)=>n-b.offset[i]))).toBeLessThan(.01);
   expect(Math.hypot(...a.target.map((n,i)=>n-b.target[i]))).toBeLessThan(.01);
   expect(Math.abs(a.span-b.span)).toBeLessThan(.01);
  }
 });
});
