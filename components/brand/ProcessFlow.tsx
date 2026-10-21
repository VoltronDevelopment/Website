"use client";
import { useId, useState, type CSSProperties } from "react";
import { SmallCube } from "./SmallCube";

export function Cube({ active = false }: { active?: boolean }) {
  return <SmallCube active={active}/>;
}
export type Stage = { title: string; record: string; detail: string };
export const lotStages: Stage[] = [
  { title: "Receive", record: "Requirements", detail: "The part, lot and customer requirements establish the context for everything that follows." },
  { title: "Process", record: "Process history", detail: "Process events remain linked to the same lot, equipment and operating conditions." },
  { title: "Verify", record: "Quality evidence", detail: "Inspections and quality records are checked against the requirements for this lot." },
  { title: "Dispatch", record: "Dispatch record", detail: "The released lot carries its manufacturing history and evidence into the dispatch record." },
];
export function ProcessFlow({ stages = lotStages, label = "Connected manufacturing flow" }: { stages?: Stage[]; label?: string }) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  return <div><ol className="flow" aria-label={label} style={{ "--flow-count": stages.length } as CSSProperties}>{stages.map((stage, index) => <li className="flow-step" key={stage.title}><button type="button" className="flow-button" aria-pressed={selected === index} aria-controls={id} onClick={() => setSelected(index)}><span className="flow-title">{stage.title}</span><Cube active={selected === index}/></button><p>{stage.record}</p></li>)}</ol><div className="flow-detail" id={id} aria-live="polite"><strong>{stages[selected].title} / {stages[selected].record}</strong><p>{stages[selected].detail}</p></div></div>;
}
