import {SiteAudio} from "@/components/entry/EntryAudio";
import {sceneMotionBootstrap} from "@/lib/scene-continuity";
import "@/components/performance/scene-continuity.css";
import type { Metadata } from "next";
import {optimizedAsset} from "@/lib/optimized-assets";
import { siteUrl } from "@/lib/assets";
import { themeBootstrap } from "@/lib/theme";
import { LatticeAtmosphere } from "@/components/brand/LatticeAtmosphere";
import {SiteFrame} from "@/components/brand/SiteFrame";
import {SiteFooter} from "@/components/brand/SiteFooter";
import { LatticeExperience } from "@/components/navigation/LatticeExperience";
import {PerformanceMonitor} from "@/components/performance/PerformanceMonitor";
import "@/components/brand/atmosphere.css";
import "@fontsource/montserrat/latin-300.css";
import "@fontsource/montserrat/latin-400.css";
import "@fontsource/montserrat/latin-500.css";
import "@fontsource/montserrat/latin-600.css";
import "./globals.css";
import "@/components/brand/responsive-frames.css";
import "@/components/brand/connected-diagrams.css";
import "@/components/brand/site-refinements.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Voltron Lattice | Intelligent Manufacturing", template: "%s | Voltron Lattice" },
  description: "Building India's Intelligent Manufacturing Backbone. Physical production, manufacturing knowledge and intelligence connected through one architecture.",
  openGraph: {
    siteName: "Voltron Lattice", type: "website", locale: "en_IN",
    images: [{ url: "/social/voltron-lattice-sharing-v1.png", width: 1200, height: 630, alt: "Voltron Lattice — Building India's Intelligent Manufacturing Backbone. People, Manufacturing, Intelligence." }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/social/voltron-lattice-sharing-v1.png"],
  },
  icons: { icon: { url: optimizedAsset("/Brand%20Assets/voltron%20brand%20page/voltron-hero-assets/voltron-mark-original.png",true), type: "image/webp" } },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }}/><script dangerouslySetInnerHTML={{ __html: sceneMotionBootstrap }}/></head><body><PerformanceMonitor/><SiteAudio><LatticeAtmosphere/><a className="skip-link" href="#main-content">Skip to main content</a><LatticeExperience><SiteFrame footer={<SiteFooter/>}>{children}</SiteFrame></LatticeExperience></SiteAudio></body></html>;
}
