"use client";
import {waitForScrollPause} from '../home/scene-preparation';
import {ArtworkControls} from './ArtworkControls';
import {DeferredPicture} from '../performance/DeferredArtwork';
import {hdPoster,hdOpening} from '../performance/hd-poster';
import {ScenePreparationObserver} from '../performance/scene-preparation-observer';
import {useSceneMotion,resetScenePoster,markSceneFailure} from '../performance/use-scene-motion';
import type {CSSProperties} from "react";
import openingFrames from "@/lib/scene-responsive-opening-frames.json";
import responsiveOpening from "@/lib/scene-responsive-opening-posters.json";
import {NativeOpening} from "../performance/NativeOpening";
import {ScenePoster} from "../performance/ScenePoster";
import {useEffect,useRef,useState} from "react";
import {Pause,Play,RotateCcw} from "lucide-react";
import {prefersStaticScene} from "../performance/scene-policy";
import {heroSceneDurations,type HeroSceneKind} from "./hero-scene-timeline";
import type {EngineeredController,SceneMode} from "./engineered-hero-renderer";
import "./hero-art-direction.css";
import {ArtworkInspector} from './ArtworkInspector';
const descriptions:Record<HeroSceneKind,string>={technology:"Fine particles form 54 glass cube nodes in four layers connected by 346 strands. Signals continue travelling between the formed nodes.",manufacturing:"Fine particles form a mounting bracket, then a prominent glowing plane scans across it as its silver surface becomes graphite. The scan repeats across the formed part.",network:"A dimensional globe makes one complete rotation. A round polygon envelope forms around readable continents, while geographic nodes light briefly as the globe continues turning.",ontology:"Every piece of the bamboo puzzle forms from particles, then locks into the completed house.",about:"Three glass structures align around a shared foundation, connecting production, knowledge and intelligence."};
function ResponsiveHeroOpening({kind,theme}:{kind:"manufacturing"|"network"|"ontology"|"about";theme:"light"|"dark"}){
 const images=responsiveOpening[kind],frame=openingFrames[kind];
 const style=Object.fromEntries(Object.entries(frame).flatMap(([device,capture])=>{const aspect=capture.width/capture.height,h=Math.max(1,(960/760)/aspect);return [[`--hero-native-${device}-width`,h*aspect],[`--hero-native-${device}-height`,h]];})) as CSSProperties;
 const extra=kind==='manufacturing'?responsiveOpening.manufacturing:undefined;
 return <DeferredPicture style={style} className={`art-theme-${theme} responsive-hero-opening`}><>{extra&&<source media="(max-width:767px) and (min-height:884px)" srcSet={hdOpening(kind,'mobileTall',theme,extra.mobileTall[theme])}/>}<source media="(max-width:767px)" srcSet={hdOpening(kind,'mobile',theme,images.mobile[theme])}/>{extra&&<source media="(min-width:1024px) and (min-height:920px)" srcSet={hdOpening(kind,'tall',theme,extra.tall[theme])}/>}</>{extra&&<><source media="(min-width:768px) and (max-width:1023px)" srcSet={hdOpening(kind,'tablet',theme,extra.tablet[theme])}/><source media="(min-width:1024px) and (max-height:780px)" srcSet={hdOpening(kind,'short',theme,extra.short[theme])}/></>}<img srcSet={hdOpening(kind,'desktop',theme,images.desktop[theme])} src={images.desktop[theme]} alt="" width="625" height="540"/></DeferredPicture>;
}
export function EngineeredHero({kind}:{kind:HeroSceneKind}){
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),controller=useRef<EngineeredController|null>(null);
 const [mode,setMode]=useState<SceneMode>("static"),[review,setReview]=useState(false);
 const motionRevision=useSceneMotion(host);
 useEffect(()=>{resetScenePoster(host.current,canvas.current);let disposed=false,loading=false;const abort=new AbortController(),query=new URLSearchParams(location.search),motion=matchMedia("(prefers-reduced-motion: reduce)");
  const forced=query.get("renderer")==="static"||query.get("motion")==="reduced"||query.get("animate")==="0";
  const still=()=>forced||prefersStaticScene();setReview(query.get("hero-review")==="1");
  const fallback=()=>{if(host.current){host.current.dataset.scenePose="complete";host.current.dataset.sceneState="fallback";}setMode("static");};
  if(still())fallback();
  const view=new ScenePreparationObserver(async([entry])=>{if(!entry.isIntersecting||loading||controller.current||still())return;loading=true;
   try{const mount=kind==="network"?(await import("./network-globe-renderer")).mountNetworkGlobe:(await import("./engineered-hero-renderer")).mountEngineeredHero;await waitForScrollPause();if(disposed||still()||!host.current||!canvas.current)return;
    const callback=(value:SceneMode)=>{if(!disposed)setMode(value);};
    const scene=kind==="network"?await (mount as typeof import('./network-globe-renderer').mountNetworkGlobe)(canvas.current,host.current,callback,abort.signal):await (mount as typeof import('./engineered-hero-renderer').mountEngineeredHero)(canvas.current,host.current,kind,callback,abort.signal);
    if(disposed||still())scene.dispose();else controller.current=scene;
   }catch{if(!disposed){fallback();markSceneFailure(host.current);}}finally{loading=false;}
  },{rootMargin:"450px 0px"});if(host.current)view.observe(host.current);
  const preference=()=>{if(still()){controller.current?.seek(heroSceneDurations[kind]);if(!controller.current)fallback();}else if(host.current&&!controller.current){delete host.current.dataset.scenePose;view.unobserve(host.current);view.observe(host.current);}};
  motion.addEventListener("change",preference);
  return()=>{disposed=true;abort.abort();view.disconnect();motion.removeEventListener("change",preference);controller.current?.dispose();controller.current=null;};
 },[kind,motionRevision]);
 return <div className={`engineered-art engineered-${kind}`}><div className="engineered-stage" ref={host} role="img" aria-label={descriptions[kind]}>
  {kind==='technology'?<ScenePoster kind="technology"/>:<div className="engineered-posters" data-scene-poster aria-hidden="true">{(["opening","complete"] as const).map(pose=><div className={`engineered-pose engineered-${pose}`} key={pose}>{pose==='opening' && kind==='network'?(['light','dark'] as const).map(theme=><img key={theme} className={`art-theme-${theme} network-entry-poster`} src={`/heroes/network-entry-${theme}.webp`} width="960" height="760" alt=""/>):pose==='opening' && kind==='manufacturing'?<NativeOpening scene="manufacturingHero"/>:["light","dark"].map(theme=>(kind==='manufacturing'||kind==='network'||kind==='ontology'||kind==='about')&&pose==='opening'?<ResponsiveHeroOpening key={theme} kind={kind} theme={theme as 'light'|'dark'}/>:kind==='network'?<img {...(pose==='complete'?hdPoster(kind,pose,theme,`/heroes/${kind}-${pose}-${theme}.webp`):{})} key={theme} className={`art-theme-${theme}`} src={`/heroes/network-${pose}-${theme}.webp`} alt="" width="960" height="760"/>:<img {...(pose==='complete'?hdPoster(kind,pose,theme,`/heroes/${kind}-${pose}-${theme}.webp`):{})} key={theme} className={`art-theme-${theme}`} src={`/heroes/${kind}-${pose}-${theme}.webp`} alt="" width="960" height="760"/>)}</div>)}</div>}
  <canvas key={motionRevision} ref={canvas} aria-hidden="true"/>
 </div>
 {kind==="network"&&<p className="hero-art-caption">Future network vision</p>}
 {review&&<label className="hero-review">Artwork time<input aria-label="Artwork time" type="range" min="0" max={heroSceneDurations[kind]} step=".05" defaultValue={heroSceneDurations[kind]} onChange={event=>controller.current?.seek(Number(event.target.value))}/></label>}
 <ArtworkControls mode={mode} onReplay={()=>controller.current?.replay()}/><ArtworkInspector scene={kind} duration={heroSceneDurations[kind]} onSeek={time=>controller.current?.seek(time)}/></div>;
}
