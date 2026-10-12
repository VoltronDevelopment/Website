import { readBrandArtwork } from "@/lib/brand-assets";
import { Reveal } from "./Reveal";

export function BrandArt({ family, className = "", crop = false }: { family: string; className?: string; crop?: boolean }) {
  const focus = crop || /entry-art|modular-art|preview-art|architecture-art|process-art/.test(className);
  const light = readBrandArtwork(family, focus);
  const dark = readBrandArtwork(family, focus, "dark");
  if (!light && !dark) return <div aria-hidden="true" data-artwork-family={family} className={`brand-art artwork-slot ${className}`} />;
  return <Reveal className={`brand-art ${crop ? "art-focus" : ""} ${className}`}>{([["light", light], ["dark", dark]] as const).map(([theme, svg]) => <div key={theme} aria-hidden="true" data-artwork-family={family} className={`art-geometry art-theme-${theme} ${svg ? "" : "artwork-slot"}`} dangerouslySetInnerHTML={svg ? { __html: svg } : undefined} />)}</Reveal>;
}
