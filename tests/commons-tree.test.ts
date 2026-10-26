import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {commonsFence,commonsTreeDuration,commonsTreeState} from '../components/brand/commons-tree-timeline';
describe('Commons tree and four-cube energy sequence',()=>{
 it('surrounds the roots with four non-overlapping cubes at matching heights',()=>{
  expect(commonsFence).toHaveLength(4);expect(new Set(commonsFence.map(p=>`${p[0]},${p[2]}`)).size).toBe(4);
  for(const p of commonsFence){expect(p[1]).toBe(.36);expect(Math.hypot(p[0],p[2])).toBeGreaterThan(2);}
 });
 it('establishes the cubes and their energy before growing the tree, then settles',()=>{
  expect(commonsTreeState(1.65).cubes.every(v=>v===1)).toBe(true);expect(commonsTreeState(1.65).power).toBeGreaterThan(0);expect(commonsTreeState(1.65).growth).toBe(0);
  let previous=0;for(let t=0;t<=11;t+=.05){const s=commonsTreeState(t);expect(s.growth).toBeGreaterThanOrEqual(previous);previous=s.growth;}
  const end=commonsTreeState(commonsTreeDuration);expect(end.growth).toBe(1);expect(end.power).toBe(0);expect(end.done).toBe(true);expect(commonsTreeState(NaN).time).toBe(0);expect(commonsTreeState(99).time).toBe(commonsTreeDuration);
 });
 it('retains the source trunk, two cutout foliage materials and valid compact buffers',()=>{
  const root='public/sculptures/commons-tree/',m=JSON.parse(readFileSync(root+'manifest.json','utf8'));expect(m.parts).toHaveLength(3);expect(m.height).toBe(3.4);expect(m.credit.author).toBe('gelmi.com.br');
  for(const [i,part]of m.parts.entries()){const b=readFileSync(root+part.file),v=b.readUInt32LE(0),n=b.readUInt32LE(4);expect(b.length).toBe(8+v*32+n*4);expect(n/3).toBe(part.triangles);expect(readFileSync(root+part.normal).length).toBeGreaterThan(1000);if(i>0)expect(part.cutoff).toBeGreaterThan(.5);for(let k=0;k<n;k++)if(b.readUInt32LE(8+v*32+k*4)>=v)throw Error('Tree index out of bounds');}
  const b=readFileSync(root+'points.bin'),p=new Float32Array(b.buffer,b.byteOffset,b.length/4);expect(p.length/8).toBe(24000);for(let k=0;k<p.length;k+=8){if(!Array.from(p.subarray(k,k+8)).every(Number.isFinite)||p[k+1]<-.0001||p[k+1]>3.4001||Math.abs(Math.hypot(p[k+3],p[k+4],p[k+5])-1)>.002)throw Error('Invalid tree particle');}
 });
});
