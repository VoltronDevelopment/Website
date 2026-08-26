"use client";

import { useEffect, useRef, useState } from "react";

function ModularIcon({ id }: { id: "core" | "capability" | "process" | "plant" | "ai" | "erp" | "scada" | "twin" | "hitl" }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7
  };

  if (id === "core") {
    return <svg viewBox="0 0 40 40" aria-hidden="true"><path {...common} d="m20 4 12 7v18l-12 7-12-7V11zM20 20l12-9M20 20 8 11M20 20v16M14 16l6 4 6-4M14 24l6-4 6 4" /></svg>;
  }

  if (id === "capability") {
    return <svg viewBox="0 0 40 40" aria-hidden="true"><path {...common} d="M5 34h30M7 34V17l8 4v-7l8 4V11l10 5v18M12 28h3M20 28h3M28 28h3" /></svg>;
  }

  if (id === "process") {
    return <svg viewBox="0 0 40 40" aria-hidden="true"><circle {...common} cx="15" cy="22" r="6" /><circle {...common} cx="28" cy="14" r="5" /><path {...common} d="m15 13 1.5 3M8 22l3-1M15 31l-1.5-3M22 22l-3-1M25 9l-2-2M34 14h-3M28 22v-3" /></svg>;
  }

  if (id === "plant") {
    return <svg viewBox="0 0 40 40" aria-hidden="true"><path {...common} d="M5 34h30M8 34V18l8-5v5l8-5v21M24 34V11l8 4v19M12 24h3M12 29h3M28 21h2M28 26h2" /></svg>;
  }

  if (id === "ai") {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path {...common} d="M20 8c-4 0-7 3-7 7 0 2 .8 3.8 2 5.1V24h10v-3.9c1.2-1.3 2-3.1 2-5.1 0-4-3-7-7-7z" />
        <path {...common} d="M14 26h12M16 30h8M11 18h2M27 18h2M20 14v2" />
      </svg>
    );
  }

  if (id === "erp") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...common} x="4" y="5" width="16" height="11" rx="1.5" /><path {...common} d="M8 19h8" /></svg>;
  }

  if (id === "scada") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M6 18V8M10 18V5M14 18v-7M18 18v-4" /><path {...common} d="M5 18h14" /></svg>;
  }

  if (id === "twin") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="m12 4 7 4v8l-7 4-7-4V8zM12 12l7-4M12 12v8M12 12 5 8" /></svg>;
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle {...common} cx="12" cy="8" r="3" />
      <path {...common} d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path {...common} d="M16 10l2-2M18 14h2" />
    </svg>
  );
}

const capabilityModules = [
  "Production",
  "Maintenance",
  "Quality and more"
] as const;

const processPackages = [
  "Pretreatment",
  "Phosphating",
  "CED and more"
] as const;

const plantSystems = [
  { id: "erp", label: "ERP" },
  { id: "scada", label: "SCADA" },
  { id: "twin", label: "Twin" },
  { id: "hitl", label: "HITL" }
] as const;

export function ModularPlatformVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let timer: number | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        let nextPhase = 1;
        setPhase(nextPhase);
        timer = window.setInterval(() => {
          nextPhase += 1;
          setPhase(nextPhase);
          if (nextPhase >= 3) window.clearInterval(timer);
        }, 360);
        observer.disconnect();
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (timer) window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="modular-platform-visual" ref={ref} data-phase={phase} aria-label="Voltron modular manufacturing architecture">
      <div className={`modular-core ${phase >= 1 ? "lit" : ""}`.trim()}>
        <span className="modular-icon"><ModularIcon id="core" /></span>
        <div>
          <span className="modular-kicker">Common logic</span>
          <strong>Voltron Core</strong>
          <span className="modular-subline">One manufacturing model</span>
        </div>
      </div>

      <div className="modular-branches" aria-hidden="true">
        <span />
        <span />
      </div>

      <div className="modular-inputs">
        <article className={`modular-input ${phase >= 2 ? "lit" : ""}`.trim()}>
          <span className="modular-icon"><ModularIcon id="capability" /></span>
          <div>
            <span className="modular-index">01</span>
            <strong>Capability Modules</strong>
            <ul className="modular-module-list">
              {capabilityModules.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </article>
        <article className={`modular-input ${phase >= 2 ? "lit" : ""}`.trim()}>
          <span className="modular-icon"><ModularIcon id="process" /></span>
          <div>
            <span className="modular-index">02</span>
            <strong>Process Packages</strong>
            <ul className="modular-module-list">
              {processPackages.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </article>
      </div>

      <div className={`modular-convergence ${phase >= 3 ? "lit" : ""}`.trim()} aria-hidden="true" />

      <div className={`modular-plant-shell ${phase >= 3 ? "lit" : ""}`.trim()}>
        <span className="modular-icon"><ModularIcon id="plant" /></span>
        <div>
          <span className="modular-kicker">Factory-specific execution</span>
          <strong>Plant Configuration</strong>
          <ul className="modular-product-row">
            {plantSystems.map((system) => (
              <li key={system.id}>
                <span className="modular-product-icon">
                  <ModularIcon id={system.id} />
                </span>
                <span>{system.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`modular-ai-output ${phase >= 3 ? "lit" : ""}`.trim()}>
        <span className="modular-icon"><ModularIcon id="ai" /></span>
        <div>
          <span className="modular-kicker">Voltron AI</span>
          <span className="modular-subline">Specialist intelligence on manufacturing context</span>
        </div>
      </div>
    </div>
  );
}
