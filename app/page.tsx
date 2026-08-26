import { AlphaVisitButton } from "@/components/home/AlphaVisitButton";
import { PartnerFormsSection } from "@/components/home/PartnerFormsSection";
import { SiteFooter } from "@/components/home/SiteFooter";
import { HeroIntro } from "@/components/HeroIntro";
import { Reveal } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";
import { AlphaProofVisual } from "@/components/visuals/AlphaProofVisual";
import { ArchitectureLayers } from "@/components/visuals/ArchitectureLayers";
import { BusinessModelInfographic } from "@/components/visuals/BusinessModelInfographic";
import { CyberPhysicalStack } from "@/components/visuals/CyberPhysicalStack";
import { DigitalQmsCapabilityStrip } from "@/components/visuals/DigitalQmsCapabilityStrip";
import { DigitalQmsVisual } from "@/components/visuals/DigitalQmsVisual";
import { HitlVisual } from "@/components/visuals/HitlVisual";
import { ContextSceneVisual, ContextSpineVisual } from "@/components/visuals/ManufacturingContextVisual";
import { ModularPlatformVisual } from "@/components/visuals/ModularPlatformVisual";
import { NetworkAdvantageVisual } from "@/components/visuals/NetworkAdvantageVisual";
import { VoltronAiAgentsExperience } from "@/components/visuals/VoltronAiAgentsExperience";
import { VoltronAiVisual } from "@/components/visuals/VoltronAiVisual";
import { hitlSequence, leaders, philosophy } from "@/lib/site-content";
import Image from "next/image";
import type { CSSProperties } from "react";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main-content">
        <section className="screen screen-dark screen-hero" id="home">
          <HeroIntro />
        </section>

        <section className="screen screen-dark screen-glow" id="gap">
          <div className="screen-inner split split-center">
            <Reveal className="split-copy">
              <p className="eyebrow">When the factory becomes a system</p>
              <h2>
                India&apos;s next factories will be{" "}
                <span className="accent">cyber-physical systems</span>.
              </h2>
              <p className="lead">
                The jugaad era expanded capacity. The next era needs factories where physical execution,
                manufacturing context and intelligence operate as one system — not in parallel spreadsheets.
              </p>
              <p className="bridge-line accent">Built for the post-jugaad transition — from assumption to system truth.</p>
              <div className="philosophy-row">
                {philosophy.map((word) => (
                  <span key={word}>{word}</span>
                ))}
              </div>
            </Reveal>

            <Reveal className="split-visual" delay={120}>
              <div className="visual-stage">
                <CyberPhysicalStack />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="screen screen-dark architecture-screen" id="architecture">
          <div className="screen-inner architecture-page">
            <Reveal className="architecture-header center-text">
              <p className="eyebrow">The Voltron Architecture</p>
              <h2>
                A factory cannot become intelligent <span className="accent">in pieces.</span>
              </h2>
              <p className="architecture-vos">
                <span className="vos-mark">
                  <span className="sr-only">VOS</span>
                  <span className="vos-v" aria-hidden="true">V</span>
                  <span className="vos-os" aria-hidden="true">OS</span>
                </span>
                <span className="architecture-vos-eq">=</span>
                <span>Execution</span>
                <span className="architecture-vos-plus">+</span>
                <span>Context</span>
                <span className="architecture-vos-plus">+</span>
                <span>Intelligence</span>
              </p>
            </Reveal>

            <Reveal delay={100}>
              <ArchitectureLayers />
            </Reveal>
          </div>
        </section>

        <section className="screen screen-light technology-middle" id="modularity">
          <div className="screen-inner split split-center">
            <Reveal className="split-copy">
              <p className="eyebrow">Modular manufacturing platform</p>
              <h2>
                Built once. <span className="accent">Configured for every factory.</span>
              </h2>
              <p className="lead">
                Every factory has its own process, equipment and operating rhythm. Voltron keeps the underlying
                manufacturing logic reusable, then configures the plant around the reality on the floor.
              </p>
              <p className="bridge-line accent">Reusable logic. Factory-specific execution.</p>
              <p className="statement-sm">Voltron Core · Capability Modules · Process Packages · Voltron AI</p>
            </Reveal>

            <Reveal className="split-visual" delay={100}>
              <div className="visual-stage visual-stage-tall">
                <ModularPlatformVisual />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="screen screen-dark technology-middle context-screen" id="context">
          <div className="screen-inner context-page">
            <div className="context-main-grid">
              <Reveal className="context-narrative split-copy">
              <p className="eyebrow">One manufacturing context</p>
              <h2>
                Every lot becomes a
                <span className="accent">connected manufacturing story.</span>
              </h2>
              <p className="lead">
                Requirements, execution, evidence and decisions — connected in one continuous context.
              </p>
              <p className="bridge-line accent">One lot. One context. One traceable story.</p>
              </Reveal>

              <Reveal className="context-scene-col" delay={80}>
                <ContextSceneVisual />
              </Reveal>

              <Reveal className="context-spine-col" delay={120}>
                <ContextSpineVisual />
              </Reveal>
            </div>
          </div>
        </section>

        <section className="screen screen-light technology-middle qms-screen" id="qms">
          <div className="screen-inner qms-page">
            <Reveal className="qms-header center-text">
              <p className="eyebrow">Voltron Digital QMS</p>
              <h2>
                Quality should not become <span className="accent">another digital silo.</span>
              </h2>
              <p className="lead center">
                Quality information already exists across Control Plans, PFMEA, inspections, SCADA, calibration,
                supplier certificates, external laboratories, spreadsheets and people. Voltron connects those records
                to the manufacturing context of the part and lot.
              </p>
              <p className="bridge-line accent">Smart at the core. Compatible at the edges.</p>
            </Reveal>

            <Reveal delay={80}>
              <DigitalQmsVisual />
            </Reveal>

            <Reveal className="qms-capability-full" delay={140}>
              <DigitalQmsCapabilityStrip />
            </Reveal>
          </div>
        </section>

        <section className="screen screen-dark technology-middle voltron-ai-screen" id="voltron-ai">
          <VoltronAiVisual />
        </section>

        <section className="screen screen-dark ai-agents-screen" id="ai-team">
          <VoltronAiAgentsExperience />
        </section>

        <section className="screen screen-dark technology-middle hitl-screen" id="hitl">
          <div className="screen-inner split split-center">
            <Reveal className="split-copy">
              <p className="eyebrow">Voltron HITL</p>
              <h2>
                Intelligence at the <span className="accent">point of work.</span>
              </h2>
              <p className="lead">
                Voltron can configure the information, guidance, inputs and actions projected onto screens throughout the
                factory. Each station sees only what the person at that point needs.
              </p>
              <ol className="bridge-line hitl-sequence">
                {hitlSequence.map((step, index) => (
                  <li key={step} style={{ "--i": index } as CSSProperties}>
                    {step}
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal className="split-visual" delay={100}>
              <div className="visual-stage visual-stage-tall">
                <HitlVisual />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="screen screen-dark" id="alpha">
          <div className="screen-inner split split-center">
            <Reveal className="split-copy">
              <p className="eyebrow">Voltron Alpha · Application 01</p>
              <h2>
                Built on the shopfloor. <span className="accent">Not in a demo room.</span>
              </h2>
              <p className="lead">
                Voltron Alpha is our first real-world manufacturing environment for proving the Voltron architecture
                under actual production conditions — surface treatment, digital systems and specialist intelligence
                working together.
              </p>
              <p className="bridge-line accent">Alpha is not the product. It is the proof.</p>
              <div className="process-row">
                <span>CED</span>
                <span>Phosphating</span>
                <span>Powder Coating</span>
              </div>
              <p className="statement-sm">Every lot traceable · Every dispatch accountable</p>
              <AlphaVisitButton />
            </Reveal>

            <Reveal className="split-visual" delay={100}>
              <div className="visual-stage visual-stage-tall">
                <AlphaProofVisual />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="screen screen-light" id="people">
          <div className="screen-inner people-page">
            <Reveal className="people-header people-header-centered">
              <p className="eyebrow">People &amp; Scale</p>
              <h2>Three disciplines. One operating system.</h2>
              <p className="lead people-lead">
                Technology, operations and plant engineering — unified to build and scale Voltron.
              </p>
              <div className="discipline-row">
                <span>Technology</span>
                <span>Operations</span>
                <span>Plant Engineering</span>
              </div>
            </Reveal>

            <div className="leader-row">
              {leaders.map((person, i) => (
                <Reveal key={person.name} delay={i * 80}>
                  <article className="leader-glass">
                    <span className="leader-discipline">{person.discipline}</span>
                    <div className="leader-photo">
                      <Image src={person.image} alt={person.name} width={80} height={80} sizes="80px" />
                    </div>
                    <h3>{person.name}</h3>
                    <p className="role">{person.role}</p>
                    <p className="cred">{person.cred}</p>
                    <p className="bio">{person.focus}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="screen screen-dark screen-glow" id="model">
          <div className="screen-inner biz-page">
            <Reveal className="biz-page-header center-text">
              <p className="eyebrow">Business Model</p>
              <h2>
                One manufacturing platform. <span className="accent">Multiple ways to scale.</span>
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <BusinessModelInfographic />
            </Reveal>
          </div>
        </section>

        <section className="screen screen-dark screen-glow" id="advantage">
          <div className="screen-inner advantage-page">
            <Reveal className="advantage-header center-text">
              <p className="eyebrow">Technology / Network Advantage</p>
              <h2>
                One architecture. <span className="accent">A network that compounds.</span>
              </h2>
              <p className="lead center advantage-lead">
                Every Voltron factory connects to the same manufacturing architecture — carrying reusable process,
                engineering and intelligence across the network.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <NetworkAdvantageVisual />
            </Reveal>
          </div>
        </section>

        <PartnerFormsSection />
      </main>

      <SiteFooter />
    </>
  );
}
