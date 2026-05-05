"use client";

import Image from "next/image";
import { type CSSProperties, FormEvent, useMemo, useState } from "react";

const metrics = ["240-Hour Salt Spray", "15-25 Micron Film", "200-400V ED Range", "1000-2000 Tonne/Month"];

const capabilities = [
  {
    title: "Automotive Components",
    body: "Cathodic ED coating for corrosion protection, edge coverage, and uniform film deposition."
  },
  {
    title: "Industrial Parts",
    body: "Durable coating solutions for metal parts exposed to demanding operating environments."
  },
  {
    title: "Controlled Thickness",
    body: "Process control for 15-25 micron target coating thickness across varied geometries."
  },
  {
    title: "High-Volume Readiness",
    body: "Designed for 1000-2000 tonnes per month production capacity with disciplined flow."
  }
];

const pillars = [
  ["Corrosion Performance", "Designed for 240-hour salt spray performance and long-term protection."],
  ["Smart Manufacturing", "SCADA-enabled monitoring for bath stability, voltage control, and traceability."],
  ["AI Quality Inspection", "Visual inspection and defect detection support for repeatable outgoing quality."],
  ["Sustainable Operations", "Closed-loop water systems, UF recovery, and ESG-aligned governance."]
];

const processSteps = [
  ["Pre-Treatment", "Degreasing, rinsing, surface conditioning, phosphating, passivation, and DI water rinse."],
  ["ED Coating", "Immersion in ED bath with DC voltage application for uniform film deposition."],
  ["UF Rinse", "Recovery and removal of excess paint solids using UF permeate."],
  ["Curing", "Oven curing at controlled temperature for durable cross-linking."],
  ["Inspection", "Thickness, adhesion, visual checks, and salt spray validation."],
  ["Dispatch", "Release through documented quality checks and production readiness controls."]
];

const techItems = [
  "SCADA Dashboards",
  "PLC + Sensor Integration",
  "Predictive Maintenance",
  "AI Visual Inspection",
  "KPI Monitoring",
  "UF Recovery System"
];

