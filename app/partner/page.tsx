import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/brand/Hero";
import { Section, SiteShell } from "@/components/brand/SiteShell";
import { PartnerFormsSection } from "@/components/home/PartnerFormsSection";
export const metadata: Metadata = { title: "Partner With Us", description: "Start a production inquiry or explore factory partnerships, platform collaboration and Voltron Commons." };
export default function PartnerPage() {
  return <SiteShell><Hero eyebrow="Partner with us" title="Start with what you are building." art="F01-partner-hero" primary="Production programs" href="#production" secondary="Partnership & JV" secondaryHref="#partnership">Bring a production requirement, a factory opportunity or an industrial capability you want to develop.</Hero>
    <Section white><Suspense fallback={<p>Loading inquiry forms...</p>}><PartnerFormsSection/></Suspense></Section>
    <Section className="contact-band"><p className="eyebrow">Get in touch</p><h2>Voltron Lattice / Pune, Maharashtra</h2><p>www.voltronlattice.com</p></Section>
  </SiteShell>;
}
