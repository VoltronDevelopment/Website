import {mesMilestones,operatingEvents,operatingProducts,operatingState,type OperatingProduct} from './operating-model';
export const graphEase=(v:number)=>{const p=Math.max(0,Math.min(1,v));return p*p*(3-2*p);};
const schedules=Object.fromEntries(operatingProducts.map(product=>{let available=0;return [product,operatingEvents.filter(event=>event[2].includes(product)).map(event=>{const start=Math.max(event[0],available);available=start+2.05;return {event,start};})];})) as Record<OperatingProduct,{event:typeof operatingEvents[number];start:number}[]>;
export function digitalGraphState(state:ReturnType<typeof operatingState>,product:OperatingProduct){
 const queued=schedules[product].filter(item=>item.start<=state.time).at(-1),event=queued?.event;
 const age=queued?state.time-queued.start:Infinity;
 const arrival=graphEase((age-.48)/.22),draw=graphEase((age-.65)/.55),packet=graphEase((age-1.05)/.6);
 const at=state.routeIndex,segment=Math.floor(at),fraction=at-segment;
 return {eventTime:event?.[0]??-1,age,arrival,draw,packet,packetVisible:age>=1.05&&age<1.65,
  response:age>=1.5&&age<1.95?Math.sin((age-1.5)/.45*Math.PI):0,
  mesProgress:(()=>{const position=state.railProgress;let i=0;while(i<3&&position>=mesMilestones[i+1])i++;return (i+(position-mesMilestones[i])/(mesMilestones[i+1]-mesMilestones[i]))/4;})(),
  traceProgress:graphEase((state.time-24)/34),
  evidence:[42,43,44].map(t=>graphEase((state.time-t)/.55)),proposal:graphEase((state.time-46)/.65),
 };
}
export function scadaTraceValue(time:number){
 const base=49+Math.sin(time*1.25)*2;
 const rise=graphEase((time-40.7)/.8),recover=graphEase((time-50)/1.4);
 return base-27*rise*(1-recover);
}

export function twinPoint(x:number,z:number){return {x:25+(x+4)/(20.7*.42)*125,y:18+(z+3.898)/(13.8*.42)*78};}
