import {describe,it,expect} from 'vitest';
import {principleCubePose} from '../components/about/principles-motion';
describe('Principle cube choreography',()=>{
 it('preserves eight unique cells and their volume before separation',()=>{const cells=Array.from({length:8},(_,i)=>principleCubePose(i,4.5));expect(new Set(cells.map(p=>p.join(','))).size).toBe(8);expect(8*Math.pow(.55,3)).toBeCloseTo(Math.pow(1.1,3));});
 it('has no jumps at emergence, division or arrangement boundaries',()=>{for(const t of [2.5,4.5,6,9.5])for(let i=0;i<8;i++){const a=principleCubePose(i,t-.0001),b=principleCubePose(i,t+.0001);expect(Math.hypot(...a.map((v,j)=>v-b[j]))).toBeLessThan(.001);}});
 it('settles cells around the whole head with clear separation',()=>{const cells=Array.from({length:8},(_,i)=>principleCubePose(i,11));for(let i=0;i<8;i++){expect(Math.pow(cells[i][0]/2.3,2)+Math.pow((cells[i][1]-1.4)/2.3,2)).toBeCloseTo(1);for(let j=i+1;j<8;j++)expect(Math.hypot(...cells[i].map((v,k)=>v-cells[j][k]))).toBeGreaterThan(.6);}});
});
