export const entryFlipDuration=.8;
export const entryHoldDuration=3;
export const entryDuration=5+4*entryFlipDuration+3*entryHoldDuration;
const ease=(value:number)=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};

export function entryStateAt(seconds:number){
  const t=Math.max(0,Math.min(entryDuration,seconds));
  let turn=0;
  for(let index=0;index<4;index++){
    const start=5+index*(entryFlipDuration+entryHoldDuration);
    turn+=ease((t-start)/entryFlipDuration);
  }
  return {
    time:t,
    phase:t<.6?0:t<1.3?1:t<2.6?2:t<4?3:t<5.4?4:t<7.6?5:t<8.4?6:t<9.6?7:8,
    logo:ease((t-.3)/1.2),
    wordmark:ease((t-2.6)/2.2),
    turn,
    face:Math.min(4,Math.floor(turn+.5)),
    entrance:t>=entryDuration?1:0,
    done:t>=entryDuration,
  };
}
