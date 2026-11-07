import {expect,it} from 'vitest';
import {factoryLayout,factoryRunningDistance,dispatchReach,operatingState} from '../components/technology/operating-model';
it('rolls only with horizontal travel and remains still during hoists and indexed turns',()=>{
 expect(factoryRunningDistance(24)).toBe(0);
 expect(factoryRunningDistance(26)).toBeCloseTo(3);
 for(const [a,b] of [[26,30],[31,36],[37,38.65],[39.4,39.9],[40.6,51.2],[52.3,52.8],[53.5,56.5]])expect(factoryRunningDistance(a)).toBeCloseTo(factoryRunningDistance(b));
 expect(factoryRunningDistance(58)).toBeCloseTo(12+(factoryLayout.returnLineZ-factoryLayout.wetLineZ)+12);
});
it('keeps travel distance continuous and reproducible through every boundary',()=>{
 for(const t of [25,26,30,31,36,37,50.6,51.2,51.7,52.3,52.8,53.05,53.5,56.5,57.05,57.4,58])expect(Math.abs(factoryRunningDistance(t-.00001)-factoryRunningDistance(t+.00001))).toBeLessThan(.002);
});
it('keeps the two sliding stages within their fixed length and withdraws after cargo is supported',()=>{
 for(let t=72;t<82;t+=.01){const p=operatingState(t),r=dispatchReach(t,p.part.x);expect(r.stages[0]).toBeGreaterThanOrEqual(0);expect(r.stages[0]).toBeLessThanOrEqual(.6);expect(r.stages[1]).toBeGreaterThanOrEqual(0);expect(r.stages[1]).toBeLessThan(.6);expect(r.stages[0]+r.stages[1]).toBeCloseTo(r.extension);}
 expect(dispatchReach(78,-6.4).extension).toBeGreaterThan(1);
 expect(dispatchReach(79,-6.4).extension).toBe(0);
});

it('passes through the oven approach without a false full stop and preserves station stops',()=>{
 const speed=(t:number)=>{const a=operatingState(t-.0001).part,b=operatingState(t+.0001).part;return Math.hypot(b.x-a.x,b.z-a.z)/.0002};
 for(const t of [53.05,57.05])expect(speed(t)).toBeGreaterThan(1);
 for(const t of [39.65,52.55,55])expect(speed(t)).toBeLessThan(.001);
 for(let t=52.8;t<53.5;t+=.01){const p=operatingState(t).part;expect(p.x).toBeGreaterThanOrEqual(1);expect(p.x).toBeLessThanOrEqual(8);expect(p.z).toBeCloseTo(factoryLayout.returnLineZ);}
});
