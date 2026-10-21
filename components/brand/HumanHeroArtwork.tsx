"use client";

import {useEffect,useRef} from "react";
import type {HumanHeroKind} from "./human-hero-timeline";
import "./human-hero.css";

export function HumanHeroArtwork({kind}:{kind:HumanHeroKind}){
  const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    let disposed=false,cleanup:(()=>void)|undefined;
    const view=new IntersectionObserver(async ([entry])=>{
      if(!entry.isIntersecting || !host.current || !canvas.current)return;
      view.disconnect();const {mountHumanHero}=await import("./human-hero-renderer");
      if(disposed || !host.current || !canvas.current)return;
      cleanup=mountHumanHero(canvas.current,host.current,kind);
    },{rootMargin:"80px"});
    if(host.current)view.observe(host.current);
    return ()=>{disposed=true;view.disconnect();cleanup?.();};
  },[kind]);
  return <div ref={host} className={`human-hero-art human-hero-${kind}`} role="img" aria-label={kind==="commons"?"An opened leaf and circuit emblem grows from a low glass lattice, connected to two satellite cubes.":"A hand guides a glass cube into the central opening of a smaller lattice, lighting its adjoining junctions."}><canvas ref={canvas} aria-hidden="true"/></div>;
}
