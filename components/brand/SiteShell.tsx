import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { founderSessionCookie } from "@/lib/founder-session-config";
import { verifyFounderTokenEdge } from "@/lib/founder-session-edge";
import { isPrelaunch } from "@/lib/launch";
import { BrandLogo } from "./BrandLogo";

export function Action({ href, children, secondary = false, text = false }: { href: string; children: React.ReactNode; secondary?: boolean; text?: boolean }) {
  return <Link className={`directional-action ${text ? "text-action" : `button ${secondary ? "button-outline" : ""}`}`} href={href}>{children}<ArrowRight size={16} aria-hidden="true" /></Link>;
}
export function Logo({ footer = false }: { footer?: boolean }) {
  return <BrandLogo footer={footer}/>;
}
// Authorization remains server-side. SiteFrame owns the persistent presentation and chrome.
// The legacy presentation prop remains accepted for Home; the frame selects it by route.
export async function SiteShell({ children }: { children: React.ReactNode; presentation?: boolean }) {
  if (isPrelaunch()) {
    const token = (await cookies()).get(founderSessionCookie)?.value;
    if (!await verifyFounderTokenEdge(token)) redirect("/coming-soon");
  }
  return <>{children}</>;
}
export function Section({ children, white = false, className = "", id }: { children: React.ReactNode; white?: boolean; className?: string; id?: string }) {
  return <section id={id} className={`section ${white ? "section-white" : ""} ${className}`}><div className="container">{children}</div></section>;
}
export function Intro({ eyebrow, title, children, centered = false }: { eyebrow?: string; title: string; children?: React.ReactNode; centered?: boolean }) {
  return <div className={`section-intro ${centered ? "centered" : ""}`}>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{children && <p>{children}</p>}</div>;
}
