'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {ArtworkControls} from './ArtworkControls';
import {ArtworkInspector} from './ArtworkInspector';
import {prefersStaticScene} from '../performance/scene-policy';
import type {CollaborationKind} from './collaboration-timeline';
import type {CollaborationController} from './collaboration-renderer';
import captures from '@/lib/collaboration-posters.json';
import './collaboration-hero.css';

const descriptions={about:'Three people form through particles and progress upward on two original stair structures, with one person on the first and two on the second, then hold at different stages of their ascent.',partner:'Two people form from particles, walk toward each other, and shake hands.'};
export function CollaborationHero({kind}:{kind:CollaborationKind}){
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),controller=useRef<CollaborationController|null>(null),[mode,setMode]=useState('static');
 useEffect(()=>{let disposed=false,loading=false;const abort=new AbortController(),motion=matchMedia('(prefers-reduced-motion: reduce)'),query=new URLSearchParams(location.search),forced=query.get('renderer')==='static'||query.get('animate')==='0'||query.get('motion')==='reduced';
  const still=()=>forced||prefersStaticScene(),fallback=()=>{if(host.current){host.current.dataset.sceneState='fallback';host.current.dataset.scenePose='complete';}setMode('static');};
  if(still())fallback();
  const view=new IntersectionObserver(async([e])=>{if(!e.isIntersecting||loading||controller.current||still())return;loading=true;try{const {mountCollaboration}=await import('./collaboration-renderer');if(disposed||!host.current||!canvas.current)return;const scene=await mountCollaboration(canvas.current,host.current,kind,value=>{if(!disposed)setMode(value);},abort.signal);if(disposed)scene.dispose();else controller.current=scene;}catch{if(!disposed)fallback();}finally{loading=false;}},{rootMargin:'80px'});
  if(host.current)view.observe(host.current);const preference=()=>{if(still()){controller.current?.seek(12);fallback();}else if(host.current){delete host.current.dataset.scenePose;if(controller.current){controller.current.seek(12);host.current.dataset.sceneState='live';}else{view.unobserve(host.current);view.observe(host.current);}}};motion.addEventListener('change',preference);
  return()=>{disposed=true;abort.abort();view.disconnect();motion.removeEventListener('change',preference);controller.current?.dispose();controller.current=null;};
 },[kind]);
 const minW=kind==='about'?7.4:5.8,minH=kind==='about'?5.6:5.3,extent=Math.max(minW,minH),style={'--story-w':minW,'--story-h':minH,'--story-frame':extent} as CSSProperties;
 const native=captures[kind],nativeStyle=Object.fromEntries(Object.entries(native).flatMap(([device,frame])=>{const aspect=frame.width/frame.height,h=Math.max(minH,minW/aspect);return [[`--story-${device}-w`,h*aspect],[`--story-${device}-h`,h]];})) as CSSProperties;
 return <div className={`engineered-art collaboration-art collaboration-${kind}`}><div ref={host} className="engineered-stage collaboration-stage" data-story={kind} role="img" aria-label={descriptions[kind]} style={style}>
  <span className="story-posters" data-scene-poster aria-hidden="true">{(['opening','complete'] as const).map(pose=><span className={`story-${pose}`} key={pose}>{(['light','dark'] as const).map(theme=><picture key={theme} className={`art-theme-${theme}${pose==='opening'?' story-native-opening':''}`} style={pose==='opening'?nativeStyle:undefined}>{pose==='opening'&&<><source media="(max-width:767px)" srcSet={native.mobile[theme]}/><source media="(min-width:768px) and (max-width:1023px)" srcSet={native.tablet[theme]}/><source media="(min-width:1024px) and (max-height:780px)" srcSet={native.short[theme]}/></>}<img src={pose==='opening'?native.desktop[theme]:`/stories/${kind}-${pose}-${theme}.webp`} width="640" height="640" alt="" decoding="async" loading="eager"/></picture>)}</span>)}</span>
  <canvas ref={canvas} aria-hidden="true"/>
 </div><ArtworkControls mode={mode} onToggle={()=>controller.current?.toggle()} onReplay={()=>controller.current?.replay()}/><ArtworkInspector scene={`collaboration-${kind}`} duration={12} onSeek={t=>controller.current?.seek(t)}/></div>;
}
