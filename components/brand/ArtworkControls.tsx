"use client";
import {Undo2} from 'lucide-react';
export function ArtworkControls({mode,onReplay,className=''}:{mode:string;onReplay:()=>void;className?:string}){
 if(mode==='static')return null;
 return <div className={`hero-motion-controls ${className}`}><button type="button" aria-label="Replay animation" title="Replay animation" onClick={onReplay}><Undo2 className="replay-arrow" size={15} aria-hidden="true"/></button></div>;
}
