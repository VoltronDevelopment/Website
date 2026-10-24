import {DiwaliCelebration} from "@/components/coming-soon/DiwaliCelebration";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/assets";
import { themeBootstrap } from "@/lib/theme";
import { LatticeAtmosphere } from "@/components/brand/LatticeAtmosphere";
import { LatticeExperience } from "@/components/navigation/LatticeExperience";
import {PerformanceMonitor} from "@/components/performance/PerformanceMonitor";
import "@/components/brand/atmosphere.css";
import "@fontsource/montserrat/latin-300.css";
import "@fontsource/montserrat/latin-400.css";
import "@fontsource/montserrat/latin-500.css";
import "@fontsource/montserrat/latin-600.css";
import "./globals.css";
import "@/components/brand/connected-diagrams.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Voltron Lattice | Intelligent Manufacturing", template: "%s | Voltron Lattice" },
  description: "Building India's Intelligent Manufacturing Backbone. Physical production, manufacturing knowledge and intelligence connected through one architecture.",
  openGraph: { siteName: "Voltron Lattice", type: "website", locale: "en_IN" },
  icons: { icon: { url: "/Brand%20Assets/voltron%20brand%20page/voltron-hero-assets/voltron-mark-original.png", type: "image/png" } },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }}/></head><body><PerformanceMonitor/><DiwaliCelebration/><LatticeAtmosphere/><a className="skip-link" href="#main-content">Skip to main content</a><LatticeExperience>{children}</LatticeExperience></body></html>;
}
