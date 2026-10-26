import { readBrandArtwork, readBrandImage } from "@/lib/brand-assets";
import { Reveal } from "./Reveal";
import {ContextArtwork} from './ContextArtwork';

export function BrandArt({ family, className = "", crop = false }: { family: string; className?: string; crop?: boolean }) {
  const focus = crop || /entry-art|modular-art|preview-art|architecture-art|process-art/.test(className);
  const light = readBrandArtwork(family, focus);
  const dark = readBrandArtwork(family, focus, "dark");
  const lightImage=readBrandImage(family),darkImage=readBrandImage(family,"dark");
  if (!light && !dark && !lightImage && !darkImage) return <ContextArtwork family={family} className={className}/>;
  return <Reveal className={`brand-art ${crop ? "art-focus" : ""} ${className}`}>{([["light",light,lightImage],["dark",dark,darkImage]] as const).map(([theme,svg,image])=>svg?<div key={theme} aria-hidden="true" data-artwork-family={family} className={`art-geometry art-theme-${theme}`} dangerouslySetInnerHTML={{__html:svg}}/>:image?<div key={theme} aria-hidden="true" data-artwork-family={family} className={`art-geometry art-theme-${theme}`}><img src={image} alt="" width="1200" height="1000" loading="lazy" decoding="async"/></div>:<div key={theme} aria-hidden="true" data-artwork-family={family} className={`art-geometry art-theme-${theme} artwork-slot`}/>)}</Reveal>;
}
