export type LatticeView="home"|"technology";
export const homeCells=[[-.5,.5,-.5],[.5,.5,-.5],[-.5,.5,.5],[.5,.5,.5],[-.5,1.5,-.5],[.5,1.5,-.5],[-.5,1.5,.5]];
export function cellsAt(mix:number){
  const pitch=1+.58*Math.max(0,Math.min(1,mix));
  return homeCells.map(([x,y,z])=>[x*pitch,y===.5?.5:.5+pitch,z*pitch]);
}
export const viewForPath=(path:string):LatticeView|null=>path==="/"?"home":path==="/technology"?"technology":null;
export const mixForView=(view:LatticeView)=>view==="home"?0:1;
export function transitionMix(from:number,to:number,progress:number){
  const t=Math.max(0,Math.min(1,progress));
  return from+(to-from)*(t*t*(3-2*t));
}
export function canMorph({width,reduced,saveData,visible,settled,fallback}:{width:number;reduced:boolean;saveData:boolean;visible:number;settled:boolean;fallback:boolean}){
  return width>=768&&!reduced&&!saveData&&visible>=.5&&settled&&!fallback;
}
