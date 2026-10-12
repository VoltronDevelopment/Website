import type { Metadata } from "next";
import { Compass, Heart, Lightbulb, Search, Wrench } from "lucide-react";
import { BrandArt } from "@/components/brand/BrandArt";
import { Hero } from "@/components/brand/Hero";
import { ContextSelector } from "@/components/brand/ContextSelector";
import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
export const metadata: Metadata = { title: "People Culture", description: "Building the human who builds the system. Individual excellence, aligned to the whole." };
export default function CulturePage() {
  return <SiteShell><Hero breadcrumb="People Culture" eyebrow="People Culture" title="Building the human who builds the system." art="P01-people-hero" primary="Build with Voltron" href="/partner?interest=people#partnership" secondary="">Human capability should deepen alongside the technology we build.</Hero>
    <Section white><Intro title="Conditions for growth."/><div className="growth-grid">{[
      { title: "Depth", Icon: Search, text: "Go beyond the surface. Understand problems in context.", example: "Follow a production issue from the part to its process history before proposing a fix." },
      { title: "Craft", Icon: Wrench, text: "Take pride in what we build. Care in the details matters.", example: "Make the work dependable, understandable and useful to the next person." },
      { title: "Courage", Icon: Compass, text: "Ask harder questions. Be willing to challenge assumptions.", example: "Raise a concern when the evidence does not support the easy answer." },
      { title: "Imagination", Icon: Lightbulb, text: "See what could be. Bring new perspectives to real problems.", example: "Connect ideas across disciplines, then test them against production reality." },
      { title: "Humanity", Icon: Heart, text: "Work with respect. Value people and their journeys.", example: "Make space for different backgrounds, questions and ways of learning." },
    ].map(({ title, Icon, text, example }) => <details className="growth-entry" key={title}><summary><Icon size={28} aria-hidden="true"/>{title}</summary><p>{text}</p><p className="growth-example">{example}</p></details>)}</div></Section>
    <Section><div className="split"><div><BrandArt family="P03-individual-whole" className="split-art" crop/><ContextSelector label="Individual and whole" choices={[
      { title: "The individual", detail: "Individual depth, craft and judgment strengthen the wider system without erasing a person's distinct perspective." },
      { title: "The whole", detail: "Shared purpose, practice and support create room for individual growth without overpowering the person." },
    ]}/></div><div className="split-copy"><h2>Individual excellence.<br/>Aligned to the whole.</h2><p>Each individual strengthens the whole. The whole creates room for individual growth.</p></div></div></Section>
    <Section white><div className="split"><div className="split-copy"><h2>Judgment grows through responsibility.</h2><p>Meaningful work, shared practice, feedback and room to question assumptions.</p></div><BrandArt family="P04-responsibility" className="split-art" crop/></div></Section>
    <Section><Intro title="Distinct perspectives. Shared purpose. Mutual growth." centered/><div className="entry-grid">{[
      ["P05-perspectives", "Different backgrounds bring sharper thinking."],
      ["P05-shared-purpose", "Shared purpose turns diversity into strength."],
      ["P05-mutual-growth", "We grow together as individuals and as a whole."],
    ].map(([family, text]) => <div className="entry capability-entry" key={family}><BrandArt family={family} className="entry-art"/><p>{text}</p></div>)}</div><div className="actions centered-actions"><Action href="/partner?interest=people#partnership" secondary>Build with Voltron</Action></div></Section>
  </SiteShell>;
}
