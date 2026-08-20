"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const systemLayers = [
  { id: "erp", label: "ERP", detail: "Business & production context", image: "/erp.png", side: "left" },
  { id: "qms", label: "QMS", detail: "Quality & traceability", image: "/qms.png", side: "left" },
  { id: "scada", label: "SCADA", detail: "Live process visibility", image: "/scada.png", side: "right" },
  { id: "twin", label: "Digital Twin", detail: "Context, insight & intelligence", image: "/digital_twin.png", side: "right" }
] as const;

const physicalLayers = [
  { label: "PLC", detail: "Control", image: "/plc.png" },
  { label: "EDGE", detail: "Connect", image: "/edge.png" },
  { label: "MACHINES", detail: "Execute", image: "/machines.png" },
  { label: "PROCESS LINE", detail: "Transform", image: "/factory_equipment.png" }
] as const;

export function ArchitectureLayers() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.18 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`architecture-visual ${visible ? "visible" : ""}`.trim()} ref={ref} aria-label="Voltron connected factory architecture">
      <div className="architecture-system-map">
        <div className="architecture-system-column architecture-system-column-left">
          {systemLayers.filter((layer) => layer.side === "left").map((layer, index) => (
            <article className="architecture-system-card" key={layer.id} style={{ "--i": index } as CSSProperties}>
              <div className="architecture-system-image-frame">
                <Image src={layer.image} alt={`${layer.label} architecture layer`} fill sizes="180px" className="architecture-system-image" />
              </div>
              <div>
                <strong>{layer.label}</strong>
                <span>{layer.detail}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="architecture-backbone">
          <span className="architecture-backbone-kicker">Connected architecture</span>
          <div className="architecture-backbone-core">
            <span className="architecture-backbone-mark">
              <Image src="/voltron-logo.webp" alt="Voltron logo" width={70} height={70} />
            </span>
            <strong>VOLTRON</strong>
            <span>Digital Backbone</span>
          </div>
          <p>One connected architecture. Not disconnected systems.</p>
        </div>

        <div className="architecture-system-column architecture-system-column-right">
          {systemLayers.filter((layer) => layer.side === "right").map((layer, index) => (
            <article className="architecture-system-card" key={layer.id} style={{ "--i": index } as CSSProperties}>
              <div className="architecture-system-image-frame">
                <Image src={layer.image} alt={`${layer.label} architecture layer`} fill sizes="180px" className="architecture-system-image" />
              </div>
              <div>
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
          <small>PLC · Edge · Machines · Process</small>
        </div>
        <div className="architecture-physical-grid">
          {physicalLayers.map((layer, index) => (
            <article className="architecture-physical-item" key={layer.label} style={{ "--i": index } as CSSProperties}>
              <div className="architecture-physical-image-frame">
                <Image src={layer.image} alt={`${layer.label} physical factory asset`} fill sizes="240px" className="architecture-physical-image" />
              </div>
              <strong>{layer.label}</strong>
              <span>{layer.detail}</span>
            </article>
          ))}
        </div>
      </div>

    </div>
  );
}
