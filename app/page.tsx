"use client";

import Image from "next/image";
import { type CSSProperties, FormEvent, useMemo, useState } from "react";

const heroLayers = [
  ["Process Line", "12-tank CED process"],
  ["Coating Control", "ED bath, rectifier, UF, oven"],
  ["Digital Layer", "PLC/HMI, Modbus, ERP, dashboards"],
  ["Quality Layer", "APQP, PFMEA, PPAP, SPC, CAPA"],
  ["ESG Layer", "ETP, water, energy, chemical discipline"]
];

const industryQuestions = [
  "Was the part cleaned correctly before coating?",
  "Were bath pH, conductivity, solids and temperature under control?",
  "Was the voltage/current setting suitable?",
  "Was the oven curing cycle validated?",
  "Was the DFT within specification?",
  "Which lot, rack, shift and operator processed the material?",
  "Is documentation available when the customer audits?",
  "Is energy, water, ETP and ESG compliance being tracked?"
];

const vosConnections = [
  ["Customer RFQ", "Requirement matrix and feasibility review"],
  ["Material inward", "Customer DC, lot creation, inward inspection"],
  ["Rack loading", "Rack number, loading pattern, part traceability"],
  ["ED process", "Bath parameters, voltage/current, dwell time"],
  ["Oven curing", "Temperature and curing records"],
  ["Inspection", "DFT, adhesion, visual checks, salt spray where required"],
  ["Dispatch", "Final release, packing, DC/invoice"],
  ["Complaint", "NCR, CAPA, 8D and lessons learned"],
  ["ESG", "ETP, energy, water, sludge and safety records"]
];

const intelligenceStack = [
  ["Coating Infrastructure", "12-tank ED/CED process line with pretreatment, CED bath, UF rinses, oven curing, DM plant and ETP."],
  ["PLC-Controlled Operations", "PLC/HMI-based control for transporter logic, sequencing, alarms, interlocks and operator visibility."],
  ["Process Parameter Monitoring", "Control and record pH, conductivity, temperature, solids, voltage, current, UF pressure, oven temperature and rinse quality."],
  ["ERP-Enabled Traceability", "Odoo ERP workflows for enquiry, quotation, inward, lot tracking, inspection, dispatch, invoicing and document control."],
  ["Quality Governance", "APQP, PFMEA, Control Plan, PPAP, MSA, SPC, NCR, CAPA, 8D, calibration and complaint management."],
  ["ESG and Resource Intelligence", "Energy, water, ETP, chemical consumption, sludge disposal, safety records and sustainability dashboards."]
];

const traceabilityItems = [
  "Customer",
  "Part",
  "DC",
  "Lot",
  "Rack",
  "Parameters",
  "Inspection",
  "Dispatch",
  "Invoice"
];

const qualityControls = [
  "Customer requirement matrix",
  "Coating feasibility review",
  "Racking feasibility",
  "Process Flow Diagram",
  "PFMEA",
  "Control Plan",
  "DFT inspection",
  "Adhesion testing",
  "Salt spray validation",
  "Oven temperature validation",
  "MSA / Gauge R&R",
  "SPC trend monitoring",
  "NCR / CAPA / 8D"
];

const dashboardGroups = [
  {
    title: "CEO Dashboard",
    items: ["Revenue", "Receivables", "Customer-wise profitability", "Cost per kg", "Capacity utilization", "Customer pipeline", "Compliance status"]
  },
  {
    title: "CTO Dashboard",
    items: ["DFT compliance", "Bath parameter trends", "Oven validation", "NCR/CAPA", "PPAP status", "Customer complaints", "Calibration due"]
  },
  {
    title: "Operations Dashboard",
    items: ["Daily production", "Shift-wise output", "WIP", "Dispatch pending", "Downtime", "Maintenance due", "Safety and ETP status"]
  }
];

const erpWorkflows = [
  "Customer enquiry",
  "Quotation",
  "Material inward",
  "Job-work lot tracking",
  "Production records",
  "Quality inspection",
  "Inventory",
  "Purchase",
  "Maintenance",
  "Dispatch",
  "Invoicing",
  "Receivables",
  "Document control"
];

const roadmapPhases = [
  ["Phase 1", "Digital Control Foundation", "PLC/HMI, process records, document control, ERP workflows and production tracking."],
  ["Phase 2", "Process Visibility", "Dashboards for DFT, bath parameters, oven, production, dispatch, inventory, maintenance and EHS."],
  ["Phase 3", "Smart Resource Tracking", "Energy meters, kWh/tonne, water/tonne, paint consumption/tonne, chemical consumption/tonne and ETP cost."],
  ["Phase 4", "Advanced Analytics", "SPC, trend alerts, predictive maintenance, abnormality detection and customer-wise profitability."],
  ["Phase 5", "Smart Quality Roadmap", "AI-assisted visual inspection, SCADA integration, digital twin, automated alerts and customer-facing traceability reports."]
];

