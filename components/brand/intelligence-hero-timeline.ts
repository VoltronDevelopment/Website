export const intelligenceHeroDuration = 7.5;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const t=clamp(v);return t*t*t*(t*(t*6-15)+10);};
export function intelligenceScanState(seconds:number){
 const time=Number.isFinite(seconds)?seconds:0;
 const pass=(start:number,end:number)=>{const progress=clamp((time-start)/(end-start));return {progress,strength:Math.sin(Math.PI*progress)};};
 return {horizontal:pass(4.5,5.8),vertical:pass(5.95,7.25)};
}
export function intelligenceHeroState(seconds:number){
 const time=Math.max(0,Math.min(intelligenceHeroDuration,Number.isFinite(seconds)?seconds:0));
 const formation=smooth((time-1.25)/3.2);
 const response=time>=intelligenceHeroDuration?0:smooth((time-5.3)/.6)*(1-smooth((time-6.4)/1.1));
 return {time,formation,wave:1-formation,scans:intelligenceScanState(time),response,enclosure:.18+.82*smooth(time/1.1),settled:time>=intelligenceHeroDuration};
}
