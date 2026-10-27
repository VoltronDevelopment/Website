import {describe,it,expect} from 'vitest';
import {SphereGeometry,Vector3} from 'three';
import {globeTextureYaw} from '../components/brand/network-globe-timeline';
import {globeArc,globeCoordinate,globeDuration,globeLinks,globeNodes,globeState} from '../components/brand/network-globe-timeline';
describe('Finite geographic network',()=>{
 it('registers the painted land texture with the coastline/node longitude convention',()=>{
  const geometry=new SphereGeometry(1,360,180),axis=new Vector3(0,1,0);
  for(const lat of [-60,-20,0,30,60])for(const lng of [-180,-90,0,78,135]){
   const index=(90-lat)*361+(lng+180),uv=geometry.getAttribute('uv'),point=new Vector3().fromBufferAttribute(geometry.getAttribute('position'),index).applyAxisAngle(axis,globeTextureYaw);
   expect(uv.getX(index)).toBeCloseTo((lng+180)/360,5);expect(uv.getY(index)).toBeCloseTo((lat+90)/180,5);
   globeCoordinate(lat,lng).forEach((value,i)=>expect(point.getComponent(i)).toBeCloseTo(value,5));
  }geometry.dispose();
 });
 it('forms a complete polygon envelope without keeping a moving signal at rest',()=>{
  let previous=0;for(let t=0;t<=globeDuration;t+=.025){const s=globeState(t);expect(s.envelope).toBeGreaterThanOrEqual(previous);previous=s.envelope;expect(s.envelope).toBeGreaterThanOrEqual(0);expect(s.envelope).toBeLessThanOrEqual(1);}
  expect(globeState(0).envelope).toBe(0);expect(globeState(2.5).envelope).toBe(1);expect(globeState(globeDuration)).toMatchObject({envelope:1,angle:Math.PI*2,energy:0,done:true});
 });
 it('keeps a dense connected regional network with no duplicate or isolated routes',()=>{
  expect(globeNodes.length).toBeGreaterThanOrEqual(32);expect(globeLinks.length).toBeGreaterThanOrEqual(70);
  const keys=globeLinks.map(([a,b])=>[a,b].sort((x,y)=>x-y).join(':'));expect(new Set(keys).size).toBe(keys.length);
  const reached=new Set<number>([0]);for(let pass=0;pass<globeNodes.length;pass++)for(const [a,b]of globeLinks){if(reached.has(a)||reached.has(b)){reached.add(a);reached.add(b);}}
  expect(reached.size).toBe(globeNodes.length);expect(globeNodes.every((_,n)=>globeLinks.filter(([a,b])=>a===n||b===n).length>=2)).toBe(true);
  expect(globeLinks.every((_,i)=>globeState(8.9).arc(i)===1)).toBe(true);
 });
 it('makes exactly one forward turn and retains every completed connection',()=>{let previous=0;for(let i=0;i<=200;i++){const s=globeState(i/200*globeDuration);expect(s.angle).toBeGreaterThanOrEqual(previous);previous=s.angle;}const end=globeState(globeDuration);expect(end.angle).toBe(Math.PI*2);expect(end.energy).toBe(0);expect(globeLinks.every((_,i)=>end.arc(i)===1&&end.response(i)===0)).toBe(true);expect(globeState(NaN).time).toBe(0);});
 it('keeps designed routes above the globe and attached to their geographic endpoints',()=>{for(const [a,b]of globeLinks){const start=globeCoordinate(globeNodes[a][0],globeNodes[a][1],1.8),end=globeCoordinate(globeNodes[b][0],globeNodes[b][1],1.8);globeArc(globeNodes[a],globeNodes[b],0).forEach((v,i)=>expect(v).toBeCloseTo(start[i],4));globeArc(globeNodes[a],globeNodes[b],1).forEach((v,i)=>expect(v).toBeCloseTo(end[i],4));for(let i=0;i<=30;i++)expect(Math.hypot(...globeArc(globeNodes[a],globeNodes[b],i/30))).toBeGreaterThanOrEqual(1.79999);}});
});
