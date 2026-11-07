"use client";
import {useEffect,useRef} from "react";

export function DiwaliCelebration({opens,serverNow}:{opens:number;serverNow:number}){
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const start=performance.now()-(serverNow-opens);
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    let disposed=false, frame=0;
    let display:ReturnType<typeof import('./fireworks').createFireworks>|undefined;
    function paint(){
      cancelAnimationFrame(frame);
      const age=performance.now()-start;
      if(!display||disposed||motion.matches||document.hidden||age>=180000)return;
      // Increase burst frequency toward midnight, keeping the phase continuous.
      const seconds=age/1000;
      const ramp=Math.min(300,Math.max(0,seconds+300));
      const phase=seconds < -300 ? (seconds+300)*.4 : ramp*.4+ramp*ramp/600+Math.max(0,seconds)*1.4;
      display.paint(seconds,offset=>{
        const last=offset+10*Math.floor((phase-offset)/10);
        const burstTime=last<0 ? last/.4-300 : last<270 ? 2*last/(.4+Math.sqrt(.16+last/150))-300 : (last-270)/1.4;
        return seconds-burstTime;
      });
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
  },[opens,serverNow]);
  return <canvas className="launch-fireworks" ref={canvas} aria-hidden="true"/>;
}
