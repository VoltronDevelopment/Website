import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Voltron Coating Solutions | Smart ED Coating",
  description:
    "Automotive-grade ED coating for corrosion-resistant automotive and industrial components, powered by process intelligence.",
  keywords: [
    "Voltron Coating Solutions",
    "ED coating",
    "e-coating",
    "electrodeposition coating",
    "automotive coating",
    "corrosion protection",
    "industrial coating"
  ],
  openGraph: {
    title: "Voltron Coating Solutions",
    description: "Automotive-grade ED coating, engineered for reliability.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>{children}</body>
    </html>
  );
}
