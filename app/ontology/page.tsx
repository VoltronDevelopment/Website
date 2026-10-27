import type { Metadata } from "next";
import { EngineeredHero } from "@/components/brand/EngineeredHero";
import { Hero } from "@/components/brand/Hero";
import { OntologyRelationships } from "@/components/brand/OntologyRelationships";
import { AccountableAction } from "@/components/brand/AccountableAction";
import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
import "../supporting-pages.css";
export const metadata: Metadata = { title: "Manufacturing Ontology", description: "One manufacturing reality, connected by meaning. Identity, relationships and accountable action." };
export default function OntologyPage() {
  return <SiteShell><div className="supporting-page ontology-page">
    <Hero artSide="left" principles={["Shared identity","Meaningful relationships","Accountable action"]} eyebrow="V-MO / Manufacturing Ontology" title="One manufacturing reality. Connected by meaning." illustration={<EngineeredHero kind="ontology"/>} primary="Explore the relationships" href="#relationships" secondary="Discuss an integration" secondaryHref="/partner?interest=platform#partnership">A reading, an inspection and a requirement become more useful when they belong to the same manufacturing situation.</Hero>
    <Section id="relationships"><Intro eyebrow="Identity and relationships" title="Give each thing its identity. Connect what matters.">Know which plant, part, lot, operation or machine a record describes. Link requirements, process, equipment, inspection and evidence without losing their distinct responsibilities.</Intro><OntologyRelationships/></Section>
    <Section><Intro title="Preserve authority. Make action accountable.">Shared meaning helps people review decisions in context and trace how they were made. Each action retains its context, identity and evidence.</Intro><AccountableAction/></Section>
    <Section><div className="closing"><div><h2>Shared meaning. Distinct responsibilities.</h2><p>Validated learning becomes reusable capability across a shared manufacturing architecture.</p></div><Action href="/technology">Explore the architecture</Action></div></Section>
  </div></SiteShell>;
}
