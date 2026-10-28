"use client";
import {Fragment,useEffect,useRef,useState} from 'react';
import {roadmapVisualState,voltronRoadmap} from '@/lib/voltron-roadmap';
import {prefersStaticScene} from '../performance/scene-policy';
import {useHomeMotion} from './HomeMotion';
import type {mountRoadmap} from './roadmap-renderer';

export function HomeRoadmap({expanded=false}:{expanded?:boolean}){
 const motionRevision=useHomeMotion(),[index,setIndex]=useState(0),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),controller=useRef<ReturnType<typeof mountRoadmap>|null>(null),indexRef=useRef(0),playing=useRef(true);
 const select=(i:number)=>{root.current?.style.setProperty('--roadmap-fill',(i/4).toFixed(3));if(indexRef.current===i&&controller.current)return;indexRef.current=i;setIndex(i);controller.current?.select(i);};
 useEffect(()=>{let disposed=false;const node=host.current;if(!node)return;if(canvas.current)canvas.current.style.opacity=prefersStaticScene()?'0':'1';node.dataset.sceneState=prefersStaticScene()?'fallback':'poster';
  const observer=new IntersectionObserver(async([entry])=>{if(!entry.isIntersecting||prefersStaticScene())return;observer.disconnect();try{const {mountRoadmap}=await import('./roadmap-renderer');if(disposed||!canvas.current)return;controller.current=mountRoadmap(canvas.current,node);controller.current.select(indexRef.current);controller.current.seek(Number(node.dataset.year)||1);node.dataset.sceneState='live';}catch{node.dataset.fallback='true';node.dataset.sceneState='fallback';}},{rootMargin:'320px'});observer.observe(node);
  return()=>{disposed=true;observer.disconnect();controller.current?.dispose();controller.current=null;if(node){delete node.dataset.ready;}};
 },[motionRevision]);
 useEffect(()=>{
  const node=root.current;if(!node)return;
  let frame=0,previous=0,elapsed=0,visible=false,disposed=false;playing.current=true;delete node.dataset.settled;
  const stop=()=>{cancelAnimationFrame(frame);frame=0;previous=0;};
  const tick=(now:number)=>{frame=0;if(disposed||!visible||document.hidden||!playing.current)return;elapsed+=previous?Math.min(.08,(now-previous)/1000):0;previous=now;const phase=Math.min(4,Math.floor(elapsed/3.8)),part=Math.min(1,(elapsed-phase*3.8)/3.8);if(indexRef.current!==phase)select(phase);const eased=part*part*(3-2*part);const range=voltronRoadmap[phase].span,year=range[0]+(range[1]-range[0])*eased;node.dataset.year=year.toFixed(1);controller.current?.seek(year);if(elapsed<19)frame=requestAnimationFrame(tick);else{playing.current=false;node.dataset.settled='true';}};
  const start=()=>{if(!visible||document.hidden||disposed||!playing.current||frame)return;if(prefersStaticScene()){select(4);node.dataset.settled='true';playing.current=false;return;}if(host.current?.dataset.sceneState!=='live')return;previous=0;frame=requestAnimationFrame(tick);};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.18;if(visible)start();else stop();},{threshold:[0,.18]});observer.observe(node);
  const readiness=new MutationObserver(start);if(host.current)readiness.observe(host.current,{attributes:true,attributeFilter:['data-scene-state']});const visibility=()=>document.hidden?stop():start();document.addEventListener('visibilitychange',visibility);
  return()=>{disposed=true;stop();observer.disconnect();readiness.disconnect();document.removeEventListener('visibilitychange',visibility);};
 },[motionRevision]);
 const choose=(i:number)=>{playing.current=false;if(root.current)root.current.dataset.settled='true';select(i);controller.current?.seek(voltronRoadmap[i].span[1]);};
 const milestone=voltronRoadmap[index],visual=roadmapVisualState(index);
 return <div ref={root} data-roadmap-design="voltron" className={`home-roadmap${expanded?' is-expanded':''}`}>
 <div className="roadmap-journey"><div className="roadmap-pin">
  <div className="roadmap-path">
   <div className="roadmap-years" role="group" aria-label="Roadmap milestones">{voltronRoadmap.map((m,i)=><Fragment key={m.years}><button type="button" className="roadmap-year-tablet" aria-label={m.years} aria-pressed={i===index} data-reached={i<=index} onClick={()=>choose(i)}><span className="roadmap-year-kicker">{m.years.startsWith('Years')?'Years':'Year'}</span><span className="roadmap-year-span">{m.years.replace(/^Years?\s/,'')}</span></button>{i<4&&<span className="roadmap-connector" data-reached={i<index} aria-hidden="true"><i/></span>}</Fragment>)}</div>
  </div>
  <div className="roadmap-composition"><div className="roadmap-art" ref={host} data-index={index} data-year="1" aria-hidden="true"><svg className="roadmap-still" viewBox="0 0 500 320"><g transform="translate(250 175)">{visual.envelope&&<><ellipse rx="145" ry="125"/><ellipse rx="80" ry="125"/><path d="M-145 0H145M-126-62H126M-126 62H126M0-125V125"/></>}{visual.cells.map((p,i)=><g key={i} transform={`translate(${(p[0]-p[2])*35} ${-p[1]*40+(p[0]+p[2])*17.5})`}><path d="M0-30L28-16V16L0 30L-28 16V-16Z"/><path d="M-28-16L0-2L28-16M0-2V30"/></g>)}</g></svg><canvas ref={canvas}/><div className="roadmap-art-caption" key={index}><span>{visual.count===1?'One proven capability':visual.count===4?'Connected capability':visual.global?'Global brand ambition':visual.envelope?'Global market readiness':'A complete manufacturing foundation'}</span><small>{visual.count===1?'1 cell':visual.count===4?'4 aligned cells':'8 cells · one shared core'}</small></div></div>
 <article className="roadmap-card" key={milestone.years} data-phase={index}><span className="roadmap-period"><b>{String(index+1).padStart(2,'0')}</b> / 05 · {milestone.years}</span><h3 className="roadmap-milestone-title">{milestone.title}</h3><p className="roadmap-detail">{milestone.detail}</p><ul className="roadmap-evidence">{milestone.evidence.map(item=><li key={item}>{item}</li>)}</ul><p className="roadmap-gate"><strong>Readiness to advance</strong>{milestone.gate}</p></article></div></div></div>
 </div>;
}
