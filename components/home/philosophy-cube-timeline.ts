export const philosophyDimensions={outer:2.1,core:.7,individual:.36,travel:2.3} as const;
export const philosophyCamera={position:[6,4.8,7],target:[0,.65,0]} as const;
export const philosophyEase=(value:number)=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
export function philosophyCubeState(seconds:number){const time=Number.isFinite(seconds)?Math.max(0,seconds):0;return {outer:philosophyEase(time/1.05),core:philosophyEase((time-1.2)/1.6),individual:philosophyEase((time-2.9)/.35),height:philosophyDimensions.travel*philosophyEase((time-3.15)/1.85)};}
export const homePhilosophyDuration=6.8;
/** Homepage: form above the structure, hold, then descend onto the core. */
export function homePhilosophyCubeState(seconds:number){const time=Number.isFinite(seconds)?Math.max(0,seconds):0,individual=philosophyEase((time-2.6)/1.4),landing=(philosophyDimensions.core+philosophyDimensions.individual)/2;return {outer:philosophyEase(time/1.05),core:philosophyEase((time-1.2)/1.6),individual,height:philosophyDimensions.travel-(philosophyDimensions.travel-landing)*philosophyEase((time-4.4)/1.9),time};}
