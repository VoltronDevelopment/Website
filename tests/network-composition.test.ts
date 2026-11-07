import {describe,it,expect} from 'vitest';
import * as T from 'three';
import {cubeSites,cubeEdges,cubeFrame,cubeTransfer} from '../components/network/cube-layout';

describe('Factory cube',()=>{
 it('has eight distinct corners and twelve single-axis edges',()=>{
  expect(new Set(cubeSites.map(p=>p.join(','))).size).toBe(8);
  expect(cubeEdges).toHaveLength(12);
  for(let i=0;i<8;i++)expect(cubeEdges.filter(([a,b])=>a===i||b===i)).toHaveLength(3);
 });
 it('keeps all eight factory silhouettes inside the canvas and clear of one another',()=>{
  for(const [aspect,phone] of [[.9,true],[1.12,true],[1.8,false],[2.2,false]] as const){
   const f=cubeFrame(aspect,phone),target=new T.Vector3(...f.target);
   const camera=new T.OrthographicCamera(-f.height*aspect/2,f.height*aspect/2,f.height/2,-f.height/2,.1,150);
   camera.position.fromArray(f.offset).add(target);camera.lookAt(target);camera.updateMatrixWorld();
   const boxes=cubeSites.map(([x,y,z])=>{
    const box=new T.Box2();
    for(const dx of [-1.56,1.56])for(const dy of [-.22,1.49])for(const dz of [-2.1,.43]){
     const v=new T.Vector3(x+dx,y+dy,z+dz).project(camera);
     expect(Math.abs(v.x)).toBeLessThan(1);expect(Math.abs(v.y)).toBeLessThan(1);
     box.expandByPoint(new T.Vector2(v.x,v.y));
    }
    return box;
   });
   boxes.forEach((b,i)=>boxes.slice(i+1).forEach(other=>expect(b.intersectsBox(other)).toBe(false)));
  }
 });
 it('relays along real edges and holds at each destination before the next departure',()=>{
  for(const start of [0,12]){
   const {route}=cubeTransfer(start);
   for(let i=0;i<2;i++)expect(cubeEdges.some(e=>e.includes(route[i])&&e.includes(route[i+1]))).toBe(true);
   expect(cubeTransfer(start+5.5).first).toBe(1);expect(cubeTransfer(start+5.5).last).toBe(0);
   expect(cubeTransfer(start+10).arrived).toBe(true);
  }
  expect(cubeTransfer(11).route[2]).toBe(cubeTransfer(12).route[0]);
 });
});
