"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function EntryAudio({leaving}: {leaving: boolean}){
  const audio=useRef<HTMLAudioElement>(null);
  const [playing,setPlaying]=useState(false),[muted,setMuted]=useState(false),[error,setError]=useState(false);
  useEffect(()=>{
    const element=audio.current;
    return ()=>{element?.pause();};
  },[]);
  useEffect(()=>{if(leaving)audio.current?.pause();},[leaving]);
  async function toggle(){
    const element=audio.current;if(!element)return;
    if(playing && !element.muted){element.muted=true;setMuted(true);return;}
    element.muted=false;setMuted(false);
    if(element.paused){try{await element.play();}catch{setPlaying(false);}}
  }
  const label=error?"Music unavailable":!playing?"Play music":muted?"Unmute music":"Mute music";
  return <><audio ref={audio} src="/Audio/Intro.mp3" preload="none" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>setError(true)}/><button type="button" className="icon-button" aria-label={label} title={label} aria-pressed={playing&&!muted} disabled={error} onClick={()=>void toggle()}>{playing&&!muted?<Volume2 size={19} aria-hidden="true"/>:<VolumeX size={19} aria-hidden="true"/>}</button></>;
}
