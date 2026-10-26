"use client";
import {useEffect,useState} from 'react';
import {artworkDefaults,type ArtworkTuning} from './artwork-tuning';
export function ArtworkInspector({scene,duration,onSeek}:{scene:string;duration:number;onSeek:(time:number)=>void}){
 const [visible,setVisible]=useState(false),[values,setValues]=useState({...artworkDefaults});useEffect(()=>setVisible(new URLSearchParams(location.search).has('artwork-review')),[]);
 if(!visible)return null;
 const apply=(next:ArtworkTuning)=>{setValues(next);window.dispatchEvent(new CustomEvent('artwork-tune',{detail:{scene,values:next}}));};
 const optical=scene==='home'||['technology','ontology','about','commons'].includes(scene),particle=['intelligence','culture','partner','manufacturing'].includes(scene);
 const controls:[keyof ArtworkTuning,string][]=[['keyDirection','Key direction']];
 if(!['culture','partner','commons','manufacturing'].includes(scene))controls.push(['glow','Local glow']);
 if(optical||scene==='intelligence'){controls.push(['reflection','Reflection'],['roughness',scene==='technology'?'Surface roughness':'Glass roughness']);if(scene!=='technology')controls.push(['glassOpacity','Glass body']);if(scene!=='commons')controls.push(['outline','Edge visibility']);}
 if(scene==='home')controls.push(['transmission','Selected side transmission']);
 if(scene==='commons')controls.push(['particleScale','Particle size']);
 if(particle){controls.push(['particleScale','Particle size']);if(scene!=='manufacturing')controls.push(['rearVisibility','Rear visibility'],['waveAmplitude','Wave amplitude']);controls.push(['waveSpeed',scene==='manufacturing'?'Treatment speed':'Wave speed']);}
 return <details className="artwork-inspector"><summary>Artwork studio</summary><div className="artwork-inspector-fields"><label>Timeline<input type="range" aria-label={`${scene} studio time`} min="0" max={duration} step=".05" defaultValue={duration} onChange={e=>onSeek(Number(e.target.value))}/></label>{controls.map(([key,label])=><label key={key}>{label}<input type="range" min={key==='keyDirection'?-3.14:0} max={key==='keyDirection'?3.14:key==='transmission'?1:2} step=".05" value={values[key]} onChange={e=>apply({...values,[key]:Number(e.target.value)})}/></label>)}<button type="button" onClick={()=>apply({...artworkDefaults})}>Reset artwork settings</button></div></details>;
}
