'use client';
import {useEffect,useRef,useState} from 'react';
import {specialists} from './investigation-model';
import {AgentCloudPoster} from './AgentCloudPoster';
import {prefersStaticScene} from '../performance/scene-policy';
import {useSceneMotion} from '../performance/use-scene-motion';

export function AgentOrbs({selected,onSelect}:{selected:number;onSelect:(index:number)=>void}){
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),controller=useRef<ReturnType<typeof import('./orb-renderer').mountOrbs>|null>(null),latest=useRef(selected);latest.current=selected;
 const [live,setLive]=useState(false),revision=useSceneMotion(host);
 useEffect(()=>{setLive(false);let disposed=false,loading=false;const observer=new IntersectionObserver(async([entry])=>{if(prefersStaticScene()||!entry.isIntersecting||loading||controller.current||!canvas.current||!host.current)return;loading=true;try{const {mountOrbs}=await import('./orb-renderer');if(disposed||prefersStaticScene()||!canvas.current||!host.current)return;controller.current=mountOrbs(canvas.current,host.current);controller.current.select(latest.current);setLive(true);}catch{if(!disposed)setLive(false);}finally{loading=false;}},{rootMargin:'200px'});if(host.current)observer.observe(host.current);return()=>{disposed=true;observer.disconnect();controller.current?.dispose();controller.current=null;};},[revision]);
 useEffect(()=>controller.current?.select(selected),[selected,live]);
 return <div ref={host} className="agent-observatory fluid-agent-gallery" data-live={live}><canvas ref={canvas} aria-hidden="true"/><div className="specialist-gallery">{specialists.map((a,i)=><button type="button" key={a.name} aria-pressed={selected===i} aria-label={`${a.name}, ${a.role}. Explore specialist`} onClick={()=>onSelect(i)}><span className={`orb-window fluid-cube-fallback fluid-${i}`} data-orb={i} aria-hidden="true"><AgentCloudPoster agent={i}/></span><strong>{a.name}</strong><span>{a.role}</span><small data-agent-state-label>Ready to investigate</small><small>{selected===i?'Selected specialist':'Explore specialist'}</small></button>)}</div><div className="agent-feature" id="selected-agent-detail"><div className={`orb-window orb-feature fluid-cube-fallback fluid-${selected}`} data-orb={selected} aria-hidden="true"><AgentCloudPoster agent={selected} featured/></div><div aria-live="polite"><p className="eyebrow">{specialists[selected].name} / {specialists[selected].role}</p><h3>{specialists[selected].question}</h3><p>{specialists[selected].action}</p><div className="agent-records" key={selected}>{specialists[selected].records.map(r=><span key={r}>{r}</span>)}</div><p className="agent-basis">Context → Relevant records → Suggested check</p></div></div></div>;
}
