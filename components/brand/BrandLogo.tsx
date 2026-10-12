import Image from "next/image";
import Link from "next/link";

export function BrandLogo({ footer = false }: { footer?: boolean }) {
  return <Link href="/" className="brand-lockup" aria-label="Voltron Lattice home"><span className="brand-mark"><Image className="theme-logo-light" src="/Brand%20Assets/logo/light%20rectangle.png" width={64} height={64} alt="" sizes="64px" priority={!footer}/><Image className="theme-logo-dark" src="/Brand%20Assets/logo/dark%20rectangle.png" width={64} height={64} alt="" sizes="64px" priority={!footer}/></span><span className="brand-wordmark">VOLTRON LATTICE</span></Link>;
}
