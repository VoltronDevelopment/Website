import {expect,it} from 'vitest';
import {alphaEvidenceFocus} from '../components/manufacturing/alpha-evidence-model';
import {alphaLineStateAt,alphaLineDuration,alphaLineSchedule} from '../components/manufacturing/alpha-line-timeline';
it('follows loading, active operation and process history, then keeps quality release pending',()=>{
 expect(alphaEvidenceFocus(alphaLineStateAt(0))).toBe(0);
 for(const interval of alphaLineSchedule){const state=alphaLineStateAt((interval.t0+interval.t1)/2),active=alphaEvidenceFocus(state);expect(active).toBeGreaterThanOrEqual(0);expect(active).toBeLessThan(4);if(state.processingComplete)expect(active).toBe(3);else if(state.stationId!=='LOAD'&&(state.phase==='hold'||state.phase==='drain'))expect(active).toBe(2);expect(state.qualityReleased).toBe(false);}
 expect(alphaEvidenceFocus(alphaLineStateAt(alphaLineDuration))).toBe(3);
 expect(alphaEvidenceFocus(alphaLineStateAt(0))).toBe(0);
});
