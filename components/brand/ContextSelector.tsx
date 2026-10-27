"use client";
import { useId, useState } from "react";
import { Box } from "lucide-react";
export type ContextChoice = { title: string; detail: string };
export function ContextSelector({ label, choices, children }: { label: string; choices: ContextChoice[]; children?: React.ReactNode }) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  return <div className="context-selector"><div className="context-choices" role="group" aria-label={label}>{choices.map((choice, index) => <button type="button" key={choice.title} aria-controls={id} aria-pressed={selected === index} onClick={() => setSelected(index)}><Box size={24} aria-hidden="true"/><span>{choice.title}</span></button>)}</div>{children}<p className="context-detail" id={id} aria-live="polite">{choices[selected].detail}</p></div>;
}
export function ModularConfiguration({ children }: { children: React.ReactNode }) {
  const [pack, setPack] = useState("Phosphating");
  return <div className="modular-configuration"><div className="pack-selector"><label htmlFor="process-pack">Process pack</label><select id="process-pack" value={pack} onChange={event => setPack(event.target.value)}>{["Phosphating", "CED", "Powder coating"].map(option => <option key={option}>{option}</option>)}</select></div><div key={pack} className="configuration-diagram">{children}</div><p className="caption centered" aria-live="polite">{pack} configuration / The common manufacturing core stays the same; process and plant configuration adapt.</p></div>;
}
