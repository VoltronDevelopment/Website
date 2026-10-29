"use client";
import {ScenePreparationObserver} from '../performance/scene-preparation-observer';
import {useSceneMotion,resetScenePoster,markSceneFailure} from '../performance/use-scene-motion';
import {ArtworkControls} from "./ArtworkControls";
import {ArtworkInspector} from './ArtworkInspector';
import {ScenePoster} from "../performance/ScenePoster";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { prefersStaticScene } from "../performance/scene-policy";
import { intelligenceHeroDuration } from "./intelligence-hero-timeline";
import type { IntelligenceHeroController } from "./intelligence-hero-renderer";
import "./intelligence-hero.css";

export function IntelligenceHeroArtwork() {
  const host = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<IntelligenceHeroController | null>(null);
  const [mode, setMode] = useState<"static" | "playing" | "paused" | "settled">("static");
  const [review,setReview]=useState(false);
  const motionRevision=useSceneMotion(host);
 useEffect(() => {resetScenePoster(host.current,canvas.current);
    setReview(new URLSearchParams(location.search).get("intelligence-review")==="1");
    let disposed = false, loading = false;
    const query=new URLSearchParams(location.search),forced=query.get("renderer")==="static"||query.get("motion")==="reduced"||query.get("animate")==="0";
    const still=()=>forced||prefersStaticScene();
    if(still()&&host.current){host.current.dataset.scenePose="complete";host.current.dataset.sceneState="fallback";}
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new ScenePreparationObserver(async ([entry]) => {
      if (!entry.isIntersecting || still() || loading || controller.current || !canvas.current || !host.current) return;
      loading = true;
      try {
        const { mountIntelligenceHero } = await import("./intelligence-hero-renderer");
        if (disposed || still() || !canvas.current || !host.current) return;
        const mounted = await mountIntelligenceHero(canvas.current, host.current, value => { if (!disposed) setMode(value); });
        if (disposed || still()) mounted.dispose(); else controller.current = mounted;
      } catch { if (!disposed) {markSceneFailure(host.current);setMode("static");if(host.current){host.current.dataset.scenePose="complete";host.current.dataset.sceneState="fallback";}} } finally { loading=false; }
    }, { rootMargin: "450px 0px" });
    if (host.current) observer.observe(host.current);
    const change = () => { if (motion.matches) { controller.current?.scrub(intelligenceHeroDuration); setMode("settled"); } else if (host.current) { observer.unobserve(host.current); observer.observe(host.current); } };
    motion.addEventListener("change", change);
    return () => { disposed = true; observer.disconnect(); motion.removeEventListener("change", change); controller.current?.dispose(); controller.current = null; };
  }, [motionRevision]);
  return <div className="intelligence-hero-artwork">
    <div ref={host} className="intelligence-face-stage" role="img" aria-label="A glass cube projects a soft light volume. A head forms from particles, is scanned and turns twice. Fine surface particles and rising light remain active while visible.">
      <ScenePoster kind="intelligence"/>
      <canvas key={motionRevision} ref={canvas} aria-hidden="true"/>
    </div>
    <ArtworkControls mode={mode} className="intelligence-face-controls" onToggle={()=>controller.current?.toggle()} onReplay={()=>controller.current?.replay()}/>
    {review && <div className="intelligence-review"><label>Artwork time <input aria-label="Artwork time" type="range" min="0" max={intelligenceHeroDuration} step=".05" defaultValue={intelligenceHeroDuration} onChange={event=>controller.current?.scrub(Number(event.target.value))}/></label><nav aria-label="Artwork review views">{["solid","particles","complete"].map(view=><a key={view} href={`?intelligence-review=1&intelligence-view=${view}&intelligence-time=${intelligenceHeroDuration}`}>{view}</a>)}</nav></div>}
    <ArtworkInspector scene="intelligence" duration={intelligenceHeroDuration} onSeek={time=>controller.current?.scrub(time)}/>
  </div>;
}
