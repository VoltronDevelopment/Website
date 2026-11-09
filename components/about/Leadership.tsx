"use client";

import {useEffect, useRef, useState, type ReactNode} from "react";
import {ArrowRight, ArrowUpRight, BriefcaseBusiness, GraduationCap, Undo2} from "lucide-react";
import {prefersStaticScene} from "../performance/scene-policy";

function LeadershipArt({kind,children}:{kind:"portrait"|"operations"|"technology";children?:ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 const [revision,setRevision]=useState(0);
 const [playing,setPlaying]=useState(false);
 useEffect(()=>{
  const element=root.current;
  if(!element)return;
  const observer=new IntersectionObserver(([entry])=>setPlaying(entry.isIntersecting&&!prefersStaticScene()),{threshold:.25});
  observer.observe(element);
  const preference=()=>{setPlaying(!prefersStaticScene()&&element.getBoundingClientRect().bottom>0&&element.getBoundingClientRect().top<innerHeight);};
  const media=matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change",preference);
  const settings=new MutationObserver(preference);
  settings.observe(document.documentElement,{attributes:true,attributeFilter:["data-artwork-motion"]});
  return()=>{observer.disconnect();media.removeEventListener("change",preference);settings.disconnect();};
 },[]);
 return <div ref={root} className={`leadership-artwork leadership-${kind}`} data-playing={playing}>
  <div key={revision} className="leadership-pattern" aria-hidden="true">
   <svg viewBox="0 0 320 160">{[[124,40],[171,66],[217,40],[217,92]].map(([x,y],i)=>
    <g key={x+'-'+y} transform={`translate(${x} ${y})`}><g className={`pattern-cell cell-${i}`}>
     <path d="m0 0 25-14 25 14-25 14Z"/><path d="m0 0 25 14v29L0 29Z"/><path d="m25 14 25-14v29L25 43Z"/>
    </g></g>)}</svg>
  </div>
  {children&&<div className="leadership-illustration">{children}</div>}
  <button className="leadership-replay" type="button" aria-label="Replay card animation" onClick={()=>setRevision(value=>value+1)}><Undo2 size={13} strokeWidth={1.25} aria-hidden="true"/></button>
 </div>;
}

export function Leadership(){
 return <div className="leadership-cards">
  <article className="leadership-person">
   <h3>Omkar Todkar</h3>
   <LeadershipArt kind="portrait"><img className="leadership-photo" src="/leadership/omkar-todkar.webp" alt="Omkar Todkar" width="600" height="600" loading="lazy"/></LeadershipArt>
   <div className="leadership-copy">

    <p><BriefcaseBusiness size={16} aria-hidden="true"/>Founder &amp; CEO</p>
    <p><GraduationCap size={16} aria-hidden="true"/>IIT Madras &middot; B.Tech + M.Tech</p>
    <div className="leadership-links">
     <a href="https://www.linkedin.com/in/omkar-todkar-65982a73/" target="_blank" rel="noopener noreferrer">LinkedIn<ArrowUpRight aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a>
     <a href="https://www.fluteandforge.com/" target="_blank" rel="noopener noreferrer">Flute &amp; Forge<ArrowUpRight aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a>
    </div>
   </div>
  </article>
  <article className="leadership-role">
   <h3>Chief Operating Officer</h3>
   <LeadershipArt kind="operations"/>
   <div className="leadership-copy"><p>Automotive experience</p><p className="leadership-state">Revealing soon</p></div>
  </article>
  <article className="leadership-role">
   <h3>Chief Technology Officer</h3>
   <LeadershipArt kind="technology"/>
   <div className="leadership-copy"><p className="leadership-state">Search underway</p><div className="leadership-links"><a href="/partner?interest=cto#partnership">Start a conversation<ArrowRight aria-hidden="true"/></a></div></div>
  </article>
 </div>;
}
