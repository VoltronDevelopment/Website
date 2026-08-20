"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const stackLayers = [
  {
    id: "scada",
    tier: "Machines",
    title: "Voltron SCADA",
    body: "Real-time machine and process visibility connected directly to PLC, instrumentation, alarms, energy and production context."
  },
  {
    id: "voltron",
    tier: "Operations",
    title: "Voltron",
    body: "The operating layer that connects part, lot, machine, process, quality and dispatch into one digital thread."
  },
  {
    id: "erp",
    tier: "Business",
    title: "Voltron ERP",
    body: "Manufacturing-first ERP for production, quality, maintenance, inventory, finance, APQP, PPAP and traceability."
  },
  {
    id: "intelligence",
    tier: "Intelligence",
    title: "Digital Twin & AI",
    body: "Structured industrial data creates the foundation for prediction, optimization and autonomous manufacturing."
  }
];

const supportPills = [
  {
    title: "Modular Architecture",
    body: "Deploy progressively — connect existing systems first, then add intelligence without rebuilding the factory."
  },
  {
    title: "Digital Quality & Traceability",
    body: "Every lot carries its process history, inspection evidence and quality outcome."
  }
];

export function VoltronAdvantageVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const clearTimers = () => {
      timersRef.current.forEach((id) => {
        window.clearInterval(id);
        window.clearTimeout(id);
      });
      timersRef.current = [];
    };

    const runSequence = () => {
      let step = 0;
      setActive(0);

      const interval = window.setInterval(() => {
        step += 1;
        if (step >= stackLayers.length) {
          window.clearInterval(interval);
          return;
        }
        setActive(step);
      }, 620);

      timersRef.current.push(interval);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        runSequence();
      },
      { threshold: 0.22 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimers();
    };
  }, []);

  return (
    <div className="advantage-visual" ref={ref} data-active={active} aria-label="Voltron integrated manufacturing platform">
      <div className="advantage-stack">
        {stackLayers.map((layer, i) => (
          <div key={layer.id} className="advantage-stack-item">
            {i > 0 ? (
              <span
                className={`advantage-connector ${i <= active ? "lit" : ""}`.trim()}
                aria-hidden="true"
              />
            ) : null}
            <article
              className={`advantage-layer ${i <= active ? "lit" : ""} ${i === active ? "active" : ""}`.trim()}
              style={{ "--i": i } as CSSProperties}
            >
              <span className="advantage-tier">{layer.tier}</span>
              <h3>{layer.title}</h3>
              <p>{layer.body}</p>
            </article>
          </div>
        ))}
      </div>

      <div className="advantage-support">
        {supportPills.map((pill, i) => (
          <article
            key={pill.title}
            className={`advantage-pill ${active >= stackLayers.length - 1 ? "lit" : ""}`.trim()}
            style={{ "--i": i } as CSSProperties}
          >
            <h4>{pill.title}</h4>
            <p>{pill.body}</p>
          </article>
        ))}
      </div>

      <div className={`advantage-flow ${active >= stackLayers.length - 1 ? "lit" : ""}`.trim()}>
        <p className="advantage-flow-line">Machines → Operations → Business → Intelligence</p>
        <p className="advantage-flow-tagline">Not separate tools. One connected manufacturing system.</p>
      </div>
    </div>
  );
}
