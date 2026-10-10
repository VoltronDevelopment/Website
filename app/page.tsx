import type { Metadata } from "next";
import Image from "next/image";
import { assets } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Voltron — Coming Soon",
  description:
    "A new digital home for Voltron is taking shape. Engineering intelligent industry.",
  openGraph: {
    title: "Voltron — Coming Soon",
    description: "A new digital home for Voltron is taking shape.",
    type: "website",
    siteName: "Voltron"
  },
  twitter: {
    card: "summary_large_image",
    title: "Voltron — Coming Soon",
    description: "A new digital home for Voltron is taking shape."
  }
};

export default function Home() {
  return (
    <main className="launch-page" id="main-content">
      <div className="launch-grid" aria-hidden="true" />

      <header className="launch-header">
        <span className="launch-wordmark">VOLTRON</span>
        <p>Engineering intelligent industry</p>
      </header>

      <section className="launch-hero" aria-labelledby="launch-title">
        <div className="launch-emblem" aria-hidden="true">
          <span className="launch-orbit launch-orbit-outer" />
          <span className="launch-orbit launch-orbit-inner" />
          <span className="launch-orbit-cross launch-orbit-cross-x" />
          <span className="launch-orbit-cross launch-orbit-cross-y" />
          <Image
            src={assets.logo}
            alt=""
            width={300}
            height={300}
            priority
            className="launch-logo"
          />
        </div>

        <div className="launch-copy">
          <p className="launch-kicker">
            <span className="launch-status-dot" aria-hidden="true" />
            The next chapter is taking shape
          </p>
          <h1 id="launch-title">
            Coming
            <br />
            soon<span>.</span>
          </h1>
          <p className="launch-description">
            We’re building a new digital home for Voltron and the future of intelligent industry.
          </p>
          <div className="launch-signature">
            <span className="launch-signature-rule" aria-hidden="true" />
            <span>Built for what industry becomes next</span>
          </div>
        </div>
      </section>

      <footer className="launch-footer">
        <span>VOLTRON</span>
        <span>Engineering intelligent industry</span>
      </footer>
    </main>
  );
}
