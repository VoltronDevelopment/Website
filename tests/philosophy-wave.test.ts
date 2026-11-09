import {expect,it} from 'vitest';
import {homePhilosophyCubeState as pose,philosophyDimensions} from '../components/home/philosophy-cube-timeline';
it('draws edges, forms the core, then completes the shell before ascent',()=>{
 expect(pose(1.2)).toMatchObject({outer:1,core:0,shell:0});
 expect(pose(2.4)).toMatchObject({core:1,shell:0,height:0});
 expect(pose(3.6).shell).toBe(1);
 expect(pose(4.15).height).toBe(0);
 expect(pose(5).height).toBeGreaterThan(0);
 expect(pose(6)).toMatchObject({opening:1,height:philosophyDimensions.travel,phase:'settled'});
});
