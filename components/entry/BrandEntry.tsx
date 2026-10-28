"use client";
import {optimizedAsset} from "@/lib/optimized-assets";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { ThemeToggle } from "@/components/brand/ThemeToggle";
import { EntryAudio } from "./EntryAudio";
import { entryDuration, entryStateAt } from "./entry-timeline";
import {IdentityTile} from './IdentityTile';
import {ComingCube} from '../coming-soon/ComingCube';

const pillars=[{id:"human",above:"Human",below:"ingenuity."},{id:"connected",above:"Connected",below:"intelligence."},{id:"manufacturing",above:"Manufacturing",below:"possibilities."}];
// Tangent panels connect both caps along the same 20px rounded perimeter.
const curvedEdges=Array.from({length:48},(_,index)=>{
  const corner=Math.floor(index/12),angle=(-90+(index+.5)*7.5)*Math.PI/180;
  return {"--corner-x":corner<2?"1":"-1","--corner-y":corner===0 || corner===3?"-1":"1","--curve-x":`${(Math.cos(angle)*20).toFixed(4)}px`,"--curve-y":`${(Math.sin(angle)*20).toFixed(4)}px`,"--curve-angle":`${(angle*180/Math.PI+90).toFixed(4)}deg`} as CSSProperties;
});

export function BrandEntry({comingSoon=false,children,extraControls}:{comingSoon?:boolean;children?:ReactNode;extraControls?:ReactNode}){
  const host=useRef<HTMLElement>(null);
  const celebrationCanvas=useRef<HTMLCanvasElement>(null);
  const [replay,setReplay]=useState(0);
  const [leaving,setLeaving]=useState(false);
  const [ready,setReady]=useState(false);
  const faceRef=useRef(0),readyRef=useRef(false);
  const navigation=useRef<ReturnType<typeof setTimeout> | null>(null);
  const router=useRouter();
  const [paused,setPaused]=useState(false);
  const pausedRef=useRef(false),motionControl=useRef<(()=>void) | null>(null);
  useEffect(()=>()=>{if(navigation.current)clearTimeout(navigation.current);},[]);
  useEffect(()=>{
    if(!host.current)return;
    const root=host.current;
    // Decode the final emblem during the opening hold, rather than on its first visible frame.
    root.querySelectorAll<HTMLImageElement>(".identity-tile-mark img").forEach(image=>{void image.decode().catch(()=>{});});
    let disposed=false,frame=0,time=0,previous=0;
    let celebration:ReturnType<typeof import("../coming-soon/fireworks").createFireworks> | undefined;
    let celebrationRequested=false;
    const duration=entryDuration+(comingSoon?7.8:0);
    const motion=matchMedia("(prefers-reduced-motion: reduce)");
    const reduced=()=>motion.matches || new URLSearchParams(location.search).get("motion")==="reduced";
    function paint(){
      const state=entryStateAt(time);
      root.dataset.phase=String(state.phase);root.dataset.settled=String(state.done);root.dataset.elapsed=time.toFixed(2);
      root.dataset.motion=reduced()?"reduced":"full";
      root.style.setProperty("--entry-logo",String(state.logo));root.style.setProperty("--entry-wordmark",String(state.wordmark));root.style.setProperty("--entry-entrance",String(state.entrance));
      root.style.setProperty("--entry-turn",String(state.turn));
      // Copy follows the same clock as the object, including Pause and Replay.
      const reveal=(start:number)=>{const t=Math.max(0,Math.min(1,(time-start)/1.1));return t*t*(3-2*t);};
      root.style.setProperty("--coming-tagline",String(reduced()?1:reveal(5.8)));
      root.style.setProperty("--coming-date",String(reduced()?1:reveal(7.5)));
      if(comingSoon && !reduced() && time>=entryDuration-3 && time<duration && !celebrationRequested){
        celebrationRequested=true;
        if(!(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData){
          void import("../coming-soon/fireworks").then(module=>{
            if(disposed || reduced() || time>=duration || !celebrationCanvas.current)return;
            celebration=module.createFireworks(celebrationCanvas.current,"intro");
          }).catch(()=>{});
        }
      }
      if(reduced() || time>=duration){celebration?.dispose();celebration=undefined;root.dataset.celebrating="false";}
      else if(celebration && time>=entryDuration){root.dataset.celebrating="true";celebration.paint(time-entryDuration);}
      // Every face is already mounted and its images requested. Switch at the
      // edge-on midpoint in this same frame, before the new side becomes visible.
      if(faceRef.current!==state.face){
        root.querySelectorAll<HTMLElement>("[data-entry-face]").forEach(element=>{element.hidden=Number(element.dataset.entryFace)!==state.face;});
        faceRef.current=state.face;
      }
      if(readyRef.current!==state.done){readyRef.current=state.done;setReady(state.done);}
    }
    function stop(){cancelAnimationFrame(frame);frame=0;previous=0;root.dataset.playing="false";}
    function tick(now: number){
      if(disposed || document.hidden || pausedRef.current){stop();return;}
      time=Math.min(duration,time+(previous?(now-previous)/1000:0));previous=now;paint();
      if(time<duration)frame=requestAnimationFrame(tick);else stop();
    }
    function resume(){stop();if(reduced()){time=duration;paint();return;}if(!document.hidden && !pausedRef.current && time<duration){root.dataset.playing="true";frame=requestAnimationFrame(tick);}}
    function visibility(){if(document.hidden)stop();else resume();}
    function preference(){resume();}
    motionControl.current=resume;
    root.dataset.celebrating="false";
    // Replay remounts the face nodes; repaint their visibility even when reduced
    // motion jumps straight back to the same final face.
    faceRef.current=-1;
    time=reduced()?duration:0;paint();
    motion.addEventListener("change",preference);document.addEventListener("visibilitychange",visibility);
    resume();
    return ()=>{disposed=true;stop();celebration?.dispose();motionControl.current=null;motion.removeEventListener("change",preference);document.removeEventListener("visibilitychange",visibility);};
  },[replay,comingSoon]);

  function enter(event: MouseEvent<HTMLAnchorElement>){
    if(!ready || leaving){event.preventDefault();return;}
    if(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button!==0)return;
    event.preventDefault();setLeaving(true);
    navigation.current=setTimeout(()=>router.push("/"),matchMedia("(prefers-reduced-motion: reduce)").matches?0:420);
  }

  return <main id="main-content" ref={host} className={`brand-entry${comingSoon?" coming-soon-entry":""}${leaving?" entry-leaving":""}`} data-phase="8" data-settled="true" data-paused={paused}>
    {comingSoon && <canvas ref={celebrationCanvas} className="coming-intro-fireworks" aria-hidden="true"/>}
    <div className="entry-presentation">
    <div className="entry-controls"><EntryAudio leaving={leaving}/><ThemeToggle/>{extraControls}{!comingSoon && <button type="button" className="icon-button entry-pause-control" aria-label={paused?"Resume animation":"Pause animation"} title={paused?"Resume animation":"Pause animation"} disabled={leaving} onClick={()=>{pausedRef.current=!pausedRef.current;setPaused(pausedRef.current);motionControl.current?.();}}>{paused?<Play size={18} aria-hidden="true"/>:<Pause size={18} aria-hidden="true"/>}</button>}<button type="button" className="icon-button" aria-label="Replay entry" title="Replay entry" disabled={leaving} onClick={()=>{pausedRef.current=false;setPaused(false);setReplay(value=>value+1);}}><RotateCcw size={18} aria-hidden="true"/></button></div>
    <div className="entry-body" key={replay}>
      <div className="entry-stage">
        <div className="entry-radial-grid" aria-hidden="true"><span/><span/><span/></div>
        {comingSoon ? <ComingCube/> : <div className="entry-logo"><span className="entry-logo-glow" aria-hidden="true"/>
          <div className="entry-perspective"><div className="entry-flip-card">
            <span className="entry-body-cap entry-body-front" aria-hidden="true"/><span className="entry-body-cap entry-body-back" aria-hidden="true"/>
            {["top","bottom","left","right"].map(side=><span className={`entry-body-wall entry-body-${side}`} aria-hidden="true" key={side}/>)}
            {curvedEdges.map((style,index)=><span className="entry-body-curve" aria-hidden="true" key={index} style={style}/>)}
            {[0,1,2,3,4].map(face=><div key={face} className="entry-face" data-entry-face={face} hidden={face!==0} style={{"--face-turn":face%2} as CSSProperties}>
              {face===0?<><img src={optimizedAsset("/Brand%20Assets/logo/light%20rectangle.png")} className="entry-mark-light" alt="Voltron Lattice" width="180" height="180" fetchPriority="high"/><img src={optimizedAsset("/Brand%20Assets/logo/dark%20rectangle.png")} className="entry-mark-dark" alt="Voltron Lattice" width="180" height="180" fetchPriority="high"/></>:face<4?<div className="entry-face-copy" key={face}><span>{pillars[face-1].above}</span><i aria-hidden="true"/><span>{pillars[face-1].below}</span></div>:<Link href="/" className="entry-face-enter" onClick={enter} aria-disabled={!ready || leaving} tabIndex={ready?0:-1}><IdentityTile caption={<>Enter Lattice<ArrowRight size={16} aria-hidden="true"/></>}/></Link>}
            </div>)}
          </div></div>
          <span className="entry-pulse" aria-hidden="true"/>
        </div>}
      </div>
      <h1 className="entry-wordmark" aria-label="Voltron Lattice">{["VOLTRON","LATTICE"].map((word,wordIndex)=><span className="entry-word" aria-hidden="true" key={word}>{[...word].map((letter,index)=><span className="entry-letter" key={index} style={{"--letter-index":wordIndex*7+index} as CSSProperties}>{letter}</span>)}</span>)}</h1>
    </div>
    {children}
    </div>
  </main>;
}
