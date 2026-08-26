"use client";

import { assets } from "@/lib/assets";
import { useInView } from "@/lib/use-in-view";
import Image from "next/image";
import { useRef } from "react";
import { SectionIcon } from "@/components/visuals/SectionIcons";

const proofs = [
  { icon: "hexagon", label: "Shared architecture" },
  { icon: "brain", label: "Reusable manufacturing knowledge" },
  { icon: "spark", label: "Network-scale intelligence" }
] as const;

const leftCards = [
  { icon: "cube", title: "Process packs", body: "Reusable process logic" },
  { icon: "process", title: "Engineering knowledge", body: "Standards + configuration" }
] as const;

const rightCards = [
  { icon: "inspect", title: "Investigation intelligence", body: "Patterns + context" },
  { icon: "shield", title: "Deployment standards", body: "Repeatable factory setup" }
] as const;

function AdvantageCard({
  icon,
  title,
  body
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <article>
      <SectionIcon name={icon} />
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

export function NetworkAdvantageVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { threshold: 0.12 });

  return (
    <div
      className={`network-advantage ${visible ? "visible" : ""}`.trim()}
      ref={ref}
      aria-label="Voltron core network"
    >
      <div className="network-advantage-board">
        <div className="network-advantage-col network-advantage-col-left">
          {leftCards.map((card) => (
            <AdvantageCard key={card.title} {...card} />
          ))}
        </div>

        <div className="network-advantage-stage">
          <div className="network-advantage-art" aria-hidden="true">
            <Image
              src={assets.network}
              alt=""
              width={1536}
              height={1024}
              sizes="(max-width: 900px) 100vw, 1100px"
              className="network-advantage-img"
            />
          </div>
        </div>

        <div className="network-advantage-col network-advantage-col-right">
          {rightCards.map((card) => (
            <AdvantageCard key={card.title} {...card} />
          ))}
        </div>
      </div>

      <ul className="network-advantage-proofs">
        {proofs.map((proof) => (
          <li key={proof.label}>
            <SectionIcon name={proof.icon} />
            <span>{proof.label}</span>
          </li>
        ))}
      </ul>

      <p className="network-advantage-closer">Each deployment starts with the capability of the network behind it.</p>
      <p className="network-advantage-note">
        Plant-specific operational and customer data remains governed within its permitted context.
      </p>
    </div>
  );
}
