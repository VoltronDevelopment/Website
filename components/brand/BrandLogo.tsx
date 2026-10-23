import {optimizedAsset} from "@/lib/optimized-assets";

import Link from "next/link";

export function BrandLogo({ footer = false }: { footer?: boolean }) {
  return <Link href="/" className="brand-lockup" aria-label="Voltron Lattice home"><span className="brand-mark"><img src={optimizedAsset("/Brand%20Assets/voltron%20brand%20page/voltron-hero-assets/voltron-mark-original.png",true)} width={64} height={64} alt="" decoding="async" loading={footer?"lazy":"eager"}/></span><span className="brand-wordmark">VOLTRON LATTICE</span></Link>;
}
