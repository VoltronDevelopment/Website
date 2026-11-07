"use client";
import {createContext,useContext,useRef,useState,type ReactNode} from "react";
import {Volume2,VolumeX} from "lucide-react";

const AudioControl=createContext({playing:false,unavailable:false,toggle:()=>{}});
export function SiteAudio({children}:{children:ReactNode}){
  const audio=useRef<HTMLAudioElement>(null);
  const [playing,setPlaying]=useState(false),[unavailable,setUnavailable]=useState(false);
  function toggle(){
    const element=audio.current;
    if(!element)return;
    if(element.paused)void element.play().catch(()=>setPlaying(false));
    else element.pause();
  }
  return <AudioControl.Provider value={{playing,unavailable,toggle}}>
    <audio ref={audio} preload="none" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>setUnavailable(true)}>
      <source src="/Audio/intro-optimized.ogg" type="audio/ogg"/><source src="/Audio/intro-compat.mp3" type="audio/mpeg"/>
    </audio>{children}
  </AudioControl.Provider>;
}
export function EntryAudio(){
  const {playing,unavailable,toggle}=useContext(AudioControl);
  const label=unavailable?'Music unavailable':playing?'Pause music':'Play music';
  return <button className="icon-button" type="button" onClick={toggle} disabled={unavailable} aria-label={label} title={label} aria-pressed={playing}>
    {playing?<Volume2 size={19} aria-hidden="true"/>:<VolumeX size={19} aria-hidden="true"/>}
  </button>;
}
