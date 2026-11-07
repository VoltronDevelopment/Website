import {ReplayableStudy} from '@/components/brand/ReplayableStudy';
import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
import { HomeHeroArtwork } from "@/components/home/HomeHeroArtwork";
import { HomeLotFlow, PhilosophyScene } from "@/components/home/HomeScenes";
import { AlphaProcessScene } from "@/components/home/AlphaProcessScene";
import "./home.css";
import "./home-surfaces.css";
import "./home-applications.css";
import {ApplicationPreviews} from "@/components/home/ApplicationPreviews";
import {HomeRoadmap} from "@/components/home/HomeRoadmap";
import {HomeMotion} from '@/components/home/HomeMotion';

import "@/components/brand/hero-art-direction.css";

export default function HomePage() {
  return <SiteShell presentation><div className="home-page">
    <section className="hero home-hero keyword-hero" aria-labelledby="home-title">
      <div className="container hero-grid"><div className="hero-copy"><h1 id="home-title" aria-label="Voltron Lattice"><span>VOLTRON</span>{" "}<span>LATTICE</span></h1><p className="hero-keywords">People · Manufacturing · Intelligence</p></div><HomeHeroArtwork/></div>
    </section>
    <Section className="home-systems-section" id="factory-systems"><Intro title="Five applications, one factory">See how the factory plans work, runs equipment, and verifies quality.</Intro><ReplayableStudy label="application views"><ApplicationPreviews/></ReplayableStudy></Section>
    <Section className="home-lot-section" id="connected-lot"><Intro title="Follow one production lot">The physical journey and its evidence stay connected.</Intro><ReplayableStudy inline label="lot journey"><HomeLotFlow/></ReplayableStudy></Section>
    <Section white className="home-alpha-section" id="voltron-alpha"><div className="home-alpha"><div className="home-alpha-intro"><div className="split-copy"><p className="eyebrow">Surface treatment / Voltron Alpha</p><h2>The ambition meets<br/>the factory floor.</h2><p>Our first manufacturing environment for developing and validating the wider architecture.</p></div><Action href="/manufacturing" text>Explore manufacturing</Action></div><ReplayableStudy inline label="surface treatment"><AlphaProcessScene/></ReplayableStudy></div></Section>
    <Section className="home-roadmap-section" id="roadmap"><Intro title="A decade of building capability.">Prove the process. Develop original products. Earn global trust.</Intro><ReplayableStudy inline label="roadmap"><HomeRoadmap/></ReplayableStudy></Section>
    <Section className="home-philosophy" id="philosophy"><div className="home-philosophy-content"><p className="eyebrow">The Voltron organizational philosophy</p><h2>Individual excellence.<br/>Aligned to the whole.</h2><ReplayableStudy label="cube study"><PhilosophyScene/></ReplayableStudy><p className="home-philosophy-statement">Each individual strengthens the whole.<br/>The whole creates room for individual growth.</p><Action href="/about#culture" text>Explore our culture</Action></div></Section>
    <HomeMotion/>
  </div></SiteShell>;
}
