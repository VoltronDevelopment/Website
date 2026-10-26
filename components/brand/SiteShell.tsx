import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { founderSessionCookie } from "@/lib/founder-session-config";
import { verifyFounderTokenEdge } from "@/lib/founder-session-edge";
import { isPrelaunch } from "@/lib/launch";
import { BrandLogo } from "./BrandLogo";
import "./presentation.css";
import "./interaction-finish.css";

export function Action({ href, children, secondary = false, text = false }: { href: string; children: React.ReactNode; secondary?: boolean; text?: boolean }) {
  return <Link className={`directional-action ${text ? "text-action" : `button ${secondary ? "button-outline" : ""}`}`} href={href}>{children}<ArrowRight size={16} aria-hidden="true" /></Link>;
}
export function Logo({ footer = false }: { footer?: boolean }) {
  return <BrandLogo footer={footer}/>;
}
export async function SiteShell({ children, presentation = false }: { children: React.ReactNode; presentation?: boolean }) {
  if (isPrelaunch()) {
    const token = (await cookies()).get(founderSessionCookie)?.value;
    if (!await verifyFounderTokenEdge(token)) redirect("/coming-soon");
  }
  const content = <><SiteHeader /><main id="main-content">{children}</main><footer className="site-footer"><div className="container footer-grid"><div><Logo footer /><p>Building India&apos;s Intelligent Manufacturing Backbone.</p><p>Pune, Maharashtra<br />www.voltronlattice.com</p><details className="artwork-credits"><summary>Artwork credits</summary><p>3D arm based on <a href="https://sketchfab.com/3d-models/arm-hand-sculpting-e97f3be309ce4907afbcfa672832808d">Arm &amp; Hand sculpting</a> by <a href="https://sketchfab.com/alfance">alfance</a>, adapted under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</p><p>Tree based on <a href="https://sketchfab.com/3d-models/old-tree-5793911821d04f73926ac4ab1d46727a">Old Tree</a> by <a href="https://sketchfab.com/rodrigogelmi">gelmi.com.br</a>, adapted under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</p><p>Network layout adapted from <a href="https://sketchfab.com/3d-models/artificial-neural-network-ann-8400016f745643a4b25a57dd0bde04ab">Artificial Neural Network (ANN)</a> by <a href="https://sketchfab.com/essabahootraza">M.E</a>, under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</p></details></div><nav aria-label="Footer navigation"><Link href="/technology">Technology</Link><Link href="/ontology">Ontology</Link><Link href="/manufacturing">Manufacturing</Link><Link href="/partner">Partner</Link><Link href="/about">About Voltron</Link><Link href="/about/voltron-commons">Voltron Commons</Link></nav></div></footer></>;
  return <div className={`site-presentation${presentation ? " home-presentation" : ""}`}><div className="presentation-veil" aria-hidden="true"/>{content}</div>;
}
export function Section({ children, white = false, className = "", id }: { children: React.ReactNode; white?: boolean; className?: string; id?: string }) {
  return <section id={id} className={`section ${white ? "section-white" : ""} ${className}`}><div className="container">{children}</div></section>;
}
export function Intro({ eyebrow, title, children, centered = false }: { eyebrow?: string; title: string; children?: React.ReactNode; centered?: boolean }) {
  return <div className={`section-intro ${centered ? "centered" : ""}`}>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{children && <p>{children}</p>}</div>;
}
