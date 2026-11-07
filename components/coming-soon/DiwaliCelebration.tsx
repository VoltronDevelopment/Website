"use client";
import {useEffect,useRef} from "react";

export function DiwaliCelebration({elapsed}:{elapsed:number}){
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const start=performance.now()-elapsed;
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    let disposed=false, frame=0;
    let display:ReturnType<typeof import('./fireworks').createFireworks>|undefined;
    function paint(){
      cancelAnimationFrame(frame);
      const age=performance.now()-start;
      if(!display||disposed||motion.matches||document.hidden||age>=180000)return;
      display.paint((age%10000)/1000);
      frame=requestAnimationFrame(paint);
    }
    if(!(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData){
      void import('./fireworks').then(({createFireworks})=>{
        if(disposed||!canvas.current)return;
        display=createFireworks(canvas.current);paint();
      }).catch(()=>{});
    }
    motion.addEventListener('change',paint);document.addEventListener('visibilitychange',paint);
    return ()=>{disposed=true;cancelAnimationFrame(frame);display?.dispose();motion.removeEventListener('change',paint);document.removeEventListener('visibilitychange',paint);};
  },[elapsed]);
  return <canvas className="launch-fireworks" ref={canvas} aria-hidden="true"/>;
}
