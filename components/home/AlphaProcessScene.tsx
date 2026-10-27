"use client";
import {useHomeMotion,resetHomeScene} from './HomeMotion';
import {ScenePoster} from "../performance/ScenePoster";
import {prefersStaticScene} from "@/components/performance/scene-policy";

import { useEffect, useId, useRef, useState } from "react";
import type { AlphaProcessController } from "./alpha-process-renderer";
import { positionAlphaFallbackLabels } from "./alpha-process-layout";

const stages = ["Loading", "Prepare", "Coat", "Finish", "Unloading"];

export function AlphaProcessScene() {
  const motionRevision=useHomeMotion();
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<AlphaProcessController | null>(null);
  const pausedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState(-1);
  const description = useId();

  useEffect(() => {
    pausedRef.current=false;setReady(false);resetHomeScene(host.current,canvas.current);
    let disposed = false;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {

      if (prefersStaticScene() && !controller.current && host.current) host.current.dataset.fallback = "true";
    };
    updateMotion();
    motion.addEventListener("change", updateMotion);
    const fallbackLayout = () => {
      if (host.current && host.current.dataset.ready !== "true") positionAlphaFallbackLabels(host.current);
    };
    const sizing = new ResizeObserver(fallbackLayout);
    const readiness = new MutationObserver(fallbackLayout);
    if (host.current) {
      sizing.observe(host.current);
      readiness.observe(host.current, { attributes: true, attributeFilter: ["data-ready"] });
    }
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || prefersStaticScene()) return;
      observer.disconnect();
      try {
        const { mountAlphaProcess } = await import("./alpha-process-renderer");
        if (disposed || !canvas.current || !host.current) return;
        controller.current = await mountAlphaProcess(canvas.current, host.current, {
          paused: pausedRef.current,
          onStage: value=>{if(!disposed)setStage(value);},
          onEnded:()=>{if(!disposed){pausedRef.current=true;}},
          onReady: () => { if (!disposed) { if(host.current) delete host.current.dataset.fallback; setReady(true); } },
        });
        if(disposed){controller.current.dispose();controller.current=null;return;}
        controller.current.setPaused(pausedRef.current);
      } catch {
        if (!disposed && host.current) host.current.dataset.fallback = "true";
        // The initial SVG remains a complete illustration if WebGL or the chunk is unavailable.
      }
    }, { rootMargin: "160px" });
    if (host.current) observer.observe(host.current);
    const sceneMotionPreference=matchMedia("(prefers-reduced-motion: reduce)");
    const retryScene=()=>{if(!prefersStaticScene()&&!controller.current&&host.current){observer.unobserve(host.current);observer.observe(host.current);}};
    sceneMotionPreference.addEventListener("change",retryScene);
    return () => {
      sceneMotionPreference.removeEventListener("change",retryScene);
      disposed = true;
      observer.disconnect();
      sizing.disconnect();
      readiness.disconnect();
      motion.removeEventListener("change", updateMotion);
      controller.current?.dispose();
      controller.current = null;
    };
  }, [motionRevision]);

  return <figure className="alpha-process" aria-label="Illustrated surface treatment line" aria-describedby={description}>
    <div className="alpha-process-art" ref={host} data-ready={ready}>
      <div className="alpha-process-fallback"><ScenePoster kind="process"/></div>
      <canvas ref={canvas} aria-hidden="true" />
    </div>
    <ol className="alpha-process-stages" aria-label="Process chapters">
      {stages.map((label, index) => <li key={label} data-active={stage === index} aria-current={stage === index ? "step" : undefined}>
        <span className="alpha-stage-dot" aria-hidden="true"/><span className="alpha-stage-name"><span className="alpha-stage-label-full">{label}</span>{(index === 0 || index === 4) && <span className="alpha-stage-label-short">{index === 0 ? "Load" : "Unload"}</span>}</span>
      </li>)}
    </ol>
    <figcaption className="alpha-process-footer">
      <p id={description}>Conceptual process illustration · Timing compressed.</p>
    </figcaption>
    <p className="alpha-process-description">A suspended silver part is lowered into three tanks in sequence: prepare, coat and finish. The part becomes graphite during coating, then is placed on the unloading platform. The empty hoist returns to loading.</p>
  </figure>;
}
