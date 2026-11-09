import {expect,it} from 'vitest';
import {homePhilosophyCubeState as pose,philosophyDimensions,homePhilosophyDuration} from '../components/home/philosophy-cube-timeline';
it('preserves three cubes through formation, descent and merge',()=>{
 expect(pose(1.05).outer).toBe(1);expect(pose(2.6).core).toBe(1);
 expect(pose(4)).toMatchObject({individual:1,height:philosophyDimensions.travel});
 expect(pose(5).height).toBeLessThan(philosophyDimensions.travel);
 expect(pose(homePhilosophyDuration)).toMatchObject({height:0,merge:1,phase:'settled'});
 expect(pose(NaN).individual).toBe(0);
});
