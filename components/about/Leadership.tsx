"use client";

import {useEffect, useRef, useState, type ReactNode} from "react";
import {ArrowRight, ArrowUpRight, BriefcaseBusiness, GraduationCap, Undo2} from "lucide-react";
import {prefersStaticScene} from "../performance/scene-policy";

// Traced from the outer alpha boundary of the founder portrait.
const portraitContour = "M155,21 145,30 139,32 137,35 123,42 118,50 116,61 119,60 121,64 116,78 116,85 119,90 119,94 111,109 111,112 114,117 114,122 94,143 92,150 95,154 102,156 101,163 108,169 108,174 112,176 108,180 108,185 106,188 108,193 101,202 102,209 105,214 115,222 123,224 139,224 148,222 157,218 160,215 165,219 169,225 169,228 159,233 123,245 115,249 107,256 100,268 95,284 94,294 85,311 83,322 76,331 75,345 69,355 61,361 57,373 38,399 377,399 377,383 380,380 383,373 382,368 386,359 387,348 379,305 375,295 373,284 368,273 363,266 349,253 316,230 300,216 280,208 266,191 274,181 276,165 282,154 289,118 289,111 287,106 289,101 290,90 289,83 281,61 275,54 268,51 258,43 256,43 250,31 246,30 243,32 239,32 235,24 230,19 223,19 221,21 211,19 205,21 192,17 185,17 172,21Z";

function PortraitOutline({colored}:{colored:boolean}){
 return <svg className="leadership-contour" viewBox="0 0 400 400" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
  {colored&&<defs><linearGradient id="leadership-voltron-fill" x1="0" y1="1" x2="1" y2="0">
   <stop offset="0" stopColor="#101735"/><stop className="coo-mid" offset=".45" stopColor="#34468D"/>
   <stop className="coo-high" offset=".78" stopColor="#409EE8"/><stop offset="1" stopColor="#739BF4"/>
  </linearGradient></defs>}
  <path d={portraitContour} fill={colored?"url(#leadership-voltron-fill)":"none"} stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" strokeLinejoin="round"/>
 </svg>;
}

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
   <svg viewBox="0 0 320 210" preserveAspectRatio="xMidYMid slice">
    {[-1,0,1,2,3].flatMap(row=>[-1,0,1,2,3,4].map(column=>{
     const x=column*92+(row%2)*46;
     const y=row*78;
     return <g key={row+','+column} transform={`translate(${x} ${y})`} className={`pattern-cell cell-${Math.abs(row+column)%4}`}>
       <path d="m0 26 46-26 46 26-46 26Z"/>
       <path d="m0 26 46 26v52L0 78Z"/>
       <path d="m46 52 46-26v52l-46 26Z"/>
     </g>;
    }))}
   </svg>
  </div>
  <div className="leadership-illustration" key={kind+revision}>{children??<PortraitOutline colored={kind==="operations"}/>}</div>
  <button className="leadership-replay" type="button" aria-label="Replay card animation" onClick={()=>setRevision(value=>value+1)}><Undo2 className="replay-arrow" size={13} strokeWidth={1.25} aria-hidden="true"/></button>
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
