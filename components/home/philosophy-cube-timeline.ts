export const philosophyDimensions={outer:2.1,core:.7,individual:.36,travel:2.3} as const;
export const philosophyCamera={position:[6,4.8,7],target:[0,.65,0]} as const;
export const philosophyEase=(value:number)=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
export function philosophyCubeState(seconds:number){const time=Number.isFinite(seconds)?Math.max(0,seconds):0;return {outer:philosophyEase(time/1.05),core:philosophyEase((time-1.2)/1.6),individual:philosophyEase((time-2.9)/.35),height:philosophyDimensions.travel*philosophyEase((time-3.15)/1.85)};}
export const homePhilosophyDuration=6.8;
/** The individual aligns above the structure, descends, and joins its core. */
export function homePhilosophyCubeState(seconds:number){
 const t=Number.isFinite(seconds)?Math.max(0,Math.min(homePhilosophyDuration,seconds)):0;
 const descent=philosophyEase((t-4)/2.05),merge=philosophyEase((t-6.05)/.75);
 return {outer:philosophyEase(t/1.05),core:philosophyEase((t-1.2)/1.3),
  shell:philosophyEase((t-1.05)/.85),individual:philosophyEase((t-2.65)/.85),
  height:philosophyDimensions.travel*(1-descent),merge,
  phase:t<1.2?'structure':t<2.6?'core':t<4?'aligning':t<6.05?'descending':t<homePhilosophyDuration?'joining':'settled'};
}
