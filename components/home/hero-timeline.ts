export const duration=14;
export const starts=[.05,.15,.3,.4,.7,.85,1];
export const offsets=[[-.18,.1,-.15],[.18,.12,-.1],[-.15,.15,.16],[.15,.12,.15],[-.12,.22,-.12],[.14,.20,-.12],[-.15,.18,.1]];
export const revealCells=[5,6] as const;
export const fragmentGrids=[2,3] as const;
export const chamberCell=4;
export const retainedCells=[0,1,2,3] as const;
const clamp=(v:number)=>Math.min(1,Math.max(0,v));
export const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
export function stateAt(seconds:number){
 const t=Number.isFinite(seconds)?Math.min(duration,Math.max(0,seconds)):0;
 return {time:t,arrivals:starts.map(start=>{const progress=clamp((t-start)/1.1);return {progress,travel:smooth(progress),visible:progress>0};}),
 resolve:smooth((t-1.7)/.5),ground:smooth(t/.5),connection:0,logo:smooth((t-11.3)/1),
 chamberLift:smooth((t-2.6)/2.7),turn:smooth((t-5.8)/5.5),turnAngle:smooth((t-5.8)/5.5)*Math.PI*4,
 rounding:smooth((t-6.4)/4.5),slice:0,activation:smooth((t-2.2)/.2)*(1-smooth((t-2.6)/.2)),children:t>=2.7&&t<7.3,
 parent:(index:number)=>revealCells.some(i=>i===index)&&t>=2.7?0:1,
 response:smooth((t-11.3)/.3)*(1-smooth((t-12.3)/.7)),gridPulse:0,
 pulse:t>=12.3?(.5-.5*Math.cos(Math.max(0,seconds-12.3)*Math.PI/1.25)):0,done:t>=duration};
}
/** Exact 2³ and 3³ tilings retreat along camera depth with a matching perspective scale. */
export function fragmentAt(seconds:number,parent:number,index:number){
 const n=fragmentGrids[parent as 0|1]??2,delay=index/(n**3)*.35,p=smooth((seconds-2.7-delay)/4.1);
 const offset:[number,number,number]=[(index%n+.5)/n-.5,(Math.floor(index/n)%n+.5)/n-.5,(Math.floor(index/(n*n))+.5)/n-.5];
 return {offset,travel:p,shift:[(parent?1:-1)*p*.65,Math.sin(p*Math.PI)*.28,-p*p*5] as [number,number,number],
 separation:offset.map(v=>v*p*.3) as [number,number,number],scale:1/(1+p*3.4),
 rotation:[p*.2*(index%3-1),p*.3*(index%2?1:-1),p*.08] as [number,number,number],
 opacity:(seconds<2.7?0:1)*(1-smooth((p-.65)/.35))};
}
export function gridOpacityAt(_seconds:number,dark=false){return dark?.035:.03;}
export function latticeWaveAt(seconds:number,distance:number){const p=(seconds-11.4-distance*.08)/.8;return p>0&&p<1?Math.sin(Math.PI*p)**2:0;}
export function scanAt(seconds:number,index:number){const start=2.05+index*.055,p=(seconds-start)/.5,visible=p>0&&p<1;return {visible,head:clamp(p),tail:clamp(p-.35),strength:visible?Math.sin(Math.PI*p):0,receiver:0};}
