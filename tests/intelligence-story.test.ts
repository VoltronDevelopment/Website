import {describe,it,expect} from 'vitest';
import {investigation,specialists,investigationChapters,investigationChapter} from '../components/intelligence/investigation-model';
import {productScenario} from '../components/technology/product-scenario';
import {intelligenceHeroState} from '../components/brand/intelligence-hero-timeline';
describe('Connected Intelligence story',()=>{
 it('retains the Technology manufacturing identity',()=>{expect(investigation.lot).toBe(productScenario(3).lot);expect(investigation.part).toBe(productScenario(3).part);});
 it('keeps process and maintenance parallel and review independent of agents',()=>{expect(investigationChapters[2].agents).toEqual([3,2]);expect(investigationChapters[5].agents).toEqual([]);expect(new Set(specialists.map(a=>a.shape)).size).toBe(6);});
 it('bounds the finite investigation clock',()=>{expect(investigationChapter(NaN)).toBe(0);expect(investigationChapter(-1)).toBe(0);expect(investigationChapter(1)).toBe(5);expect(investigationChapter(8)).toBe(5);});
 it('finishes both inspection passes before turning',()=>{expect(intelligenceHeroState(6.65).scans.horizontal.strength).toBeCloseTo(1);expect(intelligenceHeroState(7.65).scans.vertical.strength).toBeCloseTo(1);for(let t=0;t<13;t+=.025){const s=intelligenceHeroState(t);expect(s.scans.horizontal.strength*s.scans.vertical.strength).toBe(0);if(s.yaw>0)expect(s.scans.horizontal.strength+s.scans.vertical.strength).toBe(0);}});
});
