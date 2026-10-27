"use client";
import {useHomeMotion,resetHomeScene} from './HomeMotion';

import { useEffect, useId, useRef, useState } from "react";
import { Check, ClipboardList, FileText, Settings2, Shield, UserRound } from "lucide-react";
import {prefersStaticScene} from "../performance/scene-policy";
import { canPrepareHomeScene, prepareScene } from "./scene-preparation";
import { lotStageTimes, lotStoryDuration, lotStoryStages, lotStoryStateAt } from "./lot-story-timeline";
import type { LotStoryController } from "./lot-story-renderer";
import "./lot-story.css";
import lotPosters from "@/lib/lot-posters.json";
import {DeferredPicture} from '../performance/DeferredArtwork';

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
  const motionRevision=useHomeMotion();
  const host = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<LotStoryController | null>(null);
  const selectedTime = useRef<number | null>(null);
  const [state, setState] = useState(() => lotStoryStateAt(0));
  const [, setReady] = useState(false);
  const id = useId();
  useEffect(() => {
    resetHomeScene(host.current,canvas.current);
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
          if (!disposed && host.current) { host.current.dataset.renderer = "fallback"; setReady(false); setState(lotStoryStateAt(selectedTime.current ?? lotStoryDuration)); }
        }
      }, canPrepareHomeScene);
    }
    function preference() {

      if (staticArtwork || prefersStaticScene()) setState(lotStoryStateAt(requestedTime === null ? lotStoryDuration : Number(requestedTime)));
      prepare();
    }
    preference(); motion.addEventListener("change", preference);
    const observer = new IntersectionObserver(([entry]) => { nearby = entry.isIntersecting; prepare(); }, { rootMargin: "650px 0px" });
    if (host.current) observer.observe(host.current);
    return () => { disposed = true; cancel?.(); observer.disconnect(); motion.removeEventListener("change", preference); controller.current?.dispose(); controller.current = null; };
  }, [motionRevision]);

  function selectTime(time: number) {
    selectedTime.current = time; setState(lotStoryStateAt(time)); controller.current?.select(time);
  }

  const activeTitle = state.phase === "review" ? "Human review and release" : lotStoryStages[state.stage].title;
  const detail = state.phase === "review" ? "The accumulated evidence is reviewed before a human release decision is recorded. This is an illustrative review." : lotStoryStages[state.stage].detail;

  return <figure className="lot-story" aria-label="One lot travels through Receive, Process, Verify and Dispatch with connected evidence" aria-describedby={`${id}-description`}>
    <div className="lot-story-art" ref={host} data-selected={state.stage}>
      <div className="lot-story-posters" aria-hidden="true">
        {(["light", "dark"] as const).map(theme => <div key={theme} data-poster-theme={theme}>
          <DeferredPicture><source media="(max-width:767px)" srcSet={state.time<1.3?lotPosters.opening.mobile[theme]:lotPosters.mobile[theme][state.stage]}/><img src={state.time<1.3?lotPosters.opening.desktop[theme]:lotPosters.desktop[theme][state.stage]} alt="" decoding="async" loading="lazy"/></DeferredPicture>
        </div>)}
      </div>
      <canvas ref={canvas} className="lot-story-canvas" aria-hidden="true" />
      <div className="lot-story-snapshots">
        {lotStoryStages.map((stage, index) => <div className="lot-snapshot" key={stage.title} data-active={state.stage === index}>
          <div className="lot-snapshot-anchor" data-lot-story-anchor aria-hidden="true"></div>
        </div>)}
      </div>
    </div>
    <section className="lot-story-evidence" aria-label="VOS evidence history">
      <p className="lot-evidence-intro">VOS <span aria-hidden="true">·</span> Demo lot VL-001</p>
      <div className="lot-record-selector" role="group" aria-label="Select a lot record">{recordCards.map((record,i)=><button type="button" key={record.title} aria-pressed={state.activeEvidence===i} aria-controls={`${id}-record`} data-complete={state.evidence[i]} onClick={()=>selectTime(record.time)}><span className="lot-step-index">{String(i+1).padStart(2,'0')}</span>{record.title}{state.evidence[i]&&<Check size={12} aria-hidden="true"/>}</button>)}</div>
      <div className="lot-selected-record" id={`${id}-record`} data-human-review={state.activeEvidence===3} aria-live="polite"><span className="lot-tile-title">{(()=>{const Icon=icons[state.activeEvidence];return <Icon size={19} aria-hidden="true"/>;})()}{recordCards[state.activeEvidence].title}<small>{state.evidence[state.activeEvidence]?'Recorded':state.activeEvidence===3?'Reviewing':'In progress'}</small></span><p>{state.evidence[state.activeEvidence]?recordCards[state.activeEvidence].complete:state.activeEvidence===3?'Human review in progress. Dispatch is held.':recordCards[state.activeEvidence].pending}</p></div>
    <p className="sr-only" id={`${id}-detail`} aria-live="polite" aria-atomic="true">{activeTitle}: {detail}</p>
    </section>
    <figcaption className="lot-story-footer"><p id={`${id}-description`}>{state.settled?"Illustrative journey · Lot dispatched; connected history retained.":"One lot through four stages · Illustrative sequence"}</p></figcaption>

  </figure>;
}
