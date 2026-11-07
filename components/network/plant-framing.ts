import {smooth} from './network-story';

type Frame = readonly [time:number, x:number, y:number, z:number, height:number, width:number];

// The last two values are minimum vertical and horizontal coverage in plant units.
// Both constraints matter on narrow phones and on wide, shallow desktop canvases.
const owned:readonly Frame[] = [
 [0,0,1,1,14,21], [3,0,1,1,14,21],
 [5,-4,1,4,7,8], [6,-4,1,4,7,8],
 [8,-2.4,1.4,-1.8,5.6,6], [9,.9,1.3,-1.8,5.6,7.1],
 [10.8,.9,1.3,-1.8,5.6,7.1], [11.85,4.2,1.28,-1.8,5.6,7.1], [12.15,4.2,1.28,-1.8,5.6,7.1],
 [13,3.4,1.3,1,4.6,5.4], [15,3.4,1.3,1,4.6,5.4],
 [16.3,4.3,1,3.2,5,6], [19,0,1,1,14,21],
];

const partnership:readonly Frame[] = [
 [0,0,.6,0,13,21], [3,0,.6,0,13,21],
 [5,-2,1.8,-.5,9,12], [7,-2,1.8,-.5,9,12],
 [9,.2,1.4,2.9,6.6,8], [10,.2,1.4,2.9,6.6,8],
 [11.7,-2.5,1.1,-.7,6.8,8], [14,2,1.1,-.7,6.8,8],
 [16,3.8,1.8,-1.2,7,9], [18,3.8,1.8,-1.2,7,9],
 [20,0,1,0,13,21],
];

export function plantFrame(kind:'owned'|'partnership',time:number,aspect:number) {
 const shots=kind==='owned'?owned:partnership;
 let a=shots[0], b=a;
 for(const next of shots.slice(1)){
  b=next;
  if(time<=b[0])break;
  a=b;
 }
 const progress=b===a?0:smooth((time-a[0])/(b[0]-a[0]));
 const mix=(index:number)=>a[index]+(b[index]-a[index])*progress;
 return {x:mix(1),y:mix(2),z:mix(3),height:Math.max(mix(4),mix(5)/Math.max(.1,aspect))};
}
