'use client';

import {useEffect, useRef, type RefObject} from 'react';
import {waitForScrollPause} from '../home/scene-preparation';
import {ScenePreparationObserver} from '../performance/scene-preparation-observer';
import {prefersStaticScene} from '../performance/scene-policy';
import {useSceneMotion} from '../performance/use-scene-motion';
import type {mountOrbs} from './orb-renderer';

export function useAgentArtwork(host: RefObject<HTMLDivElement | null>, selected: number, rootMargin: string) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<ReturnType<typeof mountOrbs> | null>(null);
  const latest = useRef(selected);
  const revision = useSceneMotion(host);

  useEffect(() => {
    latest.current = selected;
    controller.current?.select(selected);
  }, [selected]);

  useEffect(() => {
    const element = host.current;
    if (!element || prefersStaticScene()) return;
    let disposed = false;
    const observer = new ScenePreparationObserver(async () => {
      if (disposed || controller.current || prefersStaticScene()) return;
      const {mountOrbs} = await import('./orb-renderer');
      await waitForScrollPause();
      if (disposed || prefersStaticScene() || !canvas.current) return;
      const mounted = mountOrbs(canvas.current, element);
      controller.current = mounted;
      mounted.select(latest.current);
      try {
        await mounted.prepared;
      } catch {
        if (controller.current === mounted) {
          mounted.dispose();
          controller.current = null;
        }
      }
    }, {rootMargin});
    observer.observe(element);
    return () => {
      disposed = true;
      observer.disconnect();
      controller.current?.dispose();
      controller.current = null;
    };
  }, [host, revision, rootMargin]);
  return canvas;
}
