"use client";

import { getPrefersReducedMotion } from "@/lib/prefers-reduced-motion";
import { useEffect, useRef, useState } from "react";

const processSteps = [
  { id: "customer", label: "Customer" },
  { id: "material", label: "Material" },
  { id: "production", label: "Production" },
  { id: "process", label: "Process" },
  { id: "quality", label: "Quality" },
  { id: "dispatch", label: "Dispatch" }
];

const STEP_MS = 680;
const PAUSE_MS = 1400;

export function VoltronCustomerVisual() {
  const visualRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const node = visualRef.current;
    if (!node) return;

    const clearTimers = () => {
      timersRef.current.forEach((id) => {
        window.clearInterval(id);
        window.clearTimeout(id);
      });
      timersRef.current = [];
    };

    const runSequence = () => {
      if (getPrefersReducedMotion()) {
        setActive(processSteps.length - 1);
        return;
      }

      let step = 0;
      setActive(0);

      const interval = window.setInterval(() => {
        step += 1;
        if (step >= processSteps.length) {
          window.clearInterval(interval);
          const pause = window.setTimeout(runSequence, PAUSE_MS);
          timersRef.current.push(pause);
          return;
        }
        setActive(step);
      }, STEP_MS);

      timersRef.current.push(interval);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        runSequence();
      },
      { threshold: 0.4, rootMargin: "0px 0px -5% 0px" }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimers();
    };
  }, []);

  return (
    <div className="voltron-customer-visual" aria-label="Factory event and customer visibility flow">
      <div className="voltron-live-panel">
        <div className="voltron-live-header">
          <span className="voltron-live-badge">
            <span className="voltron-live-dot" aria-hidden="true" />
            Live
          </span>
          <span className="voltron-live-title">Customer Portal</span>
        </div>
        <div className="voltron-live-frame voltron-visibility-frame" data-step={active} ref={visualRef}>
          <div className="visibility-factory-node">
            <span className="visibility-node-mark">F</span>
            <strong>FACTORY EVENTS</strong>
            <ul>
              <li>Production</li>
              <li>Quality</li>
              <li>Material</li>
              <li>Process</li>
            </ul>
          </div>

          <div className="visibility-flow-rail" aria-hidden="true">
            <span className="visibility-flow-line" />
            <i />
            <i />
            <i />
          </div>

          <div className="visibility-customer-node">
            <span className="visibility-node-mark">C</span>
            <strong>CUSTOMER</strong>
            <ul>
              <li>Live status</li>
              <li>Full context</li>
              <li>Trusted truth</li>
            </ul>
          </div>

          <div className="visibility-insight-grid">
            <article className={`visibility-insight-card ${active >= 0 ? "lit" : ""}`.trim()}>
              <span>Batch VC-206-014</span>
              <strong>In production</strong>
            </article>
            <article className={`visibility-insight-card ${active >= 2 ? "lit" : ""}`.trim()}>
              <span>Lot traceability</span>
              <strong>100% linked</strong>
            </article>
            <article className={`visibility-insight-card ${active >= 3 ? "lit" : ""}`.trim()}>
              <span>Quality check</span>
              <strong>Passed</strong>
            </article>
            <article className={`visibility-insight-card ${active >= 5 ? "lit" : ""}`.trim()}>
              <span>Dispatch ETA</span>
              <strong>On track</strong>
            </article>
          </div>
        </div>

      </div>
    </div>
  );
}
