"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  { id: "plan", label: "Plan", source: "ERP", detail: "Digital instruction" },
  { id: "execute", label: "Execute", source: "Factory", detail: "Physical action" },
  { id: "observe", label: "Observe", source: "SCADA", detail: "Live reality" },
  { id: "understand", label: "Understand", source: "Twin", detail: "Context and history" },
  { id: "improve", label: "Improve", source: "Operations", detail: "Better next cycle" }
];

function LoopIcon({ id }: { id: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8
  };

  if (id === "plan") {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><path {...common} d="M10 5h12v4H10zM8 8H6v19h20V8h-2M11 14h10M11 19h10M11 24h6" /><path {...common} d="m21 21 2 2 4-5" /></svg>;
  }

  if (id === "execute") {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><path {...common} d="M4 27h24M6 27V14l6 3V12l6 3V9l8 4v14M10 22h2M16 22h2M22 22h2" /></svg>;
  }

  if (id === "observe") {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><rect {...common} x="4" y="6" width="24" height="17" rx="2" /><path {...common} d="M12 27h8M16 23v4M8 18l4-4 3 3 5-6 4 3" /></svg>;
  }

  if (id === "understand") {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><path {...common} d="m16 4 10 6v12l-10 6-10-6V10zM16 16l10-6M16 16 6 10M16 16v12" /></svg>;
  }

  return <svg viewBox="0 0 32 32" aria-hidden="true"><path {...common} d="M5 26h22M8 22l5-5 4 3 8-10M20 10h5v5" /><path {...common} d="M8 26V13M13 26v-6M18 26v-9M23 26v-13" /></svg>;
}

export function ManufacturingLoopVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let timer: number | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        let index = 0;
        setActive(index);
        timer = window.setInterval(() => {
          index += 1;
          setActive(index);
          if (index >= steps.length - 1) window.clearInterval(timer);
        }, 320);
        observer.disconnect();
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (timer) window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="manufacturing-loop-visual" ref={ref} data-active={active} aria-label="Voltron cyber-physical operating loop">
      <div className="manufacturing-loop-orbit" aria-hidden="true">
        <span className="manufacturing-loop-orbit-arrow manufacturing-loop-orbit-arrow-top" />
        <span className="manufacturing-loop-orbit-arrow manufacturing-loop-orbit-arrow-bottom" />
      </div>
      <ol className="manufacturing-loop-track">
        {steps.map((step, index) => (
          <li key={step.id} className={`manufacturing-loop-step ${active >= index ? "lit" : ""}`.trim()}>
            <span className="manufacturing-loop-number">0{index + 1}</span>
            <div className="manufacturing-loop-node">
              <span className="manufacturing-loop-icon"><LoopIcon id={step.id} /></span>
              <strong>{step.label}</strong>
              <span>{step.source}</span>
              <i aria-hidden="true" />
              <small>{step.detail}</small>
            </div>
          </li>
        ))}
      </ol>
      <div className={`manufacturing-loop-return ${active >= steps.length - 1 ? "lit" : ""}`.trim()} aria-hidden="true">
        <span />
        <b>Continuous feedback</b>
        <span />
      </div>
      <div className="manufacturing-loop-footnote">
        <p>Digital instructions become physical execution,<br />then return as operating intelligence.</p>
      </div>
    </div>
  );
}
