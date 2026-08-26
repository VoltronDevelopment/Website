import type { Metadata } from "next";
import { assets, siteUrl } from "@/lib/assets";
import "./globals.css";

const title = "Voltron | Engineering the Future of Manufacturing";
const description =
  "Voltron connects technology, infrastructure and operations — with manufacturing context, digital QMS and Voltron AI specialist intelligence.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    url: siteUrl,
    siteName: "Voltron",
    images: [{ url: assets.ogImage, width: 1200, height: 630, alt: "Voltron — Engineering the Future of Manufacturing" }]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [assets.ogImage]
  },
  robots: {
    index: true,
    follow: true
  }
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
