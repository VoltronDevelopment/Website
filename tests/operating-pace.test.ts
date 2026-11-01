import {describe,it,expect} from 'vitest';
import {operatingState,operatingNumericActivity,advanceOperatingClock} from '../components/technology/operating-model';
describe('operating pace and restrained numeric activity',()=>{
 it('halves tank travel without accelerating review, inspection or handling',()=>{expect(advanceOperatingClock(30,.05)).toBeCloseTo(30.1);expect(advanceOperatingClock(53,.05)).toBeCloseTo(53.1);for(const t of [12,43,63,76])expect(advanceOperatingClock(t,.05)).toBeCloseTo(t+.05);});
 it('crosses rate boundaries without skipping the start of a hold',()=>{expect(advanceOperatingClock(40.96,.05)).toBeCloseTo(41.03);expect(advanceOperatingClock(49.98,.05)).toBeCloseTo(50.06);expect(advanceOperatingClock(89.99,.05)).toBe(90);});
 it('shortens total playback while retaining the complete ordered story',()=>{let time=0,elapsed=0;while(time<90&&elapsed<100){time=advanceOperatingClock(time,.01);elapsed+=.01;}expect(elapsed).toBeCloseTo(77.5,1);});
 it('keeps columns sparse and confines them to review and inspection',()=>{for(const t of [0,25,40,50,58,66,90])expect(operatingNumericActivity(operatingState(t)).opacity).toBe(0);for(const t of [42,44,63]){const n=operatingNumericActivity(operatingState(t));expect(n.opacity).toBeGreaterThan(0);expect(n.columns).toHaveLength(3);expect(n.columns.every(d=>/^\d{6}$/.test(d))).toBe(true);}});
});
