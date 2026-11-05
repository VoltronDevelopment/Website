import {describe,it,expect} from 'vitest';
import {homePhilosophyCubeState,philosophyDimensions,homePhilosophyDuration} from '../components/home/philosophy-cube-timeline';
describe('homepage Philosophy spatial alignment and descent',()=>{
 it('keeps a solid cube above the structure until alignment completes',()=>{expect(homePhilosophyCubeState(2.6).individual).toBe(1);expect(homePhilosophyCubeState(4).individual).toBe(1);expect(homePhilosophyCubeState(4).height).toBe(philosophyDimensions.travel);expect(homePhilosophyCubeState(5).height).toBeLessThan(philosophyDimensions.travel);});
 it('enters the inner core and merges at its center',()=>{const pose=homePhilosophyCubeState(homePhilosophyDuration);expect(pose.height).toBe(0);expect(pose.individual).toBe(1);expect(pose.merge).toBe(1);expect(homePhilosophyCubeState(6).merge).toBe(0);expect(homePhilosophyCubeState(99).height).toBe(pose.height);expect(homePhilosophyCubeState(NaN).individual).toBe(1);});
});
