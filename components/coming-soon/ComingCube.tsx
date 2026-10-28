"use client";
import {useEffect, useRef} from "react";

/** The home Rubik cube, shown on its own. The coming-soon tile is not part of this view. */
export function ComingCube() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const node = host.current;
    const surface = canvas.current;
    if (!node || !surface) return;
    let disposed = false;
    let stop: (() => void) | undefined;
    void import("../home/home-cube-renderer").then(module => {
      if (disposed) return;
      stop = module.mountHomeCube(surface, node, node, {sharp: true});
    }).catch(() => {surface.hidden = true;});
    return () => {disposed = true; stop?.();};
  }, []);
  return <>
    <span className="coming-cube-glow" aria-hidden="true"/>
    <div ref={host} className="coming-cube" role="img" aria-label="A transparent glass cube. Four faces are tiles: the Voltron logo, Human ingenuity, Shared progress, and Connected intelligence. The tiles turn, solve, and the cube keeps rotating.">
      <canvas ref={canvas} aria-hidden="true"/>
    </div>
  </>;
}
