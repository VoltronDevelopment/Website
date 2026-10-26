import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
import { HomeHeroArtwork } from "@/components/home/HomeHeroArtwork";
import { FactorySystems, HomeLotFlow, PhilosophyScene } from "@/components/home/HomeScenes";
import { AlphaProcessScene } from "@/components/home/AlphaProcessScene";
import "./home.css";
import "./home-surfaces.css";
import {HeroPrinciples} from "@/components/brand/HeroPrinciples";
import "@/components/brand/hero-art-direction.css";

export default function HomePage() {
  return <SiteShell presentation><div className="home-page">
    <section className="hero home-hero" aria-labelledby="home-title">
      <div className="container hero-grid"><div className="hero-copy"><p className="eyebrow">Voltron Lattice</p><h1 id="home-title">Building India&apos;s intelligent manufacturing backbone.</h1><p>Human ingenuity. Connected intelligence. Shared progress.</p><div className="hero-actions"><Action href="#factory-systems" secondary>Explore Voltron</Action><Action href="/about" text>Our vision</Action></div></div><HomeHeroArtwork/></div>
      <HeroPrinciples home labels={["Human ingenuity","Connected intelligence","Shared progress"]}/>
    </section>
    <Section white className="home-systems-section" id="factory-systems"><Intro title="One component. A connected manufacturing story.">Physical execution, manufacturing context and intelligence—working together.</Intro><FactorySystems/><div className="actions centered-actions"><Action href="/technology" text>Explore the architecture</Action></div></Section>
    <Section className="home-lot-section" id="connected-lot"><Intro title="One lot. A connected manufacturing story.">The physical journey and its evidence stay connected.</Intro><HomeLotFlow/></Section>
    <Section white className="home-alpha-section" id="voltron-alpha"><div className="home-alpha"><div className="home-alpha-intro"><div className="split-copy"><p className="eyebrow">Surface treatment / Voltron Alpha</p><h2>The ambition meets<br/>the factory floor.</h2><p>Our first manufacturing environment for developing and validating the wider architecture.</p></div><Action href="/manufacturing" text>Explore manufacturing</Action></div><AlphaProcessScene/></div></Section>
    <Section className="home-philosophy" id="philosophy"><div className="home-philosophy-content"><p className="eyebrow">The Voltron organizational philosophy</p><h2>Individual excellence.<br/>Aligned to the whole.</h2><PhilosophyScene/><p className="home-philosophy-signature">Distinct perspectives. Shared purpose. Mutual growth.</p><p className="home-philosophy-statement">Each individual strengthens the whole.<br/>The whole creates room for individual growth.</p><Action href="/about/people-culture" text>Explore our culture</Action></div></Section>
  </div></SiteShell>;
}
