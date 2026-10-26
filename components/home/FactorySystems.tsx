"use client";
import {useEffect,useId,useRef,useState,type CSSProperties} from 'react';
import {Pause,Play,RotateCcw} from 'lucide-react';
import {prefersStaticScene} from '../performance/scene-policy';
import {canPrepareHomeScene,prepareScene} from './scene-preparation';
import type {FactorySystemsController} from './factory-systems-renderer';
import type {FactoryPhase} from './factory-systems-timeline';
import posters from '@/lib/factory-part-posters.json';
import {DeferredArtwork} from '../performance/DeferredArtwork';
import componentPoster from '@/lib/component-scene-poster.json';
import {capabilityProjection} from './capability-cube-style';

const systems=[
 {title:'Execution',text:'A finishing pass on the original flange housing.'},
 {title:'Context',text:'Required geometry, recorded operation and measured result.'},
 {title:'Intelligence',text:'Inspection evidence supports a human decision.'},
];
const captions:Record<FactoryPhase,string>={component:'One part. Three connected perspectives.',digitize:'The same sample becomes a particle representation.',separate:'Particles carry the shared structure into three views.',assemble:'Three connected cubes and cards take shape.',resolve:'Execution: finishing the annular face.',connect:'Context and inspection evidence connect the same feature.',settled:'Illustrative example · Connected manufacturing evidence.'};
export function FactorySystems(){
 const opening=useRef<HTMLDivElement>(null);
 const projection=capabilityProjection(),posterUnit=`min(90cqw / ${projection.width},90cqh / ${projection.height})`;
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),controller=useRef<FactorySystemsController|null>(null),description=useId();
 const [ready,setReady]=useState(false),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(false),[phase,setPhase]=useState<FactoryPhase>('settled'),[focus,setFocus]=useState(2);
 useEffect(()=>{
  const stage=host.current,poster=opening.current,anchor=stage?.querySelectorAll<HTMLElement>('[data-system-anchor]')[1];
  if(!stage||!poster||!anchor)return;
  const align=()=>{const a=anchor.getBoundingClientRect(),b=stage.getBoundingClientRect();Object.assign(poster.style,{left:`${a.left-b.left}px`,top:`${a.top-b.top}px`,width:`${a.width}px`,height:`${a.height}px`});};
  align();const observer=new ResizeObserver(align);observer.observe(stage);observer.observe(anchor);return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  let disposed=false,nearby=false,scheduled=false,cancel:(()=>void)|undefined;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  function prepare(){if(!nearby||scheduled||prefersStaticScene()||disposed)return;scheduled=true;cancel=prepareScene(async()=>{try{
   if(motion.matches){scheduled=false;return;}const {mountFactorySystems}=await import('./factory-systems-renderer');if(disposed||!canvas.current||!host.current)return;
   controller.current=mountFactorySystems(canvas.current,host.current,{onReady:v=>{if(!disposed)setReady(v);},onPhase:v=>{if(!disposed)setPhase(v);},onFocus:v=>{if(!disposed)setFocus(v);}});await controller.current.ready;
  }catch{if(!disposed&&host.current){host.current.dataset.renderer='fallback';setReady(false);setPhase('settled');}}},canPrepareHomeScene);}
  function preference(){setReduced(motion.matches);prepare();}preference();motion.addEventListener('change',preference);
  const observer=new IntersectionObserver(([entry])=>{nearby=entry.isIntersecting;prepare();},{rootMargin:'160px 0px'});if(host.current)observer.observe(host.current);
  return()=>{disposed=true;cancel?.();observer.disconnect();motion.removeEventListener('change',preference);controller.current?.dispose();controller.current=null;};
 },[]);
 const settled=phase==='settled';
 function playback(){if(settled){setPaused(false);controller.current?.replay();}else{setPaused(!paused);controller.current?.setPaused(!paused);}}
 return <figure className="factory-systems" aria-label="One component, three manufacturing perspectives" aria-describedby={description}>
  <div className="factory-view-tabs" role="group" aria-label="Manufacturing perspective">{systems.map((s,i)=><button type="button" key={s.title} aria-pressed={focus===i} onClick={()=>{setFocus(i);setPaused(true);controller.current?.select(i);}}>{s.title}</button>)}</div>
  <div className="factory-systems-stage" ref={host} data-focus={focus}>
   <div className="factory-opening-poster" ref={opening} style={{"--poster-width":`calc(${posterUnit} * ${componentPoster.worldWidth})`,"--poster-height":`calc(${posterUnit} * ${componentPoster.worldHeight})`} as CSSProperties}><div className="factory-component-poster">{(['light','dark'] as const).map(theme=><DeferredArtwork key={theme} className={'art-theme-'+theme} src={componentPoster[theme]} width={300} height={280}/>)}</div></div>
   <canvas className="factory-systems-canvas" ref={canvas} aria-hidden="true"/>
   <div className="factory-systems-grid">{systems.map((system,index)=><article className="factory-system" key={system.title} data-active={focus===index}>
    <h3>{system.title}</h3>
    <div className="factory-system-anchor" data-system-anchor aria-hidden="true">
     <div className="factory-system-fallback">{(['light','dark'] as const).map(theme=><DeferredArtwork key={theme} className={'art-theme-'+theme} src={posters[theme][index]} width={400} height={340}/>)}</div>

    </div>
    <p className="factory-summary">{system.text}</p>
    <dl className="factory-records">
     {index===0?<><div><dt>Operation</dt><dd>T04 · Ø6 mm end mill</dd></div><div><dt>Recorded feed</dt><dd>240 mm/min</dd></div><div><dt>Feature</dt><dd>Annular face finishing</dd></div></>:index===1?<><div><dt>Required</dt><dd>Bore Ø40.00 ±0.05 mm</dd></div><div><dt>Recorded</dt><dd>T04 · feed 240 mm/min</dd></div><div><dt>Measured</dt><dd>Bore 40.04 mm</dd></div></>:<><div><dt>Recent results</dt><dd>40.01 → 40.03 → 40.04 mm</dd></div><div><dt>Upper limit</dt><dd>40.05 mm</dd></div><div className="factory-recommendation"><dt>Recommendation</dt><dd>Bore approaching its upper limit. Inspect the feature and tool/setup.</dd></div></>}
    </dl>
   </article>)}</div>
  </div>
  <figcaption className="factory-systems-footer"><p className="factory-systems-caption" aria-hidden="true">{captions[phase]}</p><div className="factory-systems-controls" hidden={!ready||reduced}><button type="button" onClick={playback} aria-label={settled?'Replay component reveal':paused?'Resume component reveal':'Pause component reveal'}>{settled?<RotateCcw size={14}/>:paused?<Play size={14}/>:<Pause size={14}/>}<span>{settled?'Replay':paused?'Resume':'Pause'}</span></button></div></figcaption>
  <p className="factory-systems-description" id={description}>The original flange housing is shown in three synchronized perspectives: a finishing pass, required and measured dimensions with recorded tool/feed data, and inspection history supporting a recommendation awaiting human review. Dimensions and records are illustrative, not actual plant data.</p>
 </figure>;
}
