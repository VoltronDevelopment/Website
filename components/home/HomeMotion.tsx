"use client";
import {useEffect,useLayoutEffect,useState} from 'react';
import {prefersStaticScene} from '../performance/scene-policy';

/** Re-create optional Home scenes when the visitor changes the shared motion choice. */
export function useHomeMotion(){
 const [revision,setRevision]=useState(0);
 useEffect(()=>{const update=()=>setRevision(n=>n+1),motion=matchMedia('(prefers-reduced-motion: reduce)');window.addEventListener('voltron:motion',update);motion.addEventListener('change',update);return()=>{window.removeEventListener('voltron:motion',update);motion.removeEventListener('change',update);};},[]);
 return revision;
}
export function HomeMotion(){
 const [off,setOff]=useState(false);
 useLayoutEffect(()=>{
  const saved=document.documentElement.dataset.entryHandoff;
  delete document.documentElement.dataset.entryHandoff;
  if(!saved||prefersStaticScene())return;
  const {at}=JSON.parse(saved);
  if(Date.now()-at>10000)return;
  const title=document.querySelector<HTMLElement>('#home-title');
  const first=title?.querySelector('span');
  const stage=document.querySelector<HTMLElement>('.home-lattice-art');
  if(!title||!first||!stage)return;
  title.style.animation='none';
  if(document.querySelector('[data-entry-travel-title]'))title.style.visibility='hidden';
  const bridge=document.querySelector<HTMLElement>('[data-entry-cube-bridge]');
  if(bridge){
    const opening=Array.from(stage.querySelectorAll<HTMLImageElement>('.native-opening-plate img')).find(img=>img.getBoundingClientRect().width>0);
    const release=()=>{bridge.animate([{opacity:1},{opacity:0}],{duration:180,fill:'forwards'}).finished.then(()=>bridge.remove());};
    if(opening)void opening.decode().then(release,release);else release();
  }
  document.querySelector('.site-header')?.animate([{opacity:0},{opacity:1}],{duration:420});
  document.querySelector('.home-hero .hero-keywords')?.animate([{opacity:0,offset:0},{opacity:0,offset:.78},{opacity:1}],{duration:1500});
 },[]);
 useEffect(()=>{
  setOff(document.documentElement.dataset.artworkMotion==='off');
  const root=document.querySelector('.home-page');if(!root)return;
  const timers=new Map<HTMLElement,ReturnType<typeof setTimeout>>();
  const view=new IntersectionObserver(entries=>entries.forEach(entry=>{
   const host=entry.target as HTMLElement;
   if(!entry.isIntersecting||host.dataset.sceneState==='live'||prefersStaticScene())return;
   if(!timers.has(host))timers.set(host,setTimeout(()=>{timers.delete(host);if(host.dataset.sceneState!=='live')host.dataset.loadingSlow='true';},1200));
  }),{rootMargin:'240px'});
  root.querySelectorAll<HTMLElement>('[data-lattice-slot],.lot-story-art,.alpha-process-art,.home-cube-philosophy,.roadmap-art').forEach(host=>view.observe(host));
  return()=>{view.disconnect();timers.forEach(clearTimeout);};
 },[]);
 return <div className="home-motion-preference"><button type="button" aria-pressed={off} onClick={()=>{
  const next=!off;setOff(next);document.documentElement.dataset.artworkMotion=next?'off':'on';
  try{localStorage.setItem('voltron-artwork-motion',next?'off':'on');}catch{}
  window.dispatchEvent(new Event('voltron:motion'));
 }}>{off?'Enable artwork animation':'Reduce artwork animation'}</button></div>;
}

export function resetHomeScene(host:HTMLElement|null,canvas:HTMLCanvasElement|null){
 if(!host||!canvas)return;
 host.querySelectorAll<HTMLElement>('.scene-poster,.lot-story-posters').forEach(p=>{p.style.removeProperty('opacity');p.style.removeProperty('visibility');});
 canvas.style.opacity='0';canvas.hidden=false;delete host.dataset.renderer;
 if(prefersStaticScene()){host.dataset.sceneState='fallback';host.dataset.scenePose='complete';}
 else{host.dataset.sceneState='poster';delete host.dataset.scenePose;delete host.dataset.loadingSlow;}
}
