const ease=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
export const ontologyPuzzleDuration=12;
export const ontologyPuzzlePieces=8;
export function ontologyPuzzleState(seconds:number){
 const time=Math.max(0,Math.min(ontologyPuzzleDuration,Number.isFinite(seconds)?seconds:0));
 const form=ease(time/3);
 const fit=ease((time-3.1)/5.6);
 return {time,done:time===ontologyPuzzleDuration,form,fit,pieces:ontologyPuzzlePieces,phase:time<3?'forming':time<8.8?'fitting':time<12?'settling':'settled'};
}
