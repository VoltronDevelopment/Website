import {smooth} from './network-story';
export function plantBuildState(time:number){
 return {foundation:smooth(time/2.5),frame:smooth((time-3)/3),envelope:smooth((time-7)/3),equipment:smooth((time-11)/3),systems:smooth((time-16)/2),roofClose:smooth((time-18)/2),complete:time>=20,glow:time<20?0:smooth((time-20)/.4)*(.28+.72*Math.sin(Math.PI*smooth((time-20)/4)))};
}