const qualityBadges = ["APQP", "PFMEA", "PPAP", "MSA", "Cpk >= 1.33", "ISO 9001", "ISO 14001", "ISO 45001", "IATF 16949 Alignment"];

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function Home() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as { ok: boolean; message: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message);
      }

      setStatus("success");
      setMessage(result.message);
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit inquiry.");
    }
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Voltron home">
          <Image src="/voltron-logo.png" alt="" width={42} height={42} priority />
          <span>Voltron<sup>TM</sup></span>
        </a>
        <nav className="nav" aria-label="Main navigation">
          <a href="#capabilities">Capabilities</a>
          <a href="#process">Process</a>
          <a href="#technology">Technology</a>
          <a href="#quality">Quality</a>
          <a href="#sustainability">ESG</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow">Corrosion Protection, Powered by Process Intelligence</p>
            <h1>Automotive-Grade ED Coating, Engineered for Reliability</h1>
            <p>
              Voltron Coating Solutions delivers corrosion-resistant electrodeposition coating for automotive and
              industrial components through controlled process engineering, smart monitoring, and sustainability-driven
              operations.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#contact">Request a Quote</a>
              <a className="button secondary" href="/voltron-company-profile.pdf" download>Download Company Profile</a>
            </div>
          </div>
          <div className="hero-visual" aria-label="Electric Voltron brand visual">
            <div className="electric-line line-one" />
            <div className="electric-line line-two" />
            <div className="electric-line line-three" />
            <div className="logo-field">
              <Image src="/voltron-logo.png" alt="Voltron logo" width={620} height={620} priority />
            </div>
          </div>
          <div className="metric-strip">
            {metrics.map((metric) => (
              <span key={metric}>{metric}</span>
            ))}
          </div>
        </section>

        <section className="section" id="capabilities">
          <div className="section-heading">
            <p className="eyebrow dark">What We Do</p>
            <h2>Precision ED Coating for Demanding Components</h2>
            <p>Voltron is built for manufacturers who need repeatable corrosion protection, controlled film thickness, and dependable delivery.</p>
          </div>
          <div className="card-grid four">
            {capabilities.map((item) => (
              <article className="feature-card" key={item.title}>
                <span className="card-icon" />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section white">
          <div className="section-heading left">
            <p className="eyebrow dark">Why Voltron</p>
            <h2>Built for Quality. Powered by Efficiency.</h2>
          </div>
          <div className="pillar-grid">
            {pillars.map(([title, body], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section process" id="process">
          <div className="section-heading">
            <p className="eyebrow dark">Controlled Process Flow</p>
            <h2>From Surface Preparation to Dispatch</h2>
          </div>
          <div className="process-flow">
            {processSteps.map(([title, body], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section technology" id="technology">
          <div className="tech-layout">
            <div>
              <p className="eyebrow">Industry 4.0 Ready</p>
              <h2>Coating Infrastructure With a Technology Layer</h2>
              <p>
                SCADA dashboards, PLC and sensor integration, predictive maintenance, KPI monitoring, AI inspection, and UF
                recovery work together to keep process quality visible.
              </p>
            </div>
            <div className="dashboard-panel">
              <div className="panel-top">
                <span>Bath Stability</span>
                <strong>98.7%</strong>
              </div>
              <div className="bar-group" aria-hidden="true">
                <span style={{ "--level": "86%" } as CSSProperties} />
                <span style={{ "--level": "64%" } as CSSProperties} />
                <span style={{ "--level": "92%" } as CSSProperties} />
                <span style={{ "--level": "74%" } as CSSProperties} />
                <span style={{ "--level": "88%" } as CSSProperties} />
              </div>
              <div className="signal-grid">
                <span>Voltage</span>
                <span>pH</span>
                <span>Temp</span>
                <span>UF</span>
              </div>
            </div>
          </div>
          <div className="tech-grid">
            {techItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className="section" id="quality">
          <div className="section-heading">
            <p className="eyebrow dark">Automotive Standards</p>
            <h2>Quality Systems Designed for Repeatability</h2>
          </div>
          <div className="badge-grid">
            {qualityBadges.map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </section>

        <section className="section white" id="sustainability">
          <div className="section-heading left">
            <p className="eyebrow dark">ESG Aligned</p>
            <h2>Sustainable Coating for the Next Generation of Manufacturing</h2>
          </div>
          <div className="card-grid three">
            <article className="feature-card green">
              <h3>Environmental</h3>
              <p>Water recycling, UF recovery, closed-loop rinse systems, and reduced resource consumption.</p>
            </article>
            <article className="feature-card green">
              <h3>Social</h3>
              <p>Employee safety, PPE, training, and a disciplined zero-incident operating culture.</p>
            </article>
            <article className="feature-card green">
              <h3>Governance</h3>
              <p>Audit readiness, transparent systems, CFT reviews, and certification compliance.</p>
            </article>
          </div>
        </section>

        <section className="section leadership">
          <div className="section-heading">
            <p className="eyebrow dark">Leadership</p>
            <h2>Led by Manufacturing, R&amp;D, and Execution Expertise</h2>
          </div>
          <div className="leader-grid">
            <article>
              <div className="leader-photo" aria-label="Photo placeholder for Rajendra">R</div>
              <span>CEO</span>
              <h3>Rajendra</h3>
              <p>20+ years of experience in manufacturing, real estate, finance, execution, and operations.</p>
            </article>
            <article>
              <div className="leader-photo" aria-label="Photo placeholder for Omkar">O</div>
              <span>CTO</span>
              <h3>Omkar</h3>
              <p>
                IIT Madras B.Tech + M.Tech with 10+ years of experience, Intelligent Manufacturing, R&amp;D experience at Tata Motors and Philips, with
                expertise in modelling, design, development, PDLM, and SDLC.
              </p>
            </article>
            <article>
              <div className="leader-photo" aria-label="Photo placeholder for Akshay">A</div>
              <span>COO</span>
              <h3>Akshay</h3>
              <p>10+ years of experience in retail, operations, execution, and business process management.</p>
            </article>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-copy">
            <p className="eyebrow">Partner With Voltron</p>
            <h2>Looking for a reliable ED coating partner?</h2>
            <p>
              Share your requirement and Voltron will respond with the right process, quality, and capacity discussion.
            </p>
            <div className="contact-points">
              <span>Automotive & industrial components</span>
              <span>Quote-ready technical intake</span>
              <span>Email notification and durable inquiry storage ready</span>
            </div>
          </div>
          <form className="quote-form" onSubmit={submitInquiry}>
            <label>
              Inquiry Type
              <select name="inquiryType" defaultValue="Request a Quote" required>
                <option>Request a Quote</option>
                <option>General Contact</option>
                <option>Supplier / Vendor Inquiry</option>
                <option>Partnership Inquiry</option>
              </select>
            </label>
            <div className="field-pair">
              <label>
                Name
                <input name="name" type="text" autoComplete="name" required />
              </label>
              <label>
                Company
                <input name="company" type="text" autoComplete="organization" required />
              </label>
            </div>
            <div className="field-pair">
              <label>
                Email
                <input name="email" type="email" autoComplete="email" required />
              </label>
              <label>
                Phone
                <input name="phone" type="tel" autoComplete="tel" />
              </label>
            </div>
            <div className="field-pair">
              <label>
                Component Type
                <input name="componentType" type="text" placeholder="Automotive bracket, casting, sheet metal..." />
              </label>
              <label>
                Material / Substrate
                <input name="material" type="text" placeholder="MS, casting, galvanized steel..." />
              </label>
            </div>
            <div className="field-pair">
              <label>
                Monthly Volume
                <input name="monthlyVolume" type="text" placeholder="Approx. tonnes/month or parts/month" />
              </label>
              <label>
                Coating Thickness
                <input name="coatingThickness" type="text" placeholder="Example: 15-25 microns" />
              </label>
            </div>
            <label>
              Salt Spray Requirement
              <input name="saltSprayRequirement" type="text" placeholder="Example: 240 hours" />
            </label>
            <label>
              Requirement
              <textarea name="requirement" rows={5} placeholder="Tell us about the part, substrate, performance target, and timeline." required />
            </label>
            <button className="button primary form-button" type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Submitting..." : "Submit Inquiry"}
            </button>
            {message ? <p className={`form-status ${status}`}>{message}</p> : null}
          </form>
        </section>
      </main>

      <footer className="footer">
        <span>Voltron Coating Solutions</span>
        <span>Smart ED coating for the future of manufacturing.</span>
        <span>{currentYear}</span>
      </footer>
    </>
  );
}
