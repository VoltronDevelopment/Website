import {smooth} from './human-hero-timeline';
export const commonsTreeDuration=16;
export const commonsCornerCount=8;
export const commonsCubeSpan=3.8;
/** Root plane of the existing tree, kept so the trunk still meets the ground. */
export const commonsRootSurface=.075;
export const commonsCubeCenter:[number,number,number]=[0,commonsRootSurface+commonsCubeSpan/2,0];
export function commonsTreeState(seconds:number){
 const time=Math.max(0,Math.min(commonsTreeDuration,Number.isFinite(seconds)?seconds:0));
 const cube=smooth((time-4.8)/2.2);
 const glow=smooth((time-7)/.55)*(1-smooth((time-7.85)/1.2));
 const growth=smooth(time/4.8);
 const canopy=smooth((time-2.4)/2.4);
 const turn=smooth((time-9.2)/5);
 return {time,done:time===commonsTreeDuration,cube,glow,growth,canopy,yaw:Math.PI/9*turn,turn,nodes:commonsCornerCount,settle:smooth((time-14.4)/1.4)};
}
