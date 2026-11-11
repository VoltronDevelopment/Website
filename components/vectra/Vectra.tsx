"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronDown, Maximize2, Minimize2, Minus } from "lucide-react";
import { isModelPreference, type ModelPreference } from "@/lib/vectra/models";
import { isAnswerStyle, type AnswerStyle } from "@/lib/vectra/types";
import { VeraIntroduction } from "./VeraIntroduction";
import { VeraCube } from "./VeraCube";
import "./vectra.css";

const Conversation = lazy(() => import("./VectraConversation"));
const mobilePanel = "(max-width: 600px), (max-height: 480px) and (pointer: coarse)";

export function Vectra() {
  const [screen, setScreen] = useState<"intro" | "chat">("intro");
  const [resumed, setResumed] = useState(false);
  const [entrance, setEntrance] = useState(true);
  const settings = useRef<HTMLDetailsElement>(null);
  const begin = useRef<HTMLDivElement>(null);
  const [preference, setPreference] = useState<ModelPreference>("auto");
  const [answerStyle, setAnswerStyle] = useState<AnswerStyle>("general");
  const [suggestQuestions, setSuggestQuestions] = useState(true);
  const [motion, setMotion] = useState("ambient");
  const [open, setOpen] = useState(false);
  const [visited, setVisited] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [homeReady, setHomeReady] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (pathname !== "/") return;
    setHomeReady(false);
    let cancelled = false, waiting = false, frame = 0;
    const settle = () => {
      if (waiting || document.querySelector("[data-entry-sweep]")) return;
      const line = document.querySelector(".home-brand-tagline span:last-child");
      if (!line) return;
      waiting = true;
      frame = requestAnimationFrame(() => {
        Promise.allSettled(line.getAnimations().map(animation => animation.finished)).then(() => {
          if (!cancelled) { observer.disconnect(); setHomeReady(true); }
        });
      });
    };
    const observer = new MutationObserver(settle);
    observer.observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:["data-entry-sweep"]});
    window.addEventListener("voltron:entry-sweep-finished", settle);
    settle();
    return () => { cancelled = true; cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("voltron:entry-sweep-finished", settle); };
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("vera-model");
      if (isModelPreference(saved)) setPreference(saved);
      const style = localStorage.getItem("vera-answer-style");
      if (isAnswerStyle(style)) setAnswerStyle(style);
      setSuggestQuestions(localStorage.getItem("vera-suggest-questions") !== "off");
      const next = localStorage.getItem("vera-motion") === "still" ? "still" : "ambient";
      setMotion(next); document.documentElement.dataset.veraMotion = next;
    } catch {}
  }, []);
  function changeModel(value: string) {
    if (!isModelPreference(value)) return;
    setPreference(value);
    try { localStorage.setItem("vera-model", value); } catch {}
  }
  function changeMotion() {
    const next = motion === "ambient" ? "still" : "ambient";
    setMotion(next); document.documentElement.dataset.veraMotion = next;
    try { localStorage.setItem("vera-motion", next); } catch {}
  }
  function changeAnswerStyle(value: string) {
    if (!isAnswerStyle(value)) return;
    setAnswerStyle(value);
    try { localStorage.setItem("vera-answer-style", value); } catch {}
  }
  function toggleQuestions() {
    const next = !suggestQuestions;
    setSuggestQuestions(next);
    try { localStorage.setItem("vera-suggest-questions", next ? "on" : "off"); } catch {}
  }
  useEffect(() => {
    const visibility = () => { document.documentElement.dataset.veraHidden = String(document.hidden); };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      delete document.documentElement.dataset.veraHidden;
    };
  }, []);
  useEffect(() => {
    const button = launcher.current;
    const main = document.getElementById("main-content");
    if (!button || !main || open) return;
    let frame = 0;

    const positionLauncher = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const strip = main.querySelector(".hero-tags, .hero-principle-strip");
        const bounds = strip?.getBoundingClientRect();
        const height = document.documentElement.clientHeight;
        // Follow the lower hero strip only in the part of the screen where it
        // can cross the floating control. The launcher remains reachable on scroll.
        const clearance = bounds && bounds.bottom > height - button.offsetHeight - 30 && bounds.top < height
          ? Math.min(160, height - bounds.top + 10)
          : 0;
        button.style.setProperty("--vera-strip-clearance", `${clearance}px`);
      });
    };

    const observer = new ResizeObserver(positionLauncher);
    observer.observe(main);
    const strip = main.querySelector(".hero-tags, .hero-principle-strip");
    if (strip) observer.observe(strip);
    positionLauncher();
    window.addEventListener("resize", positionLauncher);
    window.addEventListener("scroll", positionLauncher, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", positionLauncher);
      window.removeEventListener("scroll", positionLauncher);
    };
  }, [mounted, open, pathname, homeReady]);


  useEffect(() => {
    const panel = dialog.current;
    if (!open || !panel) return;
    const mobile = window.matchMedia(mobilePanel);
    const viewport = window.visualViewport;

    function fitViewport() {
      if (!panel || !mobile.matches || !viewport || viewport.scale !== 1) {
        panel?.style.removeProperty("--vera-visible-height");
        panel?.style.removeProperty("--vera-keyboard-offset");
        return;
      }
      panel.style.setProperty("--vera-visible-height", `${viewport.height}px`);
      panel.style.setProperty("--vera-keyboard-offset", `${Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)}px`);
    }

    function showPanel() {
      if (!panel) return;
      const focused = panel.contains(document.activeElement) ? document.activeElement as HTMLElement : title.current;
      if (panel.open) panel.close();
      if (mobile.matches) panel.showModal();
      else panel.show();
      fitViewport();
      if (focused?.getClientRects().length) focused.focus({ preventScroll: true });
      else title.current?.focus({ preventScroll: true });
    }

    showPanel();
    mobile.addEventListener("change", showPanel);
    viewport?.addEventListener("resize", fitViewport);
    viewport?.addEventListener("scroll", fitViewport);
    return () => {
      panel.close();
      mobile.removeEventListener("change", showPanel);
      viewport?.removeEventListener("resize", fitViewport);
      viewport?.removeEventListener("scroll", fitViewport);
    };
  }, [open]);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (settings.current?.open && !settings.current.contains(event.target as Node)) settings.current.open = false;
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);
  function navigate(next: "intro" | "chat") {
    setEntrance(false); setScreen(next);
    if (settings.current) settings.current.open = false;
    requestAnimationFrame(() => {
      if (next === "intro") begin.current?.querySelector("button")?.focus({ preventScroll: true });
      else title.current?.focus({ preventScroll: true });
    });
  }
  function dismiss(restoreFocus = true) {
    setEntrance(false);
    if (settings.current) settings.current.open = false;
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => launcher.current?.focus({ preventScroll: true }));
  }

  if (!mounted) return null;
  // The site's frosted presentation creates a containing block for fixed
  // descendants. Mount Vera outside it so the panel stays at the viewport edge.
  return createPortal(<>
    <button ref={launcher} type="button" className="vectra-launch" aria-label="Ask Vera" aria-haspopup="dialog"
      aria-controls="vera-panel" aria-expanded={open} hidden={open || (pathname === "/" && !homeReady)}
      onClick={() => { setVisited(true); setOpen(true); }}>
      <VeraCube /><span className="vectra-launch-label" aria-hidden="true">Ask Vera</span>
    </button>
    <dialog ref={dialog} id="vera-panel" className="vectra-panel" aria-labelledby="vera-title"
      data-expanded={expanded || undefined}
      onCancel={event => { event.preventDefault(); dismiss(); }}
      onKeyDown={event => {
        if (event.key === "Escape" && !event.defaultPrevented) {
          event.preventDefault();
          dismiss();
        }
      }}>
      <header className="vectra-header">
        <button className="vectra-icon vera-return" style={{ visibility: screen === "chat" ? "visible" : "hidden" }} tabIndex={screen === "chat" ? 0 : -1} aria-hidden={screen !== "chat"} type="button" aria-label="Back to Vera introduction" title="Meet Vera" onClick={() => navigate("intro")}><ArrowLeft size={17} /></button>
        <VeraCube />
        <div className="vera-identity"><h2 ref={title} tabIndex={-1} id="vera-title">VERA</h2><span>Voltron’s AI guide</span></div>
        <details ref={settings} className="vera-settings" onKeyDown={event => {
          if (event.key === "Escape" && settings.current?.open) {
            event.preventDefault(); event.stopPropagation(); settings.current.open = false;
            settings.current.querySelector("summary")?.focus();
          }
        }}>
          <summary aria-label="Open Vera settings" title="Vera settings"><VeraCube /><ChevronDown className="vera-settings-cue" size={10} aria-hidden="true" /></summary>
          <div className="vera-settings-panel" role="region" aria-label="Vera settings">
            <strong>Vera settings</strong>
            <label>Answer style<select value={answerStyle} onChange={event => changeAnswerStyle(event.target.value)}><option value="general">General</option><option value="conceptual">Conceptual</option></select></label>
            <p>{answerStyle === "conceptual" ? "Build understanding with analogies and examples." : "Get a direct answer at the level you ask for."}</p>
            <button type="button" className="vera-motion-choice" role="switch" aria-checked={suggestQuestions} onClick={toggleQuestions}>Suggested questions<span aria-hidden="true">{suggestQuestions ? "On" : "Off"}</span></button>
            <label>Response model<select value={preference} onChange={event => changeModel(event.target.value)}><option value="auto">Auto</option><option value="mini">GPT-5.4 Mini</option><option value="luna">GPT-5.4</option></select></label>
            <p>Auto favours Mini for speed and uses GPT-5.4 for deeper analysis. Both share this conversation.</p>
            <button type="button" className="vera-motion-choice" aria-pressed={motion === "still"} onClick={changeMotion}>Aura motion<span>{motion === "ambient" ? "Ambient" : "Still"}</span></button>
          </div>
        </details>
        <div className="vectra-window-controls">
          <button type="button" className="vectra-icon vectra-expand" aria-label={expanded ? "Restore compact window" : "Expand Vera"}
            title={expanded ? "Restore compact window" : "Expand Vera"}
            onClick={() => setExpanded(value => !value)}>
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button type="button" className="vectra-icon" aria-label="Minimize Vera" title="Minimize Vera" onClick={() => dismiss()}>
            <Minus size={18} />
          </button>
        </div>
      </header>
      <div className="vera-panel-art" aria-hidden="true" />
      {visited && <div ref={begin} className="vera-intro-view" hidden={screen !== "intro"}><VeraIntroduction resumed={resumed} animate={entrance} onBegin={() => navigate("chat")} /></div>}
      {visited && <div className="vera-conversation-view" hidden={screen !== "chat"}><Suspense fallback={<p className="vectra-loading" role="status">Opening Vera…</p>}>
        <Conversation onThreadChange={setResumed} preference={preference} answerStyle={answerStyle} suggestQuestions={suggestQuestions} open={open && screen === "chat"} dismiss={() => dismiss(false)} />
      </Suspense></div>}
    </dialog>
  </>, document.body);
}
