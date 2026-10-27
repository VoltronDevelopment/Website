import {expect,it} from 'vitest';
import {roadmapPhaseForYear,roadmapYears,voltronRoadmap} from '../lib/voltron-roadmap';
it('keeps one shared decade with Year 5 quality-readiness evidence',()=>{
 expect(voltronRoadmap).toHaveLength(5);expect(roadmapYears).toEqual([1,2,3,4,5,6,7,8,9,10]);
 expect(roadmapPhaseForYear(5)).toBe(2);expect(voltronRoadmap[2].evidence).toEqual(['Repeatability of the process','Measurement and inspection evidence','Traceability from requirement to lot','Customer qualification of the work']);
 expect(voltronRoadmap.every(m=>m.gate.length>12)).toBe(true);
});
