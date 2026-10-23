"use client";

import { useId, useState } from "react";
import { Cube } from "./ProcessFlow";
import "./ontology-relationships.css";

const nodes = [
  { id: "part", label: "Part", x: 15, y: 16 },
  { id: "process", label: "Process history", x: 15, y: 50 },
  { id: "equipment", label: "Equipment", x: 15, y: 84 },
  { id: "lot", label: "Lot", x: 50, y: 50 },
  { id: "requirements", label: "Requirements", x: 85, y: 16 },
  { id: "evidence", label: "Evidence", x: 85, y: 84 },
] as const;
const connections = [
  ["lot", "part"], ["lot", "process"], ["lot", "equipment"],
  ["lot", "requirements"], ["lot", "evidence"],
  ["equipment", "process"], ["evidence", "requirements"],
] as const;
const focuses = [
  { title: "Lot", node: "lot", detail: "A lot connects its part, process history, equipment, requirements and evidence. Its identity persists as work progresses.", relations: ["Part", "Process history", "Equipment", "Requirements", "Evidence"] },
  { title: "Equipment", node: "equipment", detail: "Equipment records relate to the operations, conditions and lots they actually affected.", relations: ["Lot", "Process history"] },
  { title: "Evidence", node: "evidence", detail: "Evidence retains the requirement, subject and manufacturing situation it supports.", relations: ["Lot", "Requirements"] },
] as const;

export function OntologyRelationships() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const focus = focuses[selected];
  const activeConnections = connections.filter(([a, b]) => a === focus.node || b === focus.node);
  const activeNodes = new Set<string>(activeConnections.flat());
  return <div className="context-selector ontology-relationships">
    <div className="context-choices" role="group" aria-label="Manufacturing relationship focus">
      {focuses.map((choice, index) => <button type="button" key={choice.node} aria-pressed={selected === index} aria-controls={id} onClick={() => setSelected(index)}><Cube active={selected === index}/><span>{choice.title}</span></button>)}
    </div>
    <div className="ontology-map" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="ontology-connections">
        {connections.map(([a, b]) => {
          const start = nodes.find(node => node.id === a)!;
          const end = nodes.find(node => node.id === b)!;
          const active = a === focus.node || b === focus.node;
          const path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
          return <g key={`${a}-${b}`} data-active={active}><path d={path}/>{active && <path key={focus.node} d={path} pathLength="1" className="ontology-trace"/>}</g>;
        })}
      </svg>
      {nodes.map(node => <span key={node.id} className="ontology-node" data-active={activeNodes.has(node.id)} data-focus={node.id === focus.node} style={{ left: `${node.x}%`, top: `${node.y}%` }}>{node.label}</span>)}
    </div>
    <div id={id} className="ontology-explanation" aria-live="polite" aria-atomic="true">
      <p className="context-detail">{focus.detail}</p>
      <p className="ontology-relation-summary"><strong>{focus.title}</strong><span>Connected to {focus.relations.join(" · ")}</span></p>
    </div>
  </div>;
}
