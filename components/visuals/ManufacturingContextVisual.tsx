"use client";

import { SectionIcon } from "@/components/visuals/SectionIcons";
import { assets } from "@/lib/assets";
import { manufacturingContextPhases } from "@/lib/site-content";
import { useInView } from "@/lib/use-in-view";
import Image from "next/image";
import { useRef, type CSSProperties } from "react";

export function ContextSceneVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { threshold: 0.08 });

  return (
    <div className={`context-scene-visual ${visible ? "visible" : ""}`.trim()} ref={ref}>
      <div className="context-scene-image-wrap">
        <Image
          src={assets.factory.flow}
          alt="Connected manufacturing lot context with holographic factory flow"
          fill
          sizes="(max-width: 900px) 90vw, 520px"
          className="context-scene-image"
          priority={false}
        />
      </div>
    </div>
  );
}

export function ContextSpineVisual() {
  const ref = useRef<HTMLOListElement>(null);
  const visible = useInView(ref, { threshold: 0.06 });

  return (
    <ol className={`context-spine ${visible ? "visible" : ""}`.trim()} ref={ref} aria-label="Manufacturing lot story">
      {manufacturingContextPhases.map((phase, index) => (
        <li key={phase.id} style={{ "--i": index } as CSSProperties}>
          <span className="context-spine-track-dot" aria-hidden="true" />
          <article className="context-phase-tile">
            <span className="context-phase-icon">
              <SectionIcon name={phase.icon} />
            </span>
            <div className="context-phase-copy">
              <strong>{phase.title}</strong>
              <p className="context-phase-flow">
                {phase.nodes.map((node, nodeIndex) => (
                  <span key={node}>
                    {nodeIndex > 0 ? (
                      <span className="context-phase-arrow" aria-hidden="true">
                        →
                      </span>
                    ) : null}
                    {node}
                  </span>
                ))}
              </p>
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
}

/** @deprecated Use ContextSceneVisual + ContextSpineVisual */
export function ManufacturingContextVisual() {
  return (
    <div className="context-visual-band">
      <ContextSceneVisual />
      <ContextSpineVisual />
    </div>
  );
}
