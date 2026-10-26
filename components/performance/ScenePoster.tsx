import posters from '@/lib/scene-posters.json';
import opening from '@/lib/scene-opening-posters.json';
import framing from '@/lib/scene-poster-framing.json';

export function ScenePoster({kind}:{kind:keyof typeof posters}) {
  const fit=framing[kind] as {width:number;height:number;minWidth:number;minHeight:number;padding?:boolean};
  const padding=fit.padding?'clamp(12px,2.5cqw,28px)':'0px';
  const scale=`min(calc((100cqw - 2 * ${padding}) / ${fit.minWidth}),calc((100cqh - 2 * ${padding}) / ${fit.minHeight}))`;
  return <span className="scene-poster" aria-hidden="true">{(['opening','complete'] as const).map(pose=><span key={pose} className={`scene-pose-${pose}`}>{(['light','dark'] as const).map(theme => <img key={theme} className={`art-theme-${theme}`} src={(pose==='opening'?opening:posters)[kind][theme]} width="640" height="520" alt="" decoding="async" loading={pose==='complete'||kind==='philosophy'||kind==='process'||kind==='plant'?'lazy':'eager'} style={{width:`calc(${scale} * ${fit.width})`,height:`calc(${scale} * ${fit.height})`,maxWidth:'none',objectFit:'fill'}} />)}</span>)}</span>;
}
