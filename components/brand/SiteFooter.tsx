import Link from "next/link";
import {BrandLogo} from "./BrandLogo";

export function SiteFooter(){return <footer className="site-footer"><div className="container footer-grid"><div><BrandLogo footer/><p>Building India&apos;s Intelligent Manufacturing Backbone.</p><p>Pune, Maharashtra<br />www.voltronlattice.com</p><Link href="/credits">Artwork credits</Link></div><nav aria-label="Footer navigation"><Link href="/technology">Technology</Link><Link href="/intelligence">Intelligence</Link><Link href="/manufacturing">Manufacturing</Link><Link href="/network">Network</Link><Link href="/partner">Partner</Link><Link href="/about">About Voltron</Link><Link href="/about/voltron-commons">Voltron Commons</Link></nav></div></footer>;}
