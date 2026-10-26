import {describe,it,expect} from "vitest";
import {heroSceneDurations,heroSceneState,type HeroSceneKind} from "../components/brand/hero-scene-timeline";
import {stateAt,duration} from "../components/home/hero-timeline";
describe("Finite hero narratives",()=>{
 it("reveals objects before their relationships and leaves no travelling wave at rest",()=>{
  for(const kind of Object.keys(heroSceneDurations) as HeroSceneKind[]){
   const first=heroSceneState(kind,1.8);expect(first.arrival(0)).toBe(1);expect(first.connection(0)).toBe(0);
   const final=heroSceneState(kind,heroSceneDurations[kind]);expect(final.done).toBe(true);expect(final.wave).toBe(0);expect(final.response).toBe(0);expect(final.finish).toBe(1);expect(final.connection(3)).toBe(1);
   expect(heroSceneState(kind,NaN).time).toBe(0);expect(heroSceneState(kind,-1).time).toBe(0);
  }
 });
 it("moves the coating boundary monotonically and repeatably",()=>{
  let previous=0;for(let t=0;t<=6.2;t+=.05){const state=heroSceneState("manufacturing",t);expect(state.finish).toBeGreaterThanOrEqual(previous);previous=state.finish;expect(heroSceneState("manufacturing",t).finish).toBe(state.finish);}
 });
 it("aligns all seven Home cells before the exact mark finishes appearing",()=>{
  expect(stateAt(4).arrivals.every(a=>a.progress===1)).toBe(true);expect(stateAt(4).logo).toBe(0);expect(stateAt(duration).logo).toBe(1);expect(stateAt(duration).gridPulse).toBe(0);expect(stateAt(duration).done).toBe(true);
 });
});
