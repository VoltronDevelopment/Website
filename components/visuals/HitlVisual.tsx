"use client";

import { assets } from "@/lib/assets";
import { hitlExample } from "@/lib/site-content";
import { useInView } from "@/lib/use-in-view";
import Image from "next/image";
import { useRef } from "react";

function HitlActionIcon({ icon }: { icon: (typeof hitlExample.actions)[number]["icon"] }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.6
  };

  if (icon === "confirm") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect {...common} x="4" y="4" width="16" height="16" rx="3" />
        <path {...common} d="m8 12 2.5 2.5L16 9" />
      </svg>
    );
  }

  if (icon === "capture") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...common} d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
        <circle {...common} cx="12" cy="13" r="3.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path {...common} d="M12 5v8M9 18h6M12 16V5" />
    </svg>
  );
}

export function HitlVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { threshold: 0.12 });

  return (
    <div
      className={`hitl-visual ${visible ? "visible" : ""}`.trim()}
      ref={ref}
      aria-label="KAVO operator HITL example"
    >
      <div className="hitl-visual-frame-wrap" aria-hidden="true">
        <Image
          src={assets.hitl}
          alt=""
          fill
          sizes="(max-width: 900px) 100vw, 520px"
          className="hitl-visual-frame"
        />
      </div>

      <div className="hitl-visual-stage">
        <div className="hitl-kavo">
          <div className="hitl-kavo-art">
            <Image src={assets.agents.kavo} alt="" fill sizes="(max-width: 900px) 280px, 220px" className="hitl-kavo-img" />
          </div>
          <strong>{hitlExample.agent}</strong>
        </div>

        <div className="hitl-panel">
          <p className="hitl-panel-kicker">Operator screen</p>
          <span className="hitl-panel-situation">{hitlExample.situation}</span>
          <p className="hitl-panel-message">{hitlExample.message}</p>
          <div className="hitl-panel-actions">
            {hitlExample.actions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={`hitl-action ${action.primary ? "is-primary" : ""}`.trim()}
              >
                <HitlActionIcon icon={action.icon} />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
