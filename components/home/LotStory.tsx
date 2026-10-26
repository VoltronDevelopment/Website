"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ClipboardList, FileText, Pause, Play, RotateCcw, ScanLine, Settings2, Shield, ShieldCheck, UserRound } from "lucide-react";
import {prefersStaticScene} from "../performance/scene-policy";
import { canPrepareHomeScene, prepareScene } from "./scene-preparation";
import { lotEvidence, lotStageTimes, lotStoryDuration, lotStoryStages, lotStoryStateAt, type LotStoryState } from "./lot-story-timeline";
import type { LotStoryController } from "./lot-story-renderer";
import "./lot-story.css";
import lotPosters from "@/lib/lot-posters.json";

const icons = [ClipboardList, Settings2, Shield, UserRound, FileText];
const tileMessages = ["Lot identified. Requirements linked.", "Execution recorded. Process history connected.", "Inspection evidence linked to the lot.", "Released lot. Connected history preserved."];
const tilePendingMessages = ["Identifying the lot and requirements.", "Recording process execution.", "Connecting inspection evidence.", "Preparing the released lot record."];
const recordCards=[
 {title:'Receive',time:lotStageTimes[0],complete:tileMessages[0],pending:tilePendingMessages[0]},
 {title:'Process',time:lotStageTimes[1],complete:tileMessages[1],pending:tilePendingMessages[1]},
 {title:'Verify',time:lotStageTimes[2],complete:tileMessages[2],pending:tilePendingMessages[2]},
 {title:'Human Review',time:9,complete:'Human release recorded. Dispatch authorised.',pending:'A human reviews the evidence before dispatch.'},
 {title:'Dispatch',time:lotStageTimes[3],complete:tileMessages[3],pending:tilePendingMessages[3]},
];

