"use client";

import { assets } from "@/lib/assets";
import { useInView } from "@/lib/use-in-view";
import Image from "next/image";
import { useRef } from "react";

const digitalItems = ["ERP / QMS", "SCADA", "Twin", "Evidence", "HITL"];
const intelligenceItems = ["KAVO", "RIXA", "MEKO", "ZILO", "SARO", "TEYO"];

export function AlphaProofVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { threshold: 0.12 });

  return (
    <div className={`alpha-proof-visual ${visible ? "visible" : ""}`.trim()} ref={ref} aria-label="Voltron Alpha proof stack">
      <article className="alpha-proof-layer" style={{ "--i": 0 } as React.CSSProperties}>
        <span className="alpha-proof-kicker">Digital</span>
        <ul>
          {digitalItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <span className="alpha-proof-connector" aria-hidden="true" />
      </article>

      <article className="alpha-proof-layer alpha-proof-photo-layer" style={{ "--i": 1 } as React.CSSProperties}>
        <span className="alpha-proof-kicker">Physical</span>
        <div className="alpha-proof-photo">
          <Image
            src={assets.alpha.flow}
            alt="Voltron Alpha factory"
            width={1672}
            height={941}
            sizes="(max-width: 900px) 100vw, 560px"
            className="alpha-proof-photo-img"
          />
        </div>
        <span className="alpha-proof-connector" aria-hidden="true" />
      </article>

      <article className="alpha-proof-layer" style={{ "--i": 2 } as React.CSSProperties}>
        <span className="alpha-proof-kicker">Intelligence</span>
        <ul>
          {intelligenceItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </div>
  );
}
