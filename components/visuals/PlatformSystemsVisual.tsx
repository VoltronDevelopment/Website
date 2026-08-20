"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const systems = [
  {
    id: "erp",
    label: "Voltron ERP",
    verb: "Run",
    items: "Production · Quality · Maintenance · Traceability",
    image: "/erp_login.png",
    alt: "Voltron ERP product entry screen",
    width: 1804,
    height: 872
  },
  {
    id: "scada",
    label: "Voltron SCADA",
    verb: "See",
    items: "PLC · Process state · Alarms · Energy",
    image: "/scada_login.png",
    alt: "Voltron SCADA product entry screen",
    width: 1672,
    height: 762
  },
  {
    id: "twin",
    label: "Voltron Twin",
    verb: "Understand",
    items: "Context · History · Relationships · Improvement",
    image: "/digital_twin_login.png",
    alt: "Voltron Digital Twin product entry screen",
    width: 1672,
    height: 806
  }
];

export function PlatformSystemsVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setActive(2);
        observer.disconnect();
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="platform-systems-visual" ref={ref} data-active={active} aria-label="Voltron ERP SCADA and Twin platform">
      <div className="platform-system-grid">
        {systems.map((system, index) => (
          <article key={system.id} className={`platform-system platform-system-${system.id} ${active >= index ? "lit" : ""}`.trim()}>
            <span className="platform-system-index">0{index + 1}</span>
            <div className="platform-system-image-frame">
              <Image
                src={system.image}
                alt={system.alt}
                width={system.width}
                height={system.height}
                sizes="(max-width: 900px) 92vw, (max-width: 1500px) 31vw, 440px"
                className="platform-system-image"
              />
            </div>
            <div className="platform-system-copy">
              <span className="platform-system-verb">{system.verb}</span>
              <h3>{system.label}</h3>
              <p>{system.items}</p>
            </div>
          </article>
        ))}
      </div>

      <div className={`platform-core-line ${active >= 2 ? "lit" : ""}`.trim()} aria-hidden="true">
        <span />
        <strong>Voltron Core</strong>
        <span />
      </div>

      <p className="platform-system-caption">One object model. One digital thread. One source of manufacturing truth.</p>
    </div>
  );
}
