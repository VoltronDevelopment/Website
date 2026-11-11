export function EntryConceptArtwork({ label, src, highDensity }: {
  label: string;
  src: string;
  highDensity: string;
}) {
  return <img className="entry-concept-artwork" src={src}
    srcSet={`${src} 1x, ${highDensity} 2x`} alt={label}
    width={360} height={360} decoding="async"/>;
}
