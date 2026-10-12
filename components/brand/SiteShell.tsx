import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { founderSessionCookie } from "@/lib/founder-session-config";
import { verifyFounderTokenEdge } from "@/lib/founder-session-edge";
import { isPrelaunch } from "@/lib/launch";
import { BrandLogo } from "./BrandLogo";

export function Action({ href, children, secondary = false, text = false }: { href: string; children: React.ReactNode; secondary?: boolean; text?: boolean }) {
  return <Link className={text ? "text-action" : `button ${secondary ? "button-outline" : ""}`} href={href}>{children}<ArrowRight size={16} aria-hidden="true" /></Link>;
}
export function Logo({ footer = false }: { footer?: boolean }) {
  return <BrandLogo footer={footer}/>;
}
export async function SiteShell({ children }: { children: React.ReactNode }) {
  if (isPrelaunch()) {
    const token = (await cookies()).get(founderSessionCookie)?.value;
    if (!await verifyFounderTokenEdge(token)) redirect("/coming-soon");
  }
  return <><SiteHeader /><main id="main-content">{children}</main><footer className="site-footer"><div className="container footer-grid"><div><Logo footer /><p>Building India&apos;s Intelligent Manufacturing Backbone.</p><p>Pune, Maharashtra<br />www.voltronlattice.com</p></div><nav aria-label="Footer navigation"><Link href="/technology">Technology</Link><Link href="/ontology">Ontology</Link><Link href="/manufacturing">Manufacturing</Link><Link href="/partner">Partner</Link><Link href="/about">About Voltron</Link><Link href="/about/voltron-commons">Voltron Commons</Link></nav></div></footer></>;
}
export function Section({ children, white = false, className = "", id }: { children: React.ReactNode; white?: boolean; className?: string; id?: string }) {
  return <section id={id} className={`section ${white ? "section-white" : ""} ${className}`}><div className="container">{children}</div></section>;
}
export function Intro({ eyebrow, title, children, centered = false }: { eyebrow?: string; title: string; children?: React.ReactNode; centered?: boolean }) {
  return <div className={`section-intro ${centered ? "centered" : ""}`}>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{children && <p>{children}</p>}</div>;
}
