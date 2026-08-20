"use client";

import { assets } from "@/lib/assets";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function CyberPhysicalStack() {
  const ref = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let interval: number | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        let step = 0;
        interval = window.setInterval(() => {
          setPhase((p) => Math.min(3, p + 1));
          step += 1;
          if (step >= 3 && interval) clearInterval(interval);
        }, 850);
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <div className="cps-visual" ref={ref} data-phase={phase} aria-label="Physical plant and digital twin">
      <div className="cps-glow" aria-hidden="true" />

      <figure className={`cps-frame cps-frame-physical ${phase >= 1 ? "visible" : ""}`.trim()}>
        <div className="cps-img-wrap">
          <Image
            src={assets.factory.physical}
            alt="Voltron physical manufacturing plant"
            fill
            sizes="(max-width: 900px) 92vw, 500px"
            className="cps-img"
            priority={false}
          />
          <div className="cps-img-scrim" aria-hidden="true" />
        </div>
        <figcaption className="cps-tag">Physical plant</figcaption>
      </figure>

      <div className={`cps-bridge ${phase >= 2 ? "visible" : ""}`.trim()} aria-hidden="true">
        <span className="cps-bridge-line" />
        <div className="cps-bridge-label">
          <strong>Live data</strong>
          <span>Voltron · Events · Context</span>
        </div>
        <span className="cps-bridge-line" />
      </div>

      <figure className={`cps-frame cps-frame-twin ${phase >= 3 ? "visible" : ""}`.trim()}>
        <div className="cps-img-wrap">
          <Image
            src={assets.factory.digitalTwin}
            alt="Voltron digital twin overlay on the plant"
            fill
            sizes="(max-width: 900px) 92vw, 500px"
            className="cps-img"
          />
          <div className="cps-img-scrim cps-img-scrim-twin" aria-hidden="true" />
        </div>
        <figcaption className="cps-tag">Digital twin</figcaption>
      </figure>
    </div>
  );
}
