"use client";

import {useEffect,useRef,useState,useId} from 'react';

import {Undo2} from 'lucide-react';
import {prefersStaticScene} from '../performance/scene-policy';

import {ScenePreparationObserver} from '../performance/scene-preparation-observer';

import {networkStatus} from './network-simulation';

import {learningChapters,networkStories,networkStoryIndex,sceneDuration,type NetworkSceneKind} from './network-story';

import type {mountNetworkStory} from './network-renderer';

export function NetworkFactoryStory({kind}:{kind:NetworkSceneKind}){

 const story=networkStories[kind],host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),controller=useRef<ReturnType<typeof mountNetworkStory>|null>(null),[time,setTime]=useState(0),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),id=useId();

 const manualTime=useRef<number|null>(null);
 const remember=(value:number|null)=>{
  manualTime.current=value;
  history.replaceState({...history.state,networkChapters:{...history.state?.networkChapters,[kind]:value}},'');
 };
 const chapterArt=kind==='learning'||kind==='partnership';
 const selected=networkStoryIndex(kind,time),step=story.steps[selected];

 useEffect(()=>{
  const saved=history.state?.networkChapters?.[kind];
  if(typeof saved==='number'&&Number.isFinite(saved)&&saved>=0&&saved<=sceneDuration(kind)){
   manualTime.current=saved;
   setTime(saved);
  }
  let disposed=false;const motion=matchMedia('(prefers-reduced-motion:reduce)');const element=canvas.current;const lost=(e:Event)=>{e.preventDefault();setReady(false);setFailed(true);};const restored=()=>{if(!disposed){setReady(true);setFailed(false);}};element?.addEventListener('webglcontextlost',lost);element?.addEventListener('webglcontextrestored',restored);const observer=new ScenePreparationObserver(async([entry])=>{if(!entry.isIntersecting||controller.current||prefersStaticScene())return;observer.disconnect();try{const {mountNetworkStory,prepareArtworkEnvironment}=await import('./network-renderer');await prepareArtworkEnvironment();if(disposed||prefersStaticScene()||!canvas.current||!host.current)return;const mounted=mountNetworkStory(canvas.current,host.current,kind,setTime);
 controller.current=mounted;
 if(manualTime.current!==null)mounted.seek(manualTime.current);
 if('prepared' in mounted)await mounted.prepared;
 if(!disposed&&controller.current===mounted)setReady(true);}catch{if(!disposed)setFailed(true);}}, {rootMargin:'350px 0px'});const update=()=>{if(prefersStaticScene()){controller.current?.dispose();controller.current=null;setReady(false);}else if(host.current){observer.unobserve(host.current);observer.observe(host.current);}};if(host.current)observer.observe(host.current);motion.addEventListener('change',update);const preferences=new MutationObserver(update);preferences.observe(document.documentElement,{attributes:true,attributeFilter:['data-artwork-motion']});return()=>{disposed=true;element?.removeEventListener('webglcontextlost',lost);element?.removeEventListener('webglcontextrestored',restored);observer.disconnect();preferences.disconnect();motion.removeEventListener('change',update);controller.current?.dispose();controller.current=null;};},[kind]);

 const posterChapter=ready?0:selected;
 const choose=(index:number)=>{const next=kind==='learning'?learningChapters[index].preview:kind==='products'&&index===3?15.95:(index+.5)/story.steps.length*sceneDuration(kind);remember(next);setTime(next);controller.current?.seek(next);};

 return <div className="replayable-study"><section id={kind==='owned'?'owned-plants':`network-${kind}`} className={`network-factory-section network-factory-${kind}`} aria-labelledby={`${id}-title`}>

  <div className="section-intro"><p className="eyebrow">{story.eyebrow}</p><h2 id={`${id}-title`}>{story.title}</h2><p>{story.intro}</p></div>

  <div className="network-factory-art" ref={host} data-ready={ready} data-kind={kind} data-chapter={posterChapter} role="img" aria-label={`${story.title} ${chapterArt ? step[0]+'. '+step[1] : 'Illustrative factory scene.'}`}>{(["light","dark"] as const).map(theme=>{
   const base=chapterArt?`/network-scenes/chapters/${kind}-${posterChapter}`:`/network-scenes/${kind}`;
   const wide=chapterArt?`${base}-wide-${theme}.webp`:`${base}-${theme}-small.webp`;
   return <picture key={theme} className={`network-factory-poster art-theme-${theme}`}>
    <source media="(max-width:767px)" srcSet={chapterArt?`${base}-phone-${theme}.webp`:`${base}-mobile-${theme}.webp`}/>
    <img src={wide} srcSet={chapterArt?undefined:`${wide} 1280w, ${base}-${theme}.webp 2240w`} sizes="(max-width:1200px) calc(100vw - 48px), 1120px" alt="" width="1600" height="900" loading="lazy"/>
   </picture>;
  })}<canvas ref={canvas} aria-hidden="true"/></div>



  {kind==='learning'&&<p className="network-cell-legend">Isometric factory network · Shared architecture above<br/><span>Connected plants / Illustrative future network</span></p>}

  <div className="network-operation-status"><span>{ready?networkStatus(kind,time):chapterArt?step[0]:"Completed concept overview · Choose a chapter to read its role"}</span>{kind==='owned'&&ready&&<span>{time>=15?'Inspection recorded · Release pending':'Inspection pending · Release pending'}</span>}</div>

  <div className="network-factory-chapters" role="group" aria-label={`${story.eyebrow} chapters`}>{story.steps.map(([label],i)=><button type="button" key={label} aria-pressed={selected===i} aria-controls={`${id}-detail`} onClick={()=>choose(i)}><span>0{i+1}</span>{label}</button>)}</div>

  <div className="network-factory-detail" id={`${id}-detail`}><div aria-live={manualTime.current===null?"off":"polite"}>{!ready&&!chapterArt&&<p className="eyebrow">Chapter guide · Overview shown above</p>}<h3>{step[0]}</h3><p>{step[1]}</p></div><div><span>{kind==='owned'?'Illustrative operating environment':kind==='products'?'Concept study · Future development':'Illustrative future network'}</span>{!ready&&!chapterArt&&<span>{failed?'Still view · Scene unavailable':'Still view available'}</span>}</div></div>

  {kind==='partnership'&&<div className="network-contributions"><div><h3>Partner contribution</h3><p>Capital · Infrastructure · Market relationships</p></div><div><h3>Voltron contribution</h3><p>Engineering · Technology · Automation · Operating capability</p></div></div>}

  {kind==='learning'&&<p className="network-governance">Shared capability passes through review and local configuration. Plant and customer information remains governed within its permitted context.</p>}

 </section><button className="study-replay" type="button" aria-label={`Replay ${story.title}`} onClick={()=>{
  remember(null);setTime(0);controller.current?.replay();
 }}><Undo2 className="replay-arrow" size={15} aria-hidden="true"/></button></div>;

}

