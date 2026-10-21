"use client";

import { useEffect, useRef } from "react";

export function SmallCube({ active=false }: {active?:boolean}) {
  const host=useRef<HTMLSpanElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  const controller=useRef<import("./small-cube-renderer").SmallCubeController|null>(null);
  const activeRef=useRef(active);activeRef.current=active;
  useEffect(()=>{
    let disposed=false;
    const observer=new IntersectionObserver(async ([entry])=>{
      if(!entry.isIntersecting)return;
      observer.disconnect();
      const {mountSmallCube}=await import("./small-cube-renderer");
      if(!disposed&&host.current&&canvas.current)controller.current=mountSmallCube(canvas.current,host.current,activeRef.current);
    },{rootMargin:"80px"});
    if(host.current)observer.observe(host.current);
    return ()=>{disposed=true;observer.disconnect();controller.current?.dispose();controller.current=null;};
  },[]);
  useEffect(()=>controller.current?.setActive(active),[active]);
  return <span ref={host} className="flow-cube small-cube" aria-hidden="true"><canvas ref={canvas}/><svg viewBox="0 0 80 90" fill="none"><path d="M40 4 75 24 40 44 5 24Z" fill="var(--cube-top)" stroke="currentColor"/><path d="M5 24 40 44V84L5 64Z" fill="var(--cube-left)" stroke="currentColor"/><path d="m40 44 35-20v40L40 84Z" fill="var(--cube-right)" stroke="currentColor"/><circle cx="40" cy="25" r="3" fill={active?"var(--blue)":"var(--cyan)"}/></svg></span>;
}
