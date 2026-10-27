import {smooth} from './human-hero-timeline';
export const commonsTreeDuration=10.5;
export const commonsFence=[[0,-.65,0]] as const;
export const commonsRootSurface=commonsFence[0][1]+1.45/2;
export function commonsEnergyY(progress:number){
 const t=Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0;
 return commonsFence[0][1]+(commonsRootSurface-commonsFence[0][1])*t;
}
export function commonsTreeState(seconds:number){
 const time=Math.max(0,Math.min(commonsTreeDuration,Number.isFinite(seconds)?seconds:0));
 return {time,done:time===commonsTreeDuration,cubes:commonsFence.map((_,i)=>smooth((time-.15-i*.18)/.85)),power:smooth((time-1.1)/.75)*(1-smooth((time-4.6)/1.4)),growth:smooth((time-1.65)/6.4),canopy:smooth((time-4.8)/3.4),settle:smooth((time-8.5)/2)};
}
