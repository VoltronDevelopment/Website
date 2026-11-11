"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Maximize2, Minimize2, Minus } from "lucide-react";
import { VeraCube } from "./VeraCube";
import "./vectra.css";

const Conversation = lazy(() => import("./VectraConversation"));
const mobilePanel = "(max-width: 600px), (max-height: 480px) and (pointer: coarse)";

export function Vectra() {
  const [open, setOpen] = useState(false);
  const [visited, setVisited] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const launcher = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => { setMounted(true); }, []);
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
  }, [mounted, open, pathname]);


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

  function dismiss(restoreFocus = true) {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => launcher.current?.focus({ preventScroll: true }));
  }

  if (!mounted) return null;
  // The site's frosted presentation creates a containing block for fixed
  // descendants. Mount Vera outside it so the panel stays at the viewport edge.
  return createPortal(<>
    <button ref={launcher} type="button" className="vectra-launch" aria-label="Ask Vera" aria-haspopup="dialog"
      aria-controls="vera-panel" aria-expanded={open} hidden={open}
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
        <VeraCube />
        <div className="vera-identity"><h2 ref={title} tabIndex={-1} id="vera-title">VERA</h2><span>Voltron’s AI guide</span></div>
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
      {visited && <Suspense fallback={<p className="vectra-loading" role="status">Opening Vera…</p>}>
        <Conversation open={open} dismiss={() => dismiss(false)} />
      </Suspense>}
    </dialog>
  </>, document.body);
}
