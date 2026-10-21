"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ClipboardList, FileText, Pause, Play, RotateCcw, ScanLine, Settings2, Shield, ShieldCheck, UserRound } from "lucide-react";
import { canPrepareHomeScene, prepareScene } from "./scene-preparation";
import { lotEvidence, lotStageTimes, lotStoryDuration, lotStoryStages, lotStoryStateAt, type LotStoryState } from "./lot-story-timeline";
import type { LotStoryController } from "./lot-story-renderer";
import "./lot-story.css";

const icons = [ClipboardList, Settings2, Shield, UserRound, FileText];

export function HomeLotFlow() {
  const host = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<LotStoryController | null>(null);
  const selectedTime = useRef<number | null>(null);
  const [state, setState] = useState(() => lotStoryStateAt(lotStoryDuration));
  const [ready, setReady] = useState(false), [paused, setPaused] = useState(false), [reduced, setReduced] = useState(false);
  const id = useId();
  useEffect(() => {
    let disposed = false, nearby = false, scheduled = false, cancel: (() => void) | undefined;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    function prepare() {
      if (disposed || scheduled || !nearby || motion.matches) return;
      scheduled = true;
      cancel = prepareScene(async () => {
        try {
          if (disposed || motion.matches) { scheduled = false; return; }
          const { mountLotStory } = await import("./lot-story-renderer");
          if (disposed || !host.current || !canvas.current || motion.matches) { scheduled = false; return; }
          controller.current = mountLotStory(canvas.current, host.current, {
            initialTime: selectedTime.current,
            onState: value => { if (!disposed) setState(value); },
            onReady: value => { if (!disposed) setReady(value); },
          });
          await controller.current.ready;
        } catch {
          if (!disposed && host.current) { host.current.dataset.renderer = "fallback"; setReady(false); setState(lotStoryStateAt(selectedTime.current ?? 14)); }
        }
      }, canPrepareHomeScene);
    }
    function preference() { setReduced(motion.matches); prepare(); }
    preference(); motion.addEventListener("change", preference);
    const observer = new IntersectionObserver(([entry]) => { nearby = entry.isIntersecting; prepare(); }, { rootMargin: "650px 0px" });
    if (host.current) observer.observe(host.current);
    return () => { disposed = true; cancel?.(); observer.disconnect(); motion.removeEventListener("change", preference); controller.current?.dispose(); controller.current = null; };
  }, []);

  function selectTime(time: number) {
    selectedTime.current = time; setPaused(true); setState(lotStoryStateAt(time)); controller.current?.select(time);
  }
  function playback() {
    if (state.settled) { selectedTime.current = null; setPaused(false); controller.current?.replay(); }
    else { setPaused(!paused); controller.current?.setPaused(!paused); }
  }
  const activeTitle = state.phase === "review" ? "Human review and release" : lotStoryStages[state.stage].title;
  const detail = state.phase === "review" ? "The accumulated evidence is reviewed before a human release decision is recorded. This is an illustrative review." : lotStoryStages[state.stage].detail;

  return <figure className="lot-story" aria-label="Four snapshots of lot VL-001 and its connected evidence" aria-describedby={`${id}-description`}>
    <div className="lot-story-art" ref={host} data-selected={state.stage}>
      <canvas ref={canvas} className="lot-story-canvas" aria-hidden="true" />
      <div className="lot-story-snapshots">
        {lotStoryStages.map((stage, index) => <article className="lot-snapshot" key={stage.title} data-active={state.stage === index}>
          <h3><button type="button" onClick={() => selectTime(lotStageTimes[index])} aria-pressed={state.stage === index} aria-controls={`${id}-detail`}>{stage.title}</button></h3>
          <div className="lot-snapshot-anchor" data-lot-story-anchor aria-hidden="true">
            <span className="lot-identity">VL-001</span>
            <LotSnapshotFallback stage={index} />
            <span className="lot-snapshot-symbol">{index === 0 ? <ClipboardList /> : index === 1 ? <Settings2 /> : index === 2 ? state.released ? <ShieldCheck /> : <ScanLine /> : <FileText />}{index === 3 && state.evidence[4] && <Check size={13} />}</span>
          </div>
          <p className="lot-snapshot-caption">{stage.caption}</p>
        </article>)}
      </div>
    </div>
    <nav className="lot-mobile-progress" aria-label="Choose a lot snapshot">
      {lotStoryStages.map((stage, index) => <button key={stage.title} type="button" onClick={() => selectTime(lotStageTimes[index])} aria-pressed={state.stage === index} aria-controls={`${id}-detail`}>{stage.title}</button>)}
    </nav>
    <div className="lot-mobile-navigation" aria-label="Browse lot snapshots">
      <button type="button" onClick={() => selectTime(lotStageTimes[state.stage - 1])} disabled={state.stage === 0}><ChevronLeft size={16} aria-hidden="true" />Previous</button>
      <span aria-live="polite">{state.stage + 1} of 4 · {lotStoryStages[state.stage].title}</span>
      <button type="button" onClick={() => selectTime(lotStageTimes[state.stage + 1])} disabled={state.stage === 3}>Next<ChevronRight size={16} aria-hidden="true" /></button>
    </div>
    <div className="lot-story-detail" id={`${id}-detail`} aria-live="polite" aria-atomic="true"><h4>{activeTitle}</h4><p>{detail}</p></div>
    <section className="lot-evidence-panel" aria-label="VOS evidence history">
      <p className="lot-evidence-intro">VOS connects what happens, what it means and what can happen next.</p>
      <div className="lot-evidence-desktop"><EvidenceList state={state} selectTime={selectTime} /></div>
      <div className="lot-evidence-mobile">
        <p className="lot-current-record"><span>{lotEvidence[state.activeEvidence]}</span><strong>{state.evidence[state.activeEvidence] ? state.activeEvidence === 3 ? "Human release recorded" : "Recorded" : state.phase === "review" ? "Reviewing evidence" : "Pending"}</strong></p>
        <details><summary>Explore the connected history</summary><EvidenceList state={state} selectTime={selectTime} /></details>
      </div>
    </section>
    <figcaption className="lot-story-footer"><p id={`${id}-description`}>Four snapshots of one lot · Illustrative sequence</p><div className="lot-story-controls" hidden={!ready || reduced}>
      <button type="button" onClick={playback} aria-label={state.settled ? "Replay lot journey" : paused ? "Resume lot journey" : "Pause lot journey"}>
        {state.settled ? <RotateCcw size={15} aria-hidden="true" /> : paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}{state.settled ? "Replay" : paused ? "Resume" : "Pause"}
      </button>
    </div></figcaption>
    <noscript><style>{"@media(max-width:767px){.lot-story-snapshots{display:block!important}.lot-snapshot{visibility:visible!important;margin-bottom:24px}.lot-mobile-navigation,.lot-mobile-progress{display:none!important}}"}</style></noscript>
  </figure>;
}

