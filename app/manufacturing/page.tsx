import type { Metadata } from "next";
import { Action, Section, SiteShell } from "@/components/brand/SiteShell";
import { ManufacturingStory } from "@/components/manufacturing/ManufacturingStory";
import {EngineeredHero} from "@/components/brand/EngineeredHero";
import { Hero } from "@/components/brand/Hero";
import "./alpha.css";

export const metadata: Metadata = { title: "Manufacturing / Voltron Alpha", description: "Follow one lot through Alpha’s illustrative 13-tank square-U treatment line, with execution, manufacturing context and evidence connected to each operation." };
export default function ManufacturingPage() {
  return <SiteShell><div className="alpha-page">
    <Hero artSide="left" className="alpha-hero" principles={["Surface integrity","Process discipline","Connected evidence"]} eyebrow="Surface treatment / Voltron Alpha" title="Where architecture meets production." illustration={<EngineeredHero kind="manufacturing"/>} primary="Explore Voltron Alpha" href="#explore-alpha" secondary="Discuss a requirement" secondaryHref="/partner#production">Engineered surfaces. Connected manufacturing.</Hero>
    <ManufacturingStory/>
    <Section><div className="closing"><div><h2>Tell us what the part needs to achieve.</h2><p>Share the process, requirements, volume and timing for your production program.</p></div><Action href="/partner#production">Start a production inquiry</Action></div></Section>
  </div></SiteShell>;
}
