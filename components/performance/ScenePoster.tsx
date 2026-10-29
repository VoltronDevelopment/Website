import {hdPoster,hdOpening} from './hd-poster';
import nativeFrames from '@/lib/scene-responsive-opening-frames.json';
import {DeferredPicture} from './DeferredArtwork';
import type {CSSProperties} from 'react';
import posters from '@/lib/scene-posters.json';
import opening from '@/lib/scene-opening-posters.json';
import framing from '@/lib/scene-poster-framing.json';
import responsiveOpening from '@/lib/scene-responsive-opening-posters.json';

export function ScenePoster({kind}:{kind:keyof typeof posters}) {
  const Picture=kind==='process'?DeferredPicture:'picture';
  const responsive=kind in responsiveOpening?responsiveOpening[kind as keyof typeof responsiveOpening]:undefined;
  const fit=framing[kind] as {width:number;height:number;minWidth:number;minHeight:number;padding?:boolean};
  const padding=fit.padding?'clamp(12px,2.5cqw,28px)':'0px';
  const native=['technology','handCulture','handPartner','commons'].includes(kind)?nativeFrames[kind as keyof typeof nativeFrames]:undefined;
  const cultureOpening=kind==='handCulture'?responsiveOpening.handCulture as Record<string,{light:string;dark:string}>:undefined;
  const nativeStyle=native?Object.fromEntries(Object.entries(native).flatMap(([device,frame])=>{const aspect=frame.width/frame.height,h=Math.max(fit.minHeight,fit.minWidth/aspect);return [[`--scene-native-${device}-width`,h*aspect],[`--scene-native-${device}-height`,h]];})) as CSSProperties:undefined;
  const scale=`min(calc((100cqw - 2 * ${padding}) / ${fit.minWidth}),calc((100cqh - 2 * ${padding}) / ${fit.minHeight}))`;
  return <span className={`scene-poster${kind==='home'?' scene-poster-home':''}`} aria-hidden="true">{(['opening','complete'] as const).map(pose=><span key={pose} className={`scene-pose-${pose}`}>{(['light','dark'] as const).map(theme => <Picture key={theme} style={pose==='opening'?nativeStyle:undefined} className={`art-theme-${theme} ${pose==='opening'&&responsive?`scene-responsive-opening scene-responsive-${kind}${native?' scene-native-opening':''}`:''}`}>{pose==='opening'&&cultureOpening?.mobileTall&&<source media="(max-width:767px) and (min-height:884px)" srcSet={hdOpening(kind,'mobileTall',theme,cultureOpening.mobileTall[theme])}/>} {pose==='opening'&&responsive&&<source media="(max-width:767px)" srcSet={hdOpening(kind,'mobile',theme,responsive.mobile[theme])}/>}{pose==='opening'&&cultureOpening?.tablet&&<source media="(min-width:768px) and (max-width:1023px)" srcSet={hdOpening(kind,'tablet',theme,cultureOpening.tablet[theme])}/>} {pose==='opening'&&cultureOpening?.short&&<source media="(min-width:1024px) and (max-height:780px)" srcSet={hdOpening(kind,'short',theme,cultureOpening.short[theme])}/>}{pose==='opening'&&cultureOpening?.tall&&<source media="(min-width:1024px) and (min-height:920px)" srcSet={hdOpening(kind,'tall',theme,cultureOpening.tall[theme])}/>}<img {...(pose==='complete'?hdPoster(kind,pose,theme,posters[kind][theme]):{srcSet:hdOpening(kind,responsive?'desktop':'generic',theme,responsive?responsive.desktop[theme]:opening[kind][theme])})} className={`art-theme-${theme}`} src={pose==='opening'&&responsive?responsive.desktop[theme]:(pose==='opening'?opening:posters)[kind][theme]} width="640" height="520" alt="" decoding="async" loading='lazy' fetchPriority={pose==='opening'&&kind==='home'?'high':'auto'} style={{width:kind==='home'?'calc(100cqh * 1.5 * var(--home-poster-fov,1))':`calc(${scale} * ${pose==='opening'&&native?`var(--scene-native-width, ${fit.width})`:fit.width})`,height:kind==='home'?'calc(100cqh * var(--home-poster-fov,1))':`calc(${scale} * ${pose==='opening'&&native?`var(--scene-native-height, ${fit.height})`:fit.height})`,maxWidth:'none',objectFit:'fill'}} /></Picture>)}</span>)}</span>;
}
