import {philosophyCubeState,philosophyDimensions,philosophyEase} from "../home/philosophy-cube-timeline";
export type HandSceneKind="culture"|"partner";
export const handSceneDuration={culture:14,partner:9.5} as const;
export const eased=(value:number)=>{const t=Math.max(0,Math.min(1,value));return Math.max(0,Math.min(1,t*t*t*(t*(t*6-15)+10)));};
export const cultureHead={r:0,y:-3.79,d:.08,scale:2.65,yaw:.10} as const;
export const cultureCue={cubeStart:5,rollStart:8.25,rollEnd:10.25,deliveryEnd:11.15,descent:11.35,descentEnd:13.2} as const;
export const cultureParticleCue={formStart:7,formEnd:8.8,descendStart:9.3,descendEnd:12.2,mergeEnd:13.2,originY:2.65} as const;
export function handSceneState(kind:HandSceneKind,seconds:number){
 const duration=handSceneDuration[kind],time=Math.max(0,Math.min(duration,Number.isFinite(seconds)?seconds:0));
 const cube=philosophyCubeState(time-(kind==='culture'?cultureCue.cubeStart:2.5));
 const state={time,done:time===duration,head:eased((time-.25)/3),arm:0,grip:eased((time-.25)/3.2),
  outer:cube.outer,core:cube.core,individual:cube.individual,height:cube.height,
  emerge:eased((time-3)/1),transfer:eased((time-4)/2.2),carrierFade:eased((time-6.2)/1.6),
  palmCube:0,smallFormation:0,smallDescent:0,merge:0,
  roll:eased((time-cultureCue.rollStart)/(cultureCue.rollEnd-cultureCue.rollStart)),
  delivery:eased((time-cultureCue.rollEnd)/.90),drop:philosophyEase((time-cultureCue.descent)/1.85),withdraw:eased((time-11.15)/.20),
  settle:eased((time-7.5)/.8)};
 if(kind!=='culture')return state;
 const cue=cultureParticleCue;
 return {...state,outer:eased((time-.25)/3),core:0,individual:0,emerge:eased((time-3.6)/1.1),transfer:eased((time-4.7)/2),
  smallFormation:eased((time-cue.formStart)/(cue.formEnd-cue.formStart)),smallDescent:eased((time-cue.descendStart)/(cue.descendEnd-cue.descendStart)),merge:eased((time-cue.descendEnd)/(cue.mergeEnd-cue.descendEnd)),drop:0,withdraw:0};
}
export function cultureCubePosition(start:readonly number[],drop:number):[number,number,number]{
 const t=Math.max(0,Math.min(1,drop));return [start[0],start[1]-philosophyDimensions.travel*t,start[2]];
}
/** Medium contribution rises from the head; the smaller contribution forms overhead. */
export function cultureCorePosition(emerge:number,transfer:number):[number,number,number]{if(transfer>=1)return [0,.7,0];return [0,-.48+1.18*transfer,.22*(1-transfer)];}
export function cultureParticleCubePosition(progress:number):[number,number,number]{const t=Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0;return [0,cultureParticleCue.originY-(cultureParticleCue.originY-.7)*t,0];}
/** Retained for archived arm-placement tooling; the Culture renderer uses the overhead path. */
export function cultureHandPosition(transfer:number):[number,number,number]{if(transfer>=1)return [0,.7,0];const t=Math.max(0,Math.min(1,transfer));return [1.9*(1-t),1.55-.85*t+.65*Math.sin(Math.PI*t),.10*(1-t)];}
