import type { Metadata } from "next";
import { Box, FileText, ScanSearch } from "lucide-react";
import { BrandArt } from "@/components/brand/BrandArt";
import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
import { AlphaLineExperience } from "@/components/manufacturing/AlphaLineExperience";
import "./alpha.css";

export const metadata: Metadata = { title: "Manufacturing / Voltron Alpha", description: "Follow one lot through Alpha’s illustrative 13-tank square-U treatment line, with execution, manufacturing context and evidence connected to each operation." };
export default function ManufacturingPage() {
  return <SiteShell><div className="alpha-page">
    <header className="alpha-intro alpha-container"><p className="eyebrow">Surface treatment / Alpha</p><h1>Voltron Alpha.<span>Where the architecture meets production.</span></h1><p>Follow a lot through the plant—and discover the context behind each operation.</p></header>
    <section id="explore-alpha" className="alpha-explore alpha-container" aria-label="Explore the Alpha treatment line"><AlphaLineExperience/></section>
    <section className="alpha-architecture alpha-container" aria-labelledby="alpha-architecture-title"><h2 id="alpha-architecture-title">One lot. A connected manufacturing story.</h2><div className="alpha-architecture-grid">
      <div><Box size={28} aria-hidden="true"/><div><h3>Execution</h3><p>The physical process, equipment and current operation.</p></div></div>
      <div><FileText size={28} aria-hidden="true"/><div><h3>Context</h3><p>The requirements, records and evidence belonging to this lot.</p></div></div>
      <div><ScanSearch size={28} aria-hidden="true"/><div><h3>Intelligence</h3><p>An investigation grounded in that evidence, ready for human review.</p></div></div>
    </div></section>
    <Section className="alpha-validation"><Intro eyebrow="What Alpha validates" title="Production reality sharpens the architecture." centered>Alpha is the proving ground for connected manufacturing. These are the disciplines being developed and evaluated.</Intro><div className="entry-grid four">{[
      { title: "Process consistency", text: "Connect each operation to its configured route, recipe and operating requirements." },
      { title: "Traceability", text: "Keep lot identity and process history connected across the complete journey." },
      { title: "Quality discipline", text: "Keep inspection evidence and authorised release distinct from physical completion." },
      { title: "Operating economics", text: "Build the context needed to understand variation, resource use and production constraints." },
    ].map(item => <div className="entry" key={item.title}><h3>{item.title}</h3><p>{item.text}</p></div>)}</div></Section>
    <Section white><Intro title="Surface treatment. A demanding foundation." centered>Process scope and readiness are confirmed against each production inquiry.</Intro><div className="entry-grid">{[
      { title: "Phosphating", text: "Prepares the surface for subsequent processing with a uniform, stable conversion layer.", family: "M02-phosphating" },
      { title: "CED", text: "Applies a uniform, corrosion-resistant coating through electrophoretic deposition.", family: "M02-ced" },
      { title: "Powder Coating", text: "A separate finishing capability, included only when the confirmed production route calls for it.", family: "M02-powder-coating" },
    ].map(({ title, text, family }) => <div className="entry process-entry" key={title}><BrandArt family={family} className="process-art"/><h3>{title}</h3><p>{text}</p></div>)}</div></Section>
    <Section><div className="closing"><div><h2>Tell us what the part needs to achieve.</h2><p>Share the process, requirements, volume and timing for your production program.</p></div><Action href="/partner#production">Start a production inquiry</Action></div></Section>
  </div></SiteShell>;
}
