import type { Metadata } from "next";
import { CheckCircle2, Box, Layers, Network } from "lucide-react";
import { BrandArt } from "@/components/brand/BrandArt";
import { Hero } from "@/components/brand/Hero";
import { IntelligenceHeroArtwork } from "@/components/brand/IntelligenceHeroArtwork";
import { EvidenceComposer, HumanReview, SpecialistAgents } from "@/components/brand/IntelligenceExperience";
import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
export const metadata: Metadata = { title: "Manufacturing Intelligence", description: "Quality evidence, specialist assistance and human judgment connected to the manufacturing situation." };
export default function IntelligencePage() {
  return <SiteShell><div className="intelligence-intro"><Hero className="intelligence-sculpture-hero" eyebrow="Voltron Lattice / Intelligence" title="Intelligence for the manufacturing situation." illustration={<IntelligenceHeroArtwork/>} primary="Explore the ontology" href="/ontology">Context, evidence and human judgment. Connected.</Hero><div className="intelligence-principles container">{([{icon:Box,label:"Manufacturing context"},{icon:Layers,label:"Evidence-led reasoning"},{icon:Network,label:"Human authority"}]).map(({icon:Icon,label})=><div key={String(label)}><Icon size={26} aria-hidden="true"/><span>{String(label)}</span></div>)}</div></div>
    <Section white id="quality"><Intro eyebrow="QMS Composition" title="Quality belongs with the manufacturing story." centered/><EvidenceComposer/></Section>
    <Section><Intro eyebrow="Specialist agents for manufacturing" title="Different questions need different expertise." centered/><SpecialistAgents/></Section>
    <Section white><div className="split"><div className="split-copy"><h2>Intelligence at the point of work.</h2><p>Relevant guidance, evidence and permitted actions for each station.</p><ul className="check-list">{["Context from the current part and lot", "Applicable procedures and specifications", "Relevant quality evidence", "Specialist assistance when needed"].map(text => <li key={text}><CheckCircle2 size={18} aria-hidden="true"/>{text}</li>)}</ul></div><BrandArt family="I04-point-of-work" className="split-art" crop/></div></Section>
    <Section><Intro title="AI investigates. Evidence supports. Humans decide." centered/><HumanReview/><div className="actions centered-actions"><Action href="/partner#partnership" secondary>Discuss a platform partnership</Action></div></Section>
  </SiteShell>;
}
