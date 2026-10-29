export type CollaborationKind='about'|'partner';
export const collaborationDuration={about:12,partner:12} as const;
export const collaborationOpening=.8;
export const partnerOpening=1.6;
export const ease=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
export function collaborationState(kind:CollaborationKind,seconds:number){
 const time=Math.max(0,Math.min(12,Number.isFinite(seconds)?seconds:0));
 if(kind==='about')return {time,done:time===12,structure:ease(time/1.8),people:[0,1,2].map(i=>ease((time-1.2-i*.22)/1.7)),walk:ease((time-3.5)/6.9),walks:[0,0],gesture:0,details:0,stamp:0,grip:0,diagram:0,wire:0,surface:0,scan:0,phase:time<1.8?'structure':time<3.4?'people':time<10.4?'ascending':time<12?'settling':'settled'};
 const walks=[ease((time-2.8)/2.8),ease((time-3.0)/2.8)];
 return {time,done:time===12,structure:0,people:[ease((time-.15)/2.4),ease((time-.35)/2.4)],walk:Math.max(...walks),walks,gesture:ease((time-6.1)/1.4),details:ease((time-8.1)/1.8),stamp:ease((time-10)/1.25),grip:0,diagram:0,wire:0,surface:ease((time-7.0)/1.4),scan:0,phase:time<2.8?'people':time<5.8?'arriving':time<6.1?'planted':time<7.0?'presenting':time<8.4?'panel':time<10?'brief':time<11.25?'identity':time<12?'settling':'settled'};
}
/** Three authored gait phases share one staircase without jumping at a loop wrap. */
export function collaborationGait(index:number,progress:number){return [2.3,.4,3.4][index]+Math.max(0,Math.min(1,progress))*[5.1,3.1,3.1][index];}
