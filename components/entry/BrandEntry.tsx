"use client";
import {optimizedAsset} from "@/lib/optimized-assets";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { ThemeToggle } from "@/components/brand/ThemeToggle";
import { EntryAudio } from "./EntryAudio";
import { entryDuration, entryStateAt } from "./entry-timeline";

const pillars=[{id:"human",above:"Human",below:"ingenuity."},{id:"connected",above:"Connected",below:"intelligence."},{id:"manufacturing",above:"Manufacturing",below:"possibilities."}];
// Tangent panels connect both caps along the same 20px rounded perimeter.
const curvedEdges=Array.from({length:48},(_,index)=>{
  const corner=Math.floor(index/12),angle=(-90+(index+.5)*7.5)*Math.PI/180;
  return {"--corner-x":corner<2?"1":"-1","--corner-y":corner===0 || corner===3?"-1":"1","--curve-x":`${(Math.cos(angle)*20).toFixed(4)}px`,"--curve-y":`${(Math.sin(angle)*20).toFixed(4)}px`,"--curve-angle":`${(angle*180/Math.PI+90).toFixed(4)}deg`} as CSSProperties;
});

export function BrandEntry(){
  const host=useRef<HTMLElement>(null);
  const [replay,setReplay]=useState(0);
  const [leaving,setLeaving]=useState(false);
  const [face,setFace]=useState(0),[ready,setReady]=useState(false);
  const faceRef=useRef(0),readyRef=useRef(false);
  const navigation=useRef<ReturnType<typeof setTimeout> | null>(null);
  const router=useRouter();
  const [paused,setPaused]=useState(false);
  const pausedRef=useRef(false),motionControl=useRef<(()=>void) | null>(null);
  useEffect(()=>()=>{if(navigation.current)clearTimeout(navigation.current);},[]);
  useEffect(()=>{
    if(!host.current)return;
    const root=host.current;
    let disposed=false,frame=0,time=0,previous=0;
    const motion=matchMedia("(prefers-reduced-motion: reduce)");
    const reduced=()=>motion.matches || new URLSearchParams(location.search).get("motion")==="reduced";
    function paint(){
      const state=entryStateAt(time);
      root.dataset.phase=String(state.phase);root.dataset.settled=String(state.done);root.dataset.elapsed=time.toFixed(2);
      root.dataset.motion=reduced()?"reduced":"full";
      root.style.setProperty("--entry-logo",String(state.logo));root.style.setProperty("--entry-wordmark",String(state.wordmark));root.style.setProperty("--entry-entrance",String(state.entrance));
      root.style.setProperty("--entry-turn",String(state.turn));
      if(faceRef.current!==state.face){faceRef.current=state.face;setFace(state.face);}
      if(readyRef.current!==state.done){readyRef.current=state.done;setReady(state.done);}
    }
    function stop(){cancelAnimationFrame(frame);frame=0;previous=0;root.dataset.playing="false";}
    function tick(now: number){
      if(disposed || document.hidden || pausedRef.current){stop();return;}
      time=Math.min(entryDuration,time+(previous?(now-previous)/1000:0));previous=now;paint();
      if(time<entryDuration)frame=requestAnimationFrame(tick);else stop();
    }
    function resume(){stop();if(reduced()){time=entryDuration;paint();return;}if(!document.hidden && !pausedRef.current && time<entryDuration){root.dataset.playing="true";frame=requestAnimationFrame(tick);}}
    function visibility(){if(document.hidden)stop();else resume();}
    function preference(){resume();}
    motionControl.current=resume;
    time=reduced()?entryDuration:0;paint();
    motion.addEventListener("change",preference);document.addEventListener("visibilitychange",visibility);
    resume();
    return ()=>{disposed=true;stop();motionControl.current=null;motion.removeEventListener("change",preference);document.removeEventListener("visibilitychange",visibility);};
  },[replay]);

  function enter(event: MouseEvent<HTMLAnchorElement>){
    if(!ready || leaving){event.preventDefault();return;}
    if(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button!==0)return;
    event.preventDefault();setLeaving(true);
    navigation.current=setTimeout(()=>router.push("/"),matchMedia("(prefers-reduced-motion: reduce)").matches?0:420);
  }

  return <main id="main-content" ref={host} className={`brand-entry${leaving?" entry-leaving":""}`} data-phase="8" data-settled="true" data-paused={paused}>
    <div className="entry-presentation">
    <div className="entry-controls"><EntryAudio leaving={leaving}/><ThemeToggle/><button type="button" className="icon-button entry-pause-control" aria-label={paused?"Resume animation":"Pause animation"} title={paused?"Resume animation":"Pause animation"} disabled={leaving} onClick={()=>{pausedRef.current=!pausedRef.current;setPaused(pausedRef.current);motionControl.current?.();}}>{paused?<Play size={18} aria-hidden="true"/>:<Pause size={18} aria-hidden="true"/>}</button><button type="button" className="icon-button" aria-label="Replay entry" title="Replay entry" disabled={leaving} onClick={()=>{pausedRef.current=false;setPaused(false);setReplay(value=>value+1);}}><RotateCcw size={18} aria-hidden="true"/></button></div>
    <div className="entry-body" key={replay}>
      <div className="entry-stage">
        <div className="entry-radial-grid" aria-hidden="true"><span/><span/><span/></div>
        <div className="entry-logo"><span className="entry-logo-glow" aria-hidden="true"/>
          <div className="entry-perspective"><div className="entry-flip-card">
            <span className="entry-body-cap entry-body-front" aria-hidden="true"/><span className="entry-body-cap entry-body-back" aria-hidden="true"/>
            {["top","bottom","left","right"].map(side=><span className={`entry-body-wall entry-body-${side}`} aria-hidden="true" key={side}/>)}
            {curvedEdges.map((style,index)=><span className="entry-body-curve" aria-hidden="true" key={index} style={style}/>)}
            <div className="entry-face" style={{"--face-turn":face%2} as CSSProperties}>
              {face===0?<><img src={optimizedAsset("/Brand%20Assets/logo/light%20rectangle.png")} className="entry-mark-light" alt="Voltron Lattice" width="180" height="180" fetchPriority="high"/><img src={optimizedAsset("/Brand%20Assets/logo/dark%20rectangle.png")} className="entry-mark-dark" alt="Voltron Lattice" width="180" height="180" fetchPriority="high"/></>:face<4?<div className="entry-face-copy" key={face}><span>{pillars[face-1].above}</span><i aria-hidden="true"/><span>{pillars[face-1].below}</span></div>:<Link href="/" className="entry-face-enter" onClick={enter} aria-disabled={!ready || leaving} tabIndex={ready?0:-1}><span className="entry-enter-mark" aria-hidden="true"><img src={optimizedAsset("/Brand%20Assets/voltron%20brand%20page/voltron-hero-assets/voltron-mark-original.png")} alt="" width="120" height="120"/></span><span className="entry-enter-label">Enter Lattice<ArrowRight size={16} aria-hidden="true"/></span></Link>}
            </div>
          </div></div>
          <span className="entry-pulse" aria-hidden="true"/>
        </div>
      </div>
      <h1 className="entry-wordmark" aria-label="Voltron Lattice">{["VOLTRON","LATTICE"].map((word,wordIndex)=><span className="entry-word" aria-hidden="true" key={word}>{[...word].map((letter,index)=><span className="entry-letter" key={index} style={{"--letter-index":wordIndex*7+index} as CSSProperties}>{letter}</span>)}</span>)}</h1>
    </div>
    </div>
  </main>;
}
