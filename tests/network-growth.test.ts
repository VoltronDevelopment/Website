import {describe,it,expect} from 'vitest';
import {plantBuildState} from '../components/network/network-growth';
describe('Plant construction',()=>{
 it('only glows after equipment, systems and roof have completed',()=>{expect(plantBuildState(19).complete).toBe(false);expect(plantBuildState(19.9).glow).toBe(0);const s=plantBuildState(22);expect(s.frame).toBe(1);expect(s.envelope).toBe(1);expect(s.equipment).toBe(1);expect(s.systems).toBe(1);expect(s.roofClose).toBe(1);expect(s.glow).toBeGreaterThan(.9);expect(plantBuildState(24).glow).toBeCloseTo(.28);});
});
