import {homeCells} from '../navigation/lattice-transition';
import {retainedCells} from './hero-timeline';

// The orthographic camera looks from (6, 5.25, 8) toward (0, 1, 0).
const length=Math.hypot(6,4.25,8),up=[-6*4.25/(10*length),10/length,-8*4.25/(10*length)];
const baseTop=Math.max(...retainedCells.flatMap(i=>Array.from({length:8},(_,corner)=>{
 const p=[homeCells[i][0]+(corner&1?.5:-.5),homeCells[i][1]+(corner&2?.5:-.5)-1,homeCells[i][2]+(corner&4?.5:-.5)];
 return p.reduce((sum,v,axis)=>sum+v*up[axis],0);
})));
export const homeIdentity={y:baseTop+.98,side:1.65};
export function homeIdentityLayout(width:number,height:number){
 const extent=Math.max(5.35,5.35/(width/height));
 return {x:50,y:50-homeIdentity.y/extent*100,size:homeIdentity.side*height/extent};
}
