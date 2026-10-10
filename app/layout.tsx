import type { Metadata } from "next";
import { assets, siteUrl } from "@/lib/assets";
import "./globals.css";
import "./coming-soon.css";

const title = "Voltron — Coming Soon";
const description = "A new digital home for Voltron is taking shape. Engineering intelligent industry.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s"
  },
  description,
  openGraph: {
    title,
    description,
    type: "website",
    url: siteUrl,
    siteName: "Voltron",
    images: [{ url: assets.ogImage, width: 1200, height: 630, alt: "Voltron — Engineering intelligent industry" }]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [assets.ogImage]
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js');"
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
