export type HumanHeroKind="commons"|"culture";
export type HeroCell={centre:readonly [number,number,number];size:number;start:number;satellite?:boolean};
const clamp=(value:number)=>Math.max(0,Math.min(1,value));
export const smooth=(value:number)=>{const t=clamp(value);return t*t*(3-2*t);};
export const durations={commons:16,culture:5.2};
export const commonsRoot=[0,.7,0] as const;
export const cultureSize=.56;
export const cultureCarryHeight=2.25;
export const cultureDestination=[0,cultureSize/2,0] as const;
export const handContacts={upper:[125,495],lower:[295,645],centre:[210,565],footprint:[270,250],image:[1706,922]} as const;

export function heroCells(kind:HumanHeroKind):HeroCell[]{
  if(kind==="commons")return [
    ...[[-.35,.35,-.35],[.35,.35,-.35],[-.35,.35,.35],[.35,.35,.35]].map((centre,index)=>({centre:centre as [number,number,number],size:.7,start:index*.13})),
    {centre:[-.35,1.05,-.35],size:.7,start:.92},
    {centre:[-1.55,1.1,.1],size:.38,start:2.65,satellite:true},
    {centre:[1.6,2.1,-.1],size:.38,start:2.85,satellite:true},
  ];
  const s=cultureSize;
  const ring=[-s,0,s].flatMap(x=>[-s,0,s].filter(z=>x!==0||z!==0).map(z=>[x,s/2,z]));
  return [...ring,[0,s*1.5,-s]].map((centre,index)=>({centre:centre as [number,number,number],size:s,start:index*.025}));
}

export function humanHeroState(kind:HumanHeroKind,seconds:number,reduced=false){
  const t=reduced?durations[kind]:Math.max(0,Math.min(durations[kind],seconds));
  return {
    time:t,done:t>=durations[kind],
    cells:heroCells(kind).map(cell=>smooth((t-cell.start)/(kind==="commons"?.65:.5))),
    emblem:smooth((t-1.35)/1.55),
    hand:smooth((t-.25)/.75),approach:smooth((t-.7)/1.4),
    heldCube:smooth((t-.8)/.55),drop:smooth((t-2.2)/1.3),
    settle:smooth((t-4.4)/.8),
  };
}
