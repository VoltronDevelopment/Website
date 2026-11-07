import {describe,expect,it} from 'vitest';
import * as THREE from 'three';
import {rollingChassis} from '../components/about/rolling-chassis';

describe('rolling chassis assembly',()=>{
 it('seats the two axle pairs in sequence while their brake discs stay fixed',()=>{
  const subject=new THREE.Group();
  const update=rollingChassis(subject,resource=>resource,new THREE.Plane());
  const model=subject.children[0];
  const wheels=model.children.filter(child=>child.children.some(part=>part instanceof THREE.Mesh && part.geometry.type==='LatheGeometry'));
  const discs=model.children.filter(child=>child instanceof THREE.Mesh && child.geometry.type==='CylinderGeometry' && child.geometry.parameters.radiusTop===.157);
  expect(wheels).toHaveLength(4);
  expect(discs).toHaveLength(4);
  const fixed=discs.map(disc=>disc.position.clone());
  update(0);
  const initial=wheels.map(wheel=>wheel.position.clone());
  update(2.6);
  wheels.forEach((wheel,i)=>{
   expect(wheel.position.x).toBe(initial[i].x);
   expect(wheel.position.y).toBe(initial[i].y);
   expect(Math.abs(wheel.position.z)).toBeCloseTo(wheel.position.x<0?.67:1.15);
  });
  update(4.3);
  wheels.forEach(wheel=>expect(Math.abs(wheel.position.z)).toBeCloseTo(.67));
  discs.forEach((disc,i)=>expect(disc.position.equals(fixed[i])).toBe(true));
 });
});
