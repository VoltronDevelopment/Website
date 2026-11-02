import {describe,it,expect} from 'vitest';
import {advanceScenario,taskState,scenarioDuration,scenarioEvents} from '../components/intelligence/scenario';
import {agentPresets,agentSelectionResponse} from '../components/intelligence/agent-presets';
describe('connected investigation',()=>{
 it('lets parallel checks finish before waiting for calibration',()=>{const t=advanceScenario(0,28,true,false);expect(t).toBe(18);expect(taskState(2,t).status).toBe('Complete');expect(taskState(3,t).status).toBe('Complete');expect(taskState(1,t,true,false).status).toBe('Waiting for calibration');expect(taskState(5,t,true,false).status).toBe('Queued');});
 it('resumes from the same point when the missing record arrives',()=>{expect(advanceScenario(18,5,true,true)).toBe(23);expect(taskState(1,23,true,true).progress).toBe(1);expect(taskState(5,23,true,true).active).toBe(true);});
 it('replays identically at different clock increments and clamps at the outcome',()=>{let time=0;for(let n=0;n<280;n++)time=advanceScenario(time,.1,false,false);expect(time).toBeCloseTo(scenarioDuration);expect(advanceScenario(0,40,false,false)).toBe(scenarioDuration);expect(scenarioEvents.at(-1)?.text).toContain('human review pending');});
 it('retains six distinct identities and a finite selection response',()=>{expect(new Set(agentPresets.map(p=>p.seed)).size).toBe(6);expect(new Set(agentPresets.map(p=>p.family)).size).toBe(3);expect(agentPresets.every(p=>p.speed>0)).toBe(true);expect(agentSelectionResponse(2)).toBeGreaterThan(0);expect(agentSelectionResponse(2,true)).toBe(0);expect(agentSelectionResponse(Infinity)).toBe(0);});
});
