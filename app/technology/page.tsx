import type { Metadata } from "next";
import { ChartNoAxesColumnIncreasing, FileCheck2, Cpu } from "lucide-react";
import { BrandArt } from "@/components/brand/BrandArt";
import { ArchitectureExplorer } from "@/components/brand/ArchitectureExplorer";
import { ModularConfiguration } from "@/components/brand/ContextSelector";
import { Hero } from "@/components/brand/Hero";
import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
import { artwork as art } from "@/lib/brand-assets";
export const metadata: Metadata = { title: "Technology", description: "Execution, context and intelligence connected through the Voltron Lattice architecture." };
export default function TechnologyPage() {
  return <SiteShell><Hero eyebrow="Technology" title="A factory cannot become intelligent in pieces." art={art.technology} primary="View the architecture" href="#architecture" secondary="Learn about our approach" secondaryHref="/ontology">Execution. Context. Intelligence. Connected.</Hero>
    <Section white id="architecture"><Intro title="The Voltron Architecture">We connect physical production, manufacturing knowledge and intelligence into coherent systems, beginning on the shopfloor.</Intro><ArchitectureExplorer><BrandArt family={art.architecture} className="architecture-art"/></ArchitectureExplorer><p className="caption centered">Shared context. Clear responsibilities.</p></Section>
    <Section><Intro title="Built once. Configured for every factory.">Reusable manufacturing logic. Factory-specific execution.</Intro><ModularConfiguration><div className="modular-grid">{[
      ["Voltron Core", art.core, "Common data model, services and runtime."], ["Capability Modules", art.capabilities, "Domain capabilities such as quality, maintenance and traceability."], ["Process Packs", art.packs, "Manufacturing logic for specific processes, such as coating or assembly."], ["Plant Configuration", art.plant, "Factory-specific configuration and integration."], ["Voltron AI", art.ai, "Context-aware intelligence for manufacturing."],
    ].map(([title, family, text]) => <div className="modular-entry" key={title}><h3>{title}</h3><BrandArt family={family} className="modular-art"/><p>{text}</p></div>)}</div></ModularConfiguration></Section>
    <Section white><Intro title="Each system retains its responsibility."/><div className="entry-grid">{[
      { title: "Business and production", Icon: ChartNoAxesColumnIncreasing, text: "ERP and planning systems manage business processes, planning and production execution." },
      { title: "Quality and evidence", Icon: FileCheck2, text: "QMS captures evidence, manages quality review and preserves traceability." },
      { title: "Physical control", Icon: Cpu, text: "SCADA provides visibility. PLC and edge systems retain their defined physical control responsibilities." },
    ].map(({ title, Icon, text }) => <div className="entry responsibility" key={title}><Icon size={32} aria-hidden="true"/><div><h3>{title}</h3><p>{text}</p></div></div>)}</div><div className="actions"><Action href="/ontology">Explore the ontology</Action><Action href="/intelligence" secondary>Explore intelligence</Action></div></Section>
  </SiteShell>;
}
