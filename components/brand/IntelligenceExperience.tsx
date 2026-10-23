"use client";
import { useState } from "react";
import { Activity, Award, CheckCircle2, FileSearch, FileText, FlaskConical, Gauge, GitBranch, Search, Settings2, ShieldCheck, UserRound, Wrench } from "lucide-react";
import { Cube, ProcessFlow } from "./ProcessFlow";
import { EvidenceConnections } from "./EvidenceConnections";
const sources = [
  { title: "SCADA evidence", icon: Activity, detail: "Process readings and timestamps are associated with the equipment and lot that produced them." },
  { title: "Inspection", icon: FileSearch, detail: "Inspection results retain their requirements, method and inspection context." },
  { title: "Calibration", icon: Gauge, detail: "Measurement evidence can be considered alongside the instrument's calibration record." },
  { title: "NCR & CAPA", icon: ShieldCheck, detail: "Nonconformances and corrective actions stay connected to the affected manufacturing situation." },
  { title: "PDF & Excel", icon: FileText, detail: "Existing documents can contribute evidence without becoming a separate source of manufacturing meaning." },
  { title: "Lab report", icon: FlaskConical, detail: "Lab findings are linked to the sample, part and lot they describe." },
  { title: "Certificate", icon: Award, detail: "Certificates remain attributable to their issuer, scope and relevant lot." },
  { title: "Manual input", icon: UserRound, detail: "Human observations carry their author, time and context." },
];
export function EvidenceComposer() {
  const [selected, setSelected] = useState(0);
  const sourceButtons = (start: number, end: number) => <div className="evidence-sources">{sources.slice(start, end).map((source, index) => { const Icon = source.icon; return <button key={source.title} type="button" aria-pressed={selected === start + index} onClick={() => setSelected(start + index)}><Icon size={22} aria-hidden="true"/>{source.title}</button>; })}</div>;
  return <><div className="evidence-layout"><EvidenceConnections selected={selected}/>{sourceButtons(0, 4)}<div className="evidence-core"><Cube active/><h3>Part + Lot Context</h3><p>Quality evidence, connected.</p></div>{sourceButtons(4, 8)}</div><p className="evidence-detail" aria-live="polite">{sources[selected].detail}</p><p className="caption centered">Smart at the core. Compatible at the edges.</p></>;
}
const agents = [
  { name: "KAVO", role: "Operator", icon: UserRound, text: "Helps operators with work instructions, checks and next steps.", example: "Which checks apply before this lot can enter the next operation?" },
  { name: "RIXA", role: "Quality", icon: Search, text: "Supports quality review with context, evidence and applicable standards.", example: "Which inspection results support this lot's quality review?" },
  { name: "MEKO", role: "Maintenance", icon: Wrench, text: "Provides maintenance knowledge and troubleshooting support.", example: "What equipment history is relevant to this recurring fault?" },
  { name: "ZILO", role: "Process", icon: Settings2, text: "Explains process intent, changes and their impact on quality.", example: "What changed in the process conditions between these two lots?" },
  { name: "SARO", role: "Evidence", icon: FileText, text: "Finds and organises relevant evidence across connected systems.", example: "Bring together the process history, inspection and certificate for this lot." },
  { name: "TEYO", role: "Fault Investigation", icon: GitBranch, text: "Helps investigate issues with structured analysis and evidence gathering.", example: "What evidence would help distinguish the possible causes of this defect?" },
];
export function SpecialistAgents() {
  const [selected, setSelected] = useState(0);
  return <><div className="agent-grid">{agents.map((agent, index) => { const Icon = agent.icon; return <button type="button" className="agent-button" key={agent.name} aria-pressed={selected === index} onClick={() => setSelected(index)}><Icon size={32} aria-hidden="true"/><span><strong>{agent.name}</strong>{agent.role}<p>{agent.text}</p></span></button>; })}</div><div className="agent-selection" aria-live="polite"><p className="eyebrow">{agents[selected].name} / Example question</p><p>{agents[selected].example}</p></div></>;
}
export function HumanReview() {
  const [reviewed, setReviewed] = useState(false);
  return <><ProcessFlow label="Evidence-led decision making" stages={[{ title: "Evidence", record: "Collect and organise", detail: "Relevant information is gathered from connected sources with its provenance intact." }, { title: "Investigation", record: "Context and expertise", detail: "AI surfaces options and supporting evidence. It does not grant itself authority to act." }, { title: "Human review", record: "Judgment and decision", detail: "The responsible person reviews the evidence and decides what is appropriate for the situation." }]}/><div className="review-demo"><p>{reviewed ? "Human review recorded in this illustration. No plant command or production approval has been issued." : "Illustrative review: the recommendation remains pending until a person reviews it."}</p><button className="button button-outline" type="button" onClick={() => setReviewed(!reviewed)}><CheckCircle2 size={18} aria-hidden="true"/>{reviewed ? "Reset illustration" : "Record illustrative review"}</button></div></>;
}
