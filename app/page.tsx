import { AlphaVisitButton } from "@/components/home/AlphaVisitButton";
import { PartnerFormsSection } from "@/components/home/PartnerFormsSection";
import { SiteFooter } from "@/components/home/SiteFooter";
import { HeroIntro } from "@/components/HeroIntro";
import { Reveal } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";
import { BusinessModelInfographic } from "@/components/visuals/BusinessModelInfographic";
import { AlphaFlowVisual } from "@/components/visuals/AlphaFlowVisual";
import { ArchitectureLayers } from "@/components/visuals/ArchitectureLayers";
import { CyberPhysicalStack } from "@/components/visuals/CyberPhysicalStack";
import { ManufacturingLoopVisual } from "@/components/visuals/ManufacturingLoopVisual";
import { ModularPlatformVisual } from "@/components/visuals/ModularPlatformVisual";
import { PlatformSystemsVisual } from "@/components/visuals/PlatformSystemsVisual";
import { VoltronAdvantageVisual } from "@/components/visuals/VoltronAdvantageVisual";
import { VoltronCustomerVisual } from "@/components/visuals/VoltronCustomerVisual";
import { leaders, philosophy } from "@/lib/site-content";
import Image from "next/image";

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
              <p className="eyebrow">Post-jugaad manufacturing</p>
              <h2>
                India&apos;s next factories will be{" "}
                <span className="accent">cyber-physical systems</span>.
              </h2>
              <p className="lead">
                The jugaad era expanded capacity. The next era needs a{" "}
                <strong>digital twin</strong> — where physical execution and system intelligence run as one system,
                not in parallel spreadsheets.
              </p>
              <p className="bridge-line">Built for the post-jugaad transition — from assumption to system truth.</p>
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
              <h2>A factory cannot become intelligent in pieces.</h2>
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
              <h2>Built once. <span className="accent">Configured for every factory.</span></h2>
              <p className="lead">
                Every factory has its own process, equipment and operating rhythm. Voltron keeps the underlying
                manufacturing logic reusable, then configures the plant around the reality on the floor.
              </p>
              <p className="bridge-line accent">Reusable logic. Factory-specific execution.</p>
              <p className="statement-sm">Voltron Core · Capability Modules · Process Packages</p>
            </Reveal>

            <Reveal className="split-visual" delay={100}>
              <div className="visual-stage visual-stage-tall">
                <ModularPlatformVisual />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="screen screen-dark technology-middle" id="platform">
          <div className="screen-inner platform-page">
            <Reveal className="platform-page-header center-text">
              <p className="eyebrow">One manufacturing model</p>
              <h2>Three systems. <span className="accent">One connected factory.</span></h2>
              <p className="lead">
                ERP, SCADA and the digital twin are not separate tools placed beside the factory. They are different
                ways of working with the same manufacturing model.
              </p>
              <p className="bridge-line accent">Run the factory. See the process. Understand the system.</p>
            </Reveal>

            <Reveal delay={100}>
              <PlatformSystemsVisual />
            </Reveal>
          </div>
        </section>

        <section className="screen screen-light technology-middle" id="loop">
          <div className="screen-inner split split-center">
            <Reveal className="split-copy">
              <p className="eyebrow">Cyber-physical operating loop</p>
              <h2>Digital instructions. <span className="accent">Physical execution. Continuous feedback.</span></h2>
              <p className="lead">
                ERP defines what should happen. The shopfloor performs it. SCADA records what is happening. The twin
                builds context around what happened, so operations can improve the next cycle.
              </p>
              <p className="bridge-line accent">Plan → Execute → Observe → Understand → Improve</p>
            </Reveal>

            <Reveal className="split-visual" delay={100}>
              <div className="visual-stage visual-stage-tall">
                <ManufacturingLoopVisual />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="screen screen-light" id="voltron">
          <div className="screen-inner split split-center">
            <Reveal className="split-copy">
              <p className="eyebrow">Digital thread · Customer visibility</p>
              <h2>Your customers see the same truth as your factory.</h2>
              <p className="lead">
                Every manufacturing event carries context from the one before it. Batch progress, lot status, quality
                records and dispatch ETA can be shared live because the factory knows the same truth.
              </p>
              <p className="bridge-line accent">Data + Context = Manufacturing Intelligence</p>
              <div className="visibility-row">
                <span>Live batch status</span>
                <span>Lot traceability</span>
                <span>Dispatch ETA</span>
              </div>
            </Reveal>

            <Reveal className="split-visual" delay={100}>
              <div className="visual-stage">
                <VoltronCustomerVisual />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="screen screen-dark" id="alpha">
          <div className="screen-inner split split-center">
            <Reveal className="split-copy">
              <p className="eyebrow">Voltron Alpha · Application 01</p>
              <h2>Our first prototype runs on the shopfloor.</h2>
              <p className="lead">
                Voltron Alpha is a live surface-treatment facility — where infrastructure, operations and Voltron prove
                themselves in production. CED, phosphating and powder coating are where we begin.
              </p>
              <p className="bridge-line accent">Surface treatment first. Manufacturing intelligence forever.</p>
              <div className="process-row">
                <span>CED</span>
                <span>Phosphating</span>
                <span>Powder Coating</span>
              </div>
              <p className="statement-sm">Every lot traceable · Every dispatch accountable</p>
              <AlphaVisitButton />
            </Reveal>

            <Reveal className="split-visual" delay={100}>
              <div className="visual-stage">
                <AlphaFlowVisual />
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
                      <Image src={person.image} alt={person.name} width={80} height={80} />
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
                One manufacturing platform.{" "}
                <span className="accent">Multiple ways to scale.</span>
              </h2>
              <p className="lead center biz-page-lead">
                Voltron builds manufacturing capacity through{" "}
                <strong>company-owned plants</strong> and <strong>strategic factory partnerships</strong> — all
                connected through the same technology, engineering and operating architecture.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <BusinessModelInfographic />
            </Reveal>

            <Reveal delay={160}>
              <p className="biz-closer">
                Own where we prove. Partner where we scale. Connect everything through Voltron.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="screen screen-dark screen-glow" id="advantage">
          <div className="screen-inner advantage-page">
            <Reveal className="advantage-header center-text">
              <p className="eyebrow">The Voltron Advantage</p>
              <h2>
                One architecture.{" "}
                <span className="accent">Every layer of manufacturing.</span>
              </h2>
              <p className="lead center advantage-lead">
                Voltron connects the factory from the machine level to the business level — through one integrated
                manufacturing platform.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <VoltronAdvantageVisual />
            </Reveal>
          </div>
        </section>

        <PartnerFormsSection />
      </main>

      <SiteFooter />
    </>
  );
}
