import type { Metadata } from "next";
import {NetworkFactoryStory} from "@/components/network/NetworkFactoryStory";
import {NetworkGlobeHero} from "@/components/brand/NetworkGlobeHero";
import { Hero } from "@/components/brand/Hero";
import { Action, Section, SiteShell } from "@/components/brand/SiteShell";
import './network.css';
export const metadata: Metadata = { title: "Network", description: "One architecture and multiple paths to scale, through directly operated plants and future factory partnerships." };
export default function NetworkPage() {
  return <SiteShell><div className="network-page"><Hero principles={["Plants","Partnerships","Shared architecture"]} eyebrow="Network / Voltron Lattice" title="Built to connect. Designed to grow." illustration={<NetworkGlobeHero/>} primary="Explore the network" href="#owned-plants" secondary="Discuss a partnership" secondaryHref="/partner#partnership">One manufacturing foundation. Multiple paths to scale.</Hero>
    <div className="container network-story">{(["owned","partnership","learning","products"] as const).map(kind=><NetworkFactoryStory key={kind} kind={kind}/>)}</div>
    <Section><div className="closing"><div><h2>Build the next capability with us.</h2><p>Proven capability grows through engineering discipline and the people who carry it. Bring a factory opportunity or explore how we work.</p></div><div className="actions"><Action href="/partner#partnership">Discuss a partnership</Action><Action href="/about#approach" secondary>Meet the company behind it</Action></div></div></Section>
  </div></SiteShell>;
}
