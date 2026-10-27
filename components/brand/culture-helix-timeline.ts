export const cultureHelixDuration=7.5;
const ease=(v:number)=>{const p=Math.max(0,Math.min(1,v));return p*p*(3-2*p);};
/** Absolute-time choreography: seeking and resuming produce the same finite story. */
export function cultureHelixState(seconds:number){
 const time=Number.isFinite(seconds)?Math.max(0,Math.min(cultureHelixDuration,seconds)):0;
 return {time,arrival:ease(time/1.4),twist:ease((time-1.4)/2.4),gather:ease((time-5.2)/2.3),
  enclosure:ease((time-6.2)/1.3),bridges:Array.from({length:5},(_,i)=>ease((time-3.8-i*.22)/.22)*(1-ease((time-5.2)/.5))),
  phase:time<1.4?'arriving':time<3.8?'intertwining':time<5.2?'connecting':time<7.5?'gathering':'settled',done:time>=cultureHelixDuration};
}
