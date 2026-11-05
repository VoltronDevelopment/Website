import type { Metadata } from "next";
import { Action, Section, SiteShell } from "@/components/brand/SiteShell";
import { ManufacturingStory } from "@/components/manufacturing/ManufacturingStory";
import {EngineeredHero} from "@/components/brand/EngineeredHero";
import { Hero } from "@/components/brand/Hero";
import "./alpha.css";

export const metadata: Metadata = { title: "Manufacturing / Voltron Alpha", description: "Follow one lot through Alpha’s illustrative 13-tank square-U treatment line, with execution, manufacturing context and evidence connected to each operation." };
export default function ManufacturingPage() {
  return <SiteShell><div className="alpha-page">
    <Hero artSide="left" className="alpha-hero" principles={["Surface integrity","Process discipline","Connected evidence"]} eyebrow="Surface treatment / Voltron Alpha" title="Where architecture meets production." illustration={<EngineeredHero kind="manufacturing"/>} primary="Explore Voltron Alpha" href="#explore-alpha" secondary="Discuss a requirement" secondaryHref="/partner#production">Voltron Alpha is the physical foundation for the connected operation and investigation. Explore how process discipline becomes dependable evidence.</Hero>
    <ManufacturingStory/>
    <Section><div className="closing"><div><h2>Tell us what the part needs to achieve.</h2><p>Alpha is the starting point. Proven methods can become reusable capability across future plants; each production inquiry begins with its own requirements.</p></div><div className="actions"><Action href="/partner#production">Start a production inquiry</Action><Action href="/network" secondary>See how capability grows</Action></div></div></Section>
  </div></SiteShell>;
}
