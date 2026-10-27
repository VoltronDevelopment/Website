export const duration=10;
export const starts=[.05,.18,.30,.42,.55,.68,.8];
export const offsets=[[-.18,.1,-.15],[.18,.12,-.1],[-.15,.15,.16],[.15,.12,.15],[-.12,.22,-.12],[.14,.20,-.12],[-.15,.18,.1]];
export const revealCells=[4,5,6] as const;
export const fragmentGrids=[2,2,3] as const;
export const chamberCell=4;
export const retainedCells=[0,1,2,3] as const;
const clamp=(v:number)=>Math.min(1,Math.max(0,v));
export const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
export function stateAt(seconds:number){
 const t=Number.isFinite(seconds)?Math.min(duration,Math.max(0,seconds)):0;
 return {time:t,arrivals:starts.map(start=>{const progress=clamp((t-start)/2.7);return {progress,travel:smooth(progress),visible:progress>0};}),
 resolve:smooth((t-2.3)/.6),ground:smooth(t/.8),connection:0,logo:smooth((t-6.1)/1.8),
 chamberLift:0,turn:1,turnAngle:0,rounding:0,slice:0,
 activation:smooth((t-2.9)/.25)*(1-smooth((t-3.5)/.3)),children:t>=3.6&&t<9.8,
 parent:(index:number)=>revealCells.some(i=>i===index)&&t>=3.6?0:1,
 response:smooth((t-6.1)/.5)*(1-smooth((t-8.1)/.8)),gridPulse:0,
 pulse:t>=7.9?(.5-.5*Math.cos(Math.max(0,seconds-7.9)*Math.PI/1.25)):0,done:t>=duration};
}
/** Two upper remnants frame the tile; every other exact grid child withdraws into depth. */
export function fragmentAt(seconds:number,parent:number,index:number){
 const n=fragmentGrids[parent as 0|1|2]??2,delay=index/(n**3)*.4,p=smooth((seconds-3.6-delay)/5.4);
 const offset:[number,number,number]=[(index%n+.5)/n-.5,(Math.floor(index/n)%n+.5)/n-.5,(Math.floor(index/(n*n))+.5)/n-.5];
 const held=parent<2&&index===0;
 const slot=parent===2?14+index:parent*7+Math.max(0,index-1),along=slot/40;
 const join=smooth(Math.min(1,p/.28));
 const depth=(1.55+along*4.6)*join;
 return {offset,held,travel:p,shift:[0,0,-depth] as [number,number,number],
 separation:[0,0,0] as [number,number,number],scale:.1*n*(1-p*.04),
 rotation:[0,0,0] as [number,number,number],
 opacity:(seconds<3.6?0:1)*(1-smooth((p-.9)/.1))*(1-smooth((depth-3.35)/.4))};
}
export function gridOpacityAt(_seconds:number,dark=false){return dark?.035:.03;}
export function latticeWaveAt(seconds:number,distance:number){const p=(seconds-6.1-distance*.08)/1.1;return p>0&&p<1?Math.sin(Math.PI*p)**2:0;}
export function scanAt(seconds:number,index:number){const start=2.55+index*.055,p=(seconds-start)/.8,visible=p>0&&p<1;return {visible,head:clamp(p),tail:clamp(p-.4),strength:visible?Math.sin(Math.PI*p):0,receiver:0};}
/** Lift clear of the breakup, hang, then fall under gravity onto the four base crowns. */
export function remnantAt(seconds:number,index:number){
 const delay=index*.25,start=3.6+delay,liftEnd=start+.85,holdEnd=liftEnd+.32;
 const peak=3.2,rest=1.25,gravity=6.4,fallTime=Math.sqrt(2*(peak-rest)/gravity),land=holdEnd+fallTime;
 const lift=smooth((seconds-start)/.85);
 let y=rest+(peak-rest)*lift,fall=0;
 if(seconds>=holdEnd){
  const ft=seconds-holdEnd;fall=Math.min(1,ft/fallTime);
  if(ft<fallTime)y=peak-.5*gravity*ft*ft;
  else{const since=ft-fallTime;y=rest+.18*Math.exp(-since*4.5)*Math.abs(Math.sin(since*12));}
 }
 const near=Math.max(0,1-Math.abs(seconds-land)/.16);
 const left=index===0;
 return {lift,fall,y,squash:seconds>land-.04&&seconds<land+.26?near*.22:0,
  impact:seconds>=land&&seconds<land+.5?Math.sin((seconds-land)/.5*Math.PI):0,landed:seconds>=land,
  yaw:(left?-.62:.7)*smooth((seconds-start)/2.6),pitch:(left?.05:-.04)*smooth((seconds-holdEnd)/.55),
  x:left?-.5:.52,z:left?.2:-.16};
}
