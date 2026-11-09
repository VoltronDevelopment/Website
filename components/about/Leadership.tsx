"use client";

import {useEffect, useRef, useState, type ReactNode} from "react";
import {ArrowRight, ArrowUpRight, BriefcaseBusiness, GraduationCap, RotateCcw} from "lucide-react";
import {prefersStaticScene} from "../performance/scene-policy";

function AutomotiveDrawing(){
 return <svg className="leadership-drawing" viewBox="0 0 360 220" role="img" aria-label="Vehicle assembly followed by inspection">
  <path className="leader-guide" d="M32 172H328"/>
  <path className="leader-fill" d="M66 137v-26l39-10 30-37h84l44 38 30 9 9 26h-31a26 26 0 0 0-52 0h-80a26 26 0 0 0-52 0Z"/>
  <path className="leader-line" d="m120 99 25-27h65l32 27ZM179 73v27M175 111h13M64 121h18M286 120h14"/>
  <g className="leader-wheel leader-wheel-rear"><circle className="leader-wheel-fill" cx="113" cy="139" r="20"/><circle className="leader-line" cx="113" cy="139" r="9"/></g>
  <g className="leader-wheel leader-wheel-front"><circle className="leader-wheel-fill" cx="245" cy="139" r="20"/><circle className="leader-line" cx="245" cy="139" r="9"/></g>
  <path className="leader-scan" d="M0 58V151"/>
  <g className="leader-verified"><circle cx="299" cy="60" r="12" className="leader-fill"/><path className="leader-line" d="m293 60 4 4 8-9"/></g>
 </svg>;
}

function TechnologyDrawing(){
 return <svg className="leadership-drawing" viewBox="0 0 360 220" role="img" aria-label="A factory signal passes through edge processing to intelligence">
  <path className="leader-guide" d="M72 111H288"/>
  <rect className="leader-fill" x="43" y="83" width="58" height="56" rx="9"/>
  <path className="leader-line" d="M56 123v-18l10 6v-10l10 6V95h11v28ZM62 116h2m8 0h2m8 0h2"/>
  <rect className="leader-fill" x="151" y="83" width="58" height="56" rx="9"/>
  <path className="leader-line" d="M166 98h28v26h-28ZM173 105h14v12h-14ZM173 78v5m14-5v5m-14 56v5m14-5v5m-41-40h5m-5 14h5m58-14h5m-5 14h5"/>
  <rect className="leader-fill" x="259" y="83" width="58" height="56" rx="9"/>
  <path className="leader-line" d="m277 102 19 0-9 18Zm0 0 10 18m9-18-9 18"/>
  <g className="leader-nodes"><circle cx="277" cy="102" r="3"/><circle cx="296" cy="102" r="3"/><circle cx="287" cy="120" r="3"/></g>
  <circle className="leader-packet" cx="108" cy="111" r="3"/>
  <circle className="leader-response" cx="304" cy="91" r="3"/>
  <g className="leader-labels"><text x="72" y="165">Factory</text><text x="180" y="165">Edge</text><text x="288" y="165">Intelligence</text></g>
 </svg>;
}

function LeadershipArt({kind,children}:{kind:"portrait"|"automotive"|"technology";children:ReactNode}){
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
  <svg className="leadership-background" viewBox="0 0 180 180" aria-hidden="true"><path d="m90 8 70 40v82l-70 40-70-40V48Zm0 80 70-40M90 88 20 48m70 40v82"/></svg>
  <div className="leadership-illustration" key={revision}>{children}</div>
  {kind!=="portrait"&&<button className="leadership-replay" type="button" aria-label={`Replay ${kind==="automotive"?"vehicle assembly":"signal flow"}`} onClick={()=>setRevision(value=>value+1)}><RotateCcw size={14} aria-hidden="true"/></button>}
 </div>;
}

export function Leadership(){
 return <div className="leadership-cards">
  <article className="leadership-person">
   <LeadershipArt kind="portrait"><img className="leadership-photo" src="/leadership/omkar-todkar.webp" alt="Omkar Todkar" width="600" height="600" loading="lazy"/></LeadershipArt>
   <div className="leadership-copy">
    <h3>Omkar Todkar</h3>
    <p><BriefcaseBusiness size={16} aria-hidden="true"/>Founder &amp; CEO</p>
    <p><GraduationCap size={16} aria-hidden="true"/>IIT Madras &middot; B.Tech + M.Tech</p>
    <div className="leadership-links">
     <a href="https://www.linkedin.com/in/omkar-todkar-65982a73/" target="_blank" rel="noopener noreferrer">LinkedIn<ArrowUpRight aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a>
     <a href="https://www.fluteandforge.com/" target="_blank" rel="noopener noreferrer">Flute &amp; Forge<ArrowUpRight aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a>
    </div>
   </div>
  </article>
  <article className="leadership-role">
   <LeadershipArt kind="automotive"><AutomotiveDrawing/></LeadershipArt>
   <div className="leadership-copy"><h3>Chief Operating Officer</h3><p>Automotive experience</p><p className="leadership-state">Revealing soon</p></div>
  </article>
  <article className="leadership-role">
   <LeadershipArt kind="technology"><TechnologyDrawing/></LeadershipArt>
   <div className="leadership-copy"><h3>Chief Technology Officer</h3><p className="leadership-state">Search underway</p><div className="leadership-links"><a href="/partner?interest=cto#partnership">Start a conversation<ArrowRight aria-hidden="true"/></a></div></div>
  </article>
 </div>;
}
