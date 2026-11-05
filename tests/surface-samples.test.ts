import * as T from 'three';
import {describe,it,expect} from 'vitest';
import {sampleWorldSurface} from '../components/brand/surface-samples';

const random=()=>{let seed=17;return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};};
describe('formation surface distribution',()=>{
 it('weights world area rather than mesh count or tessellation',()=>{
  const root=new T.Group();
  const small=new T.Mesh(new T.PlaneGeometry(1,1,20,20));small.position.x=-10;root.add(small);
  const large=new T.Mesh(new T.PlaneGeometry(1,1));large.scale.set(3,3,1);large.position.x=10;root.add(large);
  const points=sampleWorldSurface(root,6000,random());let right=0;
  for(let i=0;i<points.length;i+=3){if(points[i]>0)right++;expect(Math.abs(points[i+1])).toBeLessThanOrEqual(points[i]>0?1.5:.5);expect(points[i+2]).toBe(0);}
  expect(right/6000).toBeGreaterThan(.88);expect(right/6000).toBeLessThan(.92);
 });
 it('samples the current pose and transforms without mutating geometry',()=>{
  const root=new T.Group();root.position.set(3,2,7);const mesh=new T.Mesh(new T.PlaneGeometry(2,2));root.add(mesh);
  const before=Array.from(mesh.geometry.attributes.position.array),points=sampleWorldSurface(root,30,random());
  for(let i=0;i<points.length;i+=3){expect(points[i]).toBeGreaterThanOrEqual(2);expect(points[i]).toBeLessThanOrEqual(4);expect(points[i+2]).toBe(7);}
  expect(Array.from(mesh.geometry.attributes.position.array)).toEqual(before);
 });
});
