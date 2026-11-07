import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {commonsRootSurface,commonsCubeCenter,commonsCubeSpan,commonsCornerCount,commonsTreeDuration,commonsTreeState} from '../components/brand/commons-tree-timeline';
import {durations} from '../components/brand/human-hero-timeline';
describe('Commons corner cube and tree',()=>{
 it('keeps the tree meeting the same ground plane inside one cube volume',()=>{
  expect(commonsRootSurface).toBeCloseTo(.075);
  expect(commonsCubeCenter[1]-commonsCubeSpan/2).toBeCloseTo(commonsRootSurface);
  expect(commonsCubeSpan).toBeGreaterThan(3.4);
  expect(commonsCornerCount).toBe(8);
 });
 it('forms the corners, glows, grows the tree, then holds a stable view with the glow off',()=>{
  expect(commonsTreeDuration).toBe(16);expect(durations.commons).toBe(commonsTreeDuration);
  const opening=commonsTreeState(1.1);
  expect(opening.cube).toBe(0);expect(opening.growth).toBeGreaterThan(0);expect(opening.yaw).toBe(0);
  const canopy=commonsTreeState(4.8);expect(canopy.canopy).toBe(1);expect(canopy.cube).toBe(0);
  const glazing=commonsTreeState(5.6);expect(glazing.growth).toBe(1);expect(glazing.cube).toBeGreaterThan(0);expect(glazing.glow).toBe(0);
  const pulse=commonsTreeState(7.75);expect(pulse.cube).toBe(1);expect(pulse.glow).toBeGreaterThan(.5);expect(pulse.yaw).toBe(0);
  const grown=commonsTreeState(9.2);
  expect(grown.growth).toBe(1);expect(grown.glow).toBe(0);expect(grown.yaw).toBe(0);
  const mid=commonsTreeState(11.7);
  expect(mid.yaw).toBeGreaterThan(0);
  let previous=0;for(let t=0;t<=commonsTreeDuration;t+=.05){const s=commonsTreeState(t);expect(s.growth).toBeGreaterThanOrEqual(previous);previous=s.growth;}
  const end=commonsTreeState(commonsTreeDuration);expect(end.growth).toBe(1);expect(end.canopy).toBe(1);expect(end.glow).toBe(0);expect(end.yaw).toBeCloseTo(Math.PI/9);expect(end.done).toBe(true);
  expect(commonsTreeState(NaN).time).toBe(0);expect(commonsTreeState(99).time).toBe(commonsTreeDuration);
 });
 it('retains the source trunk, two cutout foliage materials and valid compact buffers',()=>{
  const root='public/sculptures/commons-tree/',m=JSON.parse(readFileSync(root+'manifest.json','utf8'));expect(m.parts).toHaveLength(3);expect(m.height).toBe(3.4);expect(m.credit.author).toBe('gelmi.com.br');
  for(const [i,part] of m.parts.entries()){const b=readFileSync(root+part.file),v=b.readUInt32LE(0),n=b.readUInt32LE(4);expect(b.length).toBe(8+v*32+n*4);expect(n/3).toBe(part.triangles);expect(readFileSync(root+part.normal).length).toBeGreaterThan(1000);if(i>0)expect(part.cutoff).toBeGreaterThan(.5);for(let k=0;k<n;k++)if(b.readUInt32LE(8+v*32+k*4)>=v)throw Error('Tree index out of bounds');}
  const b=readFileSync(root+'points.bin'),p=new Float32Array(b.buffer,b.byteOffset,b.length/4);expect(p.length/8).toBe(24000);for(let k=0;k<p.length;k+=8){if(!Array.from(p.subarray(k,k+8)).every(Number.isFinite)||p[k+1]<-.0001||p[k+1]>3.4001||Math.abs(Math.hypot(p[k+3],p[k+4],p[k+5])-1)>.002)throw Error('Invalid tree particle');}
 });
});
