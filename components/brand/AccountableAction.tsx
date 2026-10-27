"use client";
import { useId, useState } from "react";
import { CheckCheck, ClipboardCheck, FileInput, ShieldCheck } from "lucide-react";
import { accountableStages, ontologySubject } from "@/lib/manufacturing-ontology";
const icons = [FileInput, ClipboardCheck, ShieldCheck, CheckCheck];
export function AccountableAction() {
  const [selected, setSelected] = useState(0);
  const id = useId(), stage = accountableStages[selected];
  return <div className="accountable-action"><p className="ontology-instruction">Follow the responsibilities for the same lot. This is an explanation of the workflow, not an approval control.</p>
    <ol aria-label="Accountable action stages">{accountableStages.map((item, index) => {const Icon = icons[index];return <li key={item.title}><button type="button" aria-pressed={index === selected} aria-controls={id} onClick={() => setSelected(index)}><Icon size={26} aria-hidden="true"/><span>{item.title}</span><small>{item.record}</small></button></li>;})}</ol>
    <div id={id} className="accountable-detail" aria-live="polite" aria-atomic="true"><div><p className="eyebrow">Lot {ontologySubject.lot}</p><h3>{stage.title}</h3><p>{stage.detail}</p></div><dl><dt>Responsibility</dt><dd>{stage.owner}</dd><dt>Linked record</dt><dd>{stage.evidence}</dd></dl></div>
  </div>;
}
