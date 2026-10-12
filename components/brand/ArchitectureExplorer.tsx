"use client";
import { useState } from "react";
import { Cube } from "./ProcessFlow";
const groups = [
  { title: "Execution", systems: "ERP / QMS / SCADA / PLC / Edge", detail: "Business and production, quality evidence, live visibility and physical control retain their own responsibilities." },
  { title: "Shared meaning", systems: "V-MO / Manufacturing Ontology", detail: "Plant, part, lot, process, equipment and evidence are connected in the same manufacturing situation." },
  { title: "Intelligence", systems: "V-Twin / Voltron AI / HITL", detail: "Context supports investigation and insight. People retain authority over consequential decisions." },
];
export function ArchitectureExplorer({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState(1);
  return <div className="architecture" data-selected={selected}><div className="architecture-labels">{groups.map((group, index) => <button className="architecture-choice" type="button" key={group.title} aria-pressed={selected === index} onClick={() => setSelected(index)}><Cube active={selected === index}/><span>{group.title}</span><small>{group.systems}</small></button>)}</div>{children}<div className="flow-detail" aria-live="polite"><strong>{groups[selected].title}</strong><p>{groups[selected].detail}</p></div></div>;
}
