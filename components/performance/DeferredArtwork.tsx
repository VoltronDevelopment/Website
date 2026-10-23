"use client";
import {useEffect,useRef,useState} from 'react';

/** Browser native lazy thresholds can download whole sections before they are needed. */
export function DeferredArtwork({src}:{src:string}) {
  const ref=useRef<HTMLImageElement>(null),[near,setNear]=useState(false);
  useEffect(()=>{
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setNear(true);observer.disconnect();}},{rootMargin:'80px'});
    if(ref.current)observer.observe(ref.current);return ()=>observer.disconnect();
  },[]);
  return <><img ref={ref} src={near?src:undefined} data-scene-src={src} alt="" width="1280" height="1280" decoding="async"/><noscript><img src={src} alt="" width="1280" height="1280" loading="lazy"/></noscript></>;
}
