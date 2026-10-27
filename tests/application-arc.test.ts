import {expect,it} from 'vitest';
import {convexCardPose} from '../components/home/application-arc';

it('keeps cards on a convex circle with outward-facing normals',()=>{
 const radius=600;
 for(const delta of [-2,-1,-.5,0,.5,1,2]){
  const p=convexCardPose(delta,radius);
  expect(p.x*p.x+(p.z+radius)**2).toBeCloseTo(radius**2);
  expect(p.z).toBeLessThanOrEqual(0);
  expect(Math.sign(p.x)).toBe(Math.sign(p.angle));
 }
 expect(convexCardPose(0,radius)).toEqual({x:0,z:0,angle:0});
 expect(convexCardPose(1,radius).x).toBeCloseTo(-convexCardPose(-1,radius).x);
});
