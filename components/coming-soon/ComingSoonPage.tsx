"use client";
import {DiwaliCelebration} from "./DiwaliCelebration";
import {LockKeyhole,X} from "lucide-react";
import {type FormEvent,useEffect,useRef,useState} from "react";
import {BrandEntry} from "../entry/BrandEntry";

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
        <div className="founder-login-heading"><div><p className="eyebrow">Private review</p><h2 id="founder-login-title">Founder sign in</h2></div><button className="icon-button" type="button" aria-label="Close sign in" onClick={() => { setOpen(false); triggerRef.current?.focus(); }}><X size={19}/></button></div>
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

const celebrationMs = 3 * 60_000;
const festivalMs = 24 * 60 * 60_000;

export function ComingSoonPage({now, opens}: {now:number; opens:number}) {
  const [clock,setClock]=useState({now, confirmed:now>=opens});
  useEffect(()=>{
    let base=now, sampled=performance.now(), pending=false, disposed=false;
    let timer:ReturnType<typeof setTimeout>;
    const controller=new AbortController();
    let confirmed=now>=opens;
    function tick(){
      clearTimeout(timer);
      if(disposed || document.hidden)return;
      const current=base+performance.now()-sampled;
      setClock({now:current,confirmed});
      if(current>=opens && !confirmed)void sync();
      const next=confirmed ? (current<opens+celebrationMs ? opens+celebrationMs : opens+festivalMs) : current+1000;
      if(next>current)timer=setTimeout(tick,Math.max(50,Math.ceil(next-current)));
    }
    async function sync(){
      if(disposed || pending || document.hidden)return;
      pending=true;
      try{
        const res=await fetch('/api/launch',{cache:'no-store',signal:controller.signal});
        if(!res.ok)return;
        const status=await res.json();
        if(disposed || !Number.isFinite(status.now))return;
        base=status.now; sampled=performance.now(); confirmed=status.now>=status.launchAt; tick();
      }catch{/* Keep the server gate closed until a successful check. */}
      finally{pending=false;}
    }
    function visibility(){tick();if(!document.hidden)void sync();}
    tick();void sync();
    document.addEventListener('visibilitychange',visibility);
    return ()=>{disposed=true;controller.abort();clearTimeout(timer);document.removeEventListener('visibilitychange',visibility);};
  },[now,opens]);
  const seconds=Math.max(0,Math.ceil((opens-clock.now)/1000));
  const time=[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(value=>String(value).padStart(2,'0'));
  const festival=clock.now<opens+festivalMs;
  return <BrandEntry locked={!clock.confirmed} extraControls={!clock.confirmed&&<FounderLogin/>}
    celebration={clock.confirmed && clock.now<opens+celebrationMs && <DiwaliCelebration elapsed={Math.max(0,clock.now-opens)}/>}>
    {festival&&<div className="launch-details">
      <p className="launch-greeting">Happy Diwali</p>
      {!clock.confirmed&&<div className="launch-clock"><time role="timer" aria-label={time.join(':')}>{time.join(' : ')}</time><small>Midnight IST</small></div>}
    </div>}
  </BrandEntry>;
}