export function HomeLotFlow() {
  const host = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<LotStoryController | null>(null);
  const selectedTime = useRef<number | null>(null);
  const [state, setState] = useState(() => lotStoryStateAt(0));
  const [ready, setReady] = useState(false), [paused, setPaused] = useState(false), [reduced, setReduced] = useState(false);
  const id = useId();
  useEffect(() => {
    let disposed = false, nearby = false, scheduled = false, cancel: (() => void) | undefined;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const query = new URLSearchParams(location.search);
    const staticArtwork = query.get("renderer") === "static" || query.get("animate") === "0" || query.get("artwork") === "composition";
    const requestedTime = query.get("lot-time");
    if (requestedTime !== null) setState(lotStoryStateAt(Number(requestedTime)));
    function prepare() {
      if (disposed || scheduled || !nearby || staticArtwork || prefersStaticScene()) return;
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
    function preference() {
      setReduced(motion.matches);
      if (staticArtwork || prefersStaticScene()) setState(lotStoryStateAt(requestedTime === null ? lotStoryDuration : Number(requestedTime)));
      prepare();
    }
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
    if((state.settled||paused)&&matchMedia('(max-width:767px)').matches)host.current?.scrollIntoView({block:'center',behavior:reduced?'auto':'smooth'});
  }
  const activeTitle = state.phase === "review" ? "Human review and release" : lotStoryStages[state.stage].title;
  const detail = state.phase === "review" ? "The accumulated evidence is reviewed before a human release decision is recorded. This is an illustrative review." : lotStoryStages[state.stage].detail;

  return <figure className="lot-story" aria-label="One lot travels through Receive, Process, Verify and Dispatch with connected evidence" aria-describedby={`${id}-description`}>
    <div className="lot-story-art" ref={host} data-selected={state.stage}>
      <div className="lot-story-posters" aria-hidden="true">
        {(["light", "dark"] as const).map(theme => <div key={theme} data-poster-theme={theme}>
          <picture><source media="(max-width:767px)" srcSet={state.time<1.3?lotPosters.opening.mobile[theme]:lotPosters.mobile[theme][state.stage]}/><img src={state.time<1.3?lotPosters.opening.desktop[theme]:lotPosters.desktop[theme][state.stage]} alt="" decoding="async" loading="lazy"/></picture>
        </div>)}
      </div>
      <canvas ref={canvas} className="lot-story-canvas" aria-hidden="true" />
      <div className="lot-story-snapshots">
        {lotStoryStages.map((stage, index) => <article className="lot-snapshot" key={stage.title} data-active={state.stage === index}>
          <h3><button type="button" onClick={() => selectTime(lotStageTimes[index])} aria-pressed={state.stage === index} aria-controls={`${id}-detail`}>{stage.title}</button></h3>
          <div className="lot-snapshot-anchor" data-lot-story-anchor aria-hidden="true">
          </div>
          <p className="lot-snapshot-caption"><span className="lot-snapshot-symbol" aria-hidden="true">{index === 0 ? <ClipboardList /> : index === 1 ? <Settings2 /> : index === 2 ? state.released ? <ShieldCheck /> : <ScanLine /> : <FileText />}</span>{stage.caption}</p>
        </article>)}
      </div>
    </div>
    <nav className="lot-mobile-progress" aria-label="Choose a lot stage">
      {lotStoryStages.map((stage, index) => <button key={stage.title} type="button" onClick={() => selectTime(lotStageTimes[index])} aria-pressed={state.stage === index} aria-controls={`${id}-detail`}>{stage.title}</button>)}
    </nav>
    <div className="lot-mobile-navigation" aria-label="Browse lot stages">
      <button type="button" onClick={() => selectTime(lotStageTimes[state.stage - 1])} disabled={state.stage === 0}><ChevronLeft size={16} aria-hidden="true" />Previous</button>
      <span aria-live="polite">{state.stage + 1} of 4 · {lotStoryStages[state.stage].title}</span>
      <button type="button" onClick={() => selectTime(lotStageTimes[state.stage + 1])} disabled={state.stage === 3}>Next<ChevronRight size={16} aria-hidden="true" /></button>
    </div>
    <section className="lot-story-evidence" aria-label="VOS evidence history">
      <p className="lot-evidence-intro">VOS <span aria-hidden="true">·</span> Demo lot VL-001</p>
      <ol className="lot-story-tiles" aria-label="Lot story records">
        {recordCards.map((stage, record) => {
          const complete=state.evidence[record],active=state.activeEvidence===record,revealed=record<=state.activeEvidence;
          const Icon = icons[record];
          return <li key={stage.title} data-active={active} data-revealed={revealed} data-complete={complete} data-human-review={record===3}>
            <button type="button" onClick={() => selectTime(stage.time)} aria-pressed={active} aria-controls={`${id}-detail`} aria-label={`View ${stage.title}: ${complete ? "recorded" : "pending"}`}>
              <span className="lot-tile-title"><Icon size={17} aria-hidden="true" />{stage.title}{complete && <Check size={13} aria-hidden="true" />}</span>
              <span className="lot-tile-message" key={`${record}-${complete}`}>{revealed ? complete ? stage.complete : record===3&&active?'Human review in progress. Dispatch is held.':stage.pending : record===3?'Human review is required before dispatch.':"Record pending."}</span>
            </button>
          </li>;
        })}
      </ol>
      <div className="lot-evidence-mobile">
        <details><summary>Explore the connected history</summary><EvidenceList state={state} selectTime={selectTime} /></details>
      </div>
    <p className="sr-only" id={`${id}-detail`} aria-live="polite" aria-atomic="true">{activeTitle}: {detail}</p>
    </section>
    <figcaption className="lot-story-footer"><p id={`${id}-description`}>{state.settled?"Illustrative journey · Lot dispatched; connected history retained.":"One lot through four stages · Illustrative sequence"}</p><div className="lot-story-controls" hidden={!ready || reduced}>
      <button type="button" onClick={playback} aria-label={state.settled ? "Replay lot journey" : paused ? "Resume lot journey" : "Pause lot journey"}>
        {state.settled ? <RotateCcw size={15} aria-hidden="true" /> : paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}{state.settled ? "Replay" : paused ? "Resume" : "Pause"}
      </button>
    </div></figcaption>
    <noscript><style>{"@media(max-width:767px){.lot-story-tiles li{display:block!important}.lot-mobile-navigation,.lot-mobile-progress{display:none!important}}"}</style></noscript>
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
          <span className="lot-evidence-title">{index === 3 ? "Human release" : label}</span><span className="lot-evidence-status">{status}</span>
        </button>
      </li>;
    })}
  </ol>;
}
