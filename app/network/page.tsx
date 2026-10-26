import type { Metadata } from "next";
import { BrandArt } from "@/components/brand/BrandArt";
import {NetworkGlobeHero} from "@/components/brand/NetworkGlobeHero";
import { Hero } from "@/components/brand/Hero";
import { ProcessFlow } from "@/components/brand/ProcessFlow";
import { NetworkConnections } from "@/components/brand/NetworkConnections";
import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
export const metadata: Metadata = { title: "Network", description: "One architecture and multiple paths to scale, through directly operated plants and future factory partnerships." };
export default function NetworkPage() {
  return <SiteShell><Hero principles={["Plants","Partnerships","Shared architecture"]} eyebrow="Network / Voltron Lattice" title="Built to connect. Designed to grow." illustration={<NetworkGlobeHero/>} primary="Explore the network" href="#owned-plants">One manufacturing foundation. Multiple paths to scale.</Hero>
    <Section white id="owned-plants"><div className="split authority-copy"><Intro eyebrow="Voltron-owned plants" title="Build, operate and learn in direct manufacturing environments."/><p>We establish and run our own plants to develop and validate the Voltron architecture. Each plant becomes a source of operational data, process knowledge and reusable capability.</p></div><ProcessFlow label="Owned manufacturing environments" stages={[
      { title: "Build", record: "Design and set up the plant", detail: "Bring the process, equipment and manufacturing architecture together." },
      { title: "Operate", record: "Run connected production", detail: "Use connected systems within the plant's defined operating responsibilities." },
      { title: "Learn", record: "Capture process and quality intelligence", detail: "Identify what the operating evidence teaches about the manufacturing situation." },
      { title: "Improve", record: "Enhance performance", detail: "Validate improvements before turning learning into reusable capability." },
    ]}/></Section>
    <Section><div className="split"><div className="split-copy"><p className="eyebrow">Factory JVs / A path to scale</p><h2>Joint ventures to scale the network.</h2><p>We work with strategic partners to explore new factories using the Voltron architecture, combining local strengths with our manufacturing knowledge and intelligence.</p><p className="caption">Future partnerships, developed against a specific opportunity.</p></div><div className="two-lists">{[
      { title: "Partner brings", items: [["Capital", "Investment for factory setup and operations."], ["Assets", "Land, existing infrastructure or facilities."], ["Market access", "Customer relationships and local market knowledge."]] },
      { title: "Voltron brings", items: [["Technology", "V-MO and manufacturing intelligence."], ["Engineering", "Factory design and process engineering."], ["Automation", "Connected systems and data architecture."], ["Operations", "Operational know-how and continuous improvement."]] },
    ].map(group => <div key={group.title}><h3>{group.title}</h3><ul className="plain-list">{group.items.map(([title, text]) => <li key={title}><strong>{title}</strong><p>{text}</p></li>)}</ul></div>)}</div></div></Section>
    <Section white><div className="split"><div className="split-copy"><h2>A network that compounds.</h2><p>Validated learning becomes reusable capability. Plant and customer information remains governed within its permitted context.</p></div><NetworkConnections/></div></Section>
    <Section><div className="split"><div className="split-copy"><h2>Industrial products. A separate development direction.</h2><p>Recurring industrial problems can inform proprietary product development alongside manufacturing expansion.</p><Action href="/partner#partnership" text>Discuss a factory partnership</Action></div><div><BrandArt family="N05-industrial-products" className="split-art" crop/><p className="caption centered">Industrial products / Future direction</p></div></div></Section>
  </SiteShell>;
}
