import {describe,it,expect} from 'vitest';
import {duration,stateAt,fragmentAt,revealCells,retainedCells,chamberCell,scanAt} from '../components/home/hero-timeline';
describe('Home diagonal identity reveal',()=>{
 it('retains an upper chamber while the other upper cells withdraw',()=>{expect(retainedCells).toEqual([0,1,2,3]);expect(revealCells).toEqual([5,6]);expect(stateAt(3.2).parent(chamberCell)).toBe(1);expect(revealCells.every(i=>stateAt(3.2).parent(i)===0)).toBe(true);});
 it('retains a half-cut chamber while revealing its front-facing identity',()=>{expect(stateAt(5).slice).toBe(0);expect(stateAt(6.8).slice).toBe(1);expect(stateAt(6.8).parent(chamberCell)).toBe(1);expect(stateAt(6.8).logo).toBe(0);expect(stateAt(8).logo).toBe(1);expect(stateAt(duration).connection).toBe(0);});
 it('finishes structure and scans while allowing a bounded ambient pulse',()=>{const end=stateAt(duration);expect(end.done).toBe(true);expect(end.children).toBe(false);for(let i=0;i<7;i++)expect(scanAt(duration,i).visible).toBe(false);for(let p=0;p<2;p++)for(let i=0;i<8;i++)expect(fragmentAt(duration,p,i).opacity).toBe(0);for(let t=9;t<60;t+=.1){const s=stateAt(t);expect(s.pulse).toBeGreaterThanOrEqual(0);expect(s.pulse).toBeLessThanOrEqual(1);expect(s.logo).toBe(1);}expect(stateAt(9).pulse).not.toBe(stateAt(10).pulse);});
 it('clamps invalid review input without losing the completed pose',()=>{expect(stateAt(NaN).time).toBe(0);expect(stateAt(-1).time).toBe(0);expect(stateAt(100).time).toBe(duration);});
});
