'use client';
import {useEffect,useRef,useState} from 'react';
import {prefersStaticScene} from '../performance/scene-policy';
import {ScenePreparationObserver} from '../performance/scene-preparation-observer';
export function Workpiece({progress,scan}:{progress:number;scan:number}){
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),controller=useRef<ReturnType<typeof import('./workpiece-renderer').mountWorkpiece>|null>(null),latest=useRef({progress,scan}),redraw=useRef<()=>void>(()=>{}),[live,setLive]=useState(false);latest.current={progress,scan};
 useEffect(()=>{
  let disposed=false,loading=false,nearby=false,visible=false;
  const draw=()=>{if(visible&&!document.hidden)controller.current?.draw(latest.current.progress,latest.current.scan);};redraw.current=draw;
  const stop=()=>{controller.current?.dispose();controller.current=null;setLive(false);host.current?.setAttribute('data-ready','false');};
  const prepare=async()=>{
   if(disposed||loading||controller.current||!nearby||prefersStaticScene())return;loading=true;
   try{const {mountWorkpiece}=await import('./workpiece-renderer');if(disposed||prefersStaticScene()||!canvas.current||!host.current)return;controller.current=mountWorkpiece(canvas.current,host.current,ready=>{if(!disposed)setLive(ready);});draw();}catch{if(!disposed)stop();}finally{loading=false;}
  };
  const observer=new ScenePreparationObserver(([entry])=>{nearby=entry.isIntersecting;void prepare();},{rootMargin:'200px'}),view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){void prepare();draw();}},{threshold:.1});
  if(host.current){observer.observe(host.current);view.observe(host.current);}
  const resize=new ResizeObserver(draw);if(host.current)resize.observe(host.current);
  const update=()=>{if(prefersStaticScene())stop();else{void prepare();draw();}};
  const theme=new MutationObserver(update);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-artwork-motion']});
  const motion=matchMedia('(prefers-reduced-motion:reduce)');motion.addEventListener('change',update);window.addEventListener('voltron:motion',update);document.addEventListener('visibilitychange',draw);
  return()=>{disposed=true;redraw.current=()=>{};observer.disconnect();view.disconnect();resize.disconnect();theme.disconnect();motion.removeEventListener('change',update);window.removeEventListener('voltron:motion',update);document.removeEventListener('visibilitychange',draw);controller.current?.dispose();controller.current=null;};
 },[]);
 useEffect(()=>redraw.current(),[progress,scan]);
 return <div ref={host} className="evidence-workpiece-live" data-live={live} role="img" aria-label="The Alpha demonstration panel: six mounting holes, a folded edge and a connected suspension fixture."><picture className="art-theme-light"><img src="/intelligence/evidence-panel-light.webp" width="1024" height="854" alt="" loading="lazy" decoding="async"/></picture><picture className="art-theme-dark"><img src="/intelligence/evidence-panel-dark.webp" width="1024" height="854" alt="" loading="lazy" decoding="async"/></picture><canvas ref={canvas} aria-hidden="true"/></div>;
}
