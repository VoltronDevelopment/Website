import {DeferredPicture} from "./DeferredArtwork";
import captures from "@/lib/launch-opening-frames.json";

type Scene = keyof typeof captures;
export function NativeOpening({scene}:{scene:Scene}){
  return <>{(["light","dark"] as const).map(theme=>{
    const frames=captures[scene];
    const sources=(size:"phone"|"tablet"|"desktop")=>{
      const [standard, highDensity]=frames[size][theme];
      return `${standard} 1x, ${highDensity} 2x`;
    };
    return <DeferredPicture key={theme} initial={scene==="home"} className={`native-opening-plate art-theme-${theme}`}>
      <source media="(max-width:767px)" srcSet={sources("phone")}/>
      <source media="(max-width:1023px)" srcSet={sources("tablet")}/>
      <img alt="" src={frames.desktop[theme][0]} srcSet={sources("desktop")} decoding="async"
        fetchPriority={scene==="home"?"high":"auto"} loading={scene==="home"?"eager":"lazy"}/>
    </DeferredPicture>;
  })}</>;
}
