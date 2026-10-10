import { HeroIntro } from "@/components/HeroIntro";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voltron — Coming Soon",
  description: "Voltron is engineering the future of manufacturing. A new chapter is coming soon."
};

export default function Home() {
  return (
    <main id="main-content">
      <section className="screen screen-dark screen-hero" id="home" aria-label="Voltron">
        <HeroIntro />
        <p className="hero-coming-soon">Coming soon</p>
      </section>
    </main>
  );
}
