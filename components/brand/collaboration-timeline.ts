export type CollaborationKind='about'|'partner';
export const collaborationDuration={about:12,partner:12} as const;
export const collaborationOpening=.8;
export const ease=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
export function collaborationState(kind:CollaborationKind,seconds:number){
 const time=Math.max(0,Math.min(12,Number.isFinite(seconds)?seconds:0));
 if(kind==='about')return {time,done:time===12,structure:ease(time/1.8),people:[0,1,2].map(i=>ease((time-1.2-i*.22)/1.7)),walk:ease((time-3.5)/6.9),diagram:0,wire:0,surface:0,scan:0,phase:time<1.8?'structure':time<3.4?'people':time<10.4?'ascending':time<12?'settling':'settled'};
 return {time,done:time===12,structure:ease(time/2),people:[ease((time-1.3)/2),ease((time-1.65)/2)],walk:0,diagram:ease((time-3.2)/1.5)*(1-ease((time-8.1)/1.1)),wire:ease((time-4.2)/1.4)*(1-ease((time-7.4)/1.1)),surface:ease((time-5.2)/3),scan:ease((time-8.1)/1.6),phase:time<2?'table':time<3.7?'people':time<5.2?'blueprint':time<8.2?'materializing':time<10?'inspection':time<12?'settling':'settled'};
}
/** Three authored gait phases share one staircase without jumping at a loop wrap. */
export function collaborationGait(index:number,progress:number){return [2.3,.4,3.4][index]+Math.max(0,Math.min(1,progress))*[5.1,3.1,3.1][index];}
