import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { BrandArt } from "@/components/brand/BrandArt";
import {EngineeredHero} from "@/components/brand/EngineeredHero";
import { Hero } from "@/components/brand/Hero";
import { ContextSelector } from "@/components/brand/ContextSelector";
import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
import { artwork as art } from "@/lib/brand-assets";
export const metadata: Metadata = { title: "About Voltron Lattice", description: "An industrial systems company connecting physical production, manufacturing knowledge, digital architecture and human judgment." };
export default function AboutPage() {
  return <SiteShell><Hero principles={["Physical production","Manufacturing knowledge","Human progress"]} eyebrow="About" title="Technology should deepen human progress." illustration={<EngineeredHero kind="about"/>}>Voltron Lattice is building an industrial systems company around physical production, manufacturing knowledge, digital architecture and human judgment.</Hero>
    <Section white><Intro eyebrow="Our direction" title="Manufacturing is our first application.">We connect physical production, manufacturing knowledge and intelligence through one architecture, beginning on the shopfloor.</Intro><div className="entry-grid">{[
      ["Physical production", art.execution, "The real economy. On the shopfloor."], ["Manufacturing knowledge", art.context, "Domain expertise. Captured and structured."], ["Intelligence", art.intelligence, "Connected systems. Better decisions."],
    ].map(([title, family, text]) => <div className="entry capability-entry" key={title}><BrandArt family={family} className="entry-art"/><h3>{title}</h3><p>{text}</p></div>)}</div></Section>
    <Section><div className="split"><div className="split-copy"><p className="eyebrow">Our people</p><h2>Individual excellence.<br/>Aligned to the whole.</h2><p>Each individual strengthens the whole. The whole creates room for individual growth.</p></div><div><BrandArt family="A03-people-lattice" className="split-art" crop/><ContextSelector label="Connected disciplines" choices={[
      { title: "Engineering", detail: "Process and plant engineering connect physical requirements with dependable execution." },
      { title: "Operations", detail: "Operating experience brings the realities of the floor into the shared system." },
      { title: "Technology", detail: "Digital architecture makes manufacturing context usable across disciplines." },
    ]}/></div></div></Section>
    <Section white><Intro eyebrow="Leadership" title="Leadership"/><div className="leadership-grid"><div className="leadership-entry"><h3>Omkar Todkar / Founder &amp; CEO</h3><p>IIT Madras / B.Tech + M.Tech</p><a href="https://www.linkedin.com/in/omkar-todkar-65982a73/" target="_blank" rel="noopener noreferrer"><ExternalLink size={18} aria-hidden="true"/>LinkedIn<span className="sr-only"> (opens in a new tab)</span></a></div><div className="leadership-entry"><h3>Chief Operating Officer</h3><p>Profile coming soon</p></div><div className="leadership-entry"><h3>Chief Technology Officer</h3><p>Profile coming soon</p></div></div></Section>
    <Section><Intro eyebrow="Explore more" title="Two parts of a larger whole.">Our people and our shared knowledge ecosystem extend the company&apos;s mission.</Intro><div className="preview-grid"><article className="page-preview"><BrandArt family="A05-people-culture" className="preview-art"/><h3>People Culture</h3><p>Building the human who builds the system.</p><Action href="/about/people-culture" text>Explore our culture</Action></article><article className="page-preview"><BrandArt family="A05-voltron-commons" className="preview-art"/><h3>Voltron Commons</h3><p>Access, learning and possibility beyond the company.</p><Action href="/about/voltron-commons" text>Explore Voltron Commons</Action></article></div></Section>
  </SiteShell>;
}
