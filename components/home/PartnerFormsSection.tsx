"use client";

import { Reveal } from "@/components/Reveal";
import {
  alphaVisitIntent,
  defaultPartnerIntent,
  defaultProductionIntent,
  partnerIntents,
  productionIntents
} from "@/lib/inquiry-intents";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function PartnerFormsSection() {
  const [productionStatus, setProductionStatus] = useState<FormStatus>("idle");
  const [productionMessage, setProductionMessage] = useState("");
  const [partnerStatus, setPartnerStatus] = useState<FormStatus>("idle");
  const [partnerMessage, setPartnerMessage] = useState("");
  const [productionIntent, setProductionIntent] = useState(defaultProductionIntent);
  const [partnerIntent, setPartnerIntent] = useState(defaultPartnerIntent);

  useEffect(() => {
    const onVisitAlpha = () => {
      setProductionIntent(alphaVisitIntent);
      setPartnerIntent(alphaVisitIntent);
    };
    window.addEventListener("voltron:visit-alpha", onVisitAlpha);
    return () => window.removeEventListener("voltron:visit-alpha", onVisitAlpha);
  }, []);

  async function submitInquiry(e: FormEvent<HTMLFormElement>, kind: "production" | "partner") {
    e.preventDefault();
    const setStatus = kind === "production" ? setProductionStatus : setPartnerStatus;
    const setMessage = kind === "production" ? setProductionMessage : setPartnerMessage;

    setStatus("submitting");
    setMessage("");
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const raw = await res.text();
      let result: { ok: boolean; message: string };
      try {
        result = JSON.parse(raw) as { ok: boolean; message: string };
      } catch {
        throw new Error("Unable to submit. Please try again.");
      }
      if (!res.ok || !result.ok) throw new Error(result.message);
      setStatus("success");
      setMessage(result.message);
      form.reset();
      if (kind === "production") setProductionIntent(defaultProductionIntent);
      else setPartnerIntent(defaultPartnerIntent);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Unable to submit.");
    }
  }

  return (
    <section className="screen screen-cta" id="partner">
      <div className="screen-inner partner-page">
        <Reveal className="partner-intro center-text">
          <p className="eyebrow">Partner With Voltron</p>
          <h2>Start the conversation.</h2>
          <p className="lead center partner-lead">
            Production programs or factory partnerships — tell us what you&apos;re building.
          </p>
        </Reveal>

        <div className="partner-forms">
          <Reveal>
            <div className="partner-form-block">
              <p className="eyebrow">Production Programs</p>
              <h3>Surface treatment manufacturing</h3>
              <p className="partner-form-desc">
                CED, phosphating, powder coating and related production at Voltron Alpha.
              </p>
              <form className="form-minimal form-glass" onSubmit={(e) => submitInquiry(e, "production")}>
                <label>
                  Intent
                  <select
                    name="inquiryType"
                    required
                    value={productionIntent}
                    onChange={(e) => setProductionIntent(e.target.value)}
                  >
                    {productionIntents.map((intent) => (
                      <option key={intent} value={intent}>
                        {intent}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="form-row">
                  <label>
                    Name
                    <input name="name" type="text" required autoComplete="name" maxLength={800} placeholder="Your name" />
                  </label>
                  <label>
                    Company
                    <input
                      name="company"
                      type="text"
                      required
                      autoComplete="organization"
                      maxLength={800}
                      placeholder="Company name"
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Email
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      maxLength={800}
                      placeholder="you@company.com"
                    />
                  </label>
                  <label>
                    Phone
                    <input name="phone" type="tel" autoComplete="tel" maxLength={800} placeholder="+91 …" />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Part / material
                    <input name="material" type="text" maxLength={800} placeholder="Component type, substrate, alloy…" />
                  </label>
                  <label>
                    Monthly volume
                    <input name="monthlyVolume" type="text" maxLength={800} placeholder="Parts per month, batch size…" />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Coating spec
                    <input name="coatingThickness" type="text" maxLength={800} placeholder="Thickness, finish, standard…" />
                  </label>
                  <label>
                    Salt spray / quality
                    <input name="saltSprayRequirement" type="text" maxLength={800} placeholder="Hours, spec, test requirement…" />
                  </label>
                </div>
                <label>
                  Additional requirements
                  <textarea
                    name="requirement"
                    rows={4}
                    required
                    maxLength={800}
                    placeholder="Part type, timeline, delivery location, drawings available…"
                  />
                </label>
                <button type="submit" className="btn-primary" disabled={productionStatus === "submitting"}>
                  {productionStatus === "submitting" ? "Sending…" : "Submit production inquiry"}
                </button>
                {productionMessage ? (
                  <p className={`form-msg ${productionStatus}`} role="alert">
                    {productionMessage}
                  </p>
                ) : null}
              </form>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="partner-form-block">
              <p className="eyebrow">Partnership &amp; JV</p>
              <h3>Scale with Voltron</h3>
              <p className="partner-form-desc">Factory JVs, strategic investment and platform partnerships.</p>
              <form className="form-minimal form-glass" onSubmit={(e) => submitInquiry(e, "partner")}>
                <label>
                  Intent
                  <select
                    name="inquiryType"
                    required
                    value={partnerIntent}
                    onChange={(e) => setPartnerIntent(e.target.value)}
                  >
                    {partnerIntents.map((intent) => (
                      <option key={intent} value={intent}>
                        {intent}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="form-row">
                  <label>
                    Name
                    <input name="name" type="text" required autoComplete="name" maxLength={800} placeholder="Your name" />
                  </label>
                  <label>
                    Company
                    <input
                      name="company"
                      type="text"
                      required
                      autoComplete="organization"
                      maxLength={800}
                      placeholder="Company name"
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Email
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      maxLength={800}
                      placeholder="you@company.com"
                    />
                  </label>
                  <label>
                    Phone
                    <input name="phone" type="tel" autoComplete="tel" maxLength={800} placeholder="+91 …" />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Region / facility
                    <input name="material" type="text" maxLength={800} placeholder="City, cluster, plant location…" />
                  </label>
                  <label>
                    Scale
                    <input name="monthlyVolume" type="text" maxLength={800} placeholder="Capacity, investment range…" />
                  </label>
                </div>
                <label>
                  Timeline
                  <input name="coatingThickness" type="text" maxLength={800} placeholder="Target launch or decision window" />
                </label>
                <label>
                  Preferred model
                  <input name="saltSprayRequirement" type="text" maxLength={800} placeholder="Owned factory, JV, platform license…" />
                </label>
                <label>
                  Message
                  <textarea
                    name="requirement"
                    rows={4}
                    required
                    maxLength={800}
                    placeholder="Partnership scope, assets, market, and what you want to build together…"
                  />
                </label>
                <button type="submit" className="btn-primary" disabled={partnerStatus === "submitting"}>
                  {partnerStatus === "submitting" ? "Sending…" : "Submit partnership inquiry"}
                </button>
                {partnerMessage ? (
                  <p className={`form-msg ${partnerStatus}`} role="alert">
                    {partnerMessage}
                  </p>
                ) : null}
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
