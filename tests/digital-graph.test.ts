import {describe,it,expect} from 'vitest';
import {operatingState} from '../components/technology/operating-model';
import {digitalGraphState,scadaTraceValue} from '../components/technology/digital-graph-model';
describe('finite product graph choreography',()=>{
 it('receives the external update before drawing and sending its internal response',()=>{const at=(t:number)=>digitalGraphState(operatingState(t),'V-MO');expect(at(2.3).arrival).toBe(0);expect(at(2.8).arrival).toBe(1);expect(at(2.8).draw).toBeGreaterThan(0);expect(at(2.8).packetVisible).toBe(false);expect(at(3.3).packetVisible).toBe(true);expect(at(4.2).packetVisible).toBe(false);});
 it('finishes inspection emphasis before beginning the queued release response',()=>{expect(digitalGraphState(operatingState(66.2),'V-MO').eventTime).toBe(65);expect(digitalGraphState(operatingState(67.2),'V-MO').eventTime).toBe(66);});
 it('retains the recorded SCADA anomaly rather than replacing the whole trace',()=>{expect(scadaTraceValue(42)).toBeLessThan(30);expect(scadaTraceValue(53)).toBeGreaterThan(44);expect(scadaTraceValue(42)).toBe(scadaTraceValue(42));});
 it('holds MES progress with the physical carrier and waits for complete evidence before proposing review',()=>{expect(digitalGraphState(operatingState(42),'V-MES').mesProgress).toBe(digitalGraphState(operatingState(49),'V-MES').mesProgress);const before=digitalGraphState(operatingState(44.8),'V-AI');expect(before.evidence.every(p=>p===1)).toBe(true);expect(before.proposal).toBe(0);expect(digitalGraphState(operatingState(47),'V-AI').proposal).toBe(1);});
 it('ends every graph response in stillness and reproduces chapter poses directly',()=>{for(const product of ['V-MO','V-MES','SCADA','V-Twin','V-AI'] as const){const end=digitalGraphState(operatingState(90),product);expect(end.packetVisible).toBe(false);expect(end.response).toBe(0);expect(end).toEqual(digitalGraphState(operatingState(90),product));}});
});
