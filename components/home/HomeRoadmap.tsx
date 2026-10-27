"use client";
import {useEffect,useRef,useState} from 'react';
import {roadmapYears,voltronRoadmap} from '@/lib/voltron-roadmap';
import {prefersStaticScene} from '../performance/scene-policy';
import type {mountRoadmap} from './roadmap-renderer';
export function HomeRoadmap({expanded=false}:{expanded?:boolean}){
 const [index,setIndex]=useState(0),host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),controller=useRef<ReturnType<typeof mountRoadmap>|null>(null);
 useEffect(()=>{let disposed=false;const node=host.current;if(!node)return;const observer=new IntersectionObserver(async([entry])=>{if(!entry.isIntersecting||prefersStaticScene())return;observer.disconnect();try{const {mountRoadmap}=await import('./roadmap-renderer');if(disposed||!canvas.current)return;controller.current=mountRoadmap(canvas.current!,node);}catch{node.dataset.fallback='true';}},{rootMargin:'80px'});observer.observe(node);return()=>{disposed=true;observer.disconnect();controller.current?.dispose();};},[]);
 const current=voltronRoadmap[index];
 const select=(i:number)=>{setIndex(i);controller.current?.select(i);};
 return <div className={`home-roadmap${expanded?' is-expanded':''}`}><div className="roadmap-years" role="group" aria-label="Roadmap milestones">{voltronRoadmap.map((m,i)=><button type="button" key={m.years} aria-pressed={i===index} onClick={()=>select(i)}>{m.years}</button>)}</div>
  <ol className="roadmap-ticks" aria-label="Years from the start of operations">{roadmapYears.map(year=>{const active=year>=current.span[0]&&year<=current.span[1];return <li key={year}><button type="button" aria-pressed={active} aria-label={`Year ${year}`} onClick={()=>select(voltronRoadmap.findIndex(m=>year>=m.span[0]&&year<=m.span[1]))}>{year}</button></li>;})}</ol>
  <div className="roadmap-composition"><div className="roadmap-art" ref={host} data-index={index} aria-hidden="true"><svg className="roadmap-still" viewBox="0 0 500 280"><path d="M70 160H430M115 160V100H210V160M210 100H305V160M305 100H400V160"/><g>{Array.from({length:[1,4,6,8,10][index]},(_,i)=><rect key={i} x={80+i*34} y={125-(i%3)*20} width="26" height="26" rx="3"/>)}</g></svg><canvas ref={canvas}/></div>
  <div className="roadmap-detail" aria-live="polite"><p className="roadmap-period">{current.years}</p><h3>{current.title}</h3><p>{current.detail}</p>
   {expanded?<ul className="roadmap-evidence">{current.evidence.map(item=><li key={item}>{item}</li>)}</ul>:null}
   <p className="roadmap-gate"><strong>Advance through evidence</strong>{current.gate}</p></div></div>
  <p className="roadmap-note">Proposed direction. Years count from the start of operations; progress depends on evidence, resources and readiness. Year 5 is a quality-readiness gate, not a badge.</p></div>;
}
