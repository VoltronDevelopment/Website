"use client";
import {useEffect,useRef} from 'react';
import {ReplayableStudy} from '../brand/ReplayableStudy';
import {ExternalLink} from 'lucide-react';
import {prefersStaticScene} from '../performance/scene-policy';
import {ScenePreparationObserver} from '../performance/scene-preparation-observer';
import {waitForScrollPause} from '../home/scene-preparation';
import type {LeadershipKind} from './leadership-renderer';

function Projection({kind}:{kind:LeadershipKind}){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const node=canvas.current,element=node?.parentElement as HTMLDivElement|null;if(!node||!element)return;
  let disposed=false,loading=false,controller:{dispose():void}|undefined;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const stop=()=>{controller?.dispose();controller=undefined;};
  const observer=new ScenePreparationObserver(async([entry])=>{
   if(!entry.isIntersecting||loading||controller||prefersStaticScene())return;
   loading=true;
   try{
    const {mountLeadership}=await import('./leadership-renderer');
    await waitForScrollPause();
    if(disposed||prefersStaticScene())return;
    const mounted=await mountLeadership(node,element,kind);
    if(disposed||prefersStaticScene())mounted.dispose();else controller=mounted;
   }catch{element.dataset.live='false';}finally{loading=false;}
  },{rootMargin:'0px',threshold:.1});
  const preference=()=>{if(prefersStaticScene())stop();else{observer.unobserve(element);observer.observe(element);}};
  observer.observe(element);motion.addEventListener('change',preference);
  const settings=new MutationObserver(preference);settings.observe(document.documentElement,{attributes:true,attributeFilter:['data-artwork-motion']});
  return()=>{disposed=true;observer.disconnect();settings.disconnect();motion.removeEventListener('change',preference);stop();};
 },[kind]);
 return <><picture className="leadership-native-still art-theme-light"><source media="(max-width:767px)" srcSet={`/leadership/${kind}-mobile-light.webp`}/><img src={`/leadership/${kind}-desktop-light.webp`} alt="" width="1200" height="1000" loading="lazy"/></picture><picture className="leadership-native-still art-theme-dark"><source media="(max-width:767px)" srcSet={`/leadership/${kind}-mobile-dark.webp`}/><img src={`/leadership/${kind}-desktop-dark.webp`} alt="" width="1200" height="1000" loading="lazy"/></picture><canvas ref={canvas} aria-hidden="true"/></>;
}

export function Leadership(){
 return <div className="leadership-projections">
  <article className="leadership-person">
   <ReplayableStudy label="founder portrait reveal"><div className="leadership-projection leadership-portrait" aria-hidden="true">
    <Projection kind="portrait"/>
   </div></ReplayableStudy>
   <div className="leadership-copy"><p className="eyebrow">Founder &amp; CEO</p><h3>Omkar Todkar</h3><p className="desktop-story-details">IIT Madras · B.Tech + M.Tech</p><details className="mobile-story-details"><summary>Education</summary><p>IIT Madras · B.Tech + M.Tech</p></details><a href="https://www.linkedin.com/in/omkar-todkar-65982a73/" target="_blank" rel="noopener noreferrer">Connect on LinkedIn<ExternalLink size={15} aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a><a href="https://www.fluteandforge.com/" target="_blank" rel="noopener noreferrer">Flute &amp; Forge · Personal studio<ExternalLink size={15} aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a></div>
  </article>
  <article className="leadership-role">
   <ReplayableStudy label="chassis, suspension and wheel assembly"><div className="leadership-projection leadership-automotive" aria-hidden="true"><Projection kind="automotive"/>
   </div></ReplayableStudy><div className="leadership-copy"><p className="eyebrow">Chief Operating Officer</p><h3>Automotive experience</h3><p className="leadership-state">Revealing soon</p></div>
  </article>
  <article className="leadership-role">
   <ReplayableStudy label="CTO résumé study"><div className="leadership-projection leadership-search" aria-hidden="true"><Projection kind="search"/></div></ReplayableStudy>
   <div className="leadership-copy"><p className="eyebrow">Chief Technology Officer</p><h3>Help build what comes next.</h3><p className="leadership-state">Search underway</p><a href="/partner?interest=cto#partnership">Start a conversation <span aria-hidden="true">→</span></a></div>
  </article>
 </div>;
}
