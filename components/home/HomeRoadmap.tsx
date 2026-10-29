"use client";
import {Fragment,useEffect,useRef,useState} from 'react';
import globeEnvelopeStill from '@/lib/globe-envelope-still.json';
import {roadmapVisualState,voltronRoadmap,roadmapCellTone} from '@/lib/voltron-roadmap';
import {prefersStaticScene} from '../performance/scene-policy';
import {useHomeMotion} from './HomeMotion';
import type {mountRoadmap} from './roadmap-renderer';

function RoadmapStill({visual}:{visual:ReturnType<typeof roadmapVisualState>}){
 const forward=[6.3,4.4,8.4],length=Math.hypot(...forward),normal=forward.map(v=>v/length),right=[normal[2],0,-normal[0]],r=Math.hypot(...right);right.forEach((v,i)=>right[i]=v/r);
 const up=[normal[1]*right[2],normal[2]*right[0]-normal[0]*right[2],-normal[1]*right[0]];
 const point=(p:number[])=>{const v=[p[0]*.92,p[1]*.92+.08,p[2]*.92];return `${250+v.reduce((sum,n,i)=>sum+n*right[i],0)*320/4.8},${160-v.reduce((sum,n,i)=>sum+n*up[i],0)*320/4.8}`;};
 const path=(points:number[][])=>points.map((p,i)=>(i?'L':'M')+point(p)).join('')+'Z';
 return <svg className="roadmap-still" viewBox="0 0 500 320" preserveAspectRatio="xMidYMid slice">
  {visual.envelope&&<g className="roadmap-static-globe" data-topology={globeEnvelopeStill.topology} transform="translate(250 155.1) scale(61.3333)"><path d={globeEnvelopeStill.path} vectorEffect="non-scaling-stroke"/></g>}
  {visual.cells.map((p,index)=>({p,index})).sort((a,b)=>a.p.reduce((sum,v,i)=>sum+v*normal[i],0)-b.p.reduce((sum,v,i)=>sum+v*normal[i],0)).map(({p:[x,y,z],index})=>{
   const h=.4,a=[x-h,y+h,z-h],b=[x+h,y+h,z-h],c=[x+h,y+h,z+h],d=[x-h,y+h,z+h],e=[x+h,y-h,z-h],f=[x+h,y-h,z+h],g=[x-h,y-h,z+h];
   return <g key={index} className="roadmap-static-cell" data-tone={roadmapCellTone(index)} strokeLinejoin="round"><path className="roadmap-static-front" d={path([d,c,f,g])}/><path className="roadmap-static-side" d={path([b,e,f,c])}/><path className="roadmap-static-top" d={path([a,b,c,d])}/></g>;
  })}
 </svg>;
}

export function HomeRoadmap({expanded=false}:{expanded?:boolean}){
 const motionRevision=useHomeMotion(),[index,setIndex]=useState(0),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),controller=useRef<Awaited<ReturnType<typeof mountRoadmap>>|null>(null),indexRef=useRef(0),playing=useRef(true);
 const select=(i:number)=>{root.current?.style.setProperty('--roadmap-fill',(i/4).toFixed(3));if(indexRef.current===i&&controller.current)return;indexRef.current=i;setIndex(i);controller.current?.select(i);};
 useEffect(()=>{let disposed=false;const node=host.current;if(!node)return;if(canvas.current)canvas.current.style.opacity=prefersStaticScene()?'0':'1';node.dataset.sceneState=prefersStaticScene()?'fallback':'poster';
  const observer=new IntersectionObserver(async([entry])=>{if(!entry.isIntersecting||prefersStaticScene())return;observer.disconnect();try{const {mountRoadmap}=await import('./roadmap-renderer');if(disposed||!canvas.current)return;const mounted=await mountRoadmap(canvas.current,node);if(disposed){mounted.dispose();return;}controller.current=mounted;controller.current.select(indexRef.current);controller.current.seek(Number(node.dataset.year)||1);node.dataset.sceneState='live';}catch{node.dataset.fallback='true';node.dataset.sceneState='fallback';}},{rootMargin:'320px'});observer.observe(node);
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
  <div className="roadmap-composition"><div className="roadmap-art" ref={host} data-index={index} data-year="1" aria-hidden="true"><RoadmapStill visual={visual}/><canvas key={motionRevision} ref={canvas}/></div>
 <article className="roadmap-card" key={milestone.years} data-phase={index}><span className="roadmap-period"><b>{String(index+1).padStart(2,'0')}</b> / 05 · {milestone.years}</span><h3 className="roadmap-milestone-title">{milestone.title}</h3><p className="roadmap-detail">{milestone.detail}</p><ul className="roadmap-evidence">{milestone.evidence.map(item=><li key={item}>{item}</li>)}</ul><p className="roadmap-gate"><strong>Readiness to advance</strong>{milestone.gate}</p></article></div></div></div>
 </div>;
}
