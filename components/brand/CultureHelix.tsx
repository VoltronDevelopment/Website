'use client';
import {ScenePreparationObserver} from '../performance/scene-preparation-observer';
import {useSceneMotion,resetScenePoster,markSceneFailure} from '../performance/use-scene-motion';
import {useEffect,useRef,useState} from 'react';
import {ScenePoster} from '../performance/ScenePoster';
import {prefersStaticScene} from '../performance/scene-policy';
import {ArtworkControls} from './ArtworkControls';
import {cultureHelixDuration} from './culture-helix-timeline';
import type {SceneMode} from './engineered-hero-renderer';
import type {mountCultureHelix} from './culture-helix-renderer';
const choices=[{title:'Individual craft',detail:"Individual depth, craft and judgment strengthen the wider system without erasing a person's distinct perspective."},{title:'Shared purpose',detail:'Shared practice and support create room for individual growth, while keeping people connected to a common purpose.'}];
export function CultureHelix(){
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),controller=useRef<Awaited<ReturnType<typeof mountCultureHelix>>|null>(null);
 const [mode,setMode]=useState<SceneMode>('static'),[selected,setSelected]=useState(0);
 const motionRevision=useSceneMotion(host);
 useEffect(()=>{resetScenePoster(host.current,canvas.current);let disposed=false,loading=false;const abort=new AbortController(),query=new URLSearchParams(location.search),motion=matchMedia('(prefers-reduced-motion: reduce)');
  const still=()=>prefersStaticScene()||query.get('renderer')==='static'||query.get('motion')==='reduced'||query.get('animate')==='0';
  const fallback=()=>{if(host.current){host.current.dataset.scenePose='complete';host.current.dataset.sceneState='fallback';}setMode('static');};
  const view=new ScenePreparationObserver(async([entry])=>{if(!entry.isIntersecting||loading||controller.current||still())return;loading=true;try{const {mountCultureHelix}=await import('./culture-helix-renderer');if(disposed||!host.current||!canvas.current)return;const scene=await mountCultureHelix(canvas.current,host.current,m=>{if(!disposed)setMode(m);},abort.signal);if(disposed)scene.dispose();else{controller.current=scene;if(still()){scene.seek(cultureHelixDuration);setMode('static');}}}catch{if(!disposed){fallback();markSceneFailure(host.current);}}finally{loading=false;}},{rootMargin:'450px 0px'});
  const preference=()=>{if(still()){controller.current?.seek(cultureHelixDuration);fallback();}else if(host.current){delete host.current.dataset.scenePose;if(controller.current){host.current.dataset.sceneState='live';controller.current.replay();}else{view.unobserve(host.current);view.observe(host.current);}}};
  if(still())fallback();if(host.current)view.observe(host.current);motion.addEventListener('change',preference);
  return()=>{disposed=true;abort.abort();view.disconnect();motion.removeEventListener('change',preference);controller.current?.dispose();controller.current=null;};
 },[motionRevision]);
 return <div className="culture-helix"><div className="culture-helix-stage" ref={host} data-selected={selected} role="img" aria-label="Two fine particle ribbons represent individual craft and shared purpose. They intertwine, connect through five groups of bridges, and gather into a contribution cube within a clear enclosure."><ScenePoster kind="cultureHelix"/><canvas key={motionRevision} ref={canvas} aria-hidden="true"/></div>
  <ArtworkControls mode={mode} onToggle={()=>controller.current?.toggle()} onReplay={()=>controller.current?.replay()}/>
  <div className="context-choices" role="group" aria-label="Individual and whole">{choices.map((choice,i)=><button key={choice.title} type="button" aria-pressed={selected===i} aria-controls="culture-helix-detail" onClick={()=>{setSelected(i);if(mode!=='static')controller.current?.select(i);}}>{choice.title}</button>)}</div>
  <p id="culture-helix-detail" className="culture-helix-detail" aria-live="polite">{choices[selected].detail}</p>
 </div>;
}
