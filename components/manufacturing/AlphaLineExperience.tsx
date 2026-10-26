"use client";
import {prefersStaticScene} from "@/components/performance/scene-policy";
import { AlphaPlantPoster } from "./AlphaPlantPoster";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { ArrowDownToLine, ArrowRight, ChevronLeft, ChevronRight, Maximize2, Minus, Pause, Play, Plus, RotateCcw } from "lucide-react";
import { alphaLineChapters, alphaLineConnections, alphaLineDemo, alphaLineStation, alphaLineStations, type AlphaLineJourneyChapter } from "./alpha-line-config";
import { alphaTourStateAt, alphaTourTimeAt, alphaPlaybackDuration, alphaTourDuration } from "./alpha-line-tour";
import type { AlphaLineController } from "./alpha-line-renderer";
import { alphaLineStory, type AlphaLineView } from "./alpha-line-story";
import { alphaLineChapterPreview, alphaLineChapterStart, alphaLineDeviationDuration, alphaLineDeviationStateAt, alphaLineDeviationStepDuration, alphaLineDeviationSteps, alphaLineDuration, alphaLineRouteState, alphaLineStateAt, type AlphaLineState } from "./alpha-line-timeline";

const views: { id: AlphaLineView; label: string }[] = [{ id: "execution", label: "Execution" }, { id: "context", label: "Context" }, { id: "intelligence", label: "Intelligence" }];
const chapterOrder: (AlphaLineJourneyChapter | "route")[] = ["route", "loading", "processing", "unloading", "review"];
const compactChapters = ["Load", "Process", "Unload"];
const clock = (time: number) => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`;

export function AlphaLineExperience() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<AlphaLineController | null>(null);
  const autoStopAtRef = useRef<number | null>(null);
  // Match the homepage process illustration: begin the guided movement when the scene
  // enters view, while keeping the same visible pause/replay controls.
  const pausedRef = useRef(false);
  const playbackRef = useRef(alphaTourStateAt(0));
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [playback, setPlayback] = useState<AlphaLineState>(() => alphaTourStateAt(0));
  const [view, setView] = useState<AlphaLineView>("execution");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [explore, setExplore] = useState(false);
  const [guided, setGuided] = useState(true);
  const [fullRoute, setFullRoute] = useState(false);
  const description = useId();
  const panelTitle = useId();
  const tabsId = useId();

  useEffect(() => {
    let disposed = false, preparing = true;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const query = new URLSearchParams(location.search);
    const reviewTime = query.get("alpha-time");
    if (reviewTime !== null) { playbackRef.current = alphaLineStateAt(Number(reviewTime) || 0); setPlayback(playbackRef.current); setFullRoute(true); }
    const updateMotion = () => {
      setReduced(motion.matches);
      if (motion.matches) {
        pausedRef.current = true; setPaused(true);
        // Keep a useful still overview for visitors who prefer reduced motion.
        if (!reviewTime) {
          playbackRef.current = alphaLineRouteState(); setPlayback(playbackRef.current);
          controller.current?.seek("route", 0);
        }
        controller.current?.setPaused(true);
      }
    };
    updateMotion(); motion.addEventListener("change", updateMotion);
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || prefersStaticScene()) return;
      observer.disconnect();
      if (query.get("renderer") === "static") { if (host.current) host.current.dataset.fallback = "true"; return; }
      try {
        const { mountAlphaLine } = await import("./alpha-line-renderer");
        if (disposed || !canvas.current || !host.current) return;
        controller.current = await mountAlphaLine(canvas.current, host.current, {
          initialState: playbackRef.current,
          paused: pausedRef.current,
          onState: next => {
            if (disposed || preparing) return;
            playbackRef.current = next; setPlayback(next);
            if (autoStopAtRef.current !== null && next.time >= autoStopAtRef.current) {
              autoStopAtRef.current = null; pausedRef.current = true; setPaused(true); controller.current?.setPaused(true);
            }
          },
          onSelect: id => {
            if (disposed) return;
            pausedRef.current = true; setPaused(true); controller.current?.setPaused(true);
            setSelectedId(id); setGuided(false); controller.current?.setGuided(false); controller.current?.focusStation(id);
          },
          onReady: () => { if (!disposed) setReady(true); },
          onEnded: () => { if (!disposed) { pausedRef.current = true; setPaused(true); } },
        });
        if(disposed){controller.current.dispose();controller.current=null;return;}
        preparing=false;
        const pending=playbackRef.current;
        controller.current.seek(pending.mode, pending.time);
        controller.current.setPaused(pausedRef.current);
      } catch { if (host.current) host.current.dataset.fallback = "true"; }
    }, { rootMargin: "180px" });
    if (host.current) observer.observe(host.current);
    const sceneMotionPreference=matchMedia("(prefers-reduced-motion: reduce)");
    const retryScene=()=>{if(!prefersStaticScene()&&!controller.current&&host.current){observer.unobserve(host.current);observer.observe(host.current);}};
    sceneMotionPreference.addEventListener("change",retryScene);
    return () => { sceneMotionPreference.removeEventListener("change",retryScene); disposed = true; observer.disconnect(); motion.removeEventListener("change", updateMotion); controller.current?.dispose(); controller.current = null; };
  }, []);

  function remember(next: boolean) { pausedRef.current = next; setPaused(next); controller.current?.setPaused(next); }
  function frameStage() { host.current?.closest(".alpha-line-stage")?.scrollIntoView({behavior:reduced ? "auto" : "smooth",block:"start"}); }
  function seek(mode: "route" | "journey" | "tour" | "deviation", time: number) {
    const next = mode === "route" ? alphaLineRouteState() : mode === "deviation" ? alphaLineDeviationStateAt(time) : mode === "tour" ? alphaTourStateAt(time) : alphaLineStateAt(time);
    playbackRef.current = next; setPlayback(next);
    controller.current?.seek(mode, next.time);
    controller.current?.setPaused(pausedRef.current);
  }
  function showLine() { autoStopAtRef.current = null; remember(true); setSelectedId(null); setGuided(false); controller.current?.setGuided(false); controller.current?.focusStation(null); }
  function overview() { showLine(); resetView(); }
  function resumeGuided() { resetView(); setGuided(true); controller.current?.setGuided(true); if(playback.chapter === "route") follow(); else remember(reduced); frameStage(); }
  function follow() { autoStopAtRef.current = null; resetView(); setGuided(true); controller.current?.setGuided(true); remember(true); seek(fullRoute ? "journey" : "tour", 0); if (!reduced) remember(false); frameStage(); }
  function goTo(chapter: AlphaLineJourneyChapter) {
    resetView(); setGuided(true); controller.current?.setGuided(true); remember(true);
    const chapterPlayback = !reduced && (chapter === "loading" || chapter === "unloading");
    const sourceTime = chapterPlayback ? alphaLineChapterStart(chapter) : alphaLineChapterPreview(chapter);
    const time = fullRoute ? sourceTime : alphaTourTimeAt(sourceTime);
    autoStopAtRef.current = chapterPlayback
      ? (chapter === "loading" ? (fullRoute ? alphaLineChapterStart("processing") : alphaTourTimeAt(alphaLineChapterStart("processing"))) : (fullRoute ? alphaLineDuration : alphaTourDuration))
      : null;
    seek(fullRoute ? "journey" : "tour", time);
    if (chapterPlayback) remember(false);
    frameStage();
  }
  function step(delta: number) {
    remember(true);
    if (playback.chapter === "deviation") {
      const step = (playback.deviationStep ?? 0) + delta;
      if (step < 0 || step >= alphaLineDeviationSteps) { goTo("review"); return; }
      seek("deviation", step * alphaLineDeviationStepDuration); return;
    }
    const at = chapterOrder.indexOf(playback.chapter === "verification" ? "processing" : playback.chapter);
    const next = chapterOrder[Math.min(chapterOrder.length - 1, Math.max(0, at + delta))];
    if (next === "route") { autoStopAtRef.current = null; seek("route", 0); } else goTo(next);
  }
  function deviate() {
    autoStopAtRef.current = null;
    resetView(); setView("intelligence"); remember(true); seek("deviation", 0);
    if (!reduced) remember(false);
    document.getElementById("explore-alpha")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }
  function choose(id: string) { autoStopAtRef.current = null; setGuided(false); controller.current?.setGuided(false); if (!id) { showLine(); return; } remember(true); setSelectedId(id); setGuided(false); controller.current?.setGuided(false); controller.current?.focusStation(id); }
  function resetView() { setSelectedId(null); setExplore(false); controller.current?.setExplore(false); controller.current?.resetView(); }
  function togglePlay() {
    if (playback.chapter === "route" || playback.time >= alphaPlaybackDuration(playback.mode) && (playback.mode === "journey" || playback.mode === "tour")) { follow(); return; }
    if (playback.mode === "deviation" && playback.time >= alphaLineDeviationDuration) { deviate(); return; }
    remember(!paused);
  }
  const story = alphaLineStory(playback, view);
  const selected = selectedId ? alphaLineStation(selectedId) : null;
  const duration = playback.mode === "deviation" ? alphaLineDeviationDuration : playback.mode === "route" ? (fullRoute ? alphaLineDuration : alphaTourDuration) : alphaPlaybackDuration(playback.mode);
  const activeStation = alphaLineStation(playback.stationId);
  const completed = playback.processingComplete;
  const ended = playback.mode !== "route" && playback.time >= duration;
  const milestones = playback.mode === "deviation" ? [] : ["processing", "unloading"].map(chapter => {
    const source = alphaLineChapterStart(chapter as AlphaLineJourneyChapter);
    return (fullRoute ? source : alphaTourTimeAt(source)) / duration * 100;
  });

  return <div className="alpha-line">
    <div className="alpha-line-layout">
      <div className="alpha-line-stage">
        <div className="alpha-line-stage-heading"><span>V-Twin <i aria-hidden="true">/</i> Alpha · 13-tank line</span><span>Demo · {playback.chapter === "route" ? "Plant overview" : paused || !ready || reduced ? "Paused" : "Following lot"}</span></div>
        <div className="alpha-line-art" ref={host} data-ready={ready} role="group" aria-label="Interactive thirteen-tank square-U treatment line" aria-describedby={description}>
          <AlphaPlantPoster/>
          <canvas ref={canvas} aria-hidden="true"/>
          {playback.chapter === "route" && <button type="button" className="button alpha-line-follow" onClick={follow}>Follow a lot <ArrowRight size={16} aria-hidden="true"/></button>}
          {selected && <button type="button" className="alpha-line-complete" onClick={showLine}><Maximize2 size={14} aria-hidden="true"/>Complete line</button>}
        </div>
        <div className="alpha-twin-status"><p className="alpha-operation">{playback.compressed ? "Repeated operations · Accelerated playback" : playback.chapter === "route" ? "One component. A complete manufacturing journey." : story.rows.find(row=>row.label === "Operation")?.value ?? activeStation.name}</p><div className="alpha-lamp-legend" aria-label="Tank light states"><span><i data-lamp="active"/>Active</span><span><i data-lamp="complete"/>Complete</span><span><i data-lamp="idle"/>Idle</span></div></div>
        <div className="alpha-twin-transport">
        <ol className="alpha-line-chapters" aria-label="Guided chapters">{alphaLineChapters.filter(c=>["loading","processing","unloading"].includes(c.id)).map((chapter, index) => <li key={chapter.id}><button type="button" aria-current={playback.chapter === chapter.id ? "step" : undefined} aria-label={chapter.label} onClick={() => goTo(chapter.id)}><span className="alpha-chapter-full" aria-hidden="true">{chapter.label}</span><span className="alpha-chapter-compact" aria-hidden="true">{compactChapters[index]}</span></button></li>)}</ol>
        <div className="alpha-line-progress"><label className="sr-only" htmlFor={`${tabsId}-progress`}>Journey position in seconds</label><div className="alpha-timeline-track" data-playing={!paused && ready} style={{"--alpha-progress": `${Math.min(100, playback.time / duration * 100)}%`} as CSSProperties}><input id={`${tabsId}-progress`} type="range" min="0" max={duration} step=".1" value={Math.min(duration, playback.time)} aria-valuetext={`${clock(playback.time)} of ${clock(duration)}`} onChange={event => { autoStopAtRef.current = null; remember(true); seek(playback.mode === "deviation" ? "deviation" : fullRoute ? "journey" : "tour", Number(event.target.value)); }}/><div className="alpha-timeline-milestones" aria-hidden="true">{milestones.map((position, index) => <i key={index} style={{left:`${position}%`}}/>)}</div></div><span>{clock(playback.time)} / {clock(duration)}</span></div>
        <div className="alpha-line-controls">
          {ready && !reduced && <button type="button" className="alpha-play" onClick={togglePlay} aria-label={paused ? ended ? "Replay the lot" : "Play the lot" : "Pause the lot"}>{paused ? <Play size={15} aria-hidden="true"/> : <Pause size={15} aria-hidden="true"/>}{paused ? ended ? "Replay" : "Play" : "Pause"}</button>}
          <button type="button" onClick={() => step(-1)} disabled={playback.chapter === "route"} aria-label="Previous stage"><ChevronLeft size={15} aria-hidden="true"/><span className="alpha-control-label">Previous</span></button>
          <button type="button" onClick={() => step(1)} disabled={playback.chapter === "review"} aria-label="Next stage"><span className="alpha-control-label">Next</span><ChevronRight size={15} aria-hidden="true"/></button>
          {ready && <button type="button" onClick={overview} aria-label="Overview"><Maximize2 size={14} aria-hidden="true"/><span className="alpha-overview-full">Overview</span><span className="alpha-overview-compact">View</span></button>}
        </div>
        </div>
        <details className="alpha-options"><summary>Inspect &amp; explore</summary><div className="alpha-secondary"><label>Inspect station<select value={selectedId ?? ""} onChange={event=>choose(event.target.value)}><option value="">Complete line</option>{alphaLineStations.map(station=><option key={station.id} value={station.id}>{station.name}</option>)}</select></label>
          <button type="button" aria-pressed={fullRoute} onClick={()=>{remember(true); overview(); setFullRoute(!fullRoute); seek("route",0);}}>{fullRoute ? "Full route selected" : "Watch full route"}</button>
          {ready && <button type="button" aria-pressed={explore} onClick={()=>{remember(true);setGuided(false);controller.current?.setGuided(false);setExplore(!explore);controller.current?.setExplore(!explore);}}>Explore freely</button>}
        </div></details>
        {!guided && playback.chapter !== "route" && <button type="button" className="alpha-resume" onClick={resumeGuided}>Resume guided tour <ArrowRight size={14} aria-hidden="true"/></button>}
        {playback.chapter === "review" && <p className="alpha-line-result">Lot identified · Process history connected · Quality review pending</p>}
        {ready && explore && <div className="alpha-line-orbit" aria-label="Camera controls"><span>Drag to rotate, or use these controls.</span><button type="button" aria-label="Rotate view left" onClick={() => controller.current?.orbit(-.12, 0, 0)}><ChevronLeft size={16}/></button><button type="button" aria-label="Rotate view right" onClick={() => controller.current?.orbit(.12, 0, 0)}><ChevronRight size={16}/></button><button type="button" aria-label="Zoom out" onClick={() => controller.current?.orbit(0, 0, -.08)}><Minus size={16}/></button><button type="button" aria-label="Zoom in" onClick={() => controller.current?.orbit(0, 0, .08)}><Plus size={16}/></button></div>}
        <p className="alpha-line-caption" id={description}>Conceptual demonstration · Timing compressed</p>
        {(!ready || reduced) && <p className="alpha-line-static-note">{reduced ? "Reduced motion: " : "Static overview: "}use the chapters and journey control to inspect each stage.</p>}
      </div>
      <aside className="alpha-line-panel" aria-labelledby={panelTitle}>
        <p className="eyebrow">Lot inspector</p><h2 id={panelTitle}>Demo lot / Carrier 03</h2><p className="alpha-line-lot">Inspection pending</p>
        <div className="alpha-line-tabs" role="tablist" aria-label="VOS views">{views.map((item, index) => <button key={item.id} id={`${tabsId}-${item.id}`} type="button" role="tab" tabIndex={view === item.id ? 0 : -1} aria-selected={view === item.id} aria-controls={`${tabsId}-panel`} onClick={() => setView(item.id)} onKeyDown={event => {
          let next = index; if (event.key === "ArrowRight") next = (index + 1) % 3; else if (event.key === "ArrowLeft") next = (index + 2) % 3; else if (event.key === "Home") next = 0; else if (event.key === "End") next = 2; else return;
          event.preventDefault(); setView(views[next].id); document.getElementById(`${tabsId}-${views[next].id}`)?.focus();
        }}>{item.label}</button>)}</div>
        <div id={`${tabsId}-panel`} role="tabpanel" tabIndex={0} aria-labelledby={`${tabsId}-${view}`}>
          <p className="alpha-view-summary">{view === "execution" ? playback.chapter === "loading" ? "Identify the part and attach its required route." : playback.processingComplete ? "Processing complete. Quality review remains open." : "Follow the carrier and the current operation." : view === "context" ? "Connect this operation to its requirements and history." : "Investigate evidence and prepare a response for human review."}</p>
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
        <details className="alpha-assumptions"><summary>About this demonstration</summary><p>{alphaLineDemo.arrangement} The guided overview accelerates repeated operations; choose the full route for every complete cycle.</p></details>
        <p className="alpha-line-note">Demonstration data</p><p className="alpha-line-boundary">{alphaLineDemo.boundary}</p>
      </aside>
    </div>
    <section className="alpha-decision" aria-labelledby="alpha-decision-title"><ArrowDownToLine size={24} aria-hidden="true"/><div><p className="eyebrow">An exception, with context</p><h2 id="alpha-decision-title">A decision with evidence.</h2><p>Follow a condition outside its configured requirement. See the evidence, a proposed hold and the recorded human decision—all connected to this same lot.</p></div><button type="button" className="button button-outline" onClick={deviate}>Explore a process deviation<ArrowRight size={16} aria-hidden="true"/></button></section>
  </div>;
}
