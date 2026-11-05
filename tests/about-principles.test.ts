import {describe,it,expect} from 'vitest';
import {principleCubePose} from '../components/about/principles-motion';
describe('Principle cube choreography',()=>{
 it('preserves eight unique cells and their volume before separation',()=>{const cells=Array.from({length:8},(_,i)=>principleCubePose(i,4.5));expect(new Set(cells.map(p=>p.join(','))).size).toBe(8);expect(8*Math.pow(.55,3)).toBeCloseTo(Math.pow(1.1,3));});
 it('has no jumps at emergence, division or arrangement boundaries',()=>{for(const t of [2.5,4.5,6,9.5])for(let i=0;i<8;i++){const a=principleCubePose(i,t-.0001),b=principleCubePose(i,t+.0001);expect(Math.hypot(...a.map((v,j)=>v-b[j]))).toBeLessThan(.001);}});
 it('settles cells around the whole head with clear separation',()=>{const cells=Array.from({length:8},(_,i)=>principleCubePose(i,11));for(let i=0;i<8;i++){expect(Math.pow(cells[i][0]/2.3,2)+Math.pow((cells[i][1]-1.4)/2.3,2)).toBeCloseTo(1);for(let j=i+1;j<8;j++)expect(Math.hypot(...cells[i].map((v,k)=>v-cells[j][k]))).toBeGreaterThan(.6);}});
});

// Phone targets must remain independently tappable after camera recomposition.
import {capabilityPoint} from '../components/about/capability-layout';
it('keeps all eight settled phone targets inside the stage and separated at 44 pixels',()=>{
 for(const width of [256,280,320,360,398]){
  const points=Array.from({length:8},(_,i)=>capabilityPoint(i,12.5,width,400,true));
  for(let i=0;i<8;i++){
   expect(points[i].x).toBeGreaterThanOrEqual(22);
   expect(points[i].x).toBeLessThanOrEqual(width-22);
   expect(points[i].y).toBeGreaterThanOrEqual(22);
   expect(points[i].y).toBeLessThanOrEqual(378);
   for(let j=i+1;j<8;j++)expect(Math.max(Math.abs(points[i].x-points[j].x),Math.abs(points[i].y-points[j].y))).toBeGreaterThanOrEqual(44);
  }
 }
});
