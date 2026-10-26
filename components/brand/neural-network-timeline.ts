import {ease} from './hero-scene-timeline';
export const neuralDuration=9.5;
export function neuralState(seconds:number){const time=Math.max(0,Math.min(neuralDuration,Number.isFinite(seconds)?seconds:0));return {time,done:time===neuralDuration,node:(index:number,layer:number)=>ease((time-.15-layer*.3-(index%25)*.016)/.95),links:[0,1,2].map(layer=>ease((time-1.15-layer*.58)/1.65)),energy:ease((time-3.7)/.6)*(1-ease((time-8.25)/1.0)),finish:ease((time-8.45)/.3)*(1-ease((time-8.85)/.65))};}
