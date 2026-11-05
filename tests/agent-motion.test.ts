import {describe,it,expect} from 'vitest';
import {galleryFormation,settleFormation,taskFormation,visibleAgentDelta} from '../components/intelligence/agent-motion';
describe('fluid to particle choreography',()=>{
 it('resumes individual visible cards without skipped phases or duplicate-slot advancement',()=>{
  expect(visibleAgentDelta(null,20)).toBe(0);expect(visibleAgentDelta(2,52)).toBe(.1);expect(visibleAgentDelta(2,2)).toBe(0);expect(visibleAgentDelta(2,1)).toBe(0);
  for(const fps of [30,60]){let time=0;for(let i=1;i<=fps;i++)time+=visibleAgentDelta((i-1)/fps,i/fps);expect(time).toBeCloseTo(1,8);}
 });
 it('returns continuously to fluid at every loop boundary',()=>{for(let i=0;i<6;i++){const boundary=24-i*4;const a=galleryFormation(boundary-.0001,i),b=galleryFormation(boundary+.0001,i);expect(Math.abs(a.amount-b.amount)).toBeLessThan(.00001);expect(a.amount).toBe(0);}});
 it('keeps formation and target transitions bounded and smooth',()=>{for(let i=0;i<6;i++)for(let t=0;t<48;t+=.01){const a=galleryFormation(t,i),b=galleryFormation(t+.01,i);expect(a.amount).toBeGreaterThanOrEqual(0);expect(a.amount).toBeLessThanOrEqual(1);expect(Math.abs(a.amount-b.amount)).toBeLessThan(.01);if(a.amount>.05)expect(Math.abs(a.arrangement-b.arrangement)).toBeLessThan(.01);}});
 it('limits simultaneous strong formations to three agents',()=>{for(let t=0;t<24;t+=.1)expect(Array.from({length:6},(_,i)=>galleryFormation(t,i)).filter(s=>s.amount>.8).length).toBeLessThanOrEqual(3);});
 it('settles an interrupted formation without jumps or runaway velocity',()=>{let s={value:0,velocity:0};for(let n=0;n<120;n++)s=settleFormation(s.value,s.velocity,1,1/60);expect(s.value).toBeCloseTo(1,2);const old=s.value;s=settleFormation(s.value,s.velocity,0,1/60);expect(Math.abs(s.value-old)).toBeLessThan(.01);for(let n=0;n<180;n++)s=settleFormation(s.value,s.velocity,0,1/60);expect(s.value).toBeCloseTo(0,3);expect(settleFormation(.5,0,1,0).value).toBe(.5);});
 it('keeps waiting structured and returns completed tasks to fluid',()=>{expect(taskFormation(-1,.2,1).label).toBe('Waiting for evidence');expect(taskFormation(-1,.2,1).amount).toBeGreaterThan(.5);expect(taskFormation(0,1,1).amount).toBe(0);});
});
