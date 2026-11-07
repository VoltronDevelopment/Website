'use client';
import {useEntryChoice} from '@/lib/use-entry-choice';
import {useEffect,useId,useRef,useState} from 'react';
import {commonsStudies,type CommonsKind} from './commons-content';
import {prefersStaticScene} from '../performance/scene-policy';
import {waitForScrollPause} from '../home/scene-preparation';
import {ScenePreparationObserver} from '../performance/scene-preparation-observer';
import Link from 'next/link';

export function CommonsStudy({kind,artOnly=false}:{kind:CommonsKind;artOnly?:boolean}) {
 const entries=commonsStudies[kind],id=useId(),host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),selection=useRef(0);
 const controller=useRef<{select:(i:number)=>void;dispose:()=>void}|null>(null);
 const [selected,setSelected]=useEntryChoice('commons-'+kind,entries.length),[ready,setReady]=useState(false);
 useEffect(()=>{selection.current=selected;controller.current?.select(selected);},[selected]);
 useEffect(()=>{
  let disposed=false,loading=false;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const stop=()=>{controller.current?.dispose();controller.current=null;setReady(false);};
  const observer=new ScenePreparationObserver(async([entry])=>{
   if(!entry.isIntersecting||loading||controller.current||prefersStaticScene())return;
   loading=true;
   try {const {mountCommonsStudy,prepareArtworkEnvironment}=await import('./commons-renderer');await prepareArtworkEnvironment();await waitForScrollPause();if(disposed||prefersStaticScene()||!host.current||!canvas.current)return;
    const scene=await mountCommonsStudy(canvas.current,host.current,kind);if(disposed||prefersStaticScene()){scene.dispose();return;}
    controller.current=scene;scene.select(selection.current);setReady(true);
   }catch{if(!disposed)stop();}finally{loading=false;}
  },{rootMargin:'200px'});
  const update=()=>{if(prefersStaticScene())stop();else if(host.current){observer.unobserve(host.current);observer.observe(host.current);}};
  if(host.current)observer.observe(host.current);
  motion.addEventListener('change',update);
  const preferences=new MutationObserver(update);preferences.observe(document.documentElement,{attributes:true,attributeFilter:['data-artwork-motion']});
  return()=>{disposed=true;observer.disconnect();preferences.disconnect();motion.removeEventListener('change',update);controller.current?.dispose();controller.current=null;};
 },[kind]);
 return <div className={`commons-study commons-study-${kind}${artOnly?' commons-art-only':''}`}>
  <div className="commons-study-art" ref={host} data-ready={ready} role="img" aria-label={`${entries[selected][0]}: ${entries[selected][3]||entries[selected][2]}`}>
   <picture className="commons-still commons-still-light"><source media="(max-width:767px)" srcSet={`/commons-scenes/${kind}-${selected}-mobile-light.webp`}/><img src={`/commons-scenes/${kind}-${selected}-light.webp`} alt="" width="1800" height="1200" loading="lazy"/></picture>
   <picture className="commons-still commons-still-dark"><source media="(max-width:767px)" srcSet={`/commons-scenes/${kind}-${selected}-mobile-dark.webp`}/><img src={`/commons-scenes/${kind}-${selected}-dark.webp`} alt="" width="1800" height="1200" loading="lazy"/></picture>
   <canvas ref={canvas} aria-hidden="true"/>
  </div>
  {!artOnly&&<div className="commons-study-copy"><label className="commons-compact-choice" hidden={entries.length===1}><span>{kind==='programs'?'Program direction':kind==='learning'?'Way of learning':kind==='partner-paths'?'Partnership path':kind==='partner-process'?'Collaboration step':'Way to participate'}</span><select value={selected} aria-controls={id+'-detail'} onChange={e=>{const i=Number(e.target.value);setSelected(i);}}>{entries.map(([title],i)=><option key={title} value={i}>{title}</option>)}</select></label><div className="commons-selectors" hidden={entries.length===1} role="group" aria-label={kind==='programs'?'Program directions':kind==='learning'?'Ways of learning':kind==='partner-paths'?'Partnership paths':kind==='partner-process'?'Collaboration steps':'Ways to participate'}>{entries.map(([title],i)=><button type="button" aria-pressed={selected===i} aria-controls={`${id}-detail`} key={title} onClick={()=>{setSelected(i);}}><span>0{i+1}</span>{title}</button>)}</div>
   <div className="commons-detail" id={`${id}-detail`} aria-live="polite"><p className="eyebrow">{kind==='resources'?'Available to explore':kind==='programs'?'A developing direction':kind==='learning'?'Shared practice':kind==='partner-paths'?'Partnership direction':kind==='partner-process'?'How we begin':'An invitation'}</p><h3>{entries[selected][1]}</h3><p>{entries[selected][2]}</p>{kind==='resources'&&<Link className="partner-path-action" href="/technology#operating-platform">Explore the connected factory <span aria-hidden="true">→</span></Link>}{kind==='partner-paths'&&<Link className="partner-path-action" href={['/partner#production','/partner?interest=factory#partnership','/partner?interest=platform#partnership','/partner?interest=commons#partnership'][selected]}>Discuss {entries[selected][0].toLowerCase()} <span aria-hidden="true">→</span></Link>}</div>
  </div>}
 </div>;
}


