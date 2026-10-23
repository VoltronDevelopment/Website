"use client";

import { useId, useState } from "react";
import "./network-connections.css";

const focuses = [
  { title: "Direct manufacturing", detail: "Direct manufacturing environments provide a place to develop and validate reusable capability." },
  { title: "Factory partnerships", detail: "Future factory partnerships can apply reviewed capabilities while retaining their own plant configuration." },
  { title: "Shared architecture", detail: "A shared architecture carries validated learning, not unrestricted plant or customer data." },
] as const;
const branches = ["M 50 22 C 50 48 22 44 22 72", "M 50 22 C 50 48 78 44 78 72"];

export function NetworkConnections() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  return <div className="network-connections">
    <div className="network-focus" role="group" aria-label="Network focus">
      {focuses.map((focus, index) => <button type="button" key={focus.title} aria-pressed={selected === index} aria-controls={id} onClick={() => setSelected(index)}>{focus.title}</button>)}
    </div>
    <div className="network-map" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="network-paths">
        {branches.map((d, index) => <g key={index} data-active={selected === index || selected === 2}>
          <path d={d}/>{(selected === index || selected === 2) && <path key={selected} d={d} pathLength="1" className="network-trace"/>}
        </g>)}
      </svg>
      <div className="network-shared" data-selected={selected === 2}><strong>Shared architecture</strong><span>Validated learning<br/>Reusable capability</span></div>
      <div className="network-context network-direct" data-selected={selected === 0 || selected === 2}><strong>Direct manufacturing</strong><span>Plant context</span></div>
      <div className="network-context network-partner" data-selected={selected === 1 || selected === 2}><strong>Factory partnerships</strong><span>Future direction<br/>Own plant configuration</span></div>
    </div>
    <p id={id} className="network-explanation" aria-live="polite" aria-atomic="true">{focuses[selected].detail}</p>
  </div>;
}
