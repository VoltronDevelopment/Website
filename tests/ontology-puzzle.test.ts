import {describe,it,expect} from 'vitest';
import {ontologyPuzzleDuration,ontologyPuzzlePieces,ontologyPuzzleState} from '../components/brand/ontology-puzzle-timeline';
describe('Ontology puzzle assembly',()=>{
 it('forms the pieces before they move, then locks them',()=>{
  const forming=ontologyPuzzleState(1.4);
  expect(forming.form).toBeGreaterThan(0);expect(forming.form).toBeLessThan(1);expect(forming.fit).toBe(0);
  const fitting=ontologyPuzzleState(6);
  expect(fitting.form).toBe(1);expect(fitting.fit).toBeGreaterThan(0);expect(fitting.fit).toBeLessThan(1);
  const end=ontologyPuzzleState(ontologyPuzzleDuration);
  expect(end.form).toBe(1);expect(end.fit).toBe(1);expect(end.pieces).toBe(ontologyPuzzlePieces);expect(end.done).toBe(true);expect(end.phase).toBe('settled');
  expect(ontologyPuzzleState(NaN).time).toBe(0);expect(ontologyPuzzleState(99).time).toBe(ontologyPuzzleDuration);
 });
});
