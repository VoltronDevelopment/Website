import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
import { HomeHeroArtwork } from "@/components/home/HomeHeroArtwork";
import { FactorySystems, HomeLotFlow, PhilosophyScene } from "@/components/home/HomeScenes";
import "./home.css";

export default function HomePage() {
  return <SiteShell presentation><div className="home-page">
    <section className="hero home-hero" aria-labelledby="home-title">
      <div className="container hero-grid"><div className="hero-copy"><p className="eyebrow">Voltron Lattice</p><h1 id="home-title">Building India&apos;s Intelligent Manufacturing Backbone.</h1><p>Human ingenuity. Connected intelligence. Shared progress.</p></div><HomeHeroArtwork/></div>
      <div className="home-principles"><div className="container">{["Repeatable","Measurable","Traceable","Scalable","Intelligent"].map(word=><span key={word}>{word}</span>)}</div></div>
    </section>
    <Section white className="home-systems-section" id="factory-systems"><Intro title="The factory is becoming a system.">Physical execution, manufacturing context and intelligence work together.</Intro><FactorySystems/><div className="actions centered-actions"><Action href="/technology" text>Explore the architecture</Action></div></Section>
    <Section className="home-lot-section" id="connected-lot"><Intro title="One lot. A connected manufacturing story." centered/><HomeLotFlow/></Section>
    <Section white className="home-alpha-section" id="voltron-alpha"><div className="home-alpha"><div className="split-copy"><p className="eyebrow">Surface treatment / Voltron Alpha</p><h2>The ambition meets<br/>the factory floor.</h2><p>Our first manufacturing environment for developing and validating the wider architecture.</p><Action href="/manufacturing" text>Explore manufacturing</Action></div></div></Section>
    <Section className="home-philosophy" id="philosophy"><div className="home-philosophy-content"><p className="eyebrow">The Voltron organizational philosophy</p><h2>Individual excellence.<br/>Aligned to the whole.</h2><PhilosophyScene/><p className="home-philosophy-signature">Distinct perspectives. Shared purpose. Mutual growth.</p><p className="home-philosophy-statement">Each individual strengthens the whole.<br/>The whole creates room for individual growth.</p><Action href="/about/people-culture" text>Explore our culture</Action></div></Section>
  </div></SiteShell>;
}
