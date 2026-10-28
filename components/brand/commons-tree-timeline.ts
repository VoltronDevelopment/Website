import {smooth} from './human-hero-timeline';
export const commonsTreeDuration=12;
export const commonsCornerCount=8;
export const commonsCubeCenter:[number,number,number]=[0,1.35,0];
export const commonsCubeSpan=4.4;
/** Root plane of the existing tree, kept so the trunk still meets the ground. */
export const commonsRootSurface=.075;
export function commonsTreeState(seconds:number){
 const time=Math.max(0,Math.min(commonsTreeDuration,Number.isFinite(seconds)?seconds:0));
 const cube=smooth(time/2.2);
 const glow=smooth((time-2.2)/.45)*(1-smooth((time-8.4)/1.15));
 const growth=smooth((time-4.2)/4.2);
 const canopy=smooth((time-6.2)/3.2);
 return {time,done:time===commonsTreeDuration,cube,glow,growth,canopy,nodes:commonsCornerCount,settle:smooth((time-9.6)/1.6)};
}
