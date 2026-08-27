"use client";

import { assets } from "@/lib/assets";
import { useInView } from "@/lib/use-in-view";
import Image from "next/image";
import { useRef } from "react";
import type { CSSProperties } from "react";

const systemLayers = [
  { id: "erp", label: "ERP", detail: "Business & production context", image: "/erp.webp", side: "left" },
  { id: "qms", label: "QMS", detail: "Quality & traceability", image: "/qms.webp", side: "left" },
  { id: "scada", label: "SCADA", detail: "Live process visibility", image: "/scada.webp", side: "right" },
  {
    id: "twin-ai",
    label: "Digital Twin + Voltron AI",
    detail: "Context, insight & specialist intelligence",
    image: "/digital_twin.webp",
    side: "right"
  }
] as const;

const physicalLayers = [
  { label: "PLC", detail: "Control", image: "/plc.webp" },
  { label: "EDGE", detail: "Connect", image: "/edge.webp" },
  { label: "MACHINES", detail: "Execute", image: "/machines.webp" },
  { label: "PROCESS LINE", detail: "Transform", image: "/factory_equipment.webp" }
] as const;

export function ArchitectureLayers() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { threshold: 0.12 });

  return (
    <div className={`architecture-visual ${visible ? "visible" : ""}`.trim()} ref={ref} aria-label="Voltron connected factory architecture">
      <div className="architecture-system-map">
        <div className="architecture-system-column architecture-system-column-left">
          {systemLayers.filter((layer) => layer.side === "left").map((layer, index) => (
            <article className="architecture-system-card" key={layer.id} style={{ "--i": index } as CSSProperties}>
              <div className="architecture-system-image-frame architecture-system-image-frame-hero">
                <Image src={layer.image} alt={`${layer.label} architecture layer`} fill sizes="220px" className="architecture-system-image" />
              </div>
              <div className="architecture-system-card-copy">
                <strong>{layer.label}</strong>
                <span>{layer.detail}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="architecture-backbone architecture-backbone-ring">
          <div className="architecture-backbone-core">
            <div className="architecture-backbone-ring-wrap">
              <Image
                src={assets.ai.ring}
                alt=""
                width={220}
                height={220}
                sizes="(max-width: 900px) 160px, 220px"
                className="architecture-backbone-ring-img"
              />
              <div className="architecture-backbone-ring-copy">
                <span className="architecture-backbone-logo-wrap">
                  <Image src={assets.logo} alt="Voltron" width={72} height={72} className="architecture-backbone-logo" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="architecture-system-column architecture-system-column-right">
          {systemLayers.filter((layer) => layer.side === "right").map((layer, index) => (
            <article
              className={`architecture-system-card${layer.id === "twin-ai" ? " architecture-system-card-combined" : ""}`.trim()}
              key={layer.id}
              style={{ "--i": index } as CSSProperties}
            >
              <div className="architecture-system-image-frame architecture-system-image-frame-hero">
                <Image src={layer.image} alt={`${layer.label} architecture layer`} fill sizes="220px" className="architecture-system-image" />
              </div>
              <div className="architecture-system-card-copy">
                <strong>{layer.label}</strong>
                <span>{layer.detail}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="architecture-physical-band">
        <div className="architecture-physical-heading">
          <span>Physical factory</span>
        </div>
        <div className="architecture-physical-grid">
          {physicalLayers.map((layer, index) => (
            <article className="architecture-physical-item" key={layer.label} style={{ "--i": index } as CSSProperties}>
              <strong>{layer.label}</strong>
              <div className="architecture-physical-image-frame">
                <Image src={layer.image} alt={`${layer.label} physical factory asset`} fill sizes="200px" className="architecture-physical-image" />
              </div>
              <span>{layer.detail}</span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
