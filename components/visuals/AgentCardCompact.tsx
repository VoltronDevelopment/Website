"use client";

import { assets } from "@/lib/assets";
import type { VoltronAgent } from "@/lib/site-content";
import Image from "next/image";

type AgentCardCompactProps = {
  agent: VoltronAgent;
  active?: boolean;
  onSelect?: () => void;
};

function agentIndex(tab: string) {
  const parts = tab.split("//");
  return (parts[parts.length - 1] ?? tab).trim();
}

export function AgentCardCompact({ agent, active = false, onSelect }: AgentCardCompactProps) {
  const inner = (
    <div className="agent-card-compact-frame">
      <Image src={assets.ai.agentCardFrame} alt="" fill sizes="180px" className="agent-card-compact-frame-img" />
      <span className="agent-card-compact-shade" />
      <div className="agent-card-compact-inner">
        <div className="agent-card-compact-portrait">
          <Image
            src={agent.portrait}
            alt=""
            fill
            sizes="140px"
            className={`agent-card-compact-portrait-img agent-card-compact-portrait-${agent.id}`}
          />
        </div>
        <div className="agent-card-compact-copy">
          <strong>{agent.name}</strong>
          <div className="agent-card-compact-meta">
            <span>{agent.title}</span>
            <em>{agent.banner}</em>
          </div>
        </div>
      </div>
      <code className="agent-card-compact-index">{agentIndex(agent.tab)}</code>
    </div>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={`agent-card-compact ${active ? "active" : ""}`.trim()}
        onClick={onSelect}
        aria-pressed={active}
        aria-label={`${agent.name} — ${agent.title}`}
      >
        {inner}
      </button>
    );
  }

  return (
    <article className="agent-card-compact" aria-label={`${agent.name} — ${agent.title}`}>
      {inner}
    </article>
  );
}
