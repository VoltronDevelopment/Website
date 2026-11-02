import {describe,it,expect} from 'vitest';
import {ownedMotion,networkStoryIndex,sceneDuration} from '../components/network/network-story';
describe('Network factory story',()=>{
 it('unloads only after the reversing truck has stopped at the receiving bay',()=>{expect(ownedMotion(5.5).truckZ).toBeCloseTo(4.5);expect(ownedMotion(5.5).unload).toBe(0);expect(ownedMotion(6.7).unload).toBe(1);expect(ownedMotion(6.7).truckZ).toBeCloseTo(4.5);expect(ownedMotion(7.5).truckZ).toBeGreaterThan(4.5);});
 it('scans only after the sample has reached inspection, then connects records and capability',()=>{expect(ownedMotion(12.9).scan).toBe(false);expect(ownedMotion(13.5).scan).toBe(true);expect(ownedMotion(15).scan).toBe(false);expect(ownedMotion(15).record).toBe(0);expect(ownedMotion(19).capability).toBe(0);expect(ownedMotion(23).capability).toBe(1);});
 it('maps seeks directly to the same chapter without accumulated state',()=>{for(const kind of ['owned','partnership','learning','products'] as const){expect(networkStoryIndex(kind,0)).toBe(0);expect(networkStoryIndex(kind,sceneDuration(kind))).toBe(kind==='products'?3:5);expect(networkStoryIndex(kind,0)).toBe(0);}});
});
