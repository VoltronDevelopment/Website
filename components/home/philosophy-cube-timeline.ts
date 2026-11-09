export const philosophyDimensions={outer:2.1,core:.7,individual:.36,travel:2.3} as const;
export const philosophyCamera={position:[6,4.8,7],target:[0,.65,0]} as const;
export const philosophyEase=(value:number)=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
export function philosophyCubeState(seconds:number){const time=Number.isFinite(seconds)?Math.max(0,seconds):0;return {outer:philosophyEase(time/1.05),core:philosophyEase((time-1.2)/1.6),individual:philosophyEase((time-2.9)/.35),height:philosophyDimensions.travel*philosophyEase((time-3.15)/1.85)};}
export const homePhilosophyDuration=6.8;
/** One core forms inside the drawn frame and rises through the open crown. */
export function homePhilosophyCubeState(seconds:number){
 const t=Number.isFinite(seconds)?Math.max(0,seconds):0;
 return {outer:philosophyEase(t/1.2),core:philosophyEase((t-1.2)/1.2),
  shell:philosophyEase((t-2.4)/1.2),opening:philosophyEase((t-3.6)/.65),
  height:philosophyDimensions.travel*philosophyEase((t-4.15)/1.8),
  phase:t<1.2?'edges':t<2.4?'core':t<3.6?'shell':t<4.15?'opening':t<5.95?'rising':'settled'};
}
