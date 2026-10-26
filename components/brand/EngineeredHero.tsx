"use client";
import {ScenePoster} from "../performance/ScenePoster";
import {ArtworkControls} from "./ArtworkControls";
import {useEffect,useRef,useState} from "react";
import {Pause,Play,RotateCcw} from "lucide-react";
import {prefersStaticScene} from "../performance/scene-policy";
import {heroSceneDurations,type HeroSceneKind} from "./hero-scene-timeline";
import type {EngineeredController,SceneMode} from "./engineered-hero-renderer";
import "./hero-art-direction.css";
import {ArtworkInspector} from './ArtworkInspector';
const descriptions:Record<HeroSceneKind,string>={technology:"A complete four-layer network of 54 blue cube nodes connected by 433 fine strands. Signals travel through the connected architecture.",manufacturing:"A mounting bracket whose satin silver surface becomes graphite as an illustrative particle wave passes across it.",network:"A dimensional globe makes one complete rotation as illustrative manufacturing connections form, then holds the completed network.",ontology:"A manufactured part and its distinct records gather into a connected spatial structure.",about:"Three glass structures align around a shared foundation, connecting production, knowledge and intelligence."};
export function EngineeredHero({kind}:{kind:HeroSceneKind}){
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),controller=useRef<EngineeredController|null>(null);
 const [mode,setMode]=useState<SceneMode>("static"),[review,setReview]=useState(false);
 useEffect(()=>{let disposed=false,loading=false;const abort=new AbortController(),query=new URLSearchParams(location.search),motion=matchMedia("(prefers-reduced-motion: reduce)");
  const forced=query.get("renderer")==="static"||query.get("motion")==="reduced"||query.get("animate")==="0";
  const still=()=>forced||prefersStaticScene();setReview(query.get("hero-review")==="1");
  const fallback=()=>{if(host.current){host.current.dataset.scenePose="complete";host.current.dataset.sceneState="fallback";}setMode("static");};
  if(still())fallback();
  const view=new IntersectionObserver(async([entry])=>{if(!entry.isIntersecting||loading||controller.current||still())return;loading=true;
   try{const mount=kind==="network"?(await import("./network-globe-renderer")).mountNetworkGlobe:(await import("./engineered-hero-renderer")).mountEngineeredHero;if(disposed||!host.current||!canvas.current)return;
    const callback=(value:SceneMode)=>{if(!disposed)setMode(value);};
    const scene=kind==="network"?await (mount as typeof import('./network-globe-renderer').mountNetworkGlobe)(canvas.current,host.current,callback,abort.signal):await (mount as typeof import('./engineered-hero-renderer').mountEngineeredHero)(canvas.current,host.current,kind,callback,abort.signal);
    if(disposed)scene.dispose();else{controller.current=scene;if(still())scene.seek(heroSceneDurations[kind]);}
   }catch{if(!disposed)fallback();}finally{loading=false;}
  },{rootMargin:"80px"});if(host.current)view.observe(host.current);
  const preference=()=>{if(still()){controller.current?.seek(heroSceneDurations[kind]);if(!controller.current)fallback();}else if(host.current&&!controller.current){delete host.current.dataset.scenePose;view.unobserve(host.current);view.observe(host.current);}};
  motion.addEventListener("change",preference);
  return()=>{disposed=true;abort.abort();view.disconnect();motion.removeEventListener("change",preference);controller.current?.dispose();controller.current=null;};
 },[kind]);
 return <div className={`engineered-art engineered-${kind}`}><div className="engineered-stage" ref={host} role="img" aria-label={descriptions[kind]}>
  {kind==='technology'?<ScenePoster kind="technology"/>:<div className="engineered-posters" data-scene-poster aria-hidden="true">{(["opening","complete"] as const).map(pose=><div className={`engineered-pose engineered-${pose}`} key={pose}>{["light","dark"].map(theme=>kind==='network'?<picture key={theme} className={`art-theme-${theme}`}><source media="(max-width:767px)" srcSet={`/heroes/network-${pose}-${theme}-mobile.webp`}/><img src={`/heroes/${kind}-${pose}-${theme}.webp`} alt="" width="960" height="760"/></picture>:<img key={theme} className={`art-theme-${theme}`} src={`/heroes/${kind}-${pose}-${theme}.webp`} alt="" width="960" height="760"/>)}</div>)}</div>}
  <canvas ref={canvas} aria-hidden="true"/>
 </div><ArtworkControls mode={mode} onToggle={()=>controller.current?.toggle()} onReplay={()=>controller.current?.replay()}/>
 {kind==="network"&&<p className="hero-art-caption">Future network vision</p>}
 {review&&<label className="hero-review">Artwork time<input aria-label="Artwork time" type="range" min="0" max={heroSceneDurations[kind]} step=".05" defaultValue={heroSceneDurations[kind]} onChange={event=>controller.current?.seek(Number(event.target.value))}/></label>}
 <ArtworkInspector scene={kind} duration={heroSceneDurations[kind]} onSeek={time=>controller.current?.seek(time)}/></div>;
}
