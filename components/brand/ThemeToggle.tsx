"use client";
import {Moon,Sun} from "lucide-react";
import {useEffect,useState} from "react";
import {themeStorageKey,type Theme} from "@/lib/theme";
export function ThemeToggle(){
 const [theme,setTheme]=useState<Theme>("light");
 useEffect(()=>{const read=()=>{let next:Theme="light";try{if(localStorage.getItem(themeStorageKey)==="dark")next="dark";}catch{}document.documentElement.dataset.theme=next;setTheme(next);};read();const storage=(event:StorageEvent)=>{if(event.key===themeStorageKey||event.key===null)read();};window.addEventListener("storage",storage);return()=>window.removeEventListener("storage",storage);},[]);
 function toggle(){const next=theme==="dark"?"light":"dark";document.documentElement.dataset.theme=next;setTheme(next);try{localStorage.setItem(themeStorageKey,next);}catch{}}
 const label=`Switch to ${theme==="dark"?"light":"dark"} theme`;
 return <button type="button" className="icon-button theme-toggle" aria-label={label} title={label} onClick={toggle}><Moon className="theme-icon-light" size={20} aria-hidden="true"/><Sun className="theme-icon-dark" size={20} aria-hidden="true"/></button>;
}
