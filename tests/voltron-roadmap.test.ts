import {expect,it} from 'vitest';
import {roadmapAscentPose,roadmapPhaseForYear,roadmapYears,voltronRoadmap} from '../lib/voltron-roadmap';
it('keeps one shared decade with Year 5 quality-readiness evidence',()=>{
 expect(voltronRoadmap).toHaveLength(5);expect(roadmapYears).toEqual([1,2,3,4,5,6,7,8,9,10]);
 expect(roadmapPhaseForYear(5)).toBe(2);expect(voltronRoadmap[2].evidence).toEqual(['Process repeatability','Inspection evidence','Requirement traceability','Customer qualification']);
 expect(voltronRoadmap.every(m=>m.gate.length>12)).toBe(true);
});

it('adds five strictly increasing cubes without changing their shared support height',()=>{
 const poses=[0,1,2,3,4].map(roadmapAscentPose);
 expect(poses).toHaveLength(5);
 poses.forEach((p,i)=>{expect(p.y-p.size/2).toBeCloseTo(.08);if(i)expect(p.size).toBeGreaterThan(poses[i-1].size);});
});
