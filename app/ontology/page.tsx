import type { Metadata } from "next";
import { BrandArt } from "@/components/brand/BrandArt";
import { Hero } from "@/components/brand/Hero";
import { ProcessFlow } from "@/components/brand/ProcessFlow";
import { ContextSelector } from "@/components/brand/ContextSelector";
import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
import { artwork as art } from "@/lib/brand-assets";
export const metadata: Metadata = { title: "Manufacturing Ontology", description: "One manufacturing reality, connected by meaning. Identity, relationships and accountable action." };
export default function OntologyPage() {
  return <SiteShell><Hero eyebrow="V-MO / Manufacturing Ontology" title="One manufacturing reality. Connected by meaning." art="O01-ontology-hero">A reading, an inspection and a requirement become more useful when they belong to the same manufacturing situation.</Hero>
    <Section white><ProcessFlow/></Section>
    <Section white><div className="split ontology-split"><div><Intro title="Give each thing its identity.">Know which plant, part, lot, operation or machine a record describes.</Intro><BrandArt family={art.identity} className="split-art"/><div className="relationship-labels">{["Plant", "Part", "Lot", "Operation", "Machine"].map(word => <span key={word}>{word}</span>)}</div></div><div><Intro title="Connect what matters.">Link requirements, process, equipment, inspection and evidence.</Intro><BrandArt family={art.relationships} className="split-art"/><div className="relationship-labels">{["Requirements", "Processes", "Equipment", "Inspection", "Evidence"].map(word => <span key={word}>{word}</span>)}</div></div></div></Section>
    <Section><Intro title="Relationships in context." centered/><ContextSelector label="Manufacturing relationship focus" choices={[
      { title: "Lot", detail: "A lot connects its part, process history, equipment, requirements and evidence. Its identity persists as work progresses." },
      { title: "Equipment", detail: "Equipment records relate to the operations, conditions and lots they actually affected." },
      { title: "Evidence", detail: "Evidence retains the requirement, subject and manufacturing situation it supports." },
    ]}/></Section>
    <Section><Intro title="Preserve authority. Make action accountable." centered/><div className="split authority-copy"><div className="split-copy"><h3>A shared understanding of the manufacturing situation.</h3><p>Shared meaning helps people review decisions in context and trace how they were made.</p></div><div className="split-copy"><h3>Clear responsibilities at every stage.</h3><p>Each action is recorded with its context, identity and evidence, enabling accountable execution.</p></div></div><ProcessFlow label="Accountable action" stages={[
      { title: "Request", record: "Change request", detail: "Record what is proposed and the manufacturing situation it affects." },
      { title: "Review", record: "Impact and feasibility", detail: "The responsible people assess the evidence, implications and limits." },
      { title: "Commit", record: "Approved context", detail: "The authorised decision establishes the permitted scope of action." },
      { title: "Verify", record: "Execution evidence", detail: "Evidence confirms what happened and connects it to the approved context." },
    ]}/></Section><Section white><div className="closing"><div><h2>Shared meaning. Distinct responsibilities.</h2><p>Validated learning becomes reusable capability across a shared manufacturing architecture.</p></div><Action href="/technology">Explore the architecture</Action></div></Section>
  </SiteShell>;
}
