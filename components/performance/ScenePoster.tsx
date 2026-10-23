import posters from '@/lib/scene-posters.json';

export function ScenePoster({kind}:{kind:keyof typeof posters}) {
  return <span className="scene-poster" aria-hidden="true">{(['light','dark'] as const).map(theme => <img key={theme} className={`art-theme-${theme}`} src={posters[kind][theme]} width="640" height="520" alt="" decoding="async" />)}</span>;
}
