export type HeroSceneKind = "technology" | "manufacturing" | "network" | "ontology" | "about";
export const heroSceneDurations: Record<HeroSceneKind, number> = {technology:9.5,manufacturing:8,network:10,ontology:12,about:6};
export const ease = (value:number) => {const t=Math.max(0,Math.min(1,value));return t*t*t*(t*(t*6-15)+10);};
export function manufacturingSurfaceState(seconds:number){
 const time=Math.max(0,Math.min(8,Number.isFinite(seconds)?seconds:0));
 return {formation:ease((time-.5)/2.5),scan:ease((time-3.1)/.3)*(1-ease((time-6.6)/.7)),boundary:-2.5+ease((time-3.2)/3.4)*5,phase:time<.5?'waiting':time<3?'forming':time<7.3?'scanning':'complete'};
}
export function heroSceneState(kind:HeroSceneKind, seconds:number){
  const duration=heroSceneDurations[kind],time=Math.max(0,Math.min(duration,Number.isFinite(seconds)?seconds:0));
  return {time,done:time>=duration,ground:ease(time/.6),
    arrival:(index:number)=>ease((time-.3-index*.32)/1.5),
    connection:(index:number)=>ease((time-2.1-index*.22)/1.4),
    finish:kind==='manufacturing'?ease((time-3.2)/3.4):ease((time-1.2)/3.1),
    wave:ease((time-.4)/.8)*(1-ease((time-4.3)/1.5)),
    response:ease((time-4.6)/.5)*(1-ease((time-5.1)/.7))};
}
