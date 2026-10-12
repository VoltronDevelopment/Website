import type { Metadata } from "next";
import { BrandArt } from "@/components/brand/BrandArt";
import { Hero } from "@/components/brand/Hero";
import { ProcessFlow } from "@/components/brand/ProcessFlow";
import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
export const metadata: Metadata = { title: "Manufacturing / Voltron Alpha", description: "Surface treatment is our first application. Alpha is the proving ground for the wider architecture." };
export default function ManufacturingPage() {
  return <SiteShell><Hero eyebrow="Voltron Alpha" title="The ambition meets the factory floor." art="M01-manufacturing-hero" primary="Explore the manufacturing flow" href="#manufacturing-flow" secondary="Discuss a production program" secondaryHref="/partner#production">Surface treatment is our first application. Alpha is the proving ground for the wider architecture.</Hero>
    <Section white><Intro title="Surface treatment. A demanding foundation." centered>Process scope and readiness are confirmed against each production inquiry.</Intro><div className="entry-grid">{[
      { title: "Phosphating", text: "Prepares the surface for subsequent processing with a uniform, stable conversion layer.", family: "M02-phosphating" },
      { title: "CED", text: "Applies a uniform, corrosion-resistant coating through electrophoretic deposition.", family: "M02-ced" },
      { title: "Powder Coating", text: "Delivers a durable, consistent dry-applied finish with functional and aesthetic options.", family: "M02-powder-coating" },
    ].map(({ title, text, family }) => <div className="entry process-entry" key={title}><BrandArt family={family} className="process-art"/><h3>{title}</h3><p>{text}</p></div>)}</div></Section>
    <Section id="manufacturing-flow"><Intro title="Clear requirements. Controlled execution. Accountable release." centered/><ProcessFlow label="Manufacturing program flow" stages={[
      { title: "Define", record: "Part, application and goals", detail: "Understand what the part needs to achieve before choosing the manufacturing route." },
      { title: "Plan", record: "Process and operating window", detail: "Select the process, materials and permitted operating conditions." },
      { title: "Execute", record: "Controlled production", detail: "Run the program with connected process and equipment context." },
      { title: "Verify", record: "Quality against requirements", detail: "Review relevant inspection evidence against the agreed requirements." },
      { title: "Release", record: "Complete manufacturing record", detail: "The authorised person approves release and handover with a complete record." },
    ]}/></Section>
    <Section white><Intro title="Real operating conditions sharpen the system." centered>Production reality feeds our models, improving consistency over time.</Intro><div className="entry-grid four">{[
      { title: "Process variation", family: "M04-process-variation", text: "Material, geometry and batch differences are part of everyday production." },
      { title: "Equipment constraints", family: "M04-equipment-constraints", text: "Real equipment behaviour and operating limits inform the system." },
      { title: "Quality evidence", family: "M04-quality-evidence", text: "In-process and final checks create verifiable records linked to each lot." },
      { title: "Human decisions", family: "M04-human-decisions", text: "Operator expertise and judgment are captured as part of the process." },
    ].map(({ title, family, text }) => <div className="entry process-entry" key={title}><BrandArt family={family} className="entry-art"/><h3>{title}</h3><p>{text}</p></div>)}</div></Section>
    <Section><div className="closing"><div><h2>Tell us what the part needs to achieve.</h2><p>Share the process, requirements, volume and timing for your production program.</p></div><Action href="/partner#production">Start a production inquiry</Action></div></Section>
  </SiteShell>;
}
