'use client';
import {ArtworkControls} from './ArtworkControls';
import {DeferredPicture} from '../performance/DeferredArtwork';
import {NativeOpening} from "../performance/NativeOpening";
import {ScenePreparationObserver} from '../performance/scene-preparation-observer';
import {useSceneMotion,resetScenePoster,markSceneFailure} from '../performance/use-scene-motion';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {ArtworkInspector} from './ArtworkInspector';
import {prefersStaticScene} from '../performance/scene-policy';
import type {CollaborationKind} from './collaboration-timeline';
import type {CollaborationController} from './collaboration-renderer';
import {partnerStage} from './partner-stage';
import './collaboration-hero.css';

const descriptions={about:'Three people form through particles and progress upward on two original stair structures, with one person on the first and two on the second, then hold at different stages of their ascent.',partner:'Carla and Eric form from particles, arrive at a shared manufacturing brief and present it with complementary gestures. The glass panel and its diagrams form, then the exact Voltron emblem resolves onto the brief.'};
export function CollaborationHero({kind}:{kind:CollaborationKind}){
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),controller=useRef<CollaborationController|null>(null),[mode,setMode]=useState('static');
 const motionRevision=useSceneMotion(host);
 useEffect(()=>{resetScenePoster(host.current,canvas.current);let disposed=false,loading=false;const abort=new AbortController(),motion=matchMedia('(prefers-reduced-motion: reduce)'),query=new URLSearchParams(location.search),forced=query.get('renderer')==='static'||query.get('animate')==='0'||query.get('motion')==='reduced';
  const still=()=>forced||prefersStaticScene(),fallback=()=>{if(host.current){host.current.dataset.sceneState='fallback';host.current.dataset.scenePose='complete';}setMode('static');};
  if(still())fallback();
  const view=new ScenePreparationObserver(async([e])=>{if(!e.isIntersecting||loading||controller.current||still())return;loading=true;try{const {mountCollaboration}=await import('./collaboration-renderer');if(disposed||still()||!host.current||!canvas.current)return;const scene=await mountCollaboration(canvas.current,host.current,kind,value=>{if(!disposed)setMode(value);},abort.signal);if(disposed||still())scene.dispose();else controller.current=scene;}catch{if(!disposed){fallback();markSceneFailure(host.current);}}finally{loading=false;}},{rootMargin:'450px 0px'});
  if(host.current)view.observe(host.current);const preference=()=>{if(still()){controller.current?.seek(12);fallback();}else if(host.current){delete host.current.dataset.scenePose;if(controller.current){controller.current.seek(12);host.current.dataset.sceneState='live';}else{view.unobserve(host.current);view.observe(host.current);}}};motion.addEventListener('change',preference);
  return()=>{disposed=true;abort.abort();view.disconnect();motion.removeEventListener('change',preference);controller.current?.dispose();controller.current=null;};
 },[kind,motionRevision]);
 const minW=kind==='about'?7.4:partnerStage.width,minH=kind==='about'?5.6:partnerStage.height,extent=Math.max(minW,minH),style={'--story-w':minW,'--story-h':minH,'--story-frame':extent} as CSSProperties;
 if(kind==='partner')return <div className="engineered-art collaboration-art collaboration-partner"><div ref={host} className="engineered-stage collaboration-stage" data-story={kind} role="img" aria-label={descriptions[kind]} style={style}><span className="story-posters" data-scene-poster aria-hidden="true">{(['opening','complete'] as const).map(pose=><span className={`story-${pose}`} key={pose}>{pose==='opening'?<NativeOpening scene="partnerStory"/>: (['light','dark'] as const).map(theme=><DeferredPicture key={theme} className={`art-theme-${theme}`}><source media="(max-width:767px)" srcSet={`/stories/partner-scene-mobile-${theme}-${pose}.webp`}/><img src={`/stories/partner-scene-desktop-${theme}-${pose}.webp`} width="1400" height="1080" alt="" loading="eager"/></DeferredPicture>)}</span>)}</span><canvas key={motionRevision} ref={canvas} aria-hidden="true"/></div><ArtworkControls mode={mode} onReplay={()=>controller.current?.replay()}/><ArtworkInspector scene="collaboration-partner" duration={12} onSeek={t=>controller.current?.seek(t)}/></div>;
 return <div className={`engineered-art collaboration-art collaboration-${kind}`}><div ref={host} className="engineered-stage collaboration-stage" data-story={kind} role="img" aria-label={descriptions[kind]} style={style}>
  <span className="story-posters" data-scene-poster aria-hidden="true">
    <span className="story-opening"><NativeOpening scene="aboutStory"/></span>
    <span className="story-complete">{(['light','dark'] as const).map(theme=><DeferredPicture key={theme} className={'art-theme-'+theme}>
      <source media="(max-width:767px)" srcSet={'/about-scenes/stairs-mobile-'+theme+'-complete.png'}/>
      <img src={'/about-scenes/stairs-desktop-'+theme+'-complete.png'} width="640" height="640" alt="" decoding="async"/>
    </DeferredPicture>)}</span>
  </span>
  <canvas key={motionRevision} ref={canvas} aria-hidden="true"/>
 </div><ArtworkControls mode={mode} onReplay={()=>controller.current?.replay()}/><ArtworkInspector scene={`collaboration-${kind}`} duration={12} onSeek={t=>controller.current?.seek(t)}/></div>;
}
