const finishes = [
  ['phosphating', 'Matte grey phosphate conversion layer'],
  ['ced', 'Satin graphite cathodic electrocoat'],
  ['powder', 'Blue-grey powder-coated finish'],
] as const;

export function SurfaceSection({treatment}:{treatment:number}) {
  const [slug,description]=finishes[treatment];
  return <figure className="alpha-finish-study">
    {(['light','dark'] as const).map(theme=><picture key={theme} className={'art-theme-'+theme}>
      <img src={`/surface-finishes/${slug}-${theme}.webp`} width="1120" height="580" alt={`${description} on the two-bolt mounting bracket`} loading="lazy"/>
    </picture>)}
    <figcaption className="alpha-surface-caption">{description} · Illustrative finish</figcaption>
  </figure>;
}
