import type { Metadata } from "next";
import { BookOpen, GraduationCap, Leaf, Lightbulb, Network, Sprout, UsersRound, Wrench } from "lucide-react";
import { BrandArt } from "@/components/brand/BrandArt";
import { Hero } from "@/components/brand/Hero";
import { HumanHeroArtwork } from "@/components/brand/HumanHeroArtwork";
import { Cube } from "@/components/brand/ProcessFlow";
import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
import "../../supporting-pages.css";
export const metadata: Metadata = { title: "Voltron Commons", description: "A developing direction for access, learning and possibility beyond the company." };
export default function CommonsPage() {
  return <SiteShell><div className="supporting-page commons-page"><Hero principles={["Access", "Learning", "Possibility"]} className="human-story-hero" breadcrumb="Voltron Commons" eyebrow="Voltron Commons" title="Human progress should deepen alongside technological progress." illustration={<HumanHeroArtwork kind="commons"/>} primary="Explore a collaboration" href="/partner?interest=commons#partnership" secondary="Learn more" secondaryHref="#commons-directions">A developing direction for opening pathways to access, learning and possibility beyond the company.</Hero>
    <Section white id="commons-directions"><Intro title="Give access. Build agency." centered/><div className="commons-programs">{[
      { title: "Access", Icon: BookOpen, detail: "Explore ways to make knowledge, tools and learning opportunities more accessible." },
      { title: "Apprenticeships", Icon: Wrench, detail: "Develop practical capability through guided experience alongside skilled people." },
      { title: "Fellowships", Icon: GraduationCap, detail: "Create room for focused inquiry across manufacturing, technology and human progress." },
      { title: "Residencies", Icon: UsersRound, detail: "Bring different disciplines into sustained exchange with industrial practice." },
      { title: "Regeneration", Icon: Sprout, detail: "Explore how industry can support ecological renewal and stronger communities." },
    ].map(({title,Icon,detail}) => <details key={title}><summary><Icon size={28} aria-hidden="true"/>{title}</summary><p>{detail}</p></details>)}</div><p className="caption centered">Developing program directions. Concrete programs will take shape as Voltron grows.</p></Section>
    <Section><div className="split"><div className="split-copy"><h2>Learning beyond a single discipline.</h2><p>We value creative exchange, systems thinking, inquiry and time in nature and reflection, as essential to a more capable and humane manufacturing future.</p></div><BrandArt family="C03-learning-nature" className="split-art" crop/></div><div className="entry-grid four commons-values">{[
      { title: "Creative exchange", Icon: UsersRound, text: "Ideas across disciplines enrich what we build." }, { title: "Systems thinking", Icon: Network, text: "A broader view helps create lasting value." }, { title: "Inquiry", Icon: Lightbulb, text: "Curiosity opens new possibilities." }, { title: "Nature and reflection", Icon: Leaf, text: "Perspective strengthens judgment." },
    ].map(({ title, Icon, text }) => <div className="entry process-entry" key={title}><Icon size={32} aria-hidden="true"/><h3>{title}</h3><p>{text}</p></div>)}</div></Section>
    <Section white><div className="split"><div className="split-copy"><h2>From intention to participation.</h2><p>Concrete programs and collaborations will develop as Voltron grows.</p><Action href="/partner?interest=commons#partnership">Explore a collaboration</Action></div><BrandArt family="C04-participation" className="split-art" crop/></div></Section>
  </div></SiteShell>;
}
