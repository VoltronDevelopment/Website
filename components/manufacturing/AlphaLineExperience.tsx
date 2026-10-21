"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowDownToLine, ArrowRight, ChevronLeft, ChevronRight, Maximize2, Minus, Pause, Play, Plus, RotateCcw } from "lucide-react";
import { alphaLineChapters, alphaLineConnections, alphaLineDemo, alphaLineEndX, alphaLineFarZ, alphaLineNearZ, alphaLinePath, alphaLineStation, alphaLineStations, type AlphaLineJourneyChapter } from "./alpha-line-config";
import type { AlphaLineController } from "./alpha-line-renderer";
import { alphaLineStory, type AlphaLineView } from "./alpha-line-story";
import { alphaLineChapterPreview, alphaLineDeviationDuration, alphaLineDeviationStateAt, alphaLineDeviationStepDuration, alphaLineDeviationSteps, alphaLineDuration, alphaLineRouteState, alphaLineStateAt, type AlphaLineState } from "./alpha-line-timeline";

const views: { id: AlphaLineView; label: string }[] = [{ id: "execution", label: "Execution" }, { id: "context", label: "Context" }, { id: "intelligence", label: "Intelligence" }];
const chapterOrder: (AlphaLineJourneyChapter | "route")[] = ["route", "loading", "processing", "verification", "unloading", "review"];
const compactChapters = ["Load", "Process", "Verify", "Unload", "Review"];
const clock = (time: number) => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`;

export function AlphaLineExperience() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<AlphaLineController | null>(null);
  const pausedRef = useRef(true);
  const playbackRef = useRef(alphaLineRouteState());
  const [paused, setPaused] = useState(true);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [playback, setPlayback] = useState<AlphaLineState>(alphaLineRouteState);
  const [view, setView] = useState<AlphaLineView>("execution");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [explore, setExplore] = useState(false);
  const description = useId();
  const panelTitle = useId();
  const tabsId = useId();

  useEffect(() => {
    let disposed = false;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const query = new URLSearchParams(location.search);
    const reviewTime = query.get("alpha-time");
    if (reviewTime !== null) { playbackRef.current = alphaLineStateAt(Number(reviewTime) || 0); setPlayback(playbackRef.current); }
    const updateMotion = () => {
      setReduced(motion.matches);
      if (motion.matches) { pausedRef.current = true; setPaused(true); controller.current?.setPaused(true); }
    };
    updateMotion(); motion.addEventListener("change", updateMotion);
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (query.get("renderer") === "static") { if (host.current) host.current.dataset.fallback = "true"; return; }
      try {
        const { mountAlphaLine } = await import("./alpha-line-renderer");
        if (disposed || !canvas.current || !host.current) return;
        const pending = playbackRef.current;
        controller.current = mountAlphaLine(canvas.current, host.current, {
          paused: pausedRef.current,
          onState: next => { if (!disposed) { playbackRef.current = next; setPlayback(next); } },
          onSelect: id => {
            if (disposed) return;
            pausedRef.current = true; setPaused(true); controller.current?.setPaused(true);
            setSelectedId(id); controller.current?.focusStation(id);
          },
          onReady: () => { if (!disposed) setReady(true); },
          onEnded: () => { if (!disposed) { pausedRef.current = true; setPaused(true); } },
        });
        controller.current.seek(pending.mode, pending.time);
        controller.current.setPaused(pausedRef.current);
      } catch { if (host.current) host.current.dataset.fallback = "true"; }
    }, { rootMargin: "180px" });
    if (host.current) observer.observe(host.current);
    return () => { disposed = true; observer.disconnect(); motion.removeEventListener("change", updateMotion); controller.current?.dispose(); controller.current = null; };
  }, []);

  function remember(next: boolean) { pausedRef.current = next; setPaused(next); controller.current?.setPaused(next); }
  function seek(mode: "route" | "journey" | "deviation", time: number) {
    const next = mode === "route" ? alphaLineRouteState() : mode === "deviation" ? alphaLineDeviationStateAt(time) : alphaLineStateAt(time);
    playbackRef.current = next; setPlayback(next);
    controller.current?.seek(mode, next.time);
    controller.current?.setPaused(pausedRef.current);
  }
  function showLine() { setSelectedId(null); controller.current?.focusStation(null); }
  function follow() { resetView(); remember(true); seek("journey", 0); if (!reduced) remember(false); }
  function goTo(chapter: AlphaLineJourneyChapter) { showLine(); remember(true); seek("journey", alphaLineChapterPreview(chapter)); }
  function step(delta: number) {
    remember(true);
    if (playback.chapter === "deviation") {
      const step = (playback.deviationStep ?? 0) + delta;
      if (step < 0 || step >= alphaLineDeviationSteps) { goTo("review"); return; }
      seek("deviation", step * alphaLineDeviationStepDuration); return;
    }
    const at = chapterOrder.indexOf(playback.chapter);
    const next = chapterOrder[Math.min(chapterOrder.length - 1, Math.max(0, at + delta))];
    if (next === "route") seek("route", 0); else goTo(next);
  }
  function deviate() {
    resetView(); setView("intelligence"); remember(true); seek("deviation", 0);
    if (!reduced) remember(false);
    document.getElementById("explore-alpha")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }
  function choose(id: string) { if (!id) { showLine(); return; } remember(true); setSelectedId(id); controller.current?.focusStation(id); }
  function resetView() { setSelectedId(null); setExplore(false); controller.current?.setExplore(false); controller.current?.resetView(); }
  function togglePlay() {
    if (playback.chapter === "route" || playback.time >= alphaLineDuration && playback.mode === "journey") { follow(); return; }
    if (playback.mode === "deviation" && playback.time >= alphaLineDeviationDuration) { deviate(); return; }
    remember(!paused);
  }
  const story = alphaLineStory(playback, view);
  const selected = selectedId ? alphaLineStation(selectedId) : null;
  const duration = playback.mode === "deviation" ? alphaLineDeviationDuration : alphaLineDuration;
  const activeStation = alphaLineStation(playback.stationId);
  const completed = playback.processingComplete;
  const ended = playback.mode !== "route" && playback.time >= duration;

  return <div className="alpha-line">
    <div className="alpha-line-layout">
      <div className="alpha-line-stage">
        <div className="alpha-line-stage-heading"><span>13 tanks · Square-U route</span><span>{playback.chapter === "route" ? "Plant overview" : `${paused || !ready || reduced ? "Paused" : "Following lot"} · ${activeStation.name}`}</span></div>
        <div className="alpha-line-art" ref={host} data-ready={ready} role="group" aria-label="Interactive thirteen-tank square-U treatment line" aria-describedby={description}>
          <AlphaLineFallback state={playback} selected={selectedId}/>
          <canvas ref={canvas} aria-hidden="true"/>
          <div className="alpha-line-numbers" aria-hidden="true">{alphaLineStations.map(station => <span key={station.id} data-station={station.id} data-active={playback.carrierVisible && playback.stationId === station.id} data-selected={selectedId === station.id}>{station.number}{station.kind !== "tank" && <small>{station.name}</small>}</span>)}</div>
          {playback.chapter === "route" && <button type="button" className="button alpha-line-follow" onClick={follow}>Follow a lot <ArrowRight size={16} aria-hidden="true"/></button>}
          {selected && <button type="button" className="alpha-line-complete" onClick={showLine}><Maximize2 size={14} aria-hidden="true"/>Complete line</button>}
        </div>
        <div className="alpha-line-stage-footer"><span>Loading → Tanks 01–13 → Unloading</span><label>Inspect station<select value={selectedId ?? ""} onChange={event => choose(event.target.value)}><option value="">Complete line</option>{alphaLineStations.map(station => <option key={station.id} value={station.id}>{station.name}</option>)}</select></label></div>
        <ol className="alpha-line-chapters" aria-label="Guided chapters">{alphaLineChapters.map((chapter, index) => <li key={chapter.id}><button type="button" aria-current={playback.chapter === chapter.id ? "step" : undefined} aria-label={chapter.label} onClick={() => goTo(chapter.id)}><span aria-hidden="true">{index + 1}</span><span className="alpha-chapter-full" aria-hidden="true">{chapter.label}</span><span className="alpha-chapter-compact" aria-hidden="true">{compactChapters[index]}</span></button></li>)}</ol>
        <div className="alpha-line-progress"><label className="sr-only" htmlFor={`${tabsId}-progress`}>Journey position in seconds</label><input id={`${tabsId}-progress`} type="range" min="0" max={duration} step=".1" value={Math.min(duration, playback.time)} aria-valuetext={`${clock(playback.time)} of ${clock(duration)}`} onChange={event => { remember(true); seek(playback.mode === "deviation" ? "deviation" : "journey", Number(event.target.value)); }}/><span>{clock(playback.time)} / {clock(duration)}</span></div>
        <div className="alpha-line-controls">
          {ready && !reduced && <button type="button" className="alpha-play" onClick={togglePlay} aria-label={paused ? ended ? "Replay the lot" : "Play the lot" : "Pause the lot"}>{paused ? <Play size={15} aria-hidden="true"/> : <Pause size={15} aria-hidden="true"/>}{paused ? ended ? "Replay" : "Play" : "Pause"}</button>}
          <button type="button" onClick={() => step(-1)} disabled={playback.chapter === "route"} aria-label="Previous stage"><ChevronLeft size={15} aria-hidden="true"/>Previous</button>
          <button type="button" onClick={() => step(1)} disabled={playback.chapter === "review"} aria-label="Next stage">Next<ChevronRight size={15} aria-hidden="true"/></button>
          {ready && <><button type="button" onClick={resetView}><RotateCcw size={14} aria-hidden="true"/>Reset view</button><button type="button" aria-pressed={explore} onClick={() => { setExplore(!explore); controller.current?.setExplore(!explore); }}>Explore freely</button></>}
        </div>
        {ready && explore && <div className="alpha-line-orbit" aria-label="Camera controls"><span>Drag to rotate, or use these controls.</span><button type="button" aria-label="Rotate view left" onClick={() => controller.current?.orbit(-.12, 0, 0)}><ChevronLeft size={16}/></button><button type="button" aria-label="Rotate view right" onClick={() => controller.current?.orbit(.12, 0, 0)}><ChevronRight size={16}/></button><button type="button" aria-label="Zoom out" onClick={() => controller.current?.orbit(0, 0, -.08)}><Minus size={16}/></button><button type="button" aria-label="Zoom in" onClick={() => controller.current?.orbit(0, 0, .08)}><Plus size={16}/></button></div>}
        <p className="alpha-line-caption" id={description}>Illustrative playback · Timing compressed. {alphaLineDemo.arrangement}</p>
        {(!ready || reduced) && <p className="alpha-line-static-note">{reduced ? "Reduced motion: " : "Static overview: "}use the chapters and journey control to inspect each stage.</p>}
      </div>
      <aside className="alpha-line-panel" aria-labelledby={panelTitle}>
        <p className="eyebrow">Demonstration</p><h2 id={panelTitle}>Follow one lot</h2><p className="alpha-line-lot">Demo lot / Carrier 03</p>
        <div className="alpha-line-tabs" role="tablist" aria-label="VOS views">{views.map((item, index) => <button key={item.id} id={`${tabsId}-${item.id}`} type="button" role="tab" tabIndex={view === item.id ? 0 : -1} aria-selected={view === item.id} aria-controls={`${tabsId}-panel`} onClick={() => setView(item.id)} onKeyDown={event => {
          let next = index; if (event.key === "ArrowRight") next = (index + 1) % 3; else if (event.key === "ArrowLeft") next = (index + 2) % 3; else if (event.key === "Home") next = 0; else if (event.key === "End") next = 2; else return;
          event.preventDefault(); setView(views[next].id); document.getElementById(`${tabsId}-${views[next].id}`)?.focus();
        }}>{item.label}</button>)}</div>
        <div id={`${tabsId}-panel`} role="tabpanel" tabIndex={0} aria-labelledby={`${tabsId}-${view}`}>
          <dl className="alpha-line-facts">{story.rows.map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
          {playback.chapter === "deviation" && <p className="alpha-line-step">Deviation step {(playback.deviationStep ?? 0) + 1} of {alphaLineDeviationSteps}</p>}
        </div>
        <p className="sr-only" role="status">{playback.chapter === "deviation" ? `Deviation step ${(playback.deviationStep ?? 0) + 1}` : `${playback.chapter}. ${activeStation.name}.`}</p>
        {selected && <div className="alpha-line-inspection"><span>Inspecting</span><strong>{selected.name}</strong><p>The selected lot remains at {activeStation.name}. Station functions await plant confirmation.</p></div>}
        <div className="alpha-line-evidence"><p className="eyebrow">Related evidence</p>
          <details><summary>Recipe revision</summary><p>{alphaLineDemo.recipe}. Station functions, operating windows and production dwell times will come from the confirmed route.</p></details>
          <details><summary>Process history</summary><p>{playback.chapter === "route" ? "The journey has not started." : completed ? "All 13 treatment stations have been visited. The illustrative process record remains linked to this lot." : `${activeStation.name} is the current operation. Prior stations remain linked to the same demonstration lot.`}</p></details>
          <details><summary>Quality requirements</summary><p>Inspection pending. Completing the process and unloading the part do not release quality disposition or start dispatch.</p></details>
        </div>
        <details className="alpha-line-connections"><summary>How VOS connects this</summary><p>{selected ? selected.name : activeStation.name} · {alphaLineDemo.lot}</p><ul>{alphaLineConnections.map(item => <li key={item.id}><strong>{item.title}</strong><span>{item.text}</span></li>)}</ul></details>
        <p className="alpha-line-note">Demonstration data</p><p className="alpha-line-boundary">{alphaLineDemo.boundary}</p>
      </aside>
    </div>
    <section className="alpha-decision" aria-labelledby="alpha-decision-title"><ArrowDownToLine size={24} aria-hidden="true"/><div><p className="eyebrow">An exception, with context</p><h2 id="alpha-decision-title">A decision with evidence.</h2><p>Follow a condition outside its configured requirement. See the evidence, a proposed hold and the recorded human decision—all connected to this same lot.</p></div><button type="button" className="button button-outline" onClick={deviate}>Explore a process deviation<ArrowRight size={16} aria-hidden="true"/></button></section>
  </div>;
}

function AlphaLineFallback({ state, selected }: { state: AlphaLineState; selected: string | null }) {
  const project = (x: number, z: number) => ({ x: 65 + x / alphaLineEndX * 460 + (z - alphaLineFarZ) / (alphaLineNearZ - alphaLineFarZ) * -32, y: 68 + x / alphaLineEndX * 50 + (z - alphaLineFarZ) / (alphaLineNearZ - alphaLineFarZ) * 220 });
  const path = alphaLinePath().map(p => project(p.x, p.z));
  const part = project(state.x, state.z);
  return <svg className="alpha-line-fallback" viewBox="0 0 600 380" aria-hidden="true"><polyline points={path.map(p => `${p.x},${p.y - 37}`).join(" ")} fill="none" stroke="var(--cube-outline)" strokeWidth="4"/><polyline points={path.map(p => `${p.x},${p.y - 43}`).join(" ")} fill="none" stroke="var(--cube-outline)" strokeWidth="2"/>
    {alphaLineStations.map(station => { const p = project(station.x, station.z); const tank = station.kind === "tank"; return <g key={station.id} transform={`translate(${p.x} ${p.y})`}><path d="M-25,-14 L22,-9 L22,18 L-25,13Z" fill="var(--cube-selected)" stroke={station.id === selected || state.carrierVisible && station.id === state.stationId ? "var(--blue)" : "var(--cube-outline)"} strokeWidth="1.3"/><path d="M-25,-14 L-18,-20 L29,-15 L22,-9Z" fill="var(--cube-top)" stroke="var(--cube-outline)"/>{tank && <path d="M-20,-14 L-16,-17 L23,-13 L20,-11Z" fill="var(--cyan)" opacity=".7"/>}<text x="-1" y="6" textAnchor="middle" fill="var(--ink)" fontSize="11">{station.number}</text>{!tank && <text y="36" textAnchor="middle" fill="var(--ink)" fontSize="10">{station.name}</text>}</g>; })}
    {state.carrierVisible && <g transform={`translate(${part.x} ${part.y - 43})`}><rect x="-8" y="-4" width="16" height="6" fill="var(--muted)"/><path d="M0,2V24" stroke="var(--ink)"/>{state.attached && <rect x="-7" y="24" width="14" height="18" fill={state.coating > .5 ? "var(--ink)" : "var(--muted)"}/>}</g>}
  </svg>;
}
