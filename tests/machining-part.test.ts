import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {createMachiningView,millingPath,millingLengths,millingLength,millingPosition,partFeatures} from '../components/home/machining-part';
describe('shared machining example',()=>{
 it('clears context callouts and inspection overlays from the completed cubes',()=>{
  const context=createMachiningView(1);context.update(5,1,1,0);expect(context.group.getObjectByName('transient-context-callouts')!.visible).toBe(true);context.update(12,1,1,1);expect(context.group.getObjectByName('transient-context-callouts')!.visible).toBe(false);expect(context.group.getObjectByName('context-feature-guides')!.visible).toBe(false);
  const intelligence=createMachiningView(2);intelligence.update(7,1,1,1);expect(intelligence.group.getObjectByName('transient-inspection-scans')!.visible).toBe(true);intelligence.update(12,1,1,1);expect(intelligence.group.getObjectByName('transient-inspection-scans')!.visible).toBe(false);
 });
 it('preserves the approved open bore and raised annular face',()=>{
  const view=createMachiningView(1),part=view.group.getObjectByName('shared-flange-housing')!;part.updateMatrixWorld(true);
  const ray=new THREE.Raycaster(new THREE.Vector3(0,0,2),new THREE.Vector3(0,0,-1));expect(ray.intersectObject(part,true)).toHaveLength(0);
  ray.set(new THREE.Vector3(.48,0,2),new THREE.Vector3(0,0,-1));expect(ray.intersectObject(part,true)[0].point.z).toBeCloseTo(.335,4);
  expect(partFeatures.radius*2/partFeatures.scale).toBe(40);
 });
 it('evaluates the exact connected polyline used by stock removal without jumps',()=>{
  let walked=0;expect(millingPosition(0).toArray()).toEqual(millingPath[0].toArray());
  for(let i=0;i<millingLengths.length;i++){walked+=millingLengths[i];expect(millingPosition(walked/millingLength).distanceTo(millingPath[i+1])).toBeLessThan(.000001);}
  for(let t=.001;t<=1;t+=.001)expect(millingPosition(t).distanceTo(millingPosition(t-.001))).toBeLessThanOrEqual(millingLength*.00101);
 });
 it('retracts only after finishing the cut and reuses the part for line inspection',()=>{
  const execution=createMachiningView(0);execution.update(2.5,.5,0,0);const tool=execution.group.getObjectByName('flange-end-mill')!;expect(tool.position.z).toBeCloseTo(.335);execution.update(5,1,1,0);expect(tool.position.z).toBeGreaterThan(.5);
  const intelligence=createMachiningView(2);let count=0;intelligence.group.traverse(o=>{if(o.name==='shared-flange-housing')count++;});expect(count).toBe(1);
 });
});
