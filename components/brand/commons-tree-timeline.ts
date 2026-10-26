import {smooth} from './human-hero-timeline';
export const commonsTreeDuration=10.5;
export const commonsFence=[[-1.65,.36,-1.65],[1.65,.36,-1.65],[-1.65,.36,1.65],[1.65,.36,1.65]] as const;
export function commonsTreeState(seconds:number){
 const time=Math.max(0,Math.min(commonsTreeDuration,Number.isFinite(seconds)?seconds:0));
 return {time,done:time===commonsTreeDuration,cubes:commonsFence.map((_,i)=>smooth((time-.15-i*.18)/.85)),power:smooth((time-1.1)/.75)*(1-smooth((time-8.5)/2)),growth:smooth((time-1.65)/6.4),settle:smooth((time-8.5)/2)};
}
