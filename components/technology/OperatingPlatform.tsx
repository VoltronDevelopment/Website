"use client";
import {useEffect,useRef,useState} from 'react';
import {Pause,Play,RotateCcw,Maximize2,X,Network} from 'lucide-react';
import Link from 'next/link';
import {prefersStaticScene} from '../performance/scene-policy';
import {advanceOperatingClock,OPERATING_DURATION,operatingChapters,operatingEntities,operatingEdges,operatingState,type OperatingEntity} from './operating-model';
import './operating-platform.css';
import {OperatingDigitalLayer} from './OperatingDigitalLayer';
import type {OperatingProduct} from './operating-model';
type Controller=Awaited<ReturnType<typeof import('./operating-renderer').mountOperatingScene>>;
export function OperatingPlatform(){
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),controller=useRef<Controller|null>(null),clock=useRef(0),pausedRef=useRef(false),selection=useRef<OperatingEntity|null>(null),overviewRef=useRef(false),lastTrigger=useRef<HTMLElement|null>(null),resumeAfter=useRef(false),dialog=useRef<HTMLDialogElement>(null);
 const wake=useRef<()=>void>(()=>{});
 const [digitalSelection,setDigitalSelection]=useState<OperatingProduct|null>(null);
 const [time,setTime]=useState(0),[paused,setPaused]=useState(false),[selected,setSelected]=useState<OperatingEntity|null>(null),[overview,setOverview]=useState(false),[fallback,setFallback]=useState(false),[ready,setReady]=useState(false);
 const state=operatingState(time),entity=operatingEntities.find(e=>e.id===selected),related=operatingEdges.filter(([a,b])=>a===selected||b===selected).flatMap(([a,b])=>[a,b]).filter((v,i,a)=>v!==selected&&a.indexOf(v)===i);
 const draw=()=>controller.current?.draw(operatingState(clock.current),selection.current,overviewRef.current);
 const pick=(id:OperatingEntity,trigger?:HTMLElement)=>{setDigitalSelection(null);lastTrigger.current=trigger??host.current?.querySelector<HTMLElement>(`[data-entity-label="${id}"]`)??null;if(!selection.current)resumeAfter.current=!pausedRef.current;pausedRef.current=true;setPaused(true);selection.current=id;setSelected(id);overviewRef.current=false;setOverview(false);draw();wake.current();};
 const pickRef=useRef(pick);pickRef.current=pick;
 const close=()=>{selection.current=null;setSelected(null);pausedRef.current=!resumeAfter.current;setPaused(pausedRef.current);draw();wake.current();const target=lastTrigger.current;requestAnimationFrame(()=>target?.focus({preventScroll:true}));};
 useEffect(()=>{if(!selected||!matchMedia('(max-width:767px)').matches)return;dialog.current?.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog.current?.close();document.body.style.overflow=old;};},[selected]);
 useEffect(()=>{
  const element=host.current,view=canvas.current;if(!element||!view)return;let disposed=false,loading=false,visible=false,frame=0,last=0,published=0,settle=45,loaded=false;
  const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;};
  const tick=(now:number)=>{frame=0;if(disposed||!visible||document.hidden)return;const reduced=prefersStaticScene();if(loaded&&!pausedRef.current&&!reduced)clock.current=advanceOperatingClock(clock.current,last?Math.min(.07,(now-last)/1000):0);last=now;draw();if(now-published>120){setTime(clock.current);published=now;}if(clock.current===OPERATING_DURATION&&!pausedRef.current){pausedRef.current=true;setPaused(true);}if(!pausedRef.current||settle-->0)frame=requestAnimationFrame(tick);};
  const resume=()=>{stop();settle=45;if(visible&&!document.hidden&&!disposed)frame=requestAnimationFrame(tick);};
  wake.current=resume;
  const preferences=()=>{if(prefersStaticScene()){clock.current=OPERATING_DURATION;pausedRef.current=true;setPaused(true);setTime(clock.current);overviewRef.current=true;setOverview(true);}resume();};
  const observer=new IntersectionObserver(async([entry])=>{visible=entry.isIntersecting;if(visible&&!loading){loading=true;preferences();try{const {mountOperatingScene}=await import('./operating-renderer');if(disposed)return;const mounted=await mountOperatingScene(view,element,id=>pickRef.current(id));if(disposed){mounted.dispose();return;}controller.current=mounted;loaded=true;setReady(true);draw();resume();}catch{if(!disposed){loaded=true;setFallback(true);setReady(true);element.dataset.sceneState='fallback';}}}resume();},{rootMargin:'100px',threshold:0});observer.observe(element);
  const media=matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',preferences);window.addEventListener('voltron:motion',preferences);document.addEventListener('visibilitychange',resume);
  const lost=(event:Event)=>{event.preventDefault();setFallback(true);element.dataset.sceneState='fallback';};view.addEventListener('webglcontextlost',lost);
  return()=>{disposed=true;stop();observer.disconnect();media.removeEventListener('change',preferences);window.removeEventListener('voltron:motion',preferences);document.removeEventListener('visibilitychange',resume);view.removeEventListener('webglcontextlost',lost);controller.current?.dispose();controller.current=null;};
 },[]);
 const seek=(next:number)=>{overviewRef.current=false;setOverview(false);clock.current=next;setTime(next);selection.current=null;setSelected(null);pausedRef.current=prefersStaticScene();setPaused(pausedRef.current);draw();wake.current();};
 const details=entity&&<><p className="eyebrow">Connected manufacturing record</p><h3>{digitalSelection??entity.title}</h3><p className="operating-record">{entity.record}</p><p>{entity.detail}</p><strong>Related identities</strong><div className="operating-related">{related.map(id=><button key={id} onClick={()=>{selection.current=id;setSelected(id);draw();wake.current();}}>{operatingEntities.find(e=>e.id===id)?.title}</button>)}</div><Link href="/ontology">Explore identity and accountable action →</Link></>;
 return <div className="operating-platform" ref={host} data-chapter={state.chapter} data-status={state.lotStatus}>
  <header className="operating-header"><div><Network size={21}/><span>Voltron / Connected operation</span></div><span>{state.lotStatus}</span></header>
  <div className="operating-scene-composite"><OperatingDigitalLayer state={state} onInspect={(product,trigger)=>{pick(product==='V-MO'?'lot':product==='V-AI'?'observation':'operation',trigger);setDigitalSelection(product);}}/><svg className="operating-data-routes" aria-hidden="true">{['SCADA','V-MES','V-MO','V-Twin','V-AI'].map(product=><path key={product} data-product-route={product}/>)}</svg><div className="operating-workspace"><div className="operating-art" data-ready={ready} data-fallback={fallback}>
   <canvas ref={canvas} aria-label="Isometric Alpha factory, receiving, quality and dispatch connected to one customer order"/>
   <svg className="operating-label-leaders" aria-hidden="true">{operatingEntities.map(item=><line key={item.id} data-entity-leader={item.id}/>)}</svg><div className="operating-labels">{operatingEntities.map((item,i)=><button key={item.id} data-entity-label={item.id} style={{left:`${15+(i%3)*34}%`,top:`${20+Math.floor(i/3)*28}%`}} aria-pressed={selected===item.id} onClick={e=>pick(item.id,e.currentTarget)}>{item.title}</button>)}</div>
   {!ready&&<p className="operating-loading">Preparing the connected factory…</p>}
   {fallback&&<div className="operating-fallback"><Network size={55}/><h3>One order. Connected operations.</h3><p>Choose a chapter or manufacturing identity to follow the same lot.</p></div>}
   <button className="operating-overview" aria-pressed={overview} onClick={()=>{overviewRef.current=!overviewRef.current;setOverview(overviewRef.current);draw();wake.current();}}><Maximize2 size={16}/>{overview?'Follow operation':'Overview'}</button>
  </div>{entity&&<aside className="operating-inspector"><button onClick={close} aria-label="Close record"><X size={18}/></button>{details}</aside>}</div></div>
  <div className="operating-tools"><div className="operating-products" aria-label="Platform activity">{Object.entries(state.products).map(([name,active])=><span key={name} data-active={active}><i/>{name}</span>)}</div>
  <div className="operating-record-picker"><label>Explore a record <select aria-label="Explore a manufacturing record" value={selected??''} onChange={e=>{if(e.target.value)pick(e.target.value as OperatingEntity,e.currentTarget);}}><option value="">Choose an identity</option>{operatingEntities.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></label></div>
  </div><nav className="operating-chapters" aria-label="Operating story chapters">{operatingChapters.map((chapter,i)=><button key={chapter.title} aria-current={state.chapter===i?'step':undefined} onClick={()=>seek(chapter.time)}><small>0{i+1}</small>{chapter.title}</button>)}</nav>
  <div className="operating-caption"><div><p className="operating-quality-caption" data-visible={time>=58&&time<67}>Quality booth / {state.qualityPhase}</p><p className="operating-event" aria-live="off">{state.eventText}</p><div className="operating-chain" aria-label="Current relationship chain">{state.chain.map((id,i)=><span key={id}>{i>0&&<i aria-hidden="true">→</i>}{operatingEntities.find(e=>e.id===id)?.title}</span>)}</div><h3>{operatingChapters[state.chapter].title}</h3><p>{operatingChapters[state.chapter].text}</p></div><div className="operating-transport"><button aria-label={paused?'Play operating story':'Pause operating story'} onClick={()=>{pausedRef.current=!pausedRef.current;setPaused(pausedRef.current);wake.current();}}>{paused?<Play size={18}/>:<Pause size={18}/>}</button><button aria-label="Replay operating story" onClick={()=>seek(0)}><RotateCcw size={18}/></button></div></div>
  <label className="operating-timeline"><span>Journey</span><input type="range" min="0" max={OPERATING_DURATION} step=".5" value={time} aria-label="Operating story position" onChange={e=>{seek(Number(e.target.value));pausedRef.current=true;setPaused(true);}}/><time>{Math.floor(time/60)}:{String(Math.floor(time%60)).padStart(2,'0')}</time></label>
  <p className="operating-note">Illustrative order and compressed sequence · Equipment retains defined control responsibilities. AI proposes; authorised people review and release.</p>
  <dialog ref={dialog} className="operating-dialog" aria-label={entity?.title??'Manufacturing record'} onCancel={e=>{e.preventDefault();close();}}><button onClick={close} aria-label="Close record"><X size={20}/></button>{details}</dialog>
 </div>;
}
