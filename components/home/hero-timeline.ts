export const duration=9;
export const starts=[.05,.15,.3,.4,.9,1.05,1.2];
export const offsets=[[-.18,.10,-.15],[.18,.12,-.1],[-.15,.15,.16],[.15,.12,.15],[-.12,.22,-.12],[.14,.20,-.12],[-.15,.18,.1]];
export const revealCells=[5,6] as const;
export const chamberCell=4;
export const retainedCells=[0,1,2,3] as const;
const clamp=(v:number)=>Math.min(1,Math.max(0,v));
export const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
export function stateAt(seconds:number){
 const t=Number.isFinite(seconds)?Math.min(duration,Math.max(0,seconds)):0;
 return {time:t,arrivals:starts.map(start=>{const progress=clamp((t-start)/1);return {progress,travel:smooth(progress),visible:progress>0};}),
  resolve:smooth((t-1.8)/.4),ground:smooth(t/.4),connection:0,logo:smooth((t-6.8)/1),
  chamberLift:smooth((t-2.75)/1.45),slice:smooth((t-5)/1.8),
  activation:smooth((t-2.4)/.15)*(1-smooth((t-2.8)/.15)),children:t>=2.95&&t<5.1,
  parent:(index:number)=>revealCells.some(i=>i===index)&&t>=2.95?0:1,
  response:smooth((t-7.5)/.2)*(1-smooth((t-8.1)/.4)),
  gridPulse:0,pulse:t>=8?(.5-.5*Math.cos(Math.max(0,seconds-8)*Math.PI/3)):0,done:t>=duration};
}
/** Children exactly tile their parent at exchange; movement uses fixed camera-board axes. */
export function fragmentAt(seconds:number,parent:number,index:number){
 const p=smooth((seconds-2.95-index*.022-parent*.045)/1.85);
 const offset:[number,number,number]=[index&1?.25:-.25,index&2?.25:-.25,index&4?.25:-.25];
 const spread=smooth(p/.25)*.13;
 return {offset,travel:p,shift:[p*p*1.35,Math.sin(p*Math.PI/2)*1.05,-p*.85] as [number,number,number],
  separation:offset.map(v=>v*spread) as [number,number,number],scale:1-.16*smooth((p-.65)/.35),
  rotation:[(index%3-1)*.075*p,(index%2?1:-1)*.10*p,(index%4-1.5)*.035*p] as [number,number,number],
  opacity:(seconds<2.95?0:1)*(1-smooth((p-.50)/.45))*(index&4?.55:1)};
}
export function gridOpacityAt(_seconds:number,dark=false){return dark?.035:.03;}
export function latticeWaveAt(seconds:number,distance:number){const p=(seconds-7.5-distance*.08)/.8;return p>0&&p<1?Math.sin(Math.PI*p)**2:0;}
export function scanAt(seconds:number,index:number){
 const assembling=seconds<3.1,start=assembling?2.2+index*.06:7.5+Math.min(3,Math.max(0,index))*.10,p=(seconds-start)/.45,visible=index<(assembling?7:4)&&p>0&&p<1,age=seconds-start-.45;
 return {visible,head:clamp(p),tail:clamp(p-.4),strength:visible?Math.sin(Math.PI*p):0,receiver:index<4&&age>0&&age<.22?Math.sin(Math.PI*age/.22)**2:0};
}
