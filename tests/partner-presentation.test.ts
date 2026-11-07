import {expect,it} from 'vitest';
import {collaborationState} from '../components/brand/collaboration-timeline';
import {partnerActing,partnerFrame} from '../components/brand/partner-stage';
it('keeps the lens stationary during walking and closes only after both arrivals land',()=>{
 for(const aspect of [.75,1,1.5]){expect(partnerFrame(0,aspect)).toEqual(partnerFrame(5.8,aspect));expect(partnerFrame(12,aspect).width).toBeLessThan(partnerFrame(5.8,aspect).width);}
 for(const t of [5.8,8.4]){const a=partnerFrame(t-.00001,1),b=partnerFrame(t+.00001,1);expect(Math.abs(a.width-b.width)).toBeLessThan(.001);}
});
it('stages complementary gestures and ends in a quiet shared presentation',()=>{
 expect(partnerActing(6,0).reach).toBe(0);expect(partnerActing(6,1).reach).toBe(0);
 expect(partnerActing(7,0).reach).toBeGreaterThan(partnerActing(7,1).reach);
 expect(partnerActing(9.9,1).explain).toBe(1);
 for(const i of [0,1]){expect(partnerActing(12,i).reach).toBe(1);expect(partnerActing(12,i).explain).toBe(0);expect(partnerActing(12,i).acknowledge).toBeCloseTo(0);}
});

it('keeps each figure planted on its sampled surface until its particles have resolved',()=>{
 for(let t=0;t<=6;t+=.02){
  const state=collaborationState('partner',t);
  state.people.forEach((formed,i)=>{if(formed<1)expect(state.walks[i]).toBe(0);});
 }
});
