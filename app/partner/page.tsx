import type { Metadata } from "next";
import { Suspense } from "react";
import { CollaborationHero } from "@/components/brand/CollaborationHero";
import { Hero } from "@/components/brand/Hero";
import { Section, SiteShell } from "@/components/brand/SiteShell";
import { PartnerFormsSection } from "@/components/home/PartnerFormsSection";
import "../supporting-pages.css";
export const metadata: Metadata = { title: "Partner With Us", description: "Start a production inquiry or explore factory partnerships, platform collaboration and Voltron Commons." };
export default function PartnerPage() {
  return <SiteShell><div className="supporting-page partner-page"><Hero artSide="left" principles={["Production programs", "Factory partnerships", "Shared progress"]} eyebrow="Partner with us" title="Start with what you are building." illustration={<CollaborationHero kind="partner"/>} primary="Production programs" href="#production" secondary="Partnership & JV" secondaryHref="#partnership">Bring a production requirement, a factory opportunity or an industrial capability you want to develop.</Hero>
    <Section white><Suspense fallback={<div className="form-grid" aria-busy="true" aria-live="polite"><div className="inquiry-panel"><p className="eyebrow">Production programs</p><h2>Loading inquiry form</h2><p>Preparing the production inquiry form.</p></div><div className="inquiry-panel"><p className="eyebrow">Partnership &amp; JV</p><h2>Loading inquiry form</h2><p>Preparing the partnership inquiry form.</p></div></div>}><PartnerFormsSection/></Suspense></Section>
    <Section className="contact-band"><p className="eyebrow">Get in touch</p><h2>Voltron Lattice / Pune, Maharashtra</h2><p>www.voltronlattice.com</p></Section>
  </div></SiteShell>;
}
