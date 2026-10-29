"use client";
import {ScenePreparationObserver} from '../performance/scene-preparation-observer';
import {useSceneMotion,resetScenePoster,markSceneFailure} from '../performance/use-scene-motion';
import {ArtworkControls} from "./ArtworkControls";
import {ArtworkInspector} from './ArtworkInspector';
import {durations} from './human-hero-timeline';
import {prefersStaticScene} from "@/components/performance/scene-policy";

import {ScenePoster} from "../performance/ScenePoster";
import {Pause,Play,RotateCcw} from "lucide-react";
import {useEffect,useRef,useState} from "react";
import type {HumanHeroKind} from "./human-hero-timeline";
import "./human-hero.css";

export function HumanHeroArtwork({kind}:{kind:HumanHeroKind}){
  const controller=useRef<ReturnType<typeof import("./human-hero-renderer").mountHumanHero>|null>(null);
  const [mode,setMode]=useState("static");
  const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  const motionRevision=useSceneMotion(host);
 useEffect(()=>{resetScenePoster(host.current,canvas.current);
    let disposed=false,cleanup:(()=>void)|undefined;
    const query=new URLSearchParams(location.search),forced=query.get("renderer")==="static"||query.get("motion")==="reduced"||query.get("animate")==="0";
    const still=()=>forced||prefersStaticScene();
    if(still()&&host.current){host.current.dataset.scenePose="complete";host.current.dataset.sceneState="fallback";}
    const view=new ScenePreparationObserver(async ([entry])=>{
      if(!entry.isIntersecting || still() || !host.current || !canvas.current)return;
      view.disconnect();try { const {mountHumanHero}=await import("./human-hero-renderer");
      if(disposed || !host.current || !canvas.current)return;
      controller.current=mountHumanHero(canvas.current,host.current,kind,setMode);cleanup=controller.current;
      } catch { if(!disposed&&host.current){host.current.dataset.fallback="true";host.current.dataset.sceneState="fallback";host.current.dataset.scenePose="complete";markSceneFailure(host.current);} }
    },{rootMargin:"450px 0px"});
    if(host.current)view.observe(host.current);
    const sceneMotionPreference=matchMedia("(prefers-reduced-motion: reduce)");
    const retryScene=()=>{if(!still()&&!cleanup&&host.current){view.unobserve(host.current);view.observe(host.current);}};
    sceneMotionPreference.addEventListener("change",retryScene);
    return ()=>{sceneMotionPreference.removeEventListener("change",retryScene);disposed=true;view.disconnect();cleanup?.();};
  },[kind,motionRevision]);
  return <div className="human-hero-controlled"><div ref={host} className={`human-hero-art human-hero-${kind}`} role="img" aria-label={kind==="commons"?"Eight extended glass corners and transparent faces form one grounded enclosure. Energy reaches the roots, a tree grows inside, and the scene turns twice.":"A transparent Voltron cube forms with a prominent head. A medium cube leaves the head first. A smaller cube forms from overhead particles and descends into the same centre."}><ScenePoster kind={kind}/><canvas key={motionRevision} ref={canvas} aria-hidden="true"/></div><ArtworkControls mode={mode} onToggle={()=>controller.current?.toggle()} onReplay={()=>controller.current?.replay()}/><ArtworkInspector scene={kind} duration={durations[kind]} onSeek={time=>controller.current?.seek(time)}/></div>;
}
