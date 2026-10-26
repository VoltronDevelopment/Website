import {describe,it,expect} from 'vitest';
import {homePhilosophyCubeState,philosophyDimensions,homePhilosophyDuration} from '../components/home/philosophy-cube-timeline';
describe('homepage Philosophy particle formation and descent',()=>{
 it('forms the small cube completely before it begins descending',()=>{expect(homePhilosophyCubeState(2.6).individual).toBe(0);expect(homePhilosophyCubeState(4).individual).toBe(1);expect(homePhilosophyCubeState(4.4).height).toBe(philosophyDimensions.travel);expect(homePhilosophyCubeState(5).height).toBeLessThan(philosophyDimensions.travel);});
 it('lands without intersecting the solid inner core and stops at the completed pose',()=>{const pose=homePhilosophyCubeState(homePhilosophyDuration);expect(pose.height-philosophyDimensions.individual/2).toBeCloseTo(philosophyDimensions.core/2,8);expect(pose.individual).toBe(1);expect(homePhilosophyCubeState(99).height).toBe(pose.height);expect(homePhilosophyCubeState(NaN).individual).toBe(0);});
});
