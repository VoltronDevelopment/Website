"use client";
import {useEffect, useRef, useState} from "react";
import posters from '@/lib/scene-posters.json';
import {prefersStaticScene} from '../performance/scene-policy';
import {useSceneMotion} from '../performance/use-scene-motion';

/** The home Rubik cube, shown on its own. The coming-soon tile is not part of this view. */
export function ComingCube() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready,setReady]=useState(false);
  const motionRevision=useSceneMotion(host);
  useEffect(() => {
    setReady(false);
    const node = host.current;
    const surface = canvas.current;
    if (!node || !surface) return;
    let disposed = false;
    let stop: (() => void) | undefined;
    const lost=()=>setReady(false),restored=()=>setReady(true);
    surface.addEventListener('webglcontextlost',lost);surface.addEventListener('webglcontextrestored',restored);
    if(!prefersStaticScene())void import("../home/home-cube-renderer").then(async module => {
      if (disposed) return;
      const controller=module.mountHomeCube(surface, node, node, {sharp: true});stop=controller;
      await controller.ready;
      if(!disposed)setReady(!surface.hidden&&surface.dataset.ready==='true');
    }).catch(() => {if(!disposed)surface.hidden = true;});
    return () => {disposed = true;surface.removeEventListener('webglcontextlost',lost);surface.removeEventListener('webglcontextrestored',restored);stop?.();};
  }, [motionRevision]);
  return <>
    <span className="coming-cube-glow" aria-hidden="true"/>
    <div ref={host} className="coming-cube" data-ready={ready} role="img" aria-label="A transparent glass cube. Four faces are tiles: the Voltron logo, Human ingenuity, Shared progress, and Connected intelligence. The tiles turn, solve, and the cube keeps rotating when motion is enabled.">
      <span className="coming-cube-poster" aria-hidden="true">{(['light','dark'] as const).map(theme=><img key={theme} className={'art-theme-'+theme} src={posters.home[theme]} width="1440" height="960" alt="" decoding="async" fetchPriority="high"/>)}</span>
      <canvas ref={canvas} aria-hidden="true"/>
    </div>
  </>;
}
