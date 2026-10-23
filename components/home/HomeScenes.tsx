"use client";
import {prefersStaticScene} from "@/components/performance/scene-policy";
import {PhilosophyStill} from "../performance/PhilosophyStill";

import { useEffect, useRef } from "react";
import type { CubeKind, mountCubes } from "./cube-renderer";
import {canPrepareHomeScene,prepareScene} from "./scene-preparation";

function CubeScene({kind,active=false,sequence=0,children}: {kind: CubeKind;active?: boolean;sequence?:number;children?: React.ReactNode}) {
  const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  const controller=useRef<ReturnType<typeof mountCubes> | null>(null);
  const activeRef=useRef(active);activeRef.current=active;
  useEffect(()=>{
    let disposed=false,cancel:(()=>void)|undefined;
    const observer=new IntersectionObserver(([entry])=>{
      if(!entry.isIntersecting||prefersStaticScene())return;
      observer.disconnect();
      cancel=prepareScene(async()=>{
        try{
          const {mountCubes}=await import("./cube-renderer");
          if(disposed || !host.current || !canvas.current)return;
          controller.current=mountCubes(canvas.current,host.current,{kind,active:activeRef.current,sequence});
          await controller.current.ready;
        }catch{if(host.current)host.current.style.setProperty("--asset-reveal","1");}
      },canPrepareHomeScene);
    },{rootMargin:kind==="enclosure"?"700px 0px":"300px 0px"});
    if(host.current)observer.observe(host.current);
    const sceneMotionPreference=matchMedia("(prefers-reduced-motion: reduce)");
    const retryScene=()=>{if(!prefersStaticScene()&&!controller.current&&host.current){observer.unobserve(host.current);observer.observe(host.current);}};
    sceneMotionPreference.addEventListener("change",retryScene);
    return ()=>{sceneMotionPreference.removeEventListener("change",retryScene);disposed=true;cancel?.();observer.disconnect();controller.current?.dispose();controller.current=null;};
  },[kind,sequence]);
  useEffect(()=>{controller.current?.setActive(active);},[active]);
  return <div ref={host} className={`home-cube-scene home-cube-${kind}`} aria-hidden="true">{kind==="philosophy"&&<PhilosophyStill/>}<canvas ref={canvas}/>{children}</div>;
}

export { FactorySystems } from "./FactorySystems";

export { HomeLotFlow } from "./LotStory";

export function PhilosophyScene(){return <CubeScene kind="philosophy"/>;}
