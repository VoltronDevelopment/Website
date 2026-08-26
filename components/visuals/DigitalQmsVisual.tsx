"use client";

import { SectionIcon } from "@/components/visuals/SectionIcons";
import { assets } from "@/lib/assets";
import { qmsDigitalSources, qmsExistingSources } from "@/lib/site-content";
import { useInView } from "@/lib/use-in-view";
import Image from "next/image";
import { useRef, type CSSProperties } from "react";

export function DigitalQmsVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { threshold: 0.05, fallbackMs: 800 });

  return (
    <div className={`digital-qms-visual ${visible ? "visible" : ""}`.trim()} ref={ref} aria-label="Voltron Digital QMS evidence bridge">
      <div className="digital-qms-hub">
        <div className="digital-qms-col digital-qms-col-left">
          <span className="digital-qms-label">Digital</span>
          <ul className="digital-qms-list">
            {qmsDigitalSources.map((item, index) => (
              <li key={item.label} style={{ "--i": index } as CSSProperties}>
                <span className="digital-qms-pill digital-qms-pill-dark">
                  <SectionIcon name={item.icon} />
                  <span className="digital-qms-pill-label">{item.label}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="digital-qms-core-wrap">
          <Image
            src={assets.qms.core}
            alt="Voltron QMS core"
            width={240}
            height={240}
            sizes="(max-width: 900px) 160px, 240px"
            className="digital-qms-core-img"
          />
        </div>

        <div className="digital-qms-col digital-qms-col-right">
          <span className="digital-qms-label">Existing ecosystem</span>
          <ul className="digital-qms-list">
            {qmsExistingSources.map((item, index) => (
              <li key={item.label} style={{ "--i": index } as CSSProperties}>
                <span className="digital-qms-pill digital-qms-pill-light">
                  <SectionIcon name={item.icon} />
                  <span className="digital-qms-pill-label">{item.label}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
