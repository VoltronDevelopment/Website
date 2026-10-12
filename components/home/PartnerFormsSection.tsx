"use client";
import { useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { partnerIntents, productionIntents } from "@/lib/inquiry-intents";

type Values = Record<string, string>;
type FieldSpec = { key: string; label: string; required?: boolean; type?: string; options?: readonly string[]; multiline?: boolean; placeholder?: string; autoComplete?: string };
const common: FieldSpec[] = [
  { key: "name", label: "Full name", required: true, autoComplete: "name" },
  { key: "company", label: "Company", autoComplete: "organization" },
  { key: "email", label: "Email", required: true, type: "email", autoComplete: "email" },
  { key: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
];
const productionFields: FieldSpec[] = [...common,
  { key: "intent", label: "Required process", required: true, options: productionIntents },
  { key: "part", label: "Part or application", placeholder: "Part, material or application" },
  { key: "volume", label: "Expected volume", placeholder: "Quantity and frequency" },
  { key: "timing", label: "Timing", placeholder: "When do you plan to start?" },
  { key: "requirement", label: "Quality requirements", multiline: true, placeholder: "Standards, specifications or performance requirements" },
];
const partnershipFields: FieldSpec[] = [...common.map(field => field.key === "company" ? { ...field, label: "Organization" } : field),
  { key: "intent", label: "Partnership interest", required: true, options: partnerIntents },
  { key: "requirement", label: "What are you building?", required: true, multiline: true, placeholder: "The factory opportunity, capability or initiative you want to develop" },
];

function InquiryForm({ kind, initialIntent = "" }: { kind: "production" | "partnership"; initialIntent?: string }) {
  const fields = kind === "production" ? productionFields : partnershipFields;
  const [values, setValues] = useState<Values>({ intent: initialIntent });
  const [errors, setErrors] = useState<Values>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const busy = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const nextErrors: Values = {};
    for (const field of fields) {
      const value = (values[field.key] || "").trim();
      if (field.required && !value) nextErrors[field.key] = `${field.label} is required.`;
      else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) nextErrors[field.key] = "Enter a valid email address.";
      else if (field.options && value && !field.options.includes(value)) nextErrors[field.key] = "Select a valid option.";
      else if (value.length > 800) nextErrors[field.key] = "Use 800 characters or fewer.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus("idle");
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus();
      return;
    }
    busy.current = true;
    setStatus("sending");
    setMessage("");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal, body: JSON.stringify({
        inquiryType: values.intent, name: values.name, company: values.company || "", email: values.email, phone: values.phone,
        requirement: values.requirement?.trim() || `Production inquiry: ${values.intent}`,
        componentType: kind === "production" ? values.intent : undefined,
        material: values.part, monthlyVolume: values.volume, coatingThickness: values.timing,
        saltSprayRequirement: kind === "production" ? values.requirement : undefined,
      }) });
      const result = await response.json();
      if (!response.ok || result.ok !== true || typeof result.inquiryId !== "string" || !result.inquiryId) throw new Error(result.message || "Unable to submit. Please try again.");
      setStatus("success");
      setMessage("Your inquiry has been received. We will review the details and contact you about the next step.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error && error.name !== "AbortError" ? error.message : "The request timed out. Your details are still here; please try again.");
    } finally { clearTimeout(timeout); busy.current = false; }
  }
  return <form ref={formRef} className="inquiry-form" onSubmit={submit} noValidate aria-label={kind === "production" ? "Production inquiry" : "Partnership inquiry"} aria-busy={status === "sending"}>
    {fields.map(field => {
      const id = `${kind}-${field.key}`;
      const inputProps = { id, name: field.key, value: values[field.key] || "", required: field.required, "aria-invalid": !!errors[field.key], "aria-describedby": errors[field.key] ? `${id}-error` : undefined, disabled: status === "sending" || status === "success", onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { setValues(current => ({ ...current, [field.key]: event.target.value })); setErrors(current => ({ ...current, [field.key]: "" })); } };
      return <div className="field" key={field.key}><label htmlFor={id}>{field.label} {!field.required && <span>(optional)</span>}</label>{field.options ? <select {...inputProps}><option value="">Select {kind === "production" ? "a process" : "an interest"}</option>{field.options.map(option => <option key={option} value={option}>{option.replace(/^Production — /, "")}</option>)}</select> : field.multiline ? <textarea {...inputProps} rows={5} maxLength={800} placeholder={field.placeholder}/> : <input {...inputProps} type={field.type || "text"} maxLength={800} autoComplete={field.autoComplete} placeholder={field.placeholder}/>} {errors[field.key] && <p className="field-error" id={`${id}-error`}>{errors[field.key]}</p>}</div>;
    })}
    {status === "success" ? <div className="form-status form-success" role="status"><CheckCircle2 size={18} aria-hidden="true"/><p>{message}</p></div> : <><button className="button" type="submit" disabled={status === "sending"}>{status === "sending" ? <><LoaderCircle className="spinner" size={18} aria-hidden="true"/>Submitting...</> : <>Submit {kind === "production" ? "production" : "partnership"} inquiry<ArrowRight size={16} aria-hidden="true"/></>}</button>{status === "error" && <p className="form-error" role="alert">{message}</p>}</>}
  </form>;
}
export function PartnerFormsSection() {
  const params = useSearchParams();
  const interest = params.get("interest");
  const preset = interest === "commons" ? "Commons collaboration" : interest === "people" ? "Building with Voltron" : "";
  return <><nav className="form-jumps" aria-label="Inquiry forms"><a href="#production">Production programs</a><a href="#partnership">Partnership &amp; JV</a></nav><div className="form-grid"><article id="production" className="inquiry-panel"><h2>Production Programs</h2><p className="eyebrow">Surface treatment manufacturing</p><p>Discuss a phosphating, CED, powder coating or related requirement.</p><InquiryForm kind="production"/></article><article id="partnership" className="inquiry-panel"><h2>Partnership &amp; JV</h2><p className="eyebrow">Scale with Voltron</p><p>Explore factory JVs, strategic investment, platform partnerships or Commons collaborations.</p><InquiryForm key={preset} kind="partnership" initialIntent={preset}/></article></div></>;
}
