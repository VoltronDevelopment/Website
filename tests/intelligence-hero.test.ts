import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";
import {intelligenceHeroDuration,intelligenceHeroState} from "../components/brand/intelligence-hero-timeline";
describe("Sculpture choreography",()=>{
 it("forms monotonically with connections arriving after anatomy",()=>{let previous=0;for(let t=0;t<=6;t+=.1){const s=intelligenceHeroState(t);expect(s.formation).toBeGreaterThanOrEqual(previous);previous=s.formation;}expect(intelligenceHeroState(3).connections).toBe(0);expect(intelligenceHeroState(6).connections).toBe(1);});
 it("settles and clamps invalid review input",()=>{const s=intelligenceHeroState(30);expect(s.time).toBe(intelligenceHeroDuration);expect(s.formation).toBe(1);expect(s.wave).toBe(0);expect(s.settled).toBe(true);expect(intelligenceHeroState(NaN).time).toBe(0);});
});

it("keeps mesh samples finite and inside the shared cube",()=>{
 const file=readFileSync("public/intelligence/head-points.bin");const points=new Float32Array(file.buffer,file.byteOffset,file.byteLength/4);
 expect(points.length).toBe(45000*8);
 let valid=true;for(let i=0;i<points.length;i+=8){for(let axis=0;axis<3;axis++)if(!Number.isFinite(points[i+axis])||Math.abs(points[i+axis])>=1.6)valid=false;if(Math.abs(Math.hypot(points[i+3],points[i+4],points[i+5])-1)>.0001)valid=false;}expect(valid).toBe(true);
 const depth=readFileSync("public/intelligence/head-depth.bin");const vertices=depth.readUInt32LE(0),indices=depth.readUInt32LE(4);expect(depth.length).toBe(8+vertices*12+indices*4);let validIndices=true;for(let i=8+vertices*12;i<depth.length;i+=4)if(depth.readUInt32LE(i)>=vertices)validIndices=false;expect(validIndices).toBe(true);
});
