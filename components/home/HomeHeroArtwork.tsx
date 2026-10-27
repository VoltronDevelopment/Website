"use client";
import {ArtworkControls} from "../brand/ArtworkControls";
import {useEffect,useRef,useState} from "react";
import {Pause,Play,RotateCcw} from "lucide-react";
import {LatticeSlot} from "../navigation/LatticeExperience";
import {ArtworkInspector} from '../brand/ArtworkInspector';
import {duration} from './hero-timeline';
export function HomeHeroArtwork(){
 const host=useRef<HTMLDivElement>(null),[mode,setMode]=useState("static"),[review,setReview]=useState(false);
 useEffect(()=>{setReview(new URLSearchParams(location.search).get("hero-review")==="1");const observer=new MutationObserver(()=>{const node=host.current?.querySelector<HTMLElement>("[data-lattice-slot]");setMode(node?.dataset.sceneMode||"static");});if(host.current)observer.observe(host.current,{subtree:true,attributes:true,attributeFilter:["data-scene-mode"]});return()=>observer.disconnect();},[]);
 const command=(action:string,time?:number)=>host.current?.querySelector("[data-lattice-slot]")?.dispatchEvent(new CustomEvent("hero-control",{detail:{action,time}}));
 return <div className="home-hero-controlled" ref={host}><LatticeSlot kind="home" className="home-lattice-art" label="Seven glass cells assemble. Two upper cells divide into eight and twenty-seven fragments and retreat into depth. The remaining complete cell lifts, rotates twice and sheds its sharp corners as particles. It stops face-on above four base cubes with the original Voltron logo and a gentle volumetric pulse."/><ArtworkControls mode={mode} onToggle={()=>command("toggle")} onReplay={()=>command("replay")}/>{review&&<label className="hero-review">Artwork time<input type="range" aria-label="Artwork time" min="0" max={duration} step=".05" defaultValue={duration} onChange={e=>command("seek",Number(e.target.value))}/></label>}<ArtworkInspector scene="home" duration={duration} onSeek={time=>command("seek",time)}/></div>;
}
