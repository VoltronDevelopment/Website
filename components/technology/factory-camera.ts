import {alphaLineCameraOffset} from '../manufacturing/alpha-line-framing';
import {operatingState} from './operating-model';

type Shot={time:number;yaw:number;span:number;target:readonly [number,number,number];phase:string};
const ease=(value:number)=>{const p=Math.max(0,Math.min(1,value));return p*p*p*(p*(p*6-15)+10);};

export function factoryCameraOffset(yaw=0):[number,number,number]{
 const {x,y,z}=alphaLineCameraOffset(yaw,0);
 // View the open rear of the trailer while retaining the Alpha line elevation.
 return [-x,y,z];
}
export const factoryOverviewSpan=(aspect:number)=>Math.max(16.8,39/aspect);

/** Authored holds keep the tank lip and inspection fixture stationary during contact. */
export function factoryCameraShot(state:ReturnType<typeof operatingState>,_phone:boolean,aspect:number){
 const view=(height:number,width:number)=>Math.max(height,width/Math.max(.35,aspect));
 const dock=[-15,1,.1] as const;
 const loading=[-9.4,1,-3.3] as const;
 const process=[state.part.x,1.25,state.part.z] as const;
 const dispatch=[-9.3,1,3] as const;
 const shots:Shot[]=[
  {time:0,yaw:.45,span:view(5.1,7.6),target:dock,phase:'dock'},
  {time:4,yaw:.45,span:view(5.1,7.6),target:dock,phase:'unloading'},
  {time:10.8,yaw:.45,span:view(6.6,10),target:[-10.7,1,3.8],phase:'rack'},
  {time:17.6,yaw:.45,span:view(6.6,10),target:[-10.7,1,3.8],phase:'production-call'},
  {time:22,yaw:0,span:view(7.2,11),target:loading,phase:'loading-bay'},
  {time:26,yaw:0,span:view(6.1,9),target:process,phase:'treatment'},
  {time:52.3,yaw:0,span:view(6.1,9),target:process,phase:'treatment'},
  {time:54,yaw:0,span:view(7.8,11),target:[2,1.25,2.5],phase:'oven'},
  {time:56.5,yaw:0,span:view(7.8,11),target:[2,1.25,2.5],phase:'oven'},
  {time:60,yaw:0,span:view(5.7,7),target:[-4,1.25,2.5],phase:'inspection'},
  {time:66.5,yaw:0,span:view(5.7,7),target:[-4,1.25,2.5],phase:'release'},
  {time:71,yaw:.45,span:view(7.4,10),target:[-5.4,1,4.6],phase:'packing'},
  {time:75,yaw:.45,span:view(7.4,10),target:dispatch,phase:'return'},
  {time:78.5,yaw:.45,span:view(5.8,8.6),target:dock,phase:'dispatch'},
  {time:82,yaw:.45,span:view(5.8,8.6),target:dock,phase:'departure'},
  {time:90,yaw:0,span:factoryOverviewSpan(aspect),target:[-5,1.1,0],phase:'complete'},
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
