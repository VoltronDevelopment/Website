"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "./brand/BrandLogo";
import { ThemeToggle } from "./brand/ThemeToggle";
import { FounderPreviewControl } from "./FounderPreviewControl";

const links = [["Technology", "/technology"], ["Intelligence", "/intelligence"], ["Manufacturing", "/manufacturing"], ["Network", "/network"]] as const;
const about = [["About Voltron", "/about"], ["People Culture", "/about/people-culture"], ["Voltron Commons", "/about/voltron-commons"]] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const aboutButton = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { setMobileOpen(false); setAboutOpen(false); }, [pathname]);
  useEffect(() => {
    function outside(event: PointerEvent) { if (!aboutRef.current?.contains(event.target as Node)) setAboutOpen(false); }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (aboutOpen) { setAboutOpen(false); aboutButton.current?.focus(); }
      else if (mobileOpen) { setMobileOpen(false); menuButton.current?.focus(); }
    }
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [aboutOpen, mobileOpen]);
  return <header className="site-header"><div className="container header-inner">
    <BrandLogo/>
    <nav id="site-navigation" aria-label="Main navigation" className={`site-nav ${mobileOpen ? "is-open" : ""}`}>
      {links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setMobileOpen(false)}>{label}</Link>)}
      <div className="about-disclosure" ref={aboutRef} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setAboutOpen(false); }}>
        <button ref={aboutButton} type="button" className={pathname.startsWith("/about") ? "current" : ""} aria-expanded={aboutOpen} aria-controls="about-navigation" onClick={() => setAboutOpen(!aboutOpen)}>About<ChevronDown size={14} aria-hidden="true" /></button>
        {aboutOpen && <div className="about-links" id="about-navigation">{about.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => { setAboutOpen(false); setMobileOpen(false); }}>{label}</Link>)}</div>}
      </div>
      <Link className="nav-partner" href="/partner" aria-current={pathname === "/partner" ? "page" : undefined} onClick={() => setMobileOpen(false)}>Partner With Us</Link>
    </nav>
    <div className="header-actions"><FounderPreviewControl/><ThemeToggle/><button ref={menuButton} className="menu-toggle icon-button" type="button" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} aria-controls="site-navigation" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
  </div></header>;
}
