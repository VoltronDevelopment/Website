import {ReplayableStudy} from '@/components/brand/ReplayableStudy';
import type {Metadata} from 'next';
import {Suspense} from 'react';
import {CollaborationHero} from '@/components/brand/CollaborationHero';
import {Hero} from '@/components/brand/Hero';
import {Intro,Section,SiteShell} from '@/components/brand/SiteShell';
import {PartnerFormsSection} from '@/components/home/PartnerFormsSection';
import {CommonsStudy} from '@/components/commons/CommonsStudy';
import '../home-surfaces.css';
import '../supporting-pages.css';
import '../about/voltron-commons/commons.css';
import './partner.css';
export const metadata:Metadata={title:'Partner With Us',description:'Start a production inquiry or explore factory partnerships, platform collaboration and Voltron Commons.'};
export default function PartnerPage(){return <SiteShell><div className="supporting-page partner-page">
 <Hero artSide="left" eyebrow="Partner with us" title="What are you building?" keywords="Programs · Factories · Collaboration" illustration={<CollaborationHero kind="partner"/>} primary="Start a conversation" href="#inquiry" secondary="Explore the opportunities" secondaryHref="#partner-paths"/>
 <Section id="partner-paths"><Intro eyebrow="Where we begin" title="Different opportunities. A shared commitment.">Choose the direction closest to what you are building. Each conversation begins with its own context and requirements.</Intro><ReplayableStudy inline label="partner paths"><CommonsStudy kind="partner-paths"/></ReplayableStudy></Section>
 <Section id="inquiry"><Intro eyebrow="Start a conversation" title="Tell us what you have in mind.">Share what you know today. Optional details can help give the conversation more context.</Intro><Suspense fallback={<p aria-busy="true">Preparing the enquiry form…</p>}><PartnerFormsSection/></Suspense></Section>
 <Section className="partner-contact"><p className="eyebrow">Voltron Lattice</p><h2>Pune, Maharashtra</h2><p>Manufacturing, engineering and connected intelligence.</p></Section>
 </div></SiteShell>;}
