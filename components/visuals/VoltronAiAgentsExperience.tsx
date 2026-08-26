"use client";

import { AgentCardCompact } from "@/components/visuals/AgentCardCompact";
import { HudFrame } from "@/components/visuals/HudFrame";
import { SectionIcon } from "@/components/visuals/SectionIcons";
import { assets } from "@/lib/assets";
import {
  teyoWorkspaceFlow,
  teyoWorkspaceOutputs,
  voltronAgents,
  voltronAiAgentCapabilities
} from "@/lib/site-content";
import { useInView } from "@/lib/use-in-view";
import Image from "next/image";
import { useRef, type CSSProperties } from "react";

export function VoltronAiAgentsExperience() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { threshold: 0.04 });
  const teyo = voltronAgents.find((agent) => agent.investigator)!;
  const specialists = voltronAgents.filter((agent) => !agent.investigator);

  return (
    <div
      className={`ai-agents-experience ${visible ? "visible" : ""}`.trim()}
      ref={ref}
      aria-label="Voltron AI Agents"
    >
      <div className="ai-agents-bg" aria-hidden="true" />
      <div className="ai-agents-decor" aria-hidden="true" />
      <HudFrame />

      <div className="ai-agents-content">
        <header className="ai-agents-hero">
          <p className="eyebrow">Voltron AI Agents</p>
          <h2>
            AI that understands the
            <span className="accent">manufacturing situation.</span>
          </h2>
          <p>
            Specialist AI agents for manufacturing — grounded in plant context and built to work together.
          </p>
          <span className="ai-agents-hero-rule" />
        </header>

        <ul className="ai-agents-caps">
          {voltronAiAgentCapabilities.map((item) => (
            <li key={item.label}>
              <SectionIcon name={item.icon} />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>

        <div className="ai-agents-divider">
          <span />
          <strong>Voltron AI Specialists</strong>
          <span />
        </div>

        <div className="ai-agents-grid" role="list">
          {voltronAgents.map((agent, index) => (
            <div
              key={agent.id}
              className="ai-agents-grid-item"
              role="listitem"
              style={{ "--i": index } as CSSProperties}
            >
              <AgentCardCompact agent={agent} />
            </div>
          ))}
        </div>

        <section className="ai-agents-workspace" aria-label="Investigation workspace">
          <div className="ai-agents-teyo">
            <div className="ai-agents-teyo-art">
              <span className="ai-agents-teyo-ring" />
              <Image src={assets.agents.teyo} alt="TEYO — The Boss" fill sizes="300px" />
            </div>
            <strong>{teyo.name}</strong>
            <span>The Boss</span>
          </div>

          <div className="ai-agents-flow">
            <div className="ai-agents-calls">
              <p>Calls on</p>
              <div>
                {specialists.map((agent) => (
                  <span key={agent.id}>{agent.name}</span>
                ))}
              </div>
            </div>

            <ol>
              {teyoWorkspaceFlow.map((step, index) => (
                <li
                  key={step.label}
                  className={step.label === "Human Review" ? "is-hitl" : undefined}
                  style={{ "--i": index } as CSSProperties}
                >
                  <SectionIcon name={step.icon} />
                  <strong>{step.label}</strong>
                  <span>{step.detail}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="ai-agents-output">
            <p>Output</p>
            <ul>
              {teyoWorkspaceOutputs.map((item) => (
                <li key={item.label}>
                  <SectionIcon name={item.icon} />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
