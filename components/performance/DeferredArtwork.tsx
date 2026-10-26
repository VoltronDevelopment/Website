"use client";
import {useEffect,useRef,useState} from 'react';

/** Browser native lazy thresholds can download whole sections before they are needed. */
export function DeferredArtwork({src,className,width=1280,height=1280}:{src:string;className?:string;width?:number;height?:number}) {
  const ref=useRef<HTMLImageElement>(null),[near,setNear]=useState(false);
  useEffect(()=>{
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setNear(true);observer.disconnect();}},{rootMargin:'80px'});
    if(ref.current)observer.observe(ref.current);return ()=>observer.disconnect();
  },[]);
  return <><img ref={ref} className={className} src={near?src:undefined} data-scene-src={src} alt="" width={width} height={height} decoding="async"/><noscript><img className={className} src={src} alt="" width={width} height={height} loading="lazy"/></noscript></>;
}
