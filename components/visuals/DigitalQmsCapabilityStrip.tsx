"use client";

import { SectionIcon } from "@/components/visuals/SectionIcons";
import { qmsFeaturePillars } from "@/lib/site-content";
import { useInView } from "@/lib/use-in-view";
import { useRef, type CSSProperties } from "react";

export function DigitalQmsCapabilityStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { threshold: 0.12 });

  return (
    <div className={`digital-qms-capability-strip ${visible ? "visible" : ""}`.trim()} ref={ref}>
      <div className="digital-qms-features">
        {qmsFeaturePillars.map((pillar, index) => (
          <article key={pillar.id} style={{ "--i": index } as CSSProperties}>
            <SectionIcon name={pillar.icon} className="digital-qms-feature-icon" />
            <strong>{pillar.title}</strong>
          </article>
        ))}
      </div>
    </div>
  );
}
