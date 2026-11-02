import {capabilityAngle} from './capabilities';
const ease=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*t*(t*(t*6-15)+10);};
/** Eight half-size cells preserve one source cube's volume and separate without a position jump. */
export function principleCubePose(index:number,time:number):[number,number,number]{
 const lift=ease((time-2.5)/2),split=ease((time-4.5)/1.5),orbit=ease((time-6)/3.5);
 const start=[(index%2-.5)*.56,2.25+lift*1.8+(Math.floor(index/4)-.5)*.56,(Math.floor(index/2)%2-.5)*.56];
 const angle=capabilityAngle(index),target=[Math.cos(angle)*2.3,1.4+Math.sin(angle)*2.3,0];
 return start.map((v,i)=>v+(i===1?.35: v*.3)*split*(1-orbit)+(target[i]-v)*orbit) as [number,number,number];
}
export const principleReveal=(time:number)=>ease(time/2.5);
