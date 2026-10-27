import type { Metadata } from "next";
import { ChartNoAxesColumnIncreasing, FileCheck2, Cpu } from "lucide-react";
import { ArchitectureExplorer } from "@/components/brand/ArchitectureExplorer";
import {TechnologyConfiguration} from "@/components/brand/TechnologyConfiguration";
import { Hero } from "@/components/brand/Hero";
import { TechnologyHeroArtwork } from "@/components/brand/TechnologyHeroArtwork";
import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
import "./technology.css";
export const metadata: Metadata = { title: "Technology", description: "Execution, context and intelligence connected through the Voltron Lattice architecture." };
export default function TechnologyPage() {
  return <SiteShell><div className="technology-page"><Hero artSide="left" className="technology-hero" principles={["Shared identity","Connected context","Governed action"]} eyebrow="Technology / Voltron Lattice" title="Architecture for connected manufacturing." illustration={<TechnologyHeroArtwork/>} primary="Explore the architecture" href="#architecture" secondary="Discuss an integration" secondaryHref="/partner#partnership">Shared context. Governed intelligence. Physical execution.</Hero>
    <Section className="technology-architecture-section" id="architecture"><Intro title="The Voltron Architecture">We connect physical production, manufacturing knowledge and intelligence into coherent systems, beginning on the shopfloor.</Intro><ArchitectureExplorer/><p className="caption centered">Shared context. Clear responsibilities.</p></Section>
    <Section><Intro title="Built once. Configured for every factory.">Reusable manufacturing logic. Factory-specific execution.</Intro><TechnologyConfiguration/></Section>
    <Section className="technology-responsibilities"><Intro title="Each system retains its responsibility."/><div className="entry-grid">{[
      { title: "Business and production", Icon: ChartNoAxesColumnIncreasing, text: "ERP and planning systems manage business processes, planning and production execution." },
      { title: "Quality and evidence", Icon: FileCheck2, text: "QMS captures evidence, manages quality review and preserves traceability." },
      { title: "Physical control", Icon: Cpu, text: "SCADA provides visibility. PLC and edge systems retain their defined physical control responsibilities." },
    ].map(({ title, Icon, text }) => <div className="entry responsibility" key={title}><Icon size={32} aria-hidden="true"/><div><h3>{title}</h3><p>{text}</p></div></div>)}</div><div className="actions"><Action href="/ontology">Explore the ontology</Action><Action href="/intelligence" secondary>Explore intelligence</Action></div></Section>
  </div></SiteShell>;
}
