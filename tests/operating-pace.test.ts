import {describe,it,expect} from 'vitest';
import {advanceOperatingClock} from '../components/technology/operating-model';
describe('operating pace and restrained numeric activity',()=>{
 it('shortens treatment and CED review while retaining inspection and handling pace',()=>{expect(advanceOperatingClock(30,.05)).toBeCloseTo(30.1);expect(advanceOperatingClock(53,.05)).toBeCloseTo(53.018);expect(advanceOperatingClock(43,.05)).toBeCloseTo(43.1125);for(const t of [12,63,80])expect(advanceOperatingClock(t,.05)).toBeCloseTo(t+.05);});
 it('crosses rate boundaries without skipping the start of a hold',()=>{expect(advanceOperatingClock(40.985,.05)).toBeCloseTo(41.05625);expect(advanceOperatingClock(49.98,.05)).toBeCloseTo(50.01973);expect(advanceOperatingClock(89.99,.05)).toBe(90);});
 it('keeps the intended full playback duration with readable indexed turns',()=>{let time=0,elapsed=0;while(time<90&&elapsed<120){time=advanceOperatingClock(time,.01);elapsed+=.01;}expect(elapsed).toBeCloseTo(94.26,1);});
});
