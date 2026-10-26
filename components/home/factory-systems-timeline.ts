export const factorySystemsDuration=16;
export type FactoryPhase='component'|'digitize'|'separate'|'assemble'|'resolve'|'connect'|'settled';
export function smoothProgress(time:number,start:number,end:number){const p=Math.max(0,Math.min(1,(time-start)/(end-start)));return p*p*(3-2*p);}
/** One example, three synchronized perspectives; only the hero owns an ambient loop. */
export function factorySystemsStateAt(seconds:number){
 const time=Math.max(0,Math.min(factorySystemsDuration,Number.isFinite(seconds)?seconds:0));
 const phase:FactoryPhase=time<1?'component':time<2.3?'digitize':time<3.8?'separate':time<5?'assemble':time<8.8?'resolve':time<16?'connect':'settled';
 const activity=(start:number,end:number)=>smoothProgress(time,start,start+.4)*(1-smoothProgress(time,end-.5,end));
 return {time,phase,dissolve:smoothProgress(time,1,2.3),separate:smoothProgress(time,2.3,3.8),particles:1-smoothProgress(time,3.8,4.7),models:smoothProgress(time,3.8,4.6),cards:smoothProgress(time,3.8,4.7),cut:smoothProgress(time,5,8),context:smoothProgress(time,7.5,10.5),intelligence:smoothProgress(time,10,13.5),recommendation:smoothProgress(time,13.5,15.5),
  activity:[activity(4.7,8.8),activity(7.5,11.8),activity(10,14.7)],summaries:[4.6,7.5,10].map(t=>smoothProgress(time,t,t+.6)),records:[[5,5.8,7.3],[8,8.8,9.8],[10.8,12,13.5]].map(rows=>rows.map(t=>smoothProgress(time,t,t+.6))),
  cubes:[0,.08,.16].map(d=>smoothProgress(time,3.5+d,4.3+d)),artworks:[1,1,1],labels:[1,1,1],connections:smoothProgress(time,7.5,10.5),pulse:smoothProgress(time,8,13),settled:time===factorySystemsDuration};
}
