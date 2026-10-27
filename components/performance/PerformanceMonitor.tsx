"use client";
import {useEffect,useRef} from 'react';
import {useReportWebVitals} from 'next/web-vitals';
import {usePathname} from 'next/navigation';

function publish(name:string,value:number) {
  if(!Number.isFinite(value)||value<0)return;
  const detail={name,value,path:location.pathname,mobile:innerWidth<768};
  window.dispatchEvent(new CustomEvent('voltron:performance',{detail}));
  // Collection is opt-in. No identifiers, URL query strings, input or artwork data are sent.
  const endpoint=process.env.NEXT_PUBLIC_PERFORMANCE_ENDPOINT;
  if(endpoint?.startsWith('/')&&!endpoint.startsWith('//')) {
    navigator.sendBeacon?.(endpoint,new Blob([JSON.stringify(detail)],{type:'application/json'}));
  }
}
const reportVital:Parameters<typeof useReportWebVitals>[0]=metric=>publish(metric.name,metric.value);
export function PerformanceMonitor() {
  const pathname=usePathname(),previous=useRef<string|null>(null);
  useReportWebVitals(reportVital);
  useEffect(()=>{const motion=matchMedia("(prefers-reduced-motion: reduce)");
    try{document.documentElement.dataset.artworkMotion=localStorage.getItem('voltron-artwork-motion')||'on';}catch{}
    const update=()=>{const q=new URLSearchParams(location.search);document.documentElement.dataset.sceneMotion=q.get('renderer')==='static'||q.get('motion')==='reduced'||q.get('animate')==='0'||q.get('artwork')==='composition'||document.documentElement.dataset.artworkMotion==='off'||motion.matches||!!(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData?"static":"motion";};
    update();motion.addEventListener("change",update);window.addEventListener('voltron:motion',update);return()=>{motion.removeEventListener("change",update);window.removeEventListener('voltron:motion',update);};},[]);
  useEffect(()=>{
    const started=previous.current===null?0:performance.now();previous.current=pathname;
    const seen=new WeakSet<Element>();
    const ready=(element:Element)=>{
      if(!(element instanceof HTMLElement)||seen.has(element)||element.dataset.ready!=='true')return;
      seen.add(element);publish('scene-ready',performance.now()-started);
    };
    const observer=new MutationObserver(records=>records.forEach(r=>ready(r.target as Element)));
    observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['data-ready']});
    let long:PerformanceObserver|undefined;
    try { long=new PerformanceObserver(list=>{for(const entry of list.getEntries())if(entry.duration>=200)publish('long-task',entry.duration);});long.observe({type:'longtask',buffered:true}); }catch{}
    return ()=>{observer.disconnect();long?.disconnect();};
  },[pathname]);
  return null;
}
