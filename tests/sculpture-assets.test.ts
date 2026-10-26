import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import * as T from 'three';
import {cultureHead} from '../components/brand/hand-scene-timeline';
import {describe,it,expect} from 'vitest';
describe('Prepared human sculptures',()=>{
 for(const kind of ['head','arm','dosti','planes'])it(`retains valid indexed geometry and unit surface samples for ${kind}`,()=>{
  const b=readFileSync(`public/sculptures/${kind}-mesh.bin`),v=b.readUInt32LE(0),n=b.readUInt32LE(4);
  expect(b.length).toBe(8+v*32+n*4);expect(n/3).toBeLessThanOrEqual(22000);
  const data=new Float32Array(b.buffer,b.byteOffset+8,v*8);let valid=true;
  for(let i=0;i<v;i++)if(!Array.from(data.subarray(i*8,i*8+8)).every(Number.isFinite)||Math.abs(Math.hypot(data[i*8+3],data[i*8+4],data[i*8+5])-1)>.002)valid=false;
  expect(valid).toBe(true);for(let i=0;i<n;i++)if(b.readUInt32LE(8+v*32+i*4)>=v)throw Error('Invalid triangle');
  const p=readFileSync(`public/sculptures/${kind}-points.bin`),points=new Float32Array(p.buffer,p.byteOffset,p.length/4);expect(points.length%8).toBe(0);
  for(let i=0;i<points.length;i+=8)if(!Number.isFinite(points[i])||Math.abs(Math.hypot(points[i+3],points[i+4],points[i+5])-1)>.002||points[i+6]<0||points[i+6]>1)throw Error('Invalid particle target');
 });
 it('removes the brain and prepares compact derivatives rather than runtime source downloads',()=>{
  const manifest=JSON.parse(readFileSync('public/sculptures/manifest.json','utf8'));
  expect(manifest.assets.head.triangles).toBe(7916);expect(manifest.assets.arm.triangles).toBeLessThan(20000);expect(manifest.assets.arm.orientation).toBe('original-y-up');expect(manifest.assets.dosti.triangles).toBe(2588);expect(manifest.assets.dosti.authoredNormals).toBe(true);
  expect(manifest.credits.some((c:{asset:string})=>c.asset==='arm')).toBe(true);
 });
 it('ends the supported rolling route at the canonical cube position and orientation',()=>{
  const path=JSON.parse(readFileSync('public/sculptures/arm-path.json','utf8'));
  expect(path.version).toBe(3);expect(path.pose).toBe('upper-right-palm');expect(path.armRotation).toBeCloseTo(-Math.PI/3);expect(path.armTwist).toBeCloseTo(-Math.PI/4);expect(path.length).toBeLessThan(.35);expect(path.edge).toBe(.36);expect(path.points.length).toBeGreaterThan(50);
  for(const p of path.points){expect(p.supportHits).toBeGreaterThanOrEqual(6);expect(Math.hypot(...p.q)).toBeCloseTo(1,5);expect([p.r,p.y,p.d].every(Number.isFinite)).toBe(true);}
  const end=path.points.at(-1);expect(end.r).toBeCloseTo(0);expect(end.y).toBeCloseTo(0);expect(end.d).toBeCloseTo(0);expect(Math.abs(end.q[3])).toBeCloseTo(1);
 });
 it('keeps the rotating cube clear of the arm at baked and interpolated poses',()=>{
  expect(()=>execFileSync(process.execPath,['scripts/audit-sculpture-motion.mjs'],{stdio:'pipe'})).not.toThrow();
 });
 it('places the head outside the central cube instead of intersecting its glass faces',()=>{
  const b=readFileSync('public/sculptures/head-mesh.bin'),count=b.readUInt32LE(0),data=new Float32Array(b.buffer,b.byteOffset+8,count*8);
  const r=new T.Vector3(7,0,-6).normalize(),n=new T.Vector3(6,0,7).normalize(),basis=new T.Matrix4().makeBasis(r,new T.Vector3(0,1,0),n);let intersections=0;
  for(let i=0;i<count;i++){
   const p=new T.Vector3(data[i*8],data[i*8+1],data[i*8+2]).multiplyScalar(cultureHead.scale).applyAxisAngle(new T.Vector3(0,1,0),cultureHead.yaw).applyMatrix4(basis).addScaledVector(r,cultureHead.r).addScaledVector(n,cultureHead.d);p.y+=cultureHead.y;
   if(Math.abs(p.x)<1.05&&Math.abs(p.z)<1.05&&Math.abs(p.y+.65)<1.05)intersections++;
  }expect(intersections).toBe(0);
 });
});
