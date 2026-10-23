"use client";
import {prefersStaticScene} from "@/components/performance/scene-policy";

import {ScenePoster} from "../performance/ScenePoster";
import {useEffect,useRef} from "react";
import type {HumanHeroKind} from "./human-hero-timeline";
import "./human-hero.css";

export function HumanHeroArtwork({kind}:{kind:HumanHeroKind}){
  const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    let disposed=false,cleanup:(()=>void)|undefined;
    const view=new IntersectionObserver(async ([entry])=>{
      if(!entry.isIntersecting || prefersStaticScene() || !host.current || !canvas.current)return;
      view.disconnect();try { const {mountHumanHero}=await import("./human-hero-renderer");
      if(disposed || !host.current || !canvas.current)return;
      cleanup=mountHumanHero(canvas.current,host.current,kind);
      } catch { if(host.current)host.current.dataset.fallback="true"; }
    },{rootMargin:"80px"});
    if(host.current)view.observe(host.current);
    const sceneMotionPreference=matchMedia("(prefers-reduced-motion: reduce)");
    const retryScene=()=>{if(!prefersStaticScene()&&!cleanup&&host.current){view.unobserve(host.current);view.observe(host.current);}};
    sceneMotionPreference.addEventListener("change",retryScene);
    return ()=>{sceneMotionPreference.removeEventListener("change",retryScene);disposed=true;view.disconnect();cleanup?.();};
  },[kind]);
  return <div ref={host} className={`human-hero-art human-hero-${kind}`} role="img" aria-label={kind==="commons"?"An opened leaf and circuit emblem grows from a low glass lattice, connected to two satellite cubes.":"A hand guides a glass cube into the central opening of a smaller lattice, lighting its adjoining junctions."}><ScenePoster kind={kind}/><canvas ref={canvas} aria-hidden="true"/></div>;
}
