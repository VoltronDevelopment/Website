"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { canPrepareHomeScene, prepareScene } from "./scene-preparation";
import type { FactorySystemsController } from "./factory-systems-renderer";
import type { FactoryPhase } from "./factory-systems-timeline";

const assetRoot = "/Brand%20Assets/voltron%20brand%20page/voltron-factory-systems/";
const systems = [
  { title: "Execution", image: "Robot arm and cube conveyor-1.png", text: "Physical production on the factory floor." },
  { title: "Context", image: "Pastel display with floating checklists.png", text: "Requirements, records and relationships." },
  { title: "Intelligence", image: "Floating Powder-Blue Brain Sculpture.png", text: "Evidence that supports human judgment." },
];
const captions: Record<FactoryPhase, string> = {
  component: "One manufactured component.", digitize: "Its structure becomes visible.",
  separate: "Three connected dimensions emerge.", assemble: "Three connected dimensions emerge.",
  resolve: "Execution. Context. Intelligence.", connect: "Execution. Context. Intelligence.", settled: "One component. Three connected dimensions.",
};

export function FactorySystems() {
  const host = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<FactorySystemsController | null>(null);
  const [ready, setReady] = useState(false), [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false), [phase, setPhase] = useState<FactoryPhase>("settled");
  const description = useId();

  useEffect(() => {
    let disposed = false, nearby = false, scheduled = false, cancel: (() => void) | undefined;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    function prepare() {
      if (!nearby || scheduled || motion.matches || disposed) return;
      scheduled = true;
      cancel = prepareScene(async () => {
        try {
          if (motion.matches) { scheduled = false; return; }
          const { mountFactorySystems } = await import("./factory-systems-renderer");
          if (disposed || !canvas.current || !host.current) return;
          if (motion.matches) { scheduled = false; return; }
          controller.current = mountFactorySystems(canvas.current, host.current, {
            onReady: value => { if (!disposed) setReady(value); },
            onPhase: value => { if (!disposed) setPhase(value); },
          });
          await controller.current.ready;
        } catch {
          if (!disposed && host.current) {
            host.current.dataset.renderer = "fallback";
            setReady(false); setPhase("settled");
          }
        }
      }, canPrepareHomeScene);
    }
    const preference = () => { setReduced(motion.matches); prepare(); };
    preference();
    motion.addEventListener("change", preference);
    const observer = new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting; prepare();
    }, { rootMargin: "650px 0px" });
    if (host.current) observer.observe(host.current);
    return () => {
      disposed = true; cancel?.(); observer.disconnect();
      motion.removeEventListener("change", preference);
      controller.current?.dispose(); controller.current = null;
    };
  }, []);

  const settled = phase === "settled";
  function playback() {
    if (settled) { setPaused(false); controller.current?.replay(); }
    else { setPaused(!paused); controller.current?.setPaused(!paused); }
  }

  return <figure className="factory-systems" aria-label="One component reveals three connected manufacturing capabilities" aria-describedby={description}>
    <div className="factory-systems-stage" ref={host}>
      <canvas className="factory-systems-canvas" ref={canvas} aria-hidden="true" />
      <div className="factory-systems-grid">
        {systems.map(system => <article className="factory-system" key={system.title}>
          <h3>{system.title}</h3>
          <div className="factory-system-anchor" data-system-anchor aria-hidden="true">
            <div className="factory-system-fallback">
              <svg viewBox="0 0 300 280" fill="none" aria-hidden="true">
                <path className="factory-cube-rear" d="M150 24v138M30 208l120-46 120 46" />
                <path className="factory-cube-top" d="m30 70 120-46 120 46-120 48Z" />
                <path className="factory-cube-front" d="m30 70 120 48v138L30 208Z" />
                <path className="factory-cube-side" d="m150 118 120-48v138l-120 48Z" />
                <path className="factory-cube-edge" d="m30 70 120-46 120 46v138l-120 48-120-48V70l120 48 120-48M150 118v138" />
                {[ [30, 70], [150, 24], [270, 70], [30, 208], [150, 256], [270, 208] ].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.8" fill="var(--blue)" />)}
              </svg>
              <img src={assetRoot + encodeURIComponent(system.image)} alt="" width="1280" height="1280" loading="lazy" decoding="async" />
            </div>
          </div>
          <p>{system.text}</p>
        </article>)}
      </div>
    </div>
    <figcaption className="factory-systems-footer">
      <p className="factory-systems-caption" aria-hidden="true">{captions[phase]}</p>
      <div className="factory-systems-controls" hidden={!ready || reduced}>
        <button type="button" onClick={playback} aria-label={settled ? "Replay component reveal" : paused ? "Resume component reveal" : "Pause component reveal"}>
          {settled ? <RotateCcw size={14} aria-hidden="true" /> : paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          <span>{settled ? "Replay" : paused ? "Resume" : "Pause"}</span>
        </button>
      </div>
    </figcaption>
    <p className="factory-systems-description" id={description}>A machined flange housing becomes a digital representation, then reveals three connected capabilities: physical execution, manufacturing context and intelligence that supports human judgment.</p>
  </figure>;
}
