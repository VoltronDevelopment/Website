'use client';
import {useEffect,useRef,useState} from 'react';
import type {mountCoatingCycle} from './coating-cycle-renderer';

export function CoatingCycle({progress}:{progress:number}){
 const canvas=useRef<HTMLCanvasElement>(null),scene=useRef<ReturnType<typeof mountCoatingCycle>|null>(null);
 const latest=useRef(progress),[ready,setReady]=useState(false);
 useEffect(()=>{latest.current=progress;scene.current?.draw(progress);},[progress]);
 useEffect(()=>{
  const view=canvas.current;if(!view)return;
  let disposed=false;
  const draw=()=>scene.current?.draw(latest.current);
  const resize=new ResizeObserver(draw),theme=new MutationObserver(draw);
  const observer=new IntersectionObserver(async ([entry])=>{
   if(!entry.isIntersecting)return;
   observer.disconnect();
   try{
    const {mountCoatingCycle}=await import('./coating-cycle-renderer');
    if(disposed)return;
    scene.current=mountCoatingCycle(view);draw();setReady(true);
    resize.observe(view);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
   }catch{setReady(false);}
  },{rootMargin:'100px'});
  observer.observe(view);
  return ()=>{disposed=true;observer.disconnect();resize.disconnect();theme.disconnect();scene.current?.dispose();scene.current=null;};
 },[]);
 return <div className="coating-cycle" role="img" aria-label="A gantry lowers the suspended lot straight into the coating bath">
  {!ready&&(['light','dark'] as const).map(theme=><img key={theme} className={'art-theme-'+theme} src={'/intelligence/coating-tank-'+theme+'.webp'} alt=""/>)}
  <canvas ref={canvas} aria-hidden="true"/>
 </div>;
}
