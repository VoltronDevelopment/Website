import {describe,it,expect} from 'vitest';
import {productScenario,graphLinks,graphRecords,scenarioEvents} from '../components/technology/product-scenario';
import {alphaLineDemo,alphaLineDeviationId} from '../components/manufacturing/alpha-line-config';
describe('shared product demonstration',()=>{
 it('preserves the manufacturing identities through every perspective',()=>{for(let i=0;i<5;i++){const state=productScenario(i);expect(state.lot).toBe(alphaLineDemo.lot);expect(state.station).toBe(alphaLineDeviationId);expect(state.carrier).toBe(alphaLineDemo.carrier);}});
 it('requires an observed condition before evidence and a review proposal',()=>{expect(productScenario(1).attention).toBe(false);expect(productScenario(2).attention).toBe(true);expect(productScenario(2).linked).toBe(false);expect(productScenario(3).linked).toBe(true);expect(productScenario(3).review).toBe(false);expect(productScenario(4).review).toBe(true);expect(scenarioEvents).toHaveLength(5);});
 it('keeps every relationship attached to a real record',()=>{const ids=new Set(graphRecords.map(n=>n.id));for(const [a,b]of graphLinks){expect(ids.has(a)).toBe(true);expect(ids.has(b)).toBe(true);}});
});
