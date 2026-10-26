import {describe,it,expect} from "vitest";
import {cultureCorePosition,cultureCubePosition,cultureCue,handSceneDuration,handSceneState} from "../components/brand/hand-scene-timeline";
import {philosophyCubeState,philosophyDimensions} from "../components/home/philosophy-cube-timeline";
describe("Human sculpture choreography",()=>{
 it("uses the homepage Philosophy cube reveal exactly for both hero sequences",()=>{
  for(const kind of ["culture","partner"] as const)for(const t of [0,.5,1.2,2,2.9,3.15,4,5]){
   const state=handSceneState(kind,t+(kind==='culture'?cultureCue.cubeStart:2.5)),home=philosophyCubeState(t);
   expect(state.outer).toBeCloseTo(home.outer,10);expect(state.core).toBeCloseTo(home.core,10);expect(state.individual).toBeCloseTo(home.individual,10);expect(state.height).toBeCloseTo(home.height,10);
  }
 });
 it("finishes the source figures before the core transfer and rolls before descent",()=>{
  expect(handSceneState('culture',3.9).head).toBe(1);expect(handSceneState('culture',4).arm).toBe(1);
  expect(handSceneState('culture',cultureCue.rollEnd).roll).toBe(1);expect(handSceneState('culture',cultureCue.rollEnd).drop).toBe(0);
  expect(handSceneState('culture',cultureCue.descent).withdraw).toBe(1);
 });
 it("returns through the exact reverse Philosophy height curve on a fixed vertical axis",()=>{
  for(let i=0;i<=100;i++){const dt=i/100*1.85,state=handSceneState('culture',cultureCue.descent+dt),p=cultureCubePosition([0,1.65,0],state.drop),home=philosophyCubeState(3.15+dt);
   expect(p[0]).toBe(0);expect(p[2]).toBe(0);expect(p[1]+.65+home.height).toBeCloseTo(philosophyDimensions.travel,8);
  }expect(cultureCubePosition([0,1.65,0],1)[1]).toBeCloseTo(-.65);
 });
 it("moves the inner cube out through the crown before crossing toward the receiver",()=>{
  expect(cultureCorePosition(0,0)).toEqual([-2.6,-.2,.22]);cultureCorePosition(1,0).forEach((v,i)=>expect(v).toBeCloseTo([-2.6,1.2,.22][i],10));expect(cultureCorePosition(1,1)).toEqual([0,-.65,0]);
  expect(cultureCorePosition(.5,0)[0]).toBe(-2.6);
 });
 it("reveals the individual cube on the palm before rolling and holds it before the vertical drop",()=>{
  expect(handSceneState('culture',cultureCue.rollStart-.55).palmCube).toBe(0);
  expect(handSceneState('culture',cultureCue.rollStart).palmCube).toBeCloseTo(1,10);
  expect(handSceneState('culture',cultureCue.rollEnd).roll).toBe(1);
  expect(handSceneState('culture',cultureCue.descent-.01).drop).toBe(0);
 });
 it("finishes once and clamps invalid or out-of-range timeline input",()=>{
  for(const kind of ['culture','partner'] as const){expect(handSceneState(kind,99).time).toBe(handSceneDuration[kind]);expect(handSceneState(kind,99).done).toBe(true);expect(handSceneState(kind,NaN).time).toBe(0);}
 });
});
