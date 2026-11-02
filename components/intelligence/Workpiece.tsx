'use client';
import {useEffect,useRef,useState} from 'react';
export function Workpiece({progress,scan}:{progress:number;scan:number}){
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),controller=useRef<ReturnType<typeof import('./workpiece-renderer').mountWorkpiece>|null>(null),latest=useRef({progress,scan}),[live,setLive]=useState(false);latest.current={progress,scan};
 useEffect(()=>{let disposed=false;const draw=()=>controller.current?.draw(latest.current.progress,latest.current.scan);const observer=new IntersectionObserver(async([entry])=>{if(!entry.isIntersecting||!canvas.current||!host.current||controller.current)return;observer.disconnect();try{const {mountWorkpiece}=await import('./workpiece-renderer');if(disposed||!canvas.current||!host.current)return;controller.current=mountWorkpiece(canvas.current,host.current);draw();setLive(true);}catch{}},{rootMargin:'200px'});if(host.current)observer.observe(host.current);const resize=new ResizeObserver(draw);if(host.current)resize.observe(host.current);const theme=new MutationObserver(draw);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});return()=>{disposed=true;observer.disconnect();resize.disconnect();theme.disconnect();controller.current?.dispose();controller.current=null;};},[]);
 useEffect(()=>controller.current?.draw(progress,scan),[progress,scan]);
 return <div ref={host} className="evidence-workpiece-live" data-live={live}><canvas ref={canvas} aria-hidden="true"/></div>;
}
