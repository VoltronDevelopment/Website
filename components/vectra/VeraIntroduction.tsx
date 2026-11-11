import { ArrowRight, ArrowUpRight } from "lucide-react";
import { VeraCube } from "./VeraCube";

const directions = [
  { id: "platform", title: "Explore the platform", detail: "Connect the shop floor and its evidence.", message: "How does Voltron connect physical work, manufacturing context and intelligence?" },
  { id: "vision", title: "Think about industry", detail: "India’s manufacturing future.", message: "Why does Voltron believe coherence matters for India’s manufacturing future?" },
  { id: "challenge", title: "Bring a manufacturing challenge", detail: "Work through where to start.", message: "I have a manufacturing challenge. Help me think through where to start." },
] as const;

export function VeraStarters({ disabled, onChoose }: { disabled: boolean; onChoose: (message: string) => void }) {
  return <section className="vera-introduction" aria-label="Meet Vera">
    <div className="vera-directions">
      {directions.map(direction => <button className="vera-direction" key={direction.id} type="button"
        disabled={disabled} onClick={() => onChoose(direction.message)}>
        <VeraCube variant={direction.id} />
        <span className="vera-direction-copy"><strong>{direction.title}</strong><span>{direction.detail}</span></span>
        <ArrowUpRight size={16} aria-hidden="true" />
      </button>)}
    </div>
  </section>;
}

export function VeraIntroduction({ resumed, animate, onBegin }: { resumed: boolean; animate: boolean; onBegin: () => void }) {
  return <section className="vera-meet" aria-label="Meet Vera" data-entrance={animate || undefined}>
    <div className="vera-meet-art"><VeraCube /></div>
    <div className="vera-meet-copy">
      <p className="vera-meet-name">VERA</p>
      <h3>Let’s see what connects.</h3>
      <p>I’m Voltron Lattice’s AI guide. Bring a question, explore an idea, or imagine what industry could become.</p>
    </div>
    <button type="button" className="vera-begin" onClick={onBegin}>{resumed ? "Continue conversation" : "Begin a conversation"}<ArrowRight size={18} aria-hidden="true" /></button>
  </section>;
}
