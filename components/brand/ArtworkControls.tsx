"use client";
import {RotateCcw} from 'lucide-react';
export function ArtworkControls({mode,onReplay,className=''}:{mode:string;onReplay:()=>void;className?:string}){
 if(mode==='static')return null;
 return <div className={`hero-motion-controls ${className}`}><button type="button" aria-label="Replay animation" title="Replay animation" onClick={onReplay}><RotateCcw size={15} aria-hidden="true"/></button></div>;
}
