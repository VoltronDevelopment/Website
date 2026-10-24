"use client";
import Link from "next/link";
import {LockKeyhole,X} from "lucide-react";
import {type FormEvent,useEffect,useRef,useState} from "react";
import {BrandEntry} from "../entry/BrandEntry";
import {launchAt} from "@/lib/launch";
import "@/app/enter/entry.css";
import "./coming-entry.css";
function FounderLogin() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("omkar");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("button,select,input")].filter(element => !element.hasAttribute("disabled"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.querySelector<HTMLElement>("select")?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await fetch("/api/founder/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const payload = await result.json();
      if (!result.ok || !payload.ok) { setError(payload.message || "Sign-in could not be completed."); return; }
      window.location.assign("/");
    } catch {
      setError("Sign-in could not be reached. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return <>
    <button ref={triggerRef} className="founder-login-trigger" type="button" aria-label="Founder login" title="Founder login" onClick={() => setOpen(true)}><LockKeyhole size={16} aria-hidden="true"/></button>
    {open && <div className="founder-login-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) { setOpen(false); triggerRef.current?.focus(); } }}>
      <div ref={dialogRef} className="founder-login-dialog" role="dialog" aria-modal="true" aria-labelledby="founder-login-title">
        <div className="founder-login-heading"><div><p className="eyebrow">Private review</p><h2 id="founder-login-title">Founder sign in</h2></div><button className="icon-button" type="button" aria-label="Close sign in" onClick={() => setOpen(false)}><X size={19}/></button></div>
        <form onSubmit={signIn}>
          <label className="field"><span>Founder</span><select value={username} onChange={event => setUsername(event.target.value)}><option value="omkar">Founder 1</option><option value="sanchit">Founder 2</option></select></label>
          <label className="field"><span>Password</span><input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required maxLength={256}/></label>
          {error && <p className="founder-login-error" role="alert">{error}</p>}
          <button className="button" type="submit" disabled={pending}>{pending ? "Signing in..." : "Sign in to review"}</button>
        </form>
      </div>
    </div>}
  </>;
}

function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const next = Math.max(0, launchAt - Date.now());
      setRemaining(next);
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if(remaining===0)return <div className="coming-live"><p>Voltron Lattice is live.</p><Link className="button button-outline" href="/">Enter Lattice →</Link></div>;
  const totalSeconds = Math.floor((remaining ?? 0) / 1000);
  const values = [Math.floor(totalSeconds / 86400), Math.floor(totalSeconds / 3600) % 24, Math.floor(totalSeconds / 60) % 60, totalSeconds % 60];
  const labels = ["Days", "Hours", "Minutes", "Seconds"];
  return <div className="launch-countdown" aria-label={`${values[0]} days, ${values[1]} hours, ${values[2]} minutes and ${values[3]} seconds until launch`}>
    {values.map((value, index) => <div className="countdown-unit" key={labels[index]}><span>{remaining===null?"--":String(value).padStart(2, "0")}</span><small>{labels[index]}</small></div>)}
  </div>;
}

export function ComingSoonPage(){return <BrandEntry comingSoon extraControls={<FounderLogin/>}><section className="coming-launch" aria-label="Voltron Lattice launch"><p className="coming-launch-tagline">Building India's Intelligent Manufacturing Backbone.</p><p className="coming-launch-date">8 November 2026 · 12:00 AM IST</p><Countdown/></section></BrandEntry>;}
