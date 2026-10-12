import { Action, SiteShell } from "@/components/brand/SiteShell";
export default function NotFound() {
  return <SiteShell><div className="container not-found"><p className="eyebrow">404</p><h1>Page not found.</h1><p>The page may have moved. Explore the Voltron Lattice architecture or return home.</p><div className="actions"><Action href="/">Return home</Action><Action href="/technology" secondary>Explore technology</Action></div></div></SiteShell>;
}
