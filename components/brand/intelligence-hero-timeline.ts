export const intelligenceHeroDuration = 6;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const t=clamp(v);return t*t*t*(t*(t*6-15)+10);};
export function intelligenceHeroState(seconds:number){
 const time=Math.max(0,Math.min(intelligenceHeroDuration,Number.isFinite(seconds)?seconds:0));
 const formation=smooth((time-.4)/4.75);
 return {time,formation,wave:1-formation,connections:smooth((time-3.8)/1.4),settled:time>=intelligenceHeroDuration};
}
