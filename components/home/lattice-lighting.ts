export type Point=readonly number[];
export const clamp=(value:number)=>Math.max(0,Math.min(1,value));
const smooth=(value:number)=>{const t=clamp(value);return t*t*(3-2*t);};

export function junctionPulse(time:number,start:number,rise=.12,fade=.45){
  const age=time-start;
  if(age<0 || age>rise+fade)return 0;
  return age<rise?smooth(age/rise):1-smooth((age-rise)/fade);
}

export function alignmentLight(time:number,point:Point,cells:readonly Point[],starts:readonly number[]){
  let strength=0;
  cells.forEach((cell,index)=>{
    const distances=point.map((value,axis)=>Math.abs(value-cell[axis]));
    if(distances.every(value=>value<=.501) && distances.some(value=>value>=.49))strength=Math.max(strength,junctionPulse(time,starts[index]+1.5));
  });
  return strength;
}
