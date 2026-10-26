"use client";
import {Pause,Play,RotateCcw} from 'lucide-react';
export function ArtworkControls({mode,onToggle,onReplay,className=''}:{mode:string;onToggle:()=>void;onReplay:()=>void;className?:string}){
 return <div className={`hero-motion-controls ${className}`} role="group" aria-label="Artwork playback">{mode!=='static'&&<>{mode!=='settled'&&<button type="button" aria-label={mode==='paused'?'Resume animation':'Pause animation'} title={mode==='paused'?'Resume animation':'Pause animation'} onClick={onToggle}>{mode==='paused'?<Play size={16} aria-hidden="true"/>:<Pause size={16} aria-hidden="true"/>}</button>}<button type="button" aria-label="Replay animation" title="Replay animation" onClick={onReplay}><RotateCcw size={16} aria-hidden="true"/></button></>}</div>;
}
