export const artworkDefaults={particleScale:1,rearVisibility:1,waveAmplitude:1,waveSpeed:1,reflection:1,roughness:1,glow:1,glassOpacity:1,outline:1,keyDirection:0,transmission:0};
export type ArtworkTuning=typeof artworkDefaults;
export function observeArtworkTuning(scene:string,apply:(value:ArtworkTuning)=>void){
 if(!new URLSearchParams(location.search).has('artwork-review'))return {dispose(){}};
 const listener=(event:Event)=>{const detail=(event as CustomEvent).detail;if(detail?.scene!==scene)return;const values={...artworkDefaults};for(const key of Object.keys(values) as (keyof ArtworkTuning)[]){const value=Number(detail.values?.[key]);if(Number.isFinite(value))values[key]=Math.max(key==='keyDirection'?-3.14:0,Math.min(key==='keyDirection'?3.14:2.5,value));}apply(values);};
 window.addEventListener('artwork-tune',listener);return {dispose(){window.removeEventListener('artwork-tune',listener);}};
}
