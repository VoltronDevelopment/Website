import {describe,expect,it} from "vitest";
import {buildHandGeodesics} from "../scripts/hand-surface-binding.mjs";

describe("Hand surface binding",()=>{
 it("measures around the joined palm instead of crossing the air gap between fingers",()=>{
  const points:number[]=[],indices:number[]=[];
  for(const centre of [-.05,.05])for(const y of [0,1,2])for(const side of [-.01,.01])points.push(centre+side,y,0);
  for(const offset of [0,6])for(let row=0;row<2;row++){const a=offset+row*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
  indices.push(0,1,6,1,7,6);
  const binding=buildHandGeodesics(new Float32Array(points),indices,{left:[-.05,2,0],right:[.05,2,0]});
  const atLeft=binding.map[2];
  expect(binding.fields.left[atLeft]).toBeCloseTo(1,1);
  expect(binding.fields.right[atLeft]).toBeGreaterThan(3);
 });
 it("joins duplicated surface positions and leaves disconnected islands unreachable",()=>{
  const points=new Float32Array([0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,10,0,0,11,0,0,10,1,0]);
  const binding=buildHandGeodesics(points,[0,1,2,3,2,4,5,6,7],{palm:[0,0,0]});
  expect(binding.map[0]).toBe(binding.map[3]);
  expect(Number.isFinite(binding.fields.palm[binding.map[4]])).toBe(true);
  expect(binding.fields.palm[binding.map[5]]).toBe(Infinity);
 });
});
