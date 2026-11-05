export const intelligenceHeroDuration = 13;
const clamp=(value:number)=>Math.max(0,Math.min(1,value));
const smooth=(value:number)=>{const t=clamp(value);return t*t*t*(t*(t*6-15)+10);};
/** Two sequential quality sheets clear the formed head before its turn. */
export function intelligenceScanState(seconds:number){
 const time=Number.isFinite(seconds)?Math.max(0,seconds):0;
 const pass=(start:number,end:number)=>{const progress=clamp((time-start)/(end-start));return {progress,strength:time<=start||time>=end?0:Math.sin(Math.PI*progress)};};
 return {horizontal:pass(6.2,7.1),vertical:pass(7.2,8.1)};
}
/** Projector, square beam, surface gather, one scan, then a readable settled portrait. */
export function intelligenceHeroState(seconds:number){
 const time=Number.isFinite(seconds)?Math.max(0,Math.min(intelligenceHeroDuration,seconds)):0;
 const cube=smooth(time/1.6);
 const beam=smooth((time-1.6)/1.2);
 const head=smooth((time-2.8)/3.4);
 const turn=smooth((time-8.1)/4.1);
 return {
  time,cube,beam,head,formation:head,yaw:0,turn,
  scans:intelligenceScanState(time),
  settled:time>=intelligenceHeroDuration,
  phase:time>=intelligenceHeroDuration?'settled':time>=8.1?'settling':time>=6.2?'scan':time>=2.8?'forming':time>=1.6?'beam':'projecting',
 };
}