function EvidenceList({ state, selectTime }: { state: LotStoryState; selectTime: (time: number) => void }) {
  return <ol className="lot-evidence-list" aria-label="Connected evidence and human release">
    {lotEvidence.map((label, index) => {
      const Icon = icons[index], complete = state.evidence[index], active = state.activeEvidence === index;
      const status = complete ? index === 3 ? "Human release recorded" : "Recorded" : index === 3 && state.phase === "review" ? "Reviewing evidence" : "Pending";
      return <li key={label} data-complete={complete} data-active={active} data-gate={index === 3}>
        <button type="button" onClick={() => selectTime(index === 3 ? 9 : lotStageTimes[index === 4 ? 3 : index])} aria-label={`View ${label.toLowerCase()}: ${status.toLowerCase()}`} aria-current={active ? "step" : undefined}>
          <span className="lot-evidence-icon"><Icon size={29} aria-hidden="true" />{complete && <span className="lot-evidence-check"><Check size={11} aria-hidden="true" /></span>}</span>
          <span className="lot-evidence-title">{label}</span><span className="lot-evidence-status">{status}</span>
        </button>
      </li>;
    })}
  </ol>;
}

function LotSnapshotFallback({ stage }: { stage: number }) {
  const id = useId().replace(/:/g, "");
  return <svg className="lot-snapshot-fallback" viewBox="0 0 300 280" fill="none" aria-hidden="true">
    <defs><linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--surface)" /><stop offset=".45" stopColor="#a5c3d9" /><stop offset=".7" stopColor="#edf6fc" /><stop offset="1" stopColor="#6b8fa9" /></linearGradient></defs>
    <path className="lot-static-rear" d="M150 24v138M30 208l120-46 120 46" />
    <path d="m30 70 120-46 120 46-120 48Z" fill="var(--cube-top)" fillOpacity=".08" />
    <path d="m30 70 120 48v138L30 208Z" fill="var(--cube-left)" fillOpacity=".035" />
    <path d="m150 118 120-48v138l-120 48Z" fill="var(--cube-right)" fillOpacity=".045" />
    <ellipse cx="144" cy="214" rx="57" ry="8" fill="var(--ink)" opacity=".12" />
    <g transform="translate(101 103) skewY(15)" stroke="var(--cube-outline)" strokeWidth=".8">
      <rect x="0" y="0" width="87" height="94" rx="8" fill={`url(#${id}-metal)`} />
      {[[10, 11], [76, 11], [10, 82], [76, 82]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="var(--cube-right)" />)}
      <path d="M14 48c0-19 13-33 29-33h14c17 0 29 14 29 33S74 81 57 81H43C27 81 14 67 14 48Z" fill={`url(#${id}-metal)`} />
      <ellipse cx="43" cy="48" rx="29" ry="33" fill={`url(#${id}-metal)`} /><ellipse cx="43" cy="48" rx="19" ry="23" fill="var(--cube-right)" /><path d="M43 25c-8 2-13 10-13 23s5 21 13 23" stroke="var(--ink)" opacity=".4" />
    </g>
    {stage === 1 && <path d="M174 61v27h14V61M181 88v22" stroke="var(--cube-outline)" strokeWidth="4" />}
    {stage === 2 && <path d="m74 160 100-25 59 22-105 26Z" fill="var(--cyan)" fillOpacity=".13" stroke="var(--cyan)" strokeOpacity=".5" />}
    <path className="lot-static-front" d="m30 70 120-46 120 46v138l-120 48-120-48V70l120 48 120-48M150 118v138" />
    <path d="M5 248h62M233 248h62M150 256v22" stroke="var(--cyan)" opacity=".45" strokeDasharray="2 4" />
  </svg>;
}
