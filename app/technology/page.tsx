import type { Metadata } from "next";
import {OperatingPlatform} from "@/components/technology/OperatingPlatform";
import {ProductShowcase} from "@/components/technology/ProductShowcase";
import "../manufacturing/alpha.css";
import {TechnologyConfiguration} from "@/components/brand/TechnologyConfiguration";
import { Hero } from "@/components/brand/Hero";
import { TechnologyHeroArtwork } from "@/components/brand/TechnologyHeroArtwork";
import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
import "./technology.css";
export const metadata: Metadata = { title: "Technology", description: "Execution, context and intelligence connected through the Voltron Lattice architecture." };
export default function TechnologyPage() {
  return <SiteShell><div className="technology-page"><Hero artSide="left" className="technology-hero" principles={["Shared identity","Connected context","Governed action"]} eyebrow="Technology / Voltron Lattice" title="Connected manufacturing, from operation to insight." illustration={<TechnologyHeroArtwork/>} primary="Explore the platform" href="#operating-platform" secondary="Discuss an integration" secondaryHref="/partner#partnership">Bring production, equipment signals and manufacturing knowledge into one connected context.</Hero>
    <Section id="operating-platform"><Intro eyebrow="The connected operation" title="From customer order to dispatch. One connected manufacturing context.">Follow one lot through material, production, investigation, quality and delivery.</Intro><OperatingPlatform/></Section>
    <Section className="technology-architecture-section" id="architecture"><Intro eyebrow="Connected manufacturing" title="One lot. Five connected perspectives.">See how the same manufacturing operation appears across the Voltron platform.</Intro><ProductShowcase/></Section>
    <Section id="configuration"><Intro eyebrow="Modularity" title="A common foundation. Room for different processes.">Shared manufacturing identities and capabilities, configured around each factory’s operations.</Intro><TechnologyConfiguration/></Section>
    <Section><div className="closing"><div><h2>Connect the systems around your manufacturing process.</h2><p>Explore how your equipment, operations and records can work together.</p></div><div className="actions"><Action href="/partner#partnership">Discuss an integration</Action><Action href="/manufacturing" secondary>Explore Voltron Alpha</Action></div></div></Section>
  </div></SiteShell>;
}
