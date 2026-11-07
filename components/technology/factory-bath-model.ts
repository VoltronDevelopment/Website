import {factoryProcessPosition} from './operating-model';

// Dimensions of the approved Alpha vessel at its .7 overview scale and the .52 panel.
export const factoryBathGeometry={surface:1.82*.7,bottom:.48*.7,partHalfHeight:(.63+.016)*.52,partHalfWidth:(.47+.016)*.52};
const cycles=[
 {lower:26,dwell:27,raise:28.5,clear:29.7,travel:30},
 {lower:31,dwell:32,raise:34,clear:35.6,travel:36},
 {lower:37,dwell:38,raise:50,clear:50.5,travel:50.6},
 {lower:51.84,dwell:51.95,raise:52.08,clear:52.2,travel:52.24},
] as const;

/** Solve contact on the actual authored hoist curve, also deterministic after seeking. */
function crossing(start:number,end:number,height:number,rising:boolean){
 let lo=start,hi=end;
 for(let i=0;i<30;i++){
  const mid=(lo+hi)/2;
  if((factoryProcessPosition(mid).y<height)===rising)lo=mid;else hi=mid;
 }
 return (lo+hi)/2;
}

export const factoryBathContacts=cycles.map(cycle=>{
 const {surface,partHalfHeight}=factoryBathGeometry;
 return {...cycle,
  entry:crossing(cycle.lower,cycle.dwell,surface+partHalfHeight,false),
  submerged:crossing(cycle.lower,cycle.dwell,surface-partHalfHeight,false),
  emergence:crossing(cycle.raise,cycle.clear,surface-partHalfHeight,true),
  exit:crossing(cycle.raise,cycle.clear,surface+partHalfHeight,true),
 };
});

export function factoryBathState(time:number,index:number){
 const cycle=factoryBathContacts[index],{surface,partHalfHeight}=factoryBathGeometry;
 const position=factoryProcessPosition(time);
 const aboveTank=time>=cycle.lower&&time<=cycle.travel;
 const immersion=aboveTank?Math.max(0,Math.min(1,(surface-position.y+partHalfHeight)/(2*partHalfHeight))):0;
 const ages=[cycle.entry,cycle.submerged,cycle.emergence,cycle.exit].map(contact=>time>=contact?time-contact:-1);
 const wetness=time<cycle.emergence?0:Math.exp(-Math.max(0,time-cycle.exit)/2.4);
 return {immersion,ages,wetness,exit:cycle.exit,emissionEnd:cycle.travel,draining:time>=cycle.exit&&time<cycle.travel+.55};
}
