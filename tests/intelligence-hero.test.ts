import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";
import {intelligenceHeroDuration,intelligenceHeroState} from "../components/brand/intelligence-hero-timeline";
describe("Sculpture choreography",()=>{
 it("forms before the network and has a single finite cube response",()=>{let previous=0;for(let t=0;t<=7.5;t+=.1){const s=intelligenceHeroState(t);expect(s.formation).toBeGreaterThanOrEqual(previous);previous=s.formation;}expect(intelligenceHeroState(3).connections).toBe(0);expect(intelligenceHeroState(4.8).connections).toBeGreaterThan(0);expect(intelligenceHeroState(5).response).toBe(0);expect(intelligenceHeroState(6).response).toBeGreaterThan(0);expect(intelligenceHeroState(7.5).response).toBe(0);});
 it("settles and clamps invalid review input",()=>{const s=intelligenceHeroState(30);expect(s.time).toBe(intelligenceHeroDuration);expect(s.formation).toBe(1);expect(s.wave).toBe(0);expect(s.settled).toBe(true);expect(intelligenceHeroState(NaN).time).toBe(0);});
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
