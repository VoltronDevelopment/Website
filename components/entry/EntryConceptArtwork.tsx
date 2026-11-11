import type { CSSProperties } from "react";

export function EntryConceptArtwork({ label, src, highDensity }: {
  label: string;
  src: string;
  highDensity: string;
}) {
  return <span className="entry-concept-frame" style={{
    "--entry-concept-image": `url("${highDensity}")`,
  } as CSSProperties}>
    <img className="entry-concept-artwork" src={src}
      srcSet={`${src} 1x, ${highDensity} 2x`} alt={label}
      width={360} height={360} decoding="async"/>
  </span>;
}
