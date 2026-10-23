"use client";
import { useEffect, useRef, useState } from "react";

/** Measure HTML anchors so signals follow the controls at every desktop width. */
export function EvidenceConnections({ selected }: { selected: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState<string[]>([]);
  useEffect(() => {
    const svg = ref.current, host = svg?.parentElement;
    if (!host) return;
    const measure = () => {
      const bounds = host.getBoundingClientRect();
      const core = host.querySelector(".evidence-core")?.getBoundingClientRect();
      if (!core || !bounds.width) return;
      setPaths(Array.from(host.querySelectorAll(".evidence-sources button")).map((button, index) => {
        const source = button.getBoundingClientRect(), left = index < 4;
        const x = (left ? source.right : source.left) - bounds.left;
        const y = source.top + source.height / 2 - bounds.top;
        const endX = (left ? core.left : core.right) - bounds.left;
        const endY = core.top + core.height / 2 - bounds.top;
        const middle = (x + endX) / 2;
        return `M ${x} ${y} C ${middle} ${y}, ${middle} ${endY}, ${endX} ${endY}`;
      }));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    host.querySelectorAll("button, .evidence-core").forEach(element => observer.observe(element));
    measure();
    return () => observer.disconnect();
  }, []);
  return <svg ref={ref} className="evidence-connections" aria-hidden="true">{paths.map((d, index) => <path key={index} d={d} className={index === selected ? "is-selected" : ""}/>)}{paths[selected] && <path key={`signal-${selected}`} d={paths[selected]} pathLength="1" className="evidence-signal"/>}</svg>;
}
