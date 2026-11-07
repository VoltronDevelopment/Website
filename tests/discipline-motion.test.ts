import {expect,it} from 'vitest';
import {disciplineMotion as motion,disciplineBore as bore,disciplineDuration} from '../components/about/discipline-motion';
it('keeps measurement fingers contracted until inside the bore and contracts before withdrawal',()=>{
 for(let t=0;t<=disciplineDuration;t+=.002){const state=motion(t,1);if(state.contact>.001){expect(state.gaugeZ-.15).toBeGreaterThan(bore.rear);expect(state.gaugeZ-.15).toBeLessThan(bore.front);}}
 expect(motion(6.4,1).contact).toBe(0);expect(motion(6.4,1).gaugeZ-.15).toBeGreaterThan(bore.front);
 expect(bore.gaugeContact).toBeLessThan(bore.radius);expect(bore.radius-bore.gaugeContact).toBeLessThan(.01);
});
it('keeps the finishing insert inside the bore radius and retracts clear of its face',()=>{
 expect(Math.hypot(bore.toolRadius,.0225)).toBeLessThan(bore.radius);
 expect(bore.radius-bore.toolRadius).toBeLessThan(.002);
 expect(motion(0,0).toolZ-.4275).toBeGreaterThan(bore.front);
 expect(motion(6.4,0).toolZ-.4275).toBeGreaterThan(bore.front);
 expect(motion(3,0).toolZ-.40).toBeLessThan(bore.front);
});
it('has continuous axial and angular motion, and the spindle settles without jumping',()=>{
 for(const t of [.4,1.2,1.8,2,2.6,3.9,4,4.35,4.4,6,6.4]){const a=motion(t-.00001,0),b=motion(t+.00001,0);expect(Math.abs(a.toolZ-b.toolZ)).toBeLessThan(.001);expect(Math.abs(a.spindleAngle-b.spindleAngle)).toBeLessThan(.001);}
 expect(motion(4.4,0).spindleAngle).toBeCloseTo(motion(6.4,0).spindleAngle);
});
it('links feature, operation and observation in order before the final evidence hold',()=>{
 for(let t=0;t<=6.4;t+=.01){const {records}=motion(t,2);expect(records[0]).toBeGreaterThanOrEqual(records[1]);expect(records[1]).toBeGreaterThanOrEqual(records[2]);}
 expect(motion(6.4,2).records).toEqual([1,1,1]);expect(motion(6.4,2).done).toBe(true);
});

import {bracketStudyGeometry} from '../components/network/bracket-study';
it('fits the actual bevelled bore throat rather than only its nominal face opening',()=>{
 const {baseGeo,uprightGeo}=bracketStudyGeometry();const positions=uprightGeo.attributes.position;let throat=Infinity;
 for(let i=0;i<positions.count;i++){const r=Math.hypot(positions.getX(i),positions.getY(i)-1.75);if(r>.3&&r<.6)throat=Math.min(throat,r);}
 expect(throat).toBeCloseTo(bore.radius,3);
 expect(Math.hypot(bore.toolRadius,.0225)).toBeLessThan(throat);
 expect(Math.hypot(bore.gaugeContact,.035)).toBeLessThan(throat);
 expect(Math.hypot(bore.holderCenter+bore.holderLength/2,.0225)).toBeLessThan(throat);
 baseGeo.computeBoundingBox();expect(baseGeo.boundingBox!.max.z).toBeLessThan(bore.toolBaseFront);
 baseGeo.dispose();uprightGeo.dispose();
});
