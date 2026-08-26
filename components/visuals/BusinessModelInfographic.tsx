"use client";

import { useEffect, useRef, useState } from "react";

export function BusinessModelInfographic() {
  const ref = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let interval: number | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        let step = 0;
        interval = window.setInterval(() => {
          setPhase((p) => Math.min(3, p + 1));
          step += 1;
          if (step >= 3 && interval) clearInterval(interval);
        }, 650);
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <div className="biz-model" ref={ref} data-phase={phase} aria-label="Voltron business model">
      <article className={`biz-card biz-card-core ${phase >= 1 ? "visible" : ""}`.trim()}>
        <p className="biz-card-eyebrow">Voltron Technologies</p>
        <h3>The Core Platform</h3>
        <p className="biz-card-tags">
          Voltron · Industrial Software · Engineering · Automation · Factory Standards · Operating Systems
        </p>
        <p className="biz-card-body">
          Voltron develops and owns the technology and manufacturing architecture that powers the network.
        </p>
      </article>

      <svg className={`biz-connector biz-connector-split ${phase >= 1 ? "visible" : ""}`.trim()} viewBox="0 0 720 48" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 360 4 L 360 20 L 180 20 L 180 44" />
        <path d="M 360 20 L 540 20 L 540 44" />
      </svg>

      <div className="biz-model-row">
        <article className={`biz-card biz-card-owned ${phase >= 2 ? "visible" : ""}`.trim()}>
          <p className="biz-card-eyebrow">Voltron-Owned Plants</p>
          <h3>Where We Prove</h3>
          <p className="biz-card-sub">Plants built or operated directly by Voltron.</p>
          <p className="biz-card-flow">Build → Operate → Learn → Improve</p>
          <p className="biz-card-body">
            These facilities validate the technology, operating model, quality systems and factory economics in real
            manufacturing.
          </p>
        </article>

        <article className={`biz-card biz-card-jv ${phase >= 2 ? "visible" : ""}`.trim()}>
          <p className="biz-card-eyebrow">Voltron Factory JVs</p>
          <h3>Where We Scale</h3>
          <p className="biz-card-sub">Factories developed with strategic partners.</p>
          <div className="biz-split-list">
            <div>
              <strong>Partner brings</strong>
              <span>Capital · Assets · Market Access</span>
            </div>
            <div>
              <strong>Voltron brings</strong>
              <span>Technology · Engineering · Automation · Operations</span>
            </div>
          </div>
          <p className="biz-card-flow">Partner → Build → Operate → Scale</p>
        </article>
      </div>

      <svg className={`biz-connector biz-connector-merge ${phase >= 3 ? "visible" : ""}`.trim()} viewBox="0 0 720 48" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 180 4 L 180 20 L 360 20 L 360 44" />
        <path d="M 540 4 L 540 20 L 360 20" />
      </svg>

      <article className={`biz-card biz-card-network ${phase >= 3 ? "visible" : ""}`.trim()}>
        <p className="biz-card-eyebrow">One Connected Network</p>
        <h3>Where It Compounds</h3>
        <p className="biz-card-sub">Owned plants and JV factories operate on a common Voltron architecture.</p>
        <div className="biz-network-meta">
          <p className="biz-factory-chain">Factory 01 ↔ Factory 02 ↔ Factory 03 ↔ Factory 04</p>
          <p className="biz-card-tags">Quality · Process · Maintenance · Energy · Production · Cost</p>
        </div>
      </article>
    </div>
  );
}
