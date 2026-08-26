"use client";

import { SectionIcon } from "@/components/visuals/SectionIcons";
import { assets } from "@/lib/assets";
import { voltronAiContextInputs, voltronAiGenericSteps } from "@/lib/site-content";
import { useInView } from "@/lib/use-in-view";
import Image from "next/image";
import { useRef } from "react";

export function VoltronAiVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { threshold: 0.08 });

  return (
    <div
      className={`voltron-ai-visual ${visible ? "visible" : ""}`.trim()}
      ref={ref}
      aria-label="Generic AI versus Voltron AI"
    >
      <div className="voltron-ai-page-bg" aria-hidden="true">
        <Image src={assets.ai.factoryBackground} alt="" fill sizes="(max-width: 900px) 100vw, 1600px" />
      </div>
      <div className="voltron-ai-page-scrim" aria-hidden="true" />

      <div className="voltron-ai-section-bar">
        <p className="eyebrow">Voltron AI · Manufacturing intelligence</p>
      </div>

      <div className="voltron-ai-split">
        <div className="voltron-ai-pane voltron-ai-pane-left">
          <h2>
            <span className="voltron-ai-title-lead">Generic AI understands</span>
            <span className="accent">a prompt.</span>
          </h2>

          <div className="voltron-ai-pane-main">
            <article className="voltron-ai-card voltron-ai-card-generic">
              <p className="voltron-ai-card-eyebrow">Generic AI</p>
              <ol className="voltron-ai-tile-list">
                {voltronAiGenericSteps.map((step) => (
                  <li key={step.label} className="voltron-ai-tile">
                    <SectionIcon name={step.icon} />
                    <span>{step.label}</span>
                  </li>
                ))}
              </ol>
            </article>
          </div>

          <p className="bridge-line bridge-line-warn">
            Limited to the input. No awareness of the real-world context.
          </p>
        </div>

        <div className="voltron-ai-gutter" aria-hidden="true" />

        <div className="voltron-ai-pane voltron-ai-pane-right">
          <h2>
            <span className="voltron-ai-title-lead">Voltron AI understands</span>
            <span className="accent">the manufacturing situation.</span>
          </h2>

          <div className="voltron-ai-pane-main">
            <article className="voltron-ai-card voltron-ai-card-voltron">
              <p className="voltron-ai-card-eyebrow">Voltron AI</p>
              <ul className="voltron-ai-chip-cloud">
                {voltronAiContextInputs.map((input) => (
                  <li key={input.label} className="voltron-ai-chip">
                    <SectionIcon name={input.icon} />
                    <span>{input.label}</span>
                  </li>
                ))}
              </ul>
              <ol className="voltron-ai-tile-list">
                <li className="voltron-ai-tile">
                  <SectionIcon name="chart" />
                  <span>Manufacturing context</span>
                </li>
                <li className="voltron-ai-tile voltron-ai-tile-highlight">
                  <Image src={assets.logo} alt="" width={20} height={20} />
                  <span>Voltron AI</span>
                </li>
                <li className="voltron-ai-tile">
                  <SectionIcon name="spark" />
                  <span>Contextual assistance</span>
                </li>
              </ol>
            </article>
          </div>

          <p className="bridge-line accent">
            Built on context. Understands the manufacturing situation.
          </p>
        </div>
      </div>
    </div>
  );
}
