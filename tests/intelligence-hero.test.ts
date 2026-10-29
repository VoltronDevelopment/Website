import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";
import {intelligenceHeroDuration,intelligenceHeroState} from "../components/brand/intelligence-hero-timeline";
import {intelligenceScanState} from '../components/brand/intelligence-hero-timeline';
import {createPortraitScans} from '../components/brand/portrait-scans';
it('crosses the formed head with one horizontal sheet and clears it before the turn',()=>{
 const scans=createPortraitScans();scans.update(6.9,false);
 expect(scans.group.children).toHaveLength(1);
 const sheet=scans.group.children[0];
 expect(sheet.visible).toBe(true);expect(sheet.rotation.x).toBeCloseTo(-Math.PI/2);expect(sheet.position.y).toBeCloseTo(2.34);
 for(const t of [0,6.2,7.6,13,Infinity,NaN]){scans.update(t,false);expect(scans.group.children.every(plane=>!plane.visible)).toBe(true);}
 for(let t=0;t<=13;t+=.05){const s=intelligenceScanState(t);expect(s.vertical.strength).toBe(0);expect(s.horizontal.strength*s.vertical.strength).toBe(0);}
 scans.group.traverse(o=>{const m=o as import('three').Mesh;m.geometry?.dispose();if(m.material)(Array.isArray(m.material)?m.material:[m.material]).forEach(v=>v.dispose());});
});
it('uses denser finite formation samples without changing other sculpture defaults',async()=>{
 const {createSculptureSurface}=await import('../components/brand/sculpture-surface');const mesh=readFileSync('public/sculptures/planes-mesh.bin'),p=readFileSync('public/sculptures/planes-points.bin');const asset={mesh:mesh.buffer.slice(mesh.byteOffset,mesh.byteOffset+mesh.byteLength) as ArrayBuffer,points:new Float32Array(Array.from(new Float32Array(p.buffer,p.byteOffset,p.byteLength/4)))};
 const normal=createSculptureSurface(asset,'planes',false),desktop=createSculptureSurface(asset,'planes',false,false,2),mobile=createSculptureSurface(asset,'planes',true,false,3);
 expect(normal.particleCount).toBe(32000);expect(desktop.particleCount).toBe(64000);expect(mobile.particleCount).toBe(48000);
 for(const s of [normal,desktop,mobile]){const points=s.group.children[1] as import('three').Points;expect(Array.from(points.geometry.getAttribute('position').array).every(Number.isFinite)).toBe(true);s.dispose();}
});
describe("Hologram choreography",()=>{
 it("gathers the cube, opens the square beam, forms the head, scans once, then turns twice",()=>{
  expect(intelligenceHeroDuration).toBe(13);
  const start=intelligenceHeroState(0);expect(start.cube).toBe(0);expect(start.beam).toBe(0);expect(start.head).toBe(0);expect(start.yaw).toBe(0);
  const cube=intelligenceHeroState(1.6);expect(cube.cube).toBeCloseTo(1);expect(cube.beam).toBe(0);expect(cube.head).toBe(0);
  const beam=intelligenceHeroState(2.8);expect(beam.beam).toBeCloseTo(1);expect(beam.head).toBe(0);
  const formed=intelligenceHeroState(6.2);expect(formed.head).toBeCloseTo(1);expect(formed.scans.horizontal.strength).toBe(0);expect(formed.yaw).toBe(0);
  expect(intelligenceHeroState(6.9).scans.horizontal.strength).toBeCloseTo(1);expect(intelligenceHeroState(6.9).yaw).toBe(0);
  const turning=intelligenceHeroState(7.6);expect(turning.scans.horizontal.strength).toBe(0);expect(turning.yaw).toBe(0);
  const mid=intelligenceHeroState(9.9);expect(mid.yaw).toBeGreaterThan(0);expect(mid.yaw).toBeLessThan(Math.PI*4);
  expect(intelligenceHeroState(12.2).yaw).toBeCloseTo(Math.PI*4);
  let previous=0;for(let t=0;t<=13;t+=.1){const s=intelligenceHeroState(t);expect(s.formation).toBeGreaterThanOrEqual(previous);expect(s.scans.vertical.strength).toBe(0);previous=s.formation;}
 });
 it("settles and clamps invalid review input",()=>{const s=intelligenceHeroState(30);expect(s.time).toBe(intelligenceHeroDuration);expect(s.formation).toBe(1);expect(s.yaw).toBeCloseTo(Math.PI*4);expect(s.settled).toBe(true);expect(intelligenceHeroState(NaN).time).toBe(0);});
});

it("keeps mesh samples finite and inside the shared cube",()=>{
 const file=readFileSync("public/intelligence/head-points.bin");const points=new Float32Array(file.buffer,file.byteOffset,file.byteLength/4);
 expect(points.length).toBe(45000*8);
 let valid=true,top=-Infinity;for(let i=0;i<points.length;i+=8){top=Math.max(top,points[i+1]);for(let axis=0;axis<3;axis++)if(!Number.isFinite(points[i+axis])||Math.abs(points[i+axis])>=1.6)valid=false;if(Math.abs(Math.hypot(points[i+3],points[i+4],points[i+5])-1)>.0001)valid=false;}expect(valid).toBe(true);expect(top).toBeLessThan(1.3);
 const depth=readFileSync("public/intelligence/head-depth.bin");const vertices=depth.readUInt32LE(0),indices=depth.readUInt32LE(4);expect(depth.length).toBe(8+vertices*12+indices*4);let validIndices=true;for(let i=8+vertices*12;i<depth.length;i+=4)if(depth.readUInt32LE(i)>=vertices)validIndices=false;expect(validIndices).toBe(true);
});

it("bounds connectivity and attaches it to sampled anatomy",async()=>{
 const {buildPortraitNetwork}=await import("../components/brand/intelligence-hero-network");const file=readFileSync("public/intelligence/head-points.bin");const a=new Float32Array(file.buffer,file.byteOffset,file.byteLength/4);const graph=buildPortraitNetwork(a),degree=graph.nodes.map(()=>0),unique=new Set();
 expect(graph.nodes.length).toBe(244);expect(graph.nodes.filter(n=>n.anchor).length).toBe(20);
 const xs=graph.nodes.map(n=>(n.position[0]-n.position[2])*Math.SQRT1_2),ys=graph.nodes.map(n=>n.position[1]);expect(Math.min(...xs)).toBeLessThan(-1.9);expect(Math.max(...ys)-Math.min(...ys)).toBeGreaterThan(2.5);
 expect(graph.nodes.every(n=>n.position.every(v=>Math.abs(v)<1.6))).toBe(true);
 for(const edge of graph.edges){degree[edge.a]++;degree[edge.b]++;const key=edge.a+":"+edge.b;expect(unique.has(key)).toBe(false);unique.add(key);}expect(Math.max(...degree)).toBeLessThanOrEqual(4);expect(degree.slice(0,20).every(d=>d>0)).toBe(true);
 const seen=new Set([0]);let changed=true;while(changed){changed=false;for(const {a,b} of graph.edges)if(seen.has(a)!==seen.has(b)){seen.add(a);seen.add(b);changed=true;}}expect(seen.size).toBe(graph.nodes.length);
 expect(buildPortraitNetwork(a)).toEqual(graph);
});
