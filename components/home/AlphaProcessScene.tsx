"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { AlphaProcessController } from "./alpha-process-renderer";
import { positionAlphaFallbackLabels } from "./alpha-process-layout";

const stages = ["Loading", "Prepare", "Coat", "Finish", "Unloading"];

export function AlphaProcessScene() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<AlphaProcessController | null>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState(-1);
  const description = useId();

  useEffect(() => {
    let disposed = false;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(motion.matches);
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
      if (!entry.isIntersecting) return;
      observer.disconnect();
      try {
        const { mountAlphaProcess } = await import("./alpha-process-renderer");
        if (disposed || !canvas.current || !host.current) return;
        controller.current = mountAlphaProcess(canvas.current, host.current, {
          paused: pausedRef.current,
          onStage: setStage,
          onReady: () => { if (!disposed) setReady(true); },
        });
      } catch {
        // The initial SVG remains a complete illustration if WebGL or the chunk is unavailable.
      }
    }, { rootMargin: "160px" });
    if (host.current) observer.observe(host.current);
    return () => {
      disposed = true;
      observer.disconnect();
      sizing.disconnect();
      readiness.disconnect();
      motion.removeEventListener("change", updateMotion);
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);

  function toggle() {
    const value = !paused;
    pausedRef.current = value;
    setPaused(value);
    controller.current?.setPaused(value);
  }

  return <figure className="alpha-process" aria-label="Illustrated surface treatment line" aria-describedby={description}>
    <div className="alpha-process-art" ref={host} data-ready={ready}>
      <AlphaProcessFallback />
      <canvas ref={canvas} aria-hidden="true" />
    </div>
    <ol className="alpha-process-stages" aria-label="Process chapters">
      {stages.map((label, index) => <li key={label} data-active={stage === index} aria-current={stage === index ? "step" : undefined}>
        <span className="alpha-stage-dot" aria-hidden="true"/><span className="alpha-stage-name"><span className="alpha-stage-label-full">{label}</span>{(index === 0 || index === 4) && <span className="alpha-stage-label-short">{index === 0 ? "Load" : "Unload"}</span>}</span>
      </li>)}
    </ol>
    <figcaption className="alpha-process-footer">
      <p id={description}>Conceptual process illustration · Timing compressed.</p>
      <div className="alpha-process-controls" hidden={!ready || reduced}>
        <button type="button" onClick={toggle} aria-label={paused ? "Resume process animation" : "Pause process animation"}>
          {paused ? <Play size={14} aria-hidden="true"/> : <Pause size={14} aria-hidden="true"/>}<span>{paused ? "Resume" : "Pause"}</span>
        </button>
        <button type="button" onClick={() => { pausedRef.current = false; setPaused(false); controller.current?.replay(); }} aria-label="Replay process animation"><RotateCcw size={14} aria-hidden="true"/><span>Replay</span></button>
      </div>
    </figcaption>
    <p className="alpha-process-description">A suspended silver part is lowered into three tanks in sequence: prepare, coat and finish. The part becomes graphite during coating, then is placed on the unloading platform. The empty hoist returns to loading.</p>
  </figure>;
}

function AlphaProcessFallback() {
  return <svg className="alpha-process-fallback" viewBox="0 -115 1120 450" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="alpha-static-metal" x2="0" y2="1"><stop stopColor="var(--surface)"/><stop offset="1" stopColor="var(--cube-right)"/></linearGradient>
      <linearGradient id="alpha-static-water" x2="0" y2="1"><stop stopColor="var(--cyan)" stopOpacity=".6"/><stop offset="1" stopColor="var(--blue)" stopOpacity=".3"/></linearGradient>
    </defs>
    <g transform="translate(45 115) skewY(-8)" stroke="var(--cube-outline)" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M20 220 930 220 1005 172 95 172Z" fill="var(--cube-left)" fillOpacity=".3"/>
      {[180, 395, 610].map((x, i) => <g key={x}>
        <path d={`M${x} 96h182l54-33H${x + 54}Z`} fill="url(#alpha-static-water)"/>
        <path d={`M${x} 96h182v115H${x}Z`} fill="url(#alpha-static-water)"/>
        <path d={`m${x + 182} 96 54-33v115l-54 33Z`} fill="var(--cyan)" fillOpacity=".22"/>
        <path d={`M${x} 86h182l54-33H${x + 54}Z M${x} 86v125h182V86 M${x + 182} 211l54-33V53`} strokeWidth="4"/>
        <path d={`M${x + 88} -45V12`} strokeWidth="3"/>
        <rect x={x + 64} y="12" width="48" height="76" rx="3" fill={i === 0 ? "url(#alpha-static-metal)" : "var(--ink)"} fillOpacity=".75"/>
      </g>)}
      <path d="M55 211V-50h910v228 M93 185V-76h910v228 M55-50l38-26 M965-50l38-26" strokeWidth="7"/>
      <path d="M55-42h910 M93-68h910" stroke="var(--surface)" strokeOpacity=".65" strokeWidth="2"/>
      <path d="M4 188h108v14H4z M881 188h100v14H881z" fill="url(#alpha-static-metal)"/>
    </g>
  </svg>;
}
