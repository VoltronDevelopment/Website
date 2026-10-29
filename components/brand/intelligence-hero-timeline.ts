export const intelligenceHeroDuration = 13;
const clamp=(value:number)=>Math.max(0,Math.min(1,value));
const smooth=(value:number)=>{const t=clamp(value);return t*t*t*(t*(t*6-15)+10);};
/** One flat sheet crosses the formed head. It does not overlap the turn. */
export function intelligenceScanState(seconds:number){
 const time=Number.isFinite(seconds)?Math.max(0,seconds):0;
 const start=6.2,end=7.6,progress=clamp((time-start)/(end-start));
 const strength=time<=start||time>=end?0:Math.sin(Math.PI*progress);
 return {horizontal:{progress,strength},vertical:{progress:0,strength:0}};
}
/** Projector, square beam, surface gather, one scan, then two full turns. */
export function intelligenceHeroState(seconds:number){
 const time=Number.isFinite(seconds)?Math.max(0,Math.min(intelligenceHeroDuration,seconds)):0;
 const cube=smooth(time/1.6);
 const beam=smooth((time-1.6)/1.2);
 const head=smooth((time-2.8)/3.4);
 const turn=smooth((time-7.6)/4.6);
 return {
  time,cube,beam,head,formation:head,yaw:turn*Math.PI*4,turn,
  scans:intelligenceScanState(time),
  settled:time>=intelligenceHeroDuration,
  phase:time>=intelligenceHeroDuration?'settled':time>=7.6?'turning':time>=6.2?'scan':time>=2.8?'forming':time>=1.6?'beam':'projecting',
 };
}
