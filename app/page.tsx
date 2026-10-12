import { BrandArt } from "@/components/brand/BrandArt";
import { Hero } from "@/components/brand/Hero";
import { ProcessFlow } from "@/components/brand/ProcessFlow";
import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
import { artwork as art } from "@/lib/brand-assets";

export default function HomePage() {
  return <SiteShell>
    <Hero principles eyebrow="Voltron Lattice" title="Building India's Intelligent Manufacturing Backbone." art={art.home}>Physical production, manufacturing knowledge and intelligence, connected through one architecture.</Hero>
    <Section white><Intro title="The factory is becoming a system.">India&apos;s next factories need physical execution, manufacturing context and intelligence to work together.</Intro><div className="entry-grid">{[
      ["Execution", art.execution, "Physical production on the factory floor."], ["Context", art.context, "Manufacturing knowledge in structured form."], ["Intelligence", art.intelligence, "Actionable insight across the value chain."],
    ].map(([title, family, text]) => <div className="entry capability-entry" key={title}><BrandArt family={family} className="entry-art"/><h3>{title}</h3><p>{text}</p></div>)}</div></Section>
    <Section><Intro title="One lot. A connected manufacturing story." centered/><ProcessFlow/></Section>
    <Section white><div className="split"><div className="split-copy"><p className="eyebrow">Surface treatment / Voltron Alpha</p><h2>The ambition meets the factory floor.</h2><p>Alpha is our first manufacturing environment for developing and validating the wider architecture.</p><Action href="/manufacturing" text>Explore manufacturing</Action></div><div><BrandArt family="M01-manufacturing-hero" className="split-art" crop/><p className="caption centered">Surface treatment / Phosphating / CED / Powder coating</p></div></div></Section>
    <Section><div className="split"><div className="split-copy"><h2>Individual excellence.<br/>Aligned to the whole.</h2><p>Great manufacturing is built by people. We value individuals and channel their strengths into a shared mission.</p><Action href="/about/people-culture" text>Explore our culture</Action></div><BrandArt family="P03-individual-whole" className="split-art" crop/></div></Section>
  </SiteShell>;
}
