"use client";
import { useEffect, useRef, useState } from "react";
import { prefersStaticScene } from "../performance/scene-policy";
import type { IntelligenceHeroController } from "./intelligence-hero-renderer";
import "./intelligence-hero.css";

export function IntelligenceHeroArtwork() {
  const host = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<IntelligenceHeroController | null>(null);
  const [mode, setMode] = useState<"static" | "playing" | "paused" | "settled">("static");
  useEffect(() => {
    let disposed = false, loading = false;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || prefersStaticScene() || loading || controller.current || !canvas.current || !host.current) return;
      loading = true;
      try {
        const { mountIntelligenceHero } = await import("./intelligence-hero-renderer");
        if (disposed || prefersStaticScene() || !canvas.current || !host.current) return;
        const mounted = await mountIntelligenceHero(canvas.current, host.current, value => { if (!disposed) setMode(value); });
        if (disposed || prefersStaticScene()) mounted.dispose(); else controller.current = mounted;
      } catch { if (!disposed) setMode("static"); }
    }, { rootMargin: "60px" });
    if (host.current) observer.observe(host.current);
    const change = () => { if (motion.matches) { controller.current?.dispose(); controller.current = null; setMode("static"); loading = false; } else if (host.current) { observer.unobserve(host.current); observer.observe(host.current); } };
    motion.addEventListener("change", change);
    return () => { disposed = true; observer.disconnect(); motion.removeEventListener("change", change); controller.current?.dispose(); controller.current = null; };
  }, []);
  return <div className="intelligence-hero-artwork">
    <div ref={host} className="intelligence-face-stage" role="img" aria-label="A silver-blue particle face inside a glass cube. Particles assemble into a three-dimensional human head, connected to a small lattice inside the enclosure.">
      <picture className="intelligence-face-poster"><img src="/intelligence/face-cube-light.webp" width="700" height="620" alt=""/></picture>
      <img className="face-poster-light" src="/intelligence/face-cube-light.webp" width="700" height="620" alt=""/>
      <img className="face-poster-dark" src="/intelligence/face-cube-dark.webp" width="700" height="620" alt=""/>
      <canvas ref={canvas} aria-hidden="true"/>
    </div>
    <div className="intelligence-face-controls">{mode !== "static" && <>
      <button type="button" disabled={mode === "settled"} onClick={() => controller.current?.toggle()}>{mode === "paused" ? "Resume animation" : "Pause animation"}</button>
      <button type="button" onClick={() => controller.current?.replay()}>Replay animation</button>
    </>}</div>
  </div>;
}
