import {ReplayableStudy} from '@/components/brand/ReplayableStudy';
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
    <Section className="technology-architecture-section" id="architecture"><Intro eyebrow="Connected manufacturing" title="One lot. Five connected perspectives.">Explore a detailed Alpha example at Tank 06 across five product views. The three-stage overview above illustrates the same platform using a shorter process route.</Intro><ProductShowcase/></Section>
    <Section id="configuration"><Intro eyebrow="Modularity" title="A common foundation. Room for different processes.">Shared manufacturing identities and capabilities, configured around each factory’s operations.</Intro><ReplayableStudy label="configuration"><TechnologyConfiguration/></ReplayableStudy></Section>
    <Section><div className="closing"><div><h2>Connect the systems around your manufacturing process.</h2><p>The same lot now carries the context needed to investigate a condition, with its equipment and quality evidence intact.</p></div><div className="actions"><Action href="/partner#partnership">Discuss an integration</Action><Action href="/intelligence#quality" secondary>Follow the investigation</Action></div></div></Section>
  </div></SiteShell>;
}
