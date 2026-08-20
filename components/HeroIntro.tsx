"use client";

import { assets } from "@/lib/assets";
import { getPrefersReducedMotion } from "@/lib/prefers-reduced-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

/** viewBox 720×380 — hub at logo centre (360, 190) */
const pillars = [
  {
    id: "tech",
    label: "Technology",
    keys: "Build · Connect · Understand",
    path: "M 202 76 L 282 76 L 322 108 L 352 142 L 358 168",
    nodeClass: "node-tech"
  },
  {
    id: "infra",
    label: "Infrastructure",
    keys: "Machines · Lines · Assets",
    path: "M 202 304 L 282 304 L 322 272 L 352 238 L 358 212",
    nodeClass: "node-infra"
  },
  {
    id: "ops",
    label: "Operations",
    keys: "Run · Measure · Improve",
    path: "M 408 190 L 518 190",
    nodeClass: "node-ops"
  }
];

const LINE_MS = 1200;
const GAP_MS = 200;

export function HeroIntro() {
  const [phase, setPhase] = useState(0);
  const [activeLine, setActiveLine] = useState(-1);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    if (mobile || getPrefersReducedMotion()) {
      setPhase(3);
      setActiveLine(3);
      return;
    }

    const t1 = window.setTimeout(() => setPhase(1), 300);
    const t2 = window.setTimeout(() => {
      setPhase(2);
      setActiveLine(0);
    }, 900);
    const t3 = window.setTimeout(() => setActiveLine(1), 900 + LINE_MS + GAP_MS);
    const t4 = window.setTimeout(() => setActiveLine(2), 900 + (LINE_MS + GAP_MS) * 2);
    const t5 = window.setTimeout(() => {
      setActiveLine(3);
      setPhase(3);
    }, 900 + (LINE_MS + GAP_MS) * 3);

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);

  return (
    <div
      className="hero-intro"
      data-phase={phase}
      data-active-line={activeLine >= 0 ? activeLine : undefined}
      aria-label="Voltron brand introduction"
    >
      <div className="hero-nebula" aria-hidden="true" />
      <div className="hero-grid-bg" aria-hidden="true" />
      <div className="hero-rings" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="hero-stage">
        <div className="hero-logo-cluster">
          <div className="hero-pillar-connectors" aria-hidden="true">
            <svg viewBox="0 0 720 380" className="hero-pillar-svg" preserveAspectRatio="xMidYMid meet">
              {pillars.map((pillar) => (
                <path
                  key={pillar.id}
                  className={`pillar-line pillar-${pillar.id}`}
                  d={pillar.path}
                  pathLength={1}
                />
              ))}
              <circle className="pillar-hub" cx="360" cy="190" r="5" />
            </svg>
          </div>

          {pillars.map((pillar) => (
            <div key={pillar.id} className={`pillar-node ${pillar.nodeClass}`}>
              <span className="pillar-head">{pillar.label}</span>
              <span className="pillar-rule" aria-hidden="true" />
              <span className="pillar-keys">{pillar.keys}</span>
            </div>
          ))}

          <div className={`hero-logo-wrap ${phase >= 1 ? "assembled" : ""} ${phase >= 3 ? "connected" : ""}`.trim()}>
            <Image src={assets.logo} alt="Voltron" width={120} height={120} priority className="hero-logo-img" />
            <span className="hero-logo-pulse" aria-hidden="true" />
            <span className="hero-logo-glow" aria-hidden="true" />
          </div>
        </div>

        <div className={`hero-brand-copy ${phase >= 3 ? "visible" : ""}`.trim()}>
          <h1>VOLTRON</h1>
          <p className="hero-tagline">Engineering the Future of Manufacturing.</p>
        </div>
      </div>

      <a className={`hero-scroll-hint ${phase >= 3 ? "visible" : ""}`.trim()} href="#gap">
        <span>Scroll to Discover</span>
        <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10 4v10M5 11l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </a>
    </div>
  );
}
