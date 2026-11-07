"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { partnerIntents, productionIntents, processSlugs } from "@/lib/inquiry-intents";
import {useEntryChoice} from "@/lib/use-entry-choice";
import "./partner-forms.css";

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
  const options: readonly string[] = kind === 'production' ? productionIntents : partnerIntents;
  const [saved, saveIntent] = useEntryChoice(kind+'-intent', options.length+1, -1);
  const [draft, setValues] = useState<Values>({});
  const values: Values = {...draft, intent: saved < 0 ? initialIntent : options[saved-1] || ''};
  const [expanded, setExpanded] = useState(false);

  const [errors, setErrors] = useState<Values>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [inquiryId, setInquiryId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const submission = useRef("");
  useEffect(() => { if (status === "success") receiptRef.current?.focus(); }, [status]);
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
      setMessage("");
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus();
      return;
    }
    busy.current = true;
    setStatus("sending");
    setMessage("");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      submission.current ||= crypto.randomUUID();
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal, body: JSON.stringify({
        submissionKey: submission.current, inquiryType: values.intent, name: values.name, company: values.company || "", email: values.email, phone: values.phone,
        requirement: values.requirement?.trim() || `Production inquiry: ${values.intent}`,
        partOrApplication: values.part, expectedVolume: values.volume, timing: values.timing,
        qualityRequirements: kind === "production" ? values.requirement : undefined,
      }) });
      const result = await response.json();
      if (!response.ok || result.ok !== true || typeof result.inquiryId !== "string" || !result.inquiryId) throw new Error(result.message || "Unable to submit. Please try again.");
      setStatus("success");
      setInquiryId(result.inquiryId);
      setMessage("Your inquiry has been received. We will review the details and contact you about the next step.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error && error.name === "AbortError" ? "The request timed out. Your details are still here; please try again." : error instanceof TypeError ? "Unable to connect. Your details are still here; check your connection and try again." : error instanceof Error ? error.message : "Unable to submit. Your details are still here; please try again.");
    } finally { clearTimeout(timeout); busy.current = false; }
  }
  const errorCount = Object.values(errors).filter(Boolean).length;
  return <><p className="sr-only" role="status">{status === "sending" ? "Submitting your inquiry. Please wait." : ""}</p><form ref={formRef} className="inquiry-form" data-state={status} onSubmit={submit} noValidate aria-label={kind === "production" ? "Production inquiry" : "Partnership inquiry"} aria-busy={status === "sending"}>
    <p className="inquiry-guidance">Voltron's team receives your inquiry. Fields marked optional can be left blank.</p>
    {errorCount > 0 && <div className="inquiry-corrections"><p>Check {errorCount === 1 ? "the highlighted field" : `the ${errorCount} highlighted fields`} before submitting.</p><ul>{fields.filter(field => errors[field.key]).map(field => <li key={field.key}><a href={`#${kind}-${field.key}`} onClick={event => { event.preventDefault(); formRef.current?.querySelector<HTMLElement>(`[name="${field.key}"]`)?.focus(); }}>{field.label}</a></li>)}</ul></div>}

    {fields.map(field => {
      const id = `${kind}-${field.key}`;
      const describedBy = [field.multiline ? `${id}-hint` : "", errors[field.key] ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
      const inputProps = { id, name: field.key, value: values[field.key] || "", required: field.required, "aria-invalid": !!errors[field.key], "aria-describedby": describedBy, disabled: status === "sending" || status === "success", onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { const value=event.target.value; if(field.key==="intent")saveIntent(options.indexOf(value)+1); else setValues(current => ({ ...current, [field.key]: value })); setErrors(current => ({ ...current, [field.key]: "" })); } };
      return <div className="field" hidden={kind==="production"&&!expanded&&["part","volume","timing","requirement"].includes(field.key)} key={field.key}><label htmlFor={id}>{field.label} {!field.required && <span>(optional)</span>}</label>{field.options ? <select {...inputProps}><option value="">Select {kind === "production" ? "a process" : "an interest"}</option>{field.options.map(option => <option key={option} value={option}>{option.replace(/^Production — /, "")}</option>)}</select> : field.multiline ? <textarea {...inputProps} rows={5} maxLength={800} placeholder={field.placeholder}/> : <input {...inputProps} type={field.type || "text"} maxLength={800} autoComplete={field.autoComplete} placeholder={field.placeholder}/>} {field.multiline && <p className="inquiry-field-hint" id={`${id}-hint`}><span>Up to 800 characters.</span><span>{(values[field.key] || "").length} / 800</span></p>}{errors[field.key] && <p className="field-error" id={`${id}-error`}>{errors[field.key]}</p>}</div>;
    })}
    {kind==='production'&&<button type="button" className="inquiry-more" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?'Hide optional production details':'Add optional production details'}</button>}
    {status === "success" ? <div ref={receiptRef} tabIndex={-1} className="form-status form-success inquiry-receipt" role="status"><CheckCircle2 size={20} aria-hidden="true"/><div><h3>Inquiry received</h3><p>{message}</p><p className="inquiry-reference">Reference: <strong>{inquiryId}</strong></p></div></div> : <><button className="button inquiry-submit" type="submit" disabled={status === "sending"}>{status === "sending" ? <><LoaderCircle className="spinner" size={18} aria-hidden="true"/>Submitting...</> : <>Submit {kind === "production" ? "production" : "partnership"} inquiry<ArrowRight size={16} aria-hidden="true"/></>}</button>{status === "error" && <div className="form-error inquiry-failure" role="alert"><strong>Inquiry not confirmed</strong><p>{message}</p><p>Your entries are retained. You can try submitting again.</p></div>}</>}
  </form></>;
}
export function PartnerFormsSection() {
  const params = useSearchParams();
  const interest = params.get("interest");
  const process = productionIntents[processSlugs.findIndex(slug=>slug===params.get('process'))] || '';
  const interests: Record<string,string> = {cto:'CTO opportunity',technology:'CTO opportunity',people:'Building with Voltron',commons:'Commons collaboration',factory:'Factory JV',platform:'Platform partnership'};
  const preset = interest && Object.hasOwn(interests,interest) ? interests[interest] : '';
  const [hash,setHash]=useState('');
  useEffect(()=>{
    const sync=()=>setHash(location.hash);
    sync();window.addEventListener('hashchange',sync);window.addEventListener('popstate',sync);
    return ()=>{window.removeEventListener('hashchange',sync);window.removeEventListener('popstate',sync);};
  },[interest,process]);
  const [tab,saveTab]=useEntryChoice('inquiry-tab',2,-1);
  const active = tab===0?'production':tab===1?'partnership':hash==='#production'?'production':hash==='#partnership'||preset?'partnership':'production';
  const setActive=(kind:'production'|'partnership')=>saveTab(kind==='production'?0:1);
  return <><nav className="form-jumps" aria-label="Inquiry type"><button type="button" aria-pressed={active==='production'} onClick={()=>setActive('production')}>Production inquiry</button><button type="button" aria-pressed={active==='partnership'} onClick={()=>setActive('partnership')}>Partnership enquiry</button></nav><div className="partner-form-panels"><article id="production" className="inquiry-panel" hidden={active!=='production'}><h3>Production programs</h3><p>Discuss a phosphating, CED, powder coating or related requirement.</p><InquiryForm kind="production" initialIntent={process}/></article><article id="partnership" className="inquiry-panel" hidden={active!=='partnership'}><h3>Partnership &amp; collaboration</h3><p>Explore factory JVs, strategic investment, platform partnerships or Commons collaborations.</p><InquiryForm kind="partnership" initialIntent={preset}/></article></div></>;
}
