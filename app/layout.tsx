import type { Metadata } from "next";
import { siteUrl } from "@/lib/assets";
import { themeBootstrap } from "@/lib/theme";
import "@fontsource/montserrat/latin-300.css";
import "@fontsource/montserrat/latin-400.css";
import "@fontsource/montserrat/latin-500.css";
import "@fontsource/montserrat/latin-600.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Voltron Lattice | Intelligent Manufacturing", template: "%s | Voltron Lattice" },
  description: "Building India's Intelligent Manufacturing Backbone. Physical production, manufacturing knowledge and intelligence connected through one architecture.",
  openGraph: { siteName: "Voltron Lattice", type: "website", locale: "en_IN" },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }}/></head><body><a className="skip-link" href="#main-content">Skip to main content</a>{children}</body></html>;
}
