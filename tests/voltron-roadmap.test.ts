import {expect,it} from 'vitest';
import {roadmapVisualState,roadmapPhaseForYear,roadmapYears,voltronRoadmap} from '../lib/voltron-roadmap';
it('keeps one shared decade with Year 5 quality-readiness evidence',()=>{
 expect(voltronRoadmap).toHaveLength(5);expect(roadmapYears).toEqual([1,2,3,4,5,6,7,8,9,10]);
 expect(roadmapPhaseForYear(5)).toBe(2);expect(voltronRoadmap[2].evidence).toEqual(['Repeatability of the process','Measurement and inspection evidence','Traceability from requirement to lot','Customer qualification of the work']);
 expect(voltronRoadmap.every(m=>m.gate.length>12)).toBe(true);
});

it('keeps eight aligned capabilities at the centre of the future globe',()=>{
 expect([0,1,2,3,4].map(i=>roadmapVisualState(i).count)).toEqual([1,4,8,8,8]);
 const cube=roadmapVisualState(2);expect(new Set(cube.cells.map(c=>c.join(','))).size).toBe(8);
 for(let axis=0;axis<3;axis++){expect(new Set(cube.cells.map(c=>c[axis])).size).toBe(2);expect(cube.cells.reduce((sum,c)=>sum+c[axis],0)).toBeCloseTo(0);}
 expect(roadmapVisualState(3).cells).toEqual(cube.cells);expect(roadmapVisualState(4).cells).toEqual(cube.cells);expect(roadmapVisualState(3).envelope).toBe(true);
});
