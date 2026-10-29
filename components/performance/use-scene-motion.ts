"use client";
import {useEffect,useState,useRef,type RefObject} from 'react';
import {prefersStaticScene} from './scene-policy';
/** A preference change or one transient failure gets a fresh optional canvas. */
export function useSceneMotion(host:RefObject<HTMLElement|null>){
 const [revision,setRevision]=useState(0),attempted=useRef(false);
 useEffect(()=>{let timer:ReturnType<typeof setTimeout>|undefined;
  const update=()=>setRevision(n=>n+1);
  const retry=(event:Event)=>{if((event as CustomEvent).detail!==host.current||attempted.current||prefersStaticScene())return;attempted.current=true;
   timer=setTimeout(()=>{timer=undefined;if(host.current&&!prefersStaticScene()){host.current.dataset.retryAttempt='1';update();}},700);
  };
  const motion=matchMedia('(prefers-reduced-motion: reduce)');motion.addEventListener('change',update);
  window.addEventListener('voltron:motion',update);window.addEventListener('voltron:scene-failure',retry);
  return()=>{clearTimeout(timer);motion.removeEventListener('change',update);window.removeEventListener('voltron:motion',update);window.removeEventListener('voltron:scene-failure',retry);};
 },[host]);
 return revision;
}
export function markSceneFailure(host:HTMLElement|null){if(host){host.dataset.fallbackReason='asset-or-renderer';window.dispatchEvent(new CustomEvent('voltron:scene-failure',{detail:host}));}}
export function resetScenePoster(host:HTMLElement|null,canvas:HTMLCanvasElement|null){
 if(!host||!canvas)return;
 host.querySelectorAll<HTMLElement>('[data-scene-poster],.scene-poster,.story-posters,.engineered-posters').forEach(p=>{p.style.removeProperty('opacity');p.style.removeProperty('visibility');});
 canvas.style.opacity='0';host.dataset.sceneState='poster';delete host.dataset.scenePose;delete host.dataset.fallback;delete host.dataset.fallbackReason;
}
