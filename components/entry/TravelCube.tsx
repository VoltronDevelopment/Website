"use client";
import {useEffect,useRef} from "react";
import posters from "@/lib/scene-posters.json";
import {homeCubeDuration} from "../home/home-cube-timeline";
import {prefersStaticScene} from "../performance/scene-policy";
import type {mountHomeCube} from "../home/home-cube-renderer";

export function TravelCube({moving}:{moving:boolean}){
  const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  const controller=useRef<ReturnType<typeof mountHomeCube>|null>(null);
  const active=useRef(false);
  useEffect(()=>{
    if(prefersStaticScene())return;
    let disposed=false;
    void import("../home/home-cube-renderer").then(async module=>{
      if(disposed||!host.current||!canvas.current)return;
      const scene=module.mountHomeCube(canvas.current,host.current,host.current,{deferStart:true,openingTime:homeCubeDuration+1.7});
      controller.current=scene;
      await scene.ready;
      if(!disposed&&active.current)scene.start();
    }).catch(()=>{ /* The matching poster remains visible if WebGL is unavailable. */ });
    return ()=>{disposed=true;controller.current?.();controller.current=null;};
  },[]);
  useEffect(()=>{active.current=moving;if(moving)controller.current?.start();},[moving]);
  return <div className="travel-path"><div className="entry-home-frame" ref={host}>
    {(["light","dark"] as const).map(theme=><img key={theme} className={"art-theme-"+theme} src={posters.home[theme]} alt=""/>)}
    <canvas ref={canvas}/>
  </div></div>;
}
