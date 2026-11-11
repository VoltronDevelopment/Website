"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { allowedInquiryTypes, productionIntents } from "@/lib/inquiry-intents";
import { draftKey } from "@/lib/vectra/types";

export function VectraEnquiry({ requirement, close, dismiss }: { requirement: string; close: () => void; dismiss: () => void }) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const field = useId();
  const id = useRef("");
  const request = useRef(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [editedRequirement, setEditedRequirement] = useState<{ value: string; basis: string }>();
  const receiptHeading = useRef<HTMLHeadingElement>(null);
  const requirementValue = editedRequirement?.value ?? requirement;
  const hasNewSummary = !!requirement && !!editedRequirement && editedRequirement.basis !== requirement;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.current) return;
    const values = new FormData(event.currentTarget);
    request.current = true;
    setBusy(true);
    setStatus("");
    try {
      id.current ||= crypto.randomUUID();
      const response = await fetch("/api/inquiries", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({ ...Object.fromEntries(values), submissionKey: id.current }),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true || typeof result.inquiryId !== "string") throw new Error(result.message || "The enquiry could not be confirmed.");
      setReceipt(result.inquiryId);
      requestAnimationFrame(() => receiptHeading.current?.focus({ preventScroll: true }));
    } catch (reason) {
      setStatus(reason instanceof Error && reason.name === "Error" ? reason.message : "The enquiry could not be confirmed. Your details are still here.");
    } finally { request.current = false; setBusy(false); }
  }

  function handoff() {
    if (!form.current) return;
    const values = new FormData(form.current);
    const intent = String(values.get("inquiryType") || "");
    const kind = (productionIntents as readonly string[]).includes(intent) ? "production" : "partnership";
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({ kind, intent, requirement: String(values.get("requirement") || ""), expires: Date.now() + 600_000 }));
    } catch {
      setStatus("Your browser couldn't carry the draft. You can open Partner with us from the chat controls.");
      return;
    }
    dismiss();
    router.push(`/partner?vectra=${crypto.randomUUID()}#${kind}`);
  }

  if (receipt) return <div className="vectra-receipt" role="status">
    <h3 ref={receiptHeading} tabIndex={-1}>Enquiry received</h3>
    <p>Reference {receipt}</p>
    <button className="vectra-primary" type="button" onClick={close}>Continue conversation</button>
  </div>;
  return <form ref={form} className="vectra-enquiry" onSubmit={submit} aria-label="Quick enquiry" aria-busy={busy}>
    <fieldset disabled={busy}>
      <div className="vectra-field">
        <label htmlFor={`${field}-type`}>Enquiry type</label>
        <select id={`${field}-type`} name="inquiryType" defaultValue="Production — Need guidance">
          {allowedInquiryTypes.map(type => <option key={type}>{type}</option>)}
        </select>
      </div>
      <div className="vectra-field">
        <label htmlFor={`${field}-requirement`}>Requirement</label>
        <textarea id={`${field}-requirement`} name="requirement" required maxLength={800} rows={3}
          value={requirementValue} onChange={event => setEditedRequirement({ value: event.target.value, basis: requirement })} />
        {hasNewSummary && <button className="vectra-text-action" type="button" onClick={() => setEditedRequirement(undefined)}>
          Use latest chat summary
        </button>}
      </div>
      <div className="vectra-field">
        <label htmlFor={`${field}-name`}>Name</label>
        <input id={`${field}-name`} name="name" required maxLength={120} autoComplete="name" />
      </div>
      <div className="vectra-field">
        <label htmlFor={`${field}-email`}>Email</label>
        <input id={`${field}-email`} name="email" type="email" required maxLength={180} autoComplete="email" />
      </div>
      <div className="vectra-field">
        <label htmlFor={`${field}-company`}>Company (optional)</label>
        <input id={`${field}-company`} name="company" maxLength={120} autoComplete="organization" />
      </div>
      <label className="vectra-consent"><input type="checkbox" required /> Voltron may contact me about this enquiry.</label>
      <button className="vectra-primary" type="submit">{busy ? "Sending…" : "Submit enquiry"}</button>
      <button className="vectra-outline" type="button" onClick={handoff}>Continue in Partner with us</button>
    </fieldset>
    {status && <p className="vectra-error" role="alert">{status}</p>}
  </form>;
}
