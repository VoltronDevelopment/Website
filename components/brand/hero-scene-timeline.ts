export type HeroSceneKind = "technology" | "manufacturing" | "network" | "ontology" | "about";
export const heroSceneDurations: Record<HeroSceneKind, number> = {technology:9.5,manufacturing:6.2,network:10,ontology:6,about:6};
export const ease = (value:number) => {const t=Math.max(0,Math.min(1,value));return t*t*t*(t*(t*6-15)+10);};
export function heroSceneState(kind:HeroSceneKind, seconds:number){
  const duration=heroSceneDurations[kind],time=Math.max(0,Math.min(duration,Number.isFinite(seconds)?seconds:0));
  return {time,done:time>=duration,ground:ease(time/.6),
    arrival:(index:number)=>ease((time-.3-index*.32)/1.5),
    connection:(index:number)=>ease((time-2.1-index*.22)/1.4),
    finish:ease((time-1.2)/3.1),
    wave:ease((time-.4)/.8)*(1-ease((time-4.3)/1.5)),
    response:ease((time-4.6)/.5)*(1-ease((time-5.1)/.7))};
}
