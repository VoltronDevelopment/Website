"use client";
import { useId, useState } from "react";
import { ontologyConnections as connections, ontologyNodes as nodes, ontologySubject, type OntologyNodeId } from "@/lib/manufacturing-ontology";
import "./ontology-relationships.css";
export function OntologyRelationships() {
  const [selected, setSelected] = useState<OntologyNodeId>("lot");
  const id = useId(), focus = nodes.find(node => node.id === selected)!;
  const activeNodes = new Set<string>(connections.filter(([a, b]) => a === selected || b === selected).flat());
  const related = nodes.filter(node => node.id !== selected && activeNodes.has(node.id));
  return <div className="ontology-relationships">
    <div className="ontology-record"><p className="eyebrow">Illustrative manufacturing record</p><h3>{ontologySubject.part}</h3><p>Lot {ontologySubject.lot} <span aria-hidden="true">/</span> {ontologySubject.operation}</p></div>
    <p className="ontology-instruction">Choose a record to follow its relationships.</p>
    <div className="ontology-map" role="group" aria-label="Manufacturing relationship focus">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="ontology-connections" aria-hidden="true">{connections.map(([a,b]) => {
        const start = nodes.find(node => node.id === a)!, end = nodes.find(node => node.id === b)!;
        const path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
        return <g key={`${a}-${b}`} data-active={a === selected || b === selected}><path d={path}/>{(a === selected || b === selected) && <path key={selected} d={path} pathLength="1" className="ontology-trace"/>}</g>;
      })}</svg>
      {nodes.map(node => <button type="button" key={node.id} className="ontology-node" data-active={activeNodes.has(node.id)} aria-pressed={selected === node.id} aria-controls={id} onClick={() => setSelected(node.id)} style={{ left: `${node.x}%`, top: `${node.y}%` }}><strong>{node.label}</strong><span>{node.record}</span></button>)}
    </div>
    <div id={id} className="ontology-explanation" aria-live="polite" aria-atomic="true"><div><h3>{focus.label}</h3><p>{focus.detail}</p><p className="ontology-evidence">{focus.evidence}</p></div><div className="ontology-relation-summary"><strong>Connected to</strong><ul>{related.map(node => <li key={node.id}>{node.label}</li>)}</ul></div></div>
  </div>;
}
