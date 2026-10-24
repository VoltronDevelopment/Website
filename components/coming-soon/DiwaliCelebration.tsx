"use client";
import {useEffect,useRef,useState} from "react";
import {usePathname} from "next/navigation";
import {launchAt} from "@/lib/launch";
import "./diwali.css";
export function DiwaliCelebration(){
 const path=usePathname(),canvas=useRef<HTMLCanvasElement>(null),[active,setActive]=useState(false);
 useEffect(()=>{
  if(path!=="/"&&path!=="/coming-soon")return;
  const check=()=>{const now=Date.now();if(now<launchAt||now>=launchAt+86400000)return;try{if(localStorage.getItem("voltron-diwali-2026"))return;localStorage.setItem("voltron-diwali-2026","seen");}catch{}setActive(true);};
  check();const timer=setInterval(check,1000);return()=>clearInterval(timer);
 },[path]);
 useEffect(()=>{
  if(!active)return;let disposed=false,stop:(()=>void)|undefined;
  const timer=setTimeout(()=>setActive(false),8000);
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const simplify=()=>{if(motion.matches)stop?.();};motion.addEventListener('change',simplify);
  if(!motion.matches&&!(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData)
   void import('./fireworks').then(module=>{if(!disposed&&canvas.current&&!motion.matches)stop=module.playFireworks(canvas.current);}).catch(()=>{});
  return()=>{disposed=true;clearTimeout(timer);motion.removeEventListener('change',simplify);stop?.();};
 },[active]);
 if(!active)return null;
 return <div className="diwali-celebration"><canvas ref={canvas} aria-hidden="true"/><p role="status">Happy Diwali. A new chapter begins.</p></div>;
}
