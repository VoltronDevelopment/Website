"use client";

import { useEffect, useId, useRef, useState } from "react";
import { lotStages } from "@/components/brand/ProcessFlow";
import type { CubeKind, mountCubes } from "./cube-renderer";

function CubeScene({kind,active=false,sequence=0,children}: {kind: CubeKind;active?: boolean;sequence?:number;children?: React.ReactNode}) {
  const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  const controller=useRef<ReturnType<typeof mountCubes> | null>(null);
  const activeRef=useRef(active);activeRef.current=active;
  useEffect(()=>{
    let disposed=false;
    const observer=new IntersectionObserver(async ([entry])=>{
      if(!entry.isIntersecting)return;
      observer.disconnect();const {mountCubes}=await import("./cube-renderer");
      if(disposed || !host.current || !canvas.current)return;
      controller.current=mountCubes(canvas.current,host.current,{kind,active:activeRef.current,sequence});
    },{rootMargin:"120px"});
    if(host.current)observer.observe(host.current);
    return ()=>{disposed=true;observer.disconnect();controller.current?.dispose();controller.current=null;};
  },[kind,sequence]);
  useEffect(()=>{controller.current?.setActive(active);},[active]);
  return <div ref={host} className={`home-cube-scene home-cube-${kind}`} aria-hidden="true"><canvas ref={canvas}/>{children}</div>;
}

const assetRoot="/Brand%20Assets/voltron%20brand%20page/voltron-factory-systems/";
const systems=[
  {title:"Execution",image:"Robot arm and cube conveyor-1.png",text:"Physical production on the factory floor."},
  {title:"Context",image:"Pastel display with floating checklists.png",text:"Manufacturing knowledge in structured form."},
  {title:"Intelligence",image:"Floating Powder-Blue Brain Sculpture.png",text:"Actionable insight across the value chain."},
];

export function FactorySystems(){
  return <div className="home-systems">{systems.map((system,index)=><article key={system.title} className="home-system"><h3>{system.title}</h3><CubeScene kind="enclosure" sequence={index}><img src={assetRoot+encodeURIComponent(system.image)} alt="" width="1280" height="1280" loading="lazy" decoding="async"/></CubeScene><p>{system.text}</p></article>)}</div>;
}

export function HomeLotFlow(){
  const [selected,setSelected]=useState(0);const id=useId();
  return <div className="home-lot"><ol className="home-lot-overview" aria-label="Manufacturing stages">{lotStages.map((stage,index)=><li key={stage.title}><button type="button" aria-pressed={selected===index} aria-controls={id} onClick={()=>setSelected(index)}>{stage.title}</button></li>)}</ol><div className="home-lot-scroll" tabIndex={0} role="region" aria-label="Animated manufacturing conveyor"><div className="home-lot-track"><LotFlowScene selected={selected}/><ol className="home-lot-stages" aria-label="Connected manufacturing flow">{lotStages.map((stage,index)=><li key={stage.title}><button type="button" aria-pressed={selected===index} aria-controls={id} onClick={()=>setSelected(index)}><span>{stage.title}</span><div className="home-cube-lot" data-lot-anchor aria-hidden="true"/></button><p>{stage.record}</p></li>)}</ol></div></div><div className="home-lot-detail" id={id} aria-live="polite"><h3>{lotStages[selected].title} / {lotStages[selected].record}</h3><p>{lotStages[selected].detail}</p></div></div>;
}

function LotFlowScene({selected}: {selected:number}){
  const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  const controller=useRef<import("./lot-flow-renderer").LotFlowController | null>(null);
  const selectedRef=useRef(selected);selectedRef.current=selected;
  useEffect(()=>{
    let disposed=false;
    const observer=new IntersectionObserver(async ([entry])=>{
      if(!entry.isIntersecting)return;
      observer.disconnect();const {mountLotFlow}=await import("./lot-flow-renderer");
      if(disposed || !host.current || !canvas.current)return;
      controller.current=mountLotFlow(canvas.current,host.current,selectedRef.current);
    },{rootMargin:"80px"});
    if(host.current)observer.observe(host.current);
    return ()=>{disposed=true;observer.disconnect();controller.current?.dispose();controller.current=null;};
  },[]);
  useEffect(()=>{controller.current?.setSelected(selected);},[selected]);
  return <div className="home-lot-scene" ref={host} aria-hidden="true"><canvas ref={canvas}/></div>;
}

export function PhilosophyScene(){return <CubeScene kind="philosophy"/>;}
