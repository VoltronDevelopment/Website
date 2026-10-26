import {philosophyCubeState,philosophyDimensions,philosophyEase} from "../home/philosophy-cube-timeline";
export type HandSceneKind="culture"|"partner";
export const handSceneDuration={culture:14,partner:9.5} as const;
export const eased=(value:number)=>{const t=Math.max(0,Math.min(1,value));return t*t*t*(t*(t*6-15)+10);};
export const cultureHead={r:-2.6,y:-2.0,d:.22,scale:2.2,yaw:.10} as const;
export const cultureCue={cubeStart:5,rollStart:8.25,rollEnd:10.25,deliveryEnd:11.15,descent:11.35,descentEnd:13.2} as const;
export function handSceneState(kind:HandSceneKind,seconds:number){
 const duration=handSceneDuration[kind],time=Math.max(0,Math.min(duration,Number.isFinite(seconds)?seconds:0));
 const cube=philosophyCubeState(time-(kind==='culture'?cultureCue.cubeStart:2.5));
 return {time,done:time===duration,head:eased((time-.25)/3),arm:eased((time-.9)/3),grip:eased((time-.25)/3.2),
  outer:cube.outer,core:cube.core,individual:cube.individual,height:cube.height,
  emerge:eased((time-3)/1),transfer:eased((time-4)/2.2),carrierFade:eased((time-6.2)/1.6),
  palmCube:eased((time-(cultureCue.rollStart-.55))/.55),
  roll:eased((time-cultureCue.rollStart)/(cultureCue.rollEnd-cultureCue.rollStart)),
  delivery:eased((time-cultureCue.rollEnd)/.90),drop:philosophyEase((time-cultureCue.descent)/1.85),withdraw:eased((time-11.15)/.20),
  settle:eased((time-7.5)/.8)};
}
export function cultureCubePosition(start:readonly number[],drop:number):[number,number,number]{
 const t=Math.max(0,Math.min(1,drop));return [start[0],start[1]-philosophyDimensions.travel*t,start[2]];
}
export function cultureCorePosition(emerge:number,transfer:number):[number,number,number]{
 if(transfer<=0)return [cultureHead.r,-.20+1.40*emerge,cultureHead.d];
 if(transfer>=1)return [0,-.65,0];
 const u=1-transfer;
 return [u*u*cultureHead.r+2*u*transfer*-.9,u*u*1.2+2*u*transfer*2.0+transfer*transfer*-.65,u*u*cultureHead.d];
}
