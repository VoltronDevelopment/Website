import type {Point} from './network-simulation';
import {smooth} from './network-story';

export const cubeIntroDuration=8;
export const cubeSites:Point[]=Array.from({length:8},(_,id)=>[
 (id&1)?4.6:-4.6,(id&2)?9.2:0,(id&4)?4.6:-4.6,
]);
export const cubeEdges=cubeSites.flatMap((_,id)=>[1,2,4]
 .filter(bit=>(id&bit)===0).map(bit=>[id,id|bit] as const));

export function cubeFrame(aspect:number,phone:boolean){
 return {height:Math.max(phone?17.5:17.8,18.3/Math.max(.1,aspect)),target:[0,5.1,-.6] as Point,
  offset:(phone?[17,10,24]:[16,11,24]) as Point};
}

// Two explicit journeys. Each corner has a short hold so the turn and arrival can be read.
export function cubeTransfer(time:number){
 const second=time>=12,local=Math.max(0,Math.min(12,time-(second?12:0)));
 const route=second?[7,3,2]:[4,5,7];
 const first=smooth((local-1.7)/3.35),last=smooth((local-5.8)/3.35);
 const leg=local<5.8?0:1,progress=leg===0?first:last;
 return {route,leg,progress,first,last,arrived:local>=9.15};
}
