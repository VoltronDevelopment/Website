import {describe,expect,it} from 'vitest';
import * as THREE from 'three';
import {rollingChassis} from '../components/about/rolling-chassis';

describe('rolling chassis assembly',()=>{
 it('seats the two axle pairs in sequence once the brake assemblies seat on the hubs',()=>{
  const subject=new THREE.Group();
  const update=rollingChassis(subject,resource=>resource,new THREE.Plane());
  const model=subject.children[0];
  const wheels=model.children.filter(child=>child.children.some(part=>part instanceof THREE.Mesh && part.geometry.type==='LatheGeometry'));
  const brakes=model.children.filter(child=>child.children.some(part=>part instanceof THREE.Mesh && part.geometry.type==='CylinderGeometry' && part.geometry.parameters.radiusTop===.157 && part.scale.x===1));
  expect(wheels).toHaveLength(4);
  expect(brakes).toHaveLength(4);
  update(0);
  expect(brakes.every(brake=>!brake.visible)).toBe(true);
  update(1.85);
  const fixed=brakes.map(brake=>brake.position.clone());
  expect(brakes.every(brake=>brake.visible && Math.abs(brake.position.z)===.67)).toBe(true);
  const initial=wheels.map(wheel=>wheel.position.clone());
  update(3.12);
  wheels.forEach((wheel,i)=>{
   expect(wheel.position.x).toBe(initial[i].x);
   expect(wheel.position.y).toBe(initial[i].y);
   expect(Math.abs(wheel.position.z)).toBeCloseTo(wheel.position.x<0?.67:1.15);
  });
  update(4.4);
  wheels.forEach(wheel=>expect(Math.abs(wheel.position.z)).toBeCloseTo(.67));
  brakes.forEach((disc,i)=>expect(disc.position.equals(fixed[i])).toBe(true));
 });
});
