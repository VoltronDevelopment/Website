"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function AlphaFlowVisual() {
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
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className={`alpha-factory-visual ${visible ? "visible" : ""}`.trim()} ref={ref}>
      <div className="alpha-factory-frame">
        <Image
          src="/voltron_alpha.png"
          alt="Voltron Alpha factory with utilities, inventory, quality lab and thirteen-stage process line"
          width={1672}
          height={941}
          sizes="(max-width: 900px) 92vw, 720px"
          className="alpha-factory-image"
        />
        <span className="alpha-factory-sheen" aria-hidden="true" />
      </div>
      <figcaption>
        <span>Voltron Alpha</span>
        <small>13-stage process line · Quality lab · Inventory · Utilities</small>
      </figcaption>
    </figure>
  );
}
