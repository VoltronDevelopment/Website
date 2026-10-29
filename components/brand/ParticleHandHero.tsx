"use client";
import {ScenePreparationObserver} from '../performance/scene-preparation-observer';
import {useSceneMotion,resetScenePoster,markSceneFailure} from '../performance/use-scene-motion';
import {ArtworkControls} from "./ArtworkControls";
import {ArtworkInspector} from './ArtworkInspector';
import {ScenePoster} from "../performance/ScenePoster";
import {Pause,Play,RotateCcw} from "lucide-react";
import {useEffect,useRef,useState} from "react";
import {prefersStaticScene} from "../performance/scene-policy";
import {handSceneDuration,type HandSceneKind} from "./hand-scene-timeline";
import type {HandSceneController,HandSceneMode} from "./hand-scene-renderer";
import "./particle-hand-hero.css";
export function ParticleHandHero({kind}:{kind:HandSceneKind}){
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),controller=useRef<HandSceneController|null>(null);
 const [mode,setMode]=useState<HandSceneMode>("static"),[review,setReview]=useState(false);
 const motionRevision=useSceneMotion(host);
 useEffect(()=>{resetScenePoster(host.current,canvas.current);let disposed=false,loading=false;const query=new URLSearchParams(location.search);const forcedStill=query.get("renderer")==="static"||query.get("motion")==="reduced"||query.get("animate")==="0"||query.get("artwork")==="composition";const wantsStill=()=>forcedStill||prefersStaticScene();const motion=matchMedia("(prefers-reduced-motion: reduce)");setReview(new URLSearchParams(location.search).get("hand-review")==="1");
  if(host.current&&wantsStill()){host.current.dataset.fallback="true";host.current.dataset.scenePose="complete";host.current.dataset.sceneState="fallback";}
  const observer=new ScenePreparationObserver(async([entry])=>{if(!entry.isIntersecting||wantsStill()||loading||controller.current||!host.current||!canvas.current)return;loading=true;
   try{const {mountHandScene}=await import("./hand-scene-renderer");if(disposed||wantsStill()||!canvas.current||!host.current)return;const scene=await mountHandScene(canvas.current,host.current,kind,value=>{if(!disposed)setMode(value);});if(disposed||wantsStill())scene.dispose();else {if(host.current)delete host.current.dataset.fallback;controller.current=scene;}}catch{if(!disposed){markSceneFailure(host.current);setMode("static");if(host.current){host.current.dataset.fallback="true";host.current.dataset.scenePose="complete";host.current.dataset.sceneState="fallback";}}}finally{loading=false;}
  },{rootMargin:"450px 0px"});if(host.current)observer.observe(host.current);
  const preference=()=>{if(motion.matches){controller.current?.scrub(handSceneDuration[kind]);setMode("settled");}else if(host.current){if(!forcedStill){delete host.current.dataset.fallback;delete host.current.dataset.scenePose;}observer.unobserve(host.current);observer.observe(host.current);}};motion.addEventListener("change",preference);
  return()=>{disposed=true;observer.disconnect();motion.removeEventListener("change",preference);controller.current?.dispose();controller.current=null;};
 },[kind,motionRevision]);
 return <div className={`particle-hand-artwork particle-hand-${kind}`}><div className="particle-hand-stage" ref={host} role="img" aria-label={kind==="culture"?"Particles form a prominent head and a transparent Voltron cube together. A medium cube leaves the head and settles at the cube centre. A smaller cube then forms from an overhead particle wave, pauses above the enclosure, and descends into the same centre.":"Particles construct two hands holding each other's wrists above the shared Philosophy cube animation."}>
  <ScenePoster kind={kind==="culture"?"handCulture":"handPartner"}/>
  <canvas key={motionRevision} ref={canvas} aria-hidden="true"/>
 </div><ArtworkControls mode={mode} className="particle-hand-controls" onToggle={()=>controller.current?.pause()} onReplay={()=>controller.current?.replay()}/>
 {review&&<div className="hand-review"><label>Artwork time <input type="range" aria-label="Artwork time" min="0" max={handSceneDuration[kind]} step=".05" defaultValue={handSceneDuration[kind]} onChange={e=>controller.current?.scrub(Number(e.target.value))}/></label><a href={`?hand-review=1&hand-view=solid&hand-time=${handSceneDuration[kind]}`}>Solid geometry</a><a href={`?hand-review=1&hand-time=${handSceneDuration[kind]}`}>Particles</a></div>}<ArtworkInspector scene={kind} duration={handSceneDuration[kind]} onSeek={time=>controller.current?.scrub(time)}/></div>;
}
