import type { Metadata } from "next";
import { Hero } from "@/components/brand/Hero";
import { IntelligenceHeroArtwork } from "@/components/brand/IntelligenceHeroArtwork";
import {EvidenceStory,SpecialistStory,CollaborationStory,WorkAndReview} from '@/components/intelligence/IntelligenceStory';
import {InvestigationProvider} from '@/components/intelligence/InvestigationSimulation';
import {FluidCubeStudy} from '@/components/intelligence/FluidCubeStudy';
import { Action, Intro, Section, SiteShell } from "@/components/brand/SiteShell";
import './intelligence.css';
import '@/components/intelligence/intelligence-story.css';
export const metadata: Metadata = { title: "Manufacturing Intelligence", description: "Quality evidence, specialist assistance and human judgment connected to the manufacturing situation." };
export default async function IntelligencePage({searchParams}:{searchParams:Promise<{study?:string}>}) {
  if((await searchParams).study==='fluid-cube')return <SiteShell><div className="intelligence-page"><Section><h1 className="eyebrow">Intelligence / Fluid cube preview</h1><FluidCubeStudy/></Section></div></SiteShell>;
  return <SiteShell><InvestigationProvider><div className="intelligence-page"><div className="intelligence-intro"><Hero className="intelligence-sculpture-hero" principles={["Manufacturing context","Evidence-led reasoning","Human authority"]} eyebrow="Voltron Lattice / Intelligence" title="Intelligence for the manufacturing situation." illustration={<IntelligenceHeroArtwork/>} primary="Follow an investigation" href="#quality" secondary="Meet the specialists" secondaryHref="#specialists">Connect process history, equipment condition and quality evidence—so people can investigate with context.</Hero></div>
    <Section id="quality"><Intro eyebrow="01 / Connected evidence" title="Every observation belongs to a manufacturing story.">Follow the same coating lot from Technology. A recorded condition becomes an investigation with its context intact.</Intro><EvidenceStory/></Section>
    <Section id="specialists"><Intro eyebrow="02 / Specialist agents" title="Different expertise. One shared manufacturing context.">Six perspectives, each with a distinct role in understanding the work.</Intro><SpecialistStory/></Section>
    <Section id="investigation"><Intro eyebrow="03 / Working together" title="One situation. Different perspectives. Connected evidence.">Process and equipment history can be examined in parallel, with the evidence retained through each handoff.</Intro><CollaborationStory/></Section>
    <Section id="point-of-work"><Intro eyebrow="04 / Intelligence at the point of work" title="The next step, with its evidence beside it.">Relevant guidance reaches the station as a proposed check, ready for the responsible person to review.</Intro><WorkAndReview/></Section>
    <Section><div className="closing"><div><h2>Intelligence becomes useful when it stays connected to the work.</h2><p>Connect manufacturing context, specialist knowledge and human judgment.</p></div><div className="actions"><Action href="/partner#partnership">Discuss a platform partnership</Action><Action href="/technology#operating-platform" secondary>Explore the connected platform</Action></div></div></Section>
  </div></InvestigationProvider></SiteShell>;
}
