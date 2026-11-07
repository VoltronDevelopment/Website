import {alphaLineCameraOffset} from '../manufacturing/alpha-line-framing';
import {operatingState} from './operating-model';

type Shot={time:number;yaw:number;span:number;target:readonly [number,number,number];phase:string};
const ease=(value:number)=>{const p=Math.max(0,Math.min(1,value));return p*p*p*(p*(p*6-15)+10);};

export function factoryCameraOffset(yaw=0):[number,number,number]{
 const {x,y,z}=alphaLineCameraOffset(yaw,0);
 return [x,y,z];
}
export const factoryOverviewSpan=(aspect:number)=>Math.max(13.3,29.5/aspect);

/** Authored holds keep the tank lip and inspection fixture stationary during contact. */
export function factoryCameraShot(state:ReturnType<typeof operatingState>,phone:boolean,aspect:number){
 const wide=factoryOverviewSpan(aspect),part=state.part;
 const receiving:[number,number,number]=[part.x,1.15,part.z];
 const process:[number,number,number]=[part.x,1.25,part.z];
 const stationSpan=Math.max(5.9,9.4/aspect);
 const shots:Shot[]=[
  {time:0,yaw:0,span:wide,target:[0,0,0],phase:'overview'},
  {time:6,yaw:0,span:wide,target:[0,0,0],phase:'arrival'},
  {time:10,yaw:.08,span:phone?19:16,target:[-10,1.1,-4],phase:'receiving'},
  {time:17,yaw:.08,span:phone?19:16,target:[-10,1.1,-4],phase:'receiving'},
  {time:23,yaw:0,span:phone?13:12,target:receiving,phase:'transfer'},
  {time:26,yaw:-.12,span:stationSpan,target:process,phase:'treatment'},
  {time:38.65,yaw:-.12,span:stationSpan,target:process,phase:'treatment'},
  {time:40.6,yaw:-.22,span:stationSpan,target:process,phase:'return-bend'},
  {time:51.2,yaw:-.22,span:stationSpan,target:process,phase:'paint'},
  {time:53.5,yaw:-.12,span:Math.max(12,8/aspect),target:[2,1.3,part.z],phase:'oven'},
  {time:56.5,yaw:-.12,span:Math.max(12,8/aspect),target:[1,1.3,part.z],phase:'oven'},
  {time:58,yaw:-.05,span:Math.max(8,10/aspect),target:[-4,1.25,part.z],phase:'unload'},
  {time:59,yaw:-.05,span:Math.max(4.85,7.7/aspect),target:process,phase:'handoff'},
  {time:61.5,yaw:.09,span:phone?5.8:6.2,target:[-4,1,part.z],phase:'inspection'},
  {time:66.5,yaw:.09,span:phone?5.8:6.2,target:[-4,1,part.z],phase:'inspection'},
  {time:70,yaw:.08,span:phone?15:13,target:[-7,1,5],phase:'packing'},
  {time:78,yaw:.08,span:phone?15:13,target:[-7,1,5],phase:'loading'},
  {time:83,yaw:0,span:wide,target:[0,0,0],phase:'departure'},
  {time:90,yaw:0,span:wide,target:[0,0,0],phase:'complete'},
 ];
 let a=shots[0];
 for(const b of shots.slice(1)){
  if(state.time<=b.time){
   const p=ease((state.time-a.time)/(b.time-a.time));
   const mix=(x:number,y:number)=>x+(y-x)*p;
   return {offset:factoryCameraOffset(mix(a.yaw,b.yaw)),target:a.target.map((n,i)=>mix(n,b.target[i])) as [number,number,number],span:mix(a.span,b.span),phase:a.phase};
  }
  a=b;
 }
 return {...a,offset:factoryCameraOffset(a.yaw)};
}
