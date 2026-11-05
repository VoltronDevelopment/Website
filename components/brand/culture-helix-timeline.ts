export const cultureHelixDuration=9;
const ease=(v:number)=>{const p=Math.max(0,Math.min(1,v));return p*p*(3-2*p);};
/** Absolute-time choreography: seeking and resuming produce the same finite story. */
export function cultureHelixState(seconds:number){
 const time=Number.isFinite(seconds)?Math.max(0,Math.min(cultureHelixDuration,seconds)):0;
 const twist=ease((time-1.4)/2.4);
 return {time,spin:twist*Math.min(time,5.2)*.14,arrival:ease(time/1.4),twist,gather:ease((time-6.6)/2.4),
  enclosure:ease((time-7.6)/1.4),bridges:Array.from({length:5},(_,i)=>ease((time-3.8-i*.22)/.22)*(1-ease((time-6.2)/.4))),
  phase:time<1.4?'arriving':time<3.8?'intertwining':time<6.6?'connecting':time<cultureHelixDuration?'gathering':'settled',done:time>=cultureHelixDuration};
}

/** The CPU bridge endpoints use the same phase and opposite strand spin as the shader. */
export function cultureHelixPoint(t:number,side:0|1,state:ReturnType<typeof cultureHelixState>){
 const angle=t*(.6+state.twist*1.4)*Math.PI*2+side*Math.PI+(side===0?1:-1)*state.spin;
 return [Math.cos(angle)*.57,(t-.5)*3.1,Math.sin(angle)*.57] as const;
}
