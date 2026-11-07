'use client';
import {useEffect,useRef,useState} from 'react';
import {prefersStaticScene} from '../performance/scene-policy';

/** A finite, visibility-aware presentation clock shared by lightweight product diagrams. */
export function usePresentationClock(key:number,duration=10,paused=false){
 const host=useRef<HTMLDivElement>(null);
 const pauseRef=useRef(paused),syncPlayback=useRef<(()=>void)|null>(null);
 useEffect(()=>{pauseRef.current=paused;syncPlayback.current?.();},[paused]);
 const [progress,setProgress]=useState(0),[running,setRunning]=useState(false),[staticMode,setStaticMode]=useState(false);
 useEffect(()=>{
  let visible=false,frame=0,last=0,elapsed=0,disposed=false,published=0;
  setProgress(0);
  const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;setRunning(false);};
  const tick=(now:number)=>{frame=0;if(disposed||!visible||document.hidden)return;elapsed+=last?Math.min((now-last)/1000,.1):0;last=now;
   if(now-published>65||elapsed>=duration){setProgress(Math.min(1,elapsed/duration));published=now;}
   if(elapsed<duration)frame=requestAnimationFrame(tick);else setRunning(false);
  };
  const resume=()=>{stop();const reduced=prefersStaticScene();setStaticMode(reduced);if(reduced){setProgress(1);return;}if(visible&&!pauseRef.current&&!document.hidden&&elapsed<duration){setRunning(true);frame=requestAnimationFrame(tick);}};
  syncPlayback.current=resume;
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.2;resume();},{threshold:.2});if(host.current)observer.observe(host.current);
  const media=matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',resume);window.addEventListener('voltron:motion',resume);document.addEventListener('visibilitychange',resume);resume();
  return()=>{disposed=true;syncPlayback.current=null;cancelAnimationFrame(frame);observer.disconnect();media.removeEventListener('change',resume);window.removeEventListener('voltron:motion',resume);document.removeEventListener('visibilitychange',resume);};
 },[key,duration]);
 return {host,progress,running,staticMode};
}
