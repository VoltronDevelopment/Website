"use client";
import {useEffect,useRef,useState} from "react";
import {LatticeSlot} from "../navigation/LatticeExperience";
import {ArtworkInspector} from '../brand/ArtworkInspector';
import {homeCubeDuration as duration} from './home-cube-timeline';
export function HomeHeroArtwork(){
 const host=useRef<HTMLDivElement>(null),[review,setReview]=useState(false);
 useEffect(()=>{setReview(new URLSearchParams(location.search).get("hero-review")==="1");},[]);
 const command=(action:string,time?:number)=>host.current?.querySelector("[data-lattice-slot]")?.dispatchEvent(new CustomEvent("hero-control",{detail:{action,time}}));
 return <div className="home-hero-controlled" ref={host}><LatticeSlot kind="home" className="home-lattice-art" label="A transparent glass cube, turned slightly toward you. Four faces are tiles: the Voltron logo, Human ingenuity, Shared progress, and Connected intelligence. The tiles divide across the 3 by 3 cube, turn for about six seconds, solve back into those faces, and the cube keeps rotating."/>{review&&<label className="hero-review">Artwork time<input type="range" aria-label="Artwork time" min="0" max={duration} step=".05" defaultValue={duration} onChange={e=>command("seek",Number(e.target.value))}/></label>}<ArtworkInspector scene="home" duration={duration} onSeek={time=>command("seek",time)}/></div>;
}