const esgBlocks = [
  {
    title: "Environmental",
    items: ["UF paint recovery", "ETP monitoring", "Water consumption tracking", "Energy monitoring", "Chemical discipline", "Sludge disposal records"]
  },
  {
    title: "Social",
    items: ["PPE compliance", "Chemical handling training", "Hoist safety", "Oven safety", "ETP safety", "Skill matrix"]
  },
  {
    title: "Governance",
    items: ["Document control", "CEO/CTO approvals", "Internal audits", "Customer audit readiness", "Compliance register", "CAPA tracking"]
  }
];

const promises = [
  ["Corrosion protection", "ED/CED process with DFT and validation records"],
  ["Consistency", "Process parameters, Control Plan and SPC"],
  ["Traceability", "Customer-wise lot, rack, inspection and dispatch records"],
  ["Audit readiness", "APQP, PPAP, PFMEA, MSA and CAPA documentation"],
  ["Delivery reliability", "ERP-enabled production and dispatch tracking"],
  ["ESG compliance", "ETP, energy, water, safety and sludge records"],
  ["Cost discipline", "Cost/kg and resource consumption dashboards"]
];

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
    const payload = Object.fromEntries(new FormData(form).entries());

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
          <a href="#problem">Problem</a>
          <a href="#vos">VOS</a>
          <a href="#traceability">Traceability</a>
          <a href="#quality">Quality</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow">The Future of ED Coating Is Process Intelligence</p>
            <h1>Corrosion Protection, Powered by Process Intelligence</h1>
            <p>
              ED/CED coating for manufacturers who need every lot controlled, tracked, verified, and ready for audit.
            </p>
            <strong className="hero-punch">Not just coated. Controlled. Tracked. Verified.</strong>
            <div className="hero-actions">
              <a className="button primary" href="#contact">Request Technical Review</a>
              <a className="button secondary" href="/voltron-company-profile.pdf" download>Download Capability Deck</a>
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
          <div className="metric-strip system-layer-strip">
            {heroLayers.map(([layer, focus]) => (
              <span key={layer}>
                <strong>{layer}</strong>
                {focus}
              </span>
            ))}
          </div>
        </section>

        <section className="section problem-section" id="problem">
          <div className="section-heading left">
            <p className="eyebrow dark">The Industry Problem</p>
            <h2>What the Industry Actually Needs</h2>
            <p>
              Coating failure is rarely just a coating problem. It is usually a process visibility problem.
            </p>
          </div>
          <div className="problem-grid">
            <div className="problem-copy">
              <h3>Customers need answers, not assumptions.</h3>
              <p>
                Manufacturers need traceability, repeatability, documentation, predictable dispatch, quality records,
                ESG compliance, cost discipline, and fast response when something goes wrong.
              </p>
              <strong>Voltron is being built to answer these questions with systems, not assumptions.</strong>
            </div>
            <div className="question-list">
              {industryQuestions.map((question) => (
                <span key={question}>{question}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="section vos-section" id="vos">
          <div className="section-heading">
            <p className="eyebrow">Voltron Operating System</p>
            <h2>A digital and process governance layer for ED coating operations</h2>
            <p>
              VOS connects coating process control, quality systems, production tracking, ERP workflows, ESG records,
              and business dashboards.
            </p>
          </div>
          <div className="vos-map">
            {vosConnections.map(([plant, control], index) => (
              <article key={plant}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{plant}</h3>
                <p>{control}</p>
              </article>
            ))}
          </div>
          <p className="section-line">
            VOS helps Voltron operate as an ERP-enabled, process-controlled, audit-ready ED coating partner.
          </p>
        </section>

        <section className="section stack-section" id="stack">
          <div className="section-heading left">
            <p className="eyebrow dark">Process Intelligence Stack</p>
            <h2>The Voltron Process Intelligence Stack</h2>
            <p>Instead of presenting only tanks and machines, Voltron presents the full intelligence stack around coating reliability.</p>
          </div>
          <div className="stack-list">
            {intelligenceStack.map(([title, body], index) => (
              <article key={title}>
                <span>Layer {index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section traceability" id="traceability">
          <div className="section-heading">
            <p className="eyebrow dark">Lot Traceability</p>
            <h2>Every Lot Should Have a Story</h2>
            <p>Voltron’s traceability system is designed to connect customer material to the final dispatch record.</p>
          </div>
          <div className="trace-chain">
            {traceabilityItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="trace-card">
            <p>
              When a customer asks what happened to this lot, Voltron should not search files. Voltron should search the system.
            </p>
          </div>
        </section>

        <section className="section quality" id="quality">
          <div className="section-heading left">
            <p className="eyebrow dark">Quality Governance</p>
            <h2>Quality Is Not a Final Inspection Activity</h2>
            <p>
              At Voltron, quality is designed into every stage of the coating process, from customer requirement review to dispatch.
            </p>
          </div>
          <div className="quality-layout">
            <div className="badge-grid">
              {qualityControls.map((control) => (
                <span key={control}>{control}</span>
              ))}
            </div>
            <div className="principle-card">
              <h3>Control Before Defects Travel</h3>
              <p>
                The goal is not to inspect defects at the end. The goal is to control the process so defects do not travel forward.
              </p>
            </div>
          </div>
        </section>

        <section className="section dashboards">
          <div className="section-heading">
            <p className="eyebrow">Decision Dashboards</p>
            <h2>Custom Dashboards for Real Plant Decisions</h2>
            <p>The dashboard is not decoration. It is how the plant thinks.</p>
          </div>
          <div className="dashboard-grid">
            {dashboardGroups.map((group, groupIndex) => (
              <article key={group.title} className="dashboard-card">
                <div className="dashboard-top">
                  <h3>{group.title}</h3>
                  <strong>{groupIndex === 0 ? "Business" : groupIndex === 1 ? "Technical" : "Execution"}</strong>
                </div>
                <div className="mini-bars" aria-hidden="true">
                  <span style={{ "--level": "82%" } as CSSProperties} />
                  <span style={{ "--level": "58%" } as CSSProperties} />
                  <span style={{ "--level": "74%" } as CSSProperties} />
                  <span style={{ "--level": "91%" } as CSSProperties} />
                </div>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section erp-section">
          <div className="section-heading left">
            <p className="eyebrow dark">ERP-Enabled Operations</p>
            <h2>From RFQ to Invoice — Connected</h2>
            <p>
              ED coating is a process business. ERP makes the process visible beyond the shopfloor.
            </p>
          </div>
          <div className="workflow-cloud">
            {erpWorkflows.map((workflow) => (
              <span key={workflow}>{workflow}</span>
            ))}
          </div>
        </section>

        <section className="section roadmap" id="roadmap">
          <div className="section-heading">
            <p className="eyebrow dark">Industry 4.0 Roadmap</p>
            <h2>Industry 4.0, Built in Phases</h2>
            <p>
              Voltron’s Industry 4.0 approach is practical. We are building digital capability around real coating-operation pain points.
            </p>
          </div>
          <div className="roadmap-list">
            {roadmapPhases.map(([phase, title, body]) => (
              <article key={phase}>
                <span>{phase}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section esg-section">
          <div className="section-heading left">
            <p className="eyebrow dark">ESG Discipline</p>
            <h2>ESG for Coating Operations, Not Brochure ESG</h2>
            <p>
              For an ED/CED coating plant, ESG lives in water, energy, chemicals, sludge, PPE, safety, and compliance records.
            </p>
          </div>
          <div className="esg-grid">
            {esgBlocks.map((block) => (
              <article key={block.title}>
                <h3>{block.title}</h3>
                <ul>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="section-line dark-line">
            Sustainability is not a certificate on the wall. It is what the plant records every day.
          </p>
        </section>

        <section className="section promise-section">
          <div className="section-heading">
            <p className="eyebrow dark">Customer Promise</p>
            <h2>What Voltron Promises</h2>
          </div>
          <div className="promise-grid">
            {promises.map(([need, response]) => (
              <article key={need}>
                <span>{need}</span>
                <p>{response}</p>
              </article>
            ))}
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
              <span>CEO &amp; Co-Founder</span>
              <h3>Rajendra</h3>
              <p>20+ years of experience in manufacturing, real estate, finance, execution, and operations.</p>
            </article>
            <article>
              <div className="leader-photo" aria-label="Photo placeholder for Omkar">O</div>
              <span>CTO &amp; Co-Founder</span>
              <h3>Omkar</h3>
              <p>
                IIT Madras B.Tech + M.Tech with 10+ years of experience, Intelligent Manufacturing, R&amp;D experience at Tata Motors and Philips, with
                expertise in modelling, design, development, PDLM, and SDLC.
              </p>
            </article>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-copy">
            <p className="eyebrow">Technical Review</p>
            <h2>Looking for a Coating Partner Built for the Next Decade?</h2>
            <p>
              Share your component requirement with Voltron. We will review geometry, substrate, coating thickness,
              corrosion requirement, monthly volume, masking needs, packing method, and documentation expectations before
              proposing the right coating solution.
            </p>
            <div className="contact-points">
              <span>Part geometry and substrate review</span>
              <span>Corrosion, thickness and documentation expectations</span>
              <span>Production, dispatch and audit-readiness discussion</span>
            </div>
          </div>
          <form className="quote-form" onSubmit={submitInquiry}>
            <label>
              Inquiry Type
              <select name="inquiryType" defaultValue="Technical Review" required>
                <option>Technical Review</option>
                <option>Submit RFQ</option>
                <option>General Inquiry</option>
                <option>Customer Audit / Documentation</option>
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
              <textarea name="requirement" rows={5} placeholder="Tell us about the part, substrate, performance target, documentation expectation, and timeline." required />
            </label>
            <button className="button primary form-button" type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Submitting..." : "Request Technical Review"}
            </button>
            {message ? <p className={`form-status ${status}`}>{message}</p> : null}
          </form>
        </section>
      </main>

      <footer className="footer">
        <span>Voltron Coating Solutions</span>
        <span>Building the operating system for reliable ED coating.</span>
        <span>{currentYear}</span>
      </footer>
    </>
  );
}
