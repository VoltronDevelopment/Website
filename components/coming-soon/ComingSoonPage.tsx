"use client";

import Image from "next/image";
import { LockKeyhole, X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/brand/ThemeToggle";
import { launchAt } from "@/lib/launch";

const pillars = [
  { label: "Human ingenuity.", path: "M 202 76 L 282 76 L 322 108 L 352 142 L 358 168", id: "tech" },
  { label: "Connected intelligence.", path: "M 202 304 L 282 304 L 322 272 L 352 238 L 358 212", id: "infra" },
  { label: "Manufacturing possibilities.", path: "M 408 190 L 518 190", id: "ops" }
];

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
    <button ref={triggerRef} className="founder-login-trigger" type="button" onClick={() => setOpen(true)}><LockKeyhole size={15} aria-hidden="true"/>Founder login</button>
    {open && <div className="founder-login-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) { setOpen(false); triggerRef.current?.focus(); } }}>
      <div ref={dialogRef} className="founder-login-dialog" role="dialog" aria-modal="true" aria-labelledby="founder-login-title">
        <div className="founder-login-heading"><div><p className="eyebrow">Private review</p><h2 id="founder-login-title">Founder sign in</h2></div><button className="icon-button" type="button" aria-label="Close sign in" onClick={() => setOpen(false)}><X size={19}/></button></div>
        <form onSubmit={signIn}>
          <label className="field"><span>Founder</span><select value={username} onChange={event => setUsername(event.target.value)}><option value="omkar">Omkar</option><option value="sanchit">Sanchit</option></select></label>
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
    let reloaded = false;
    const update = () => {
      const next = Math.max(0, launchAt - Date.now());
      setRemaining(next);
      if (next === 0 && !reloaded) { reloaded = true; window.location.reload(); }
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const totalSeconds = Math.floor((remaining ?? 0) / 1000);
  const values = [Math.floor(totalSeconds / 86400), Math.floor(totalSeconds / 3600) % 24, Math.floor(totalSeconds / 60) % 60, totalSeconds % 60];
  const labels = ["Days", "Hours", "Minutes", "Seconds"];
  return <div className="launch-countdown" aria-label={`${values[0]} days, ${values[1]} hours, ${values[2]} minutes and ${values[3]} seconds until launch`}>
    {values.map((value, index) => <div className="countdown-unit" key={labels[index]}><span>{String(value).padStart(2, "0")}</span><small>{labels[index]}</small></div>)}
  </div>;
}

function AnimatedBrandMark() {
  const [phase, setPhase] = useState(1);
  const [activeLine, setActiveLine] = useState(-1);

  useEffect(() => {
    if (window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase(3);
      setActiveLine(3);
      return;
    }
    const timers = [
      window.setTimeout(() => { setPhase(2); setActiveLine(0); }, 900),
      window.setTimeout(() => setActiveLine(1), 2300),
      window.setTimeout(() => setActiveLine(2), 3700),
      window.setTimeout(() => { setActiveLine(3); setPhase(3); }, 5100)
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  return <div className="hero-intro" data-phase={phase} data-active-line={activeLine >= 0 ? activeLine : undefined}>
    <div className="hero-nebula" aria-hidden="true"/><div className="hero-grid-bg" aria-hidden="true"/>
    <div className="hero-stage">
      <div className="hero-logo-cluster">
        <div className="hero-rings" aria-hidden="true"><span/><span/><span/></div>
        <div className="hero-pillar-connectors" aria-hidden="true"><svg viewBox="0 0 720 380" className="hero-pillar-svg" preserveAspectRatio="xMidYMid meet">{pillars.map(pillar => <path key={pillar.id} className={`pillar-line pillar-${pillar.id}`} d={pillar.path} pathLength={1}/>)}<circle className="pillar-hub" cx="360" cy="190" r="5"/></svg></div>
        {pillars.map(pillar => <div key={pillar.id} className={`pillar-node node-${pillar.id}`}><span className="pillar-head">{pillar.label}</span><span className="pillar-rule"/></div>)}
        <div className={`hero-logo-wrap ${phase >= 1 ? "assembled" : ""} ${phase >= 3 ? "connected" : ""}`}>
          <Image className="theme-logo-light hero-logo-img" src="/Brand%20Assets/logo/light%20rectangle.png" alt="" width={120} height={120} priority/>
          <Image className="theme-logo-dark hero-logo-img" src="/Brand%20Assets/logo/dark%20rectangle.png" alt="" width={120} height={120} priority/>
          <span className="hero-logo-pulse" aria-hidden="true"/><span className="hero-logo-glow" aria-hidden="true"/>
        </div>
      </div>
      <div className={`hero-brand-copy ${phase >= 3 ? "visible" : ""}`}>
        <p className="hero-tagline">Building India&apos;s Intelligent Manufacturing Backbone.</p><h1>VOLTRON LATTICE</h1>
      </div>
      <div className="launch-announcement"><p className="eyebrow">Coming this Diwali</p><p className="launch-date">8 November 2026 <span>·</span> 12:00 AM IST</p><Countdown/></div>
    </div>
  </div>;
}

export function ComingSoonPage() {
  return <main id="main-content" className="coming-soon-page">
    <div className="coming-soon-controls"><ThemeToggle autoCycle/><FounderLogin/></div>
    <AnimatedBrandMark/>
  </main>;
}
