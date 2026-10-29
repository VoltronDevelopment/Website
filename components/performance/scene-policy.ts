/** Motion choice is separate from GPU quality. No scene download is needed for a still. */
export function prefersStaticScene() {
  return document.documentElement.dataset.artworkMotion==='off' || matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !!(navigator as Navigator & {connection?:{saveData?:boolean}}).connection?.saveData;
}

export async function yieldToBrowser() {
  const scheduler = (globalThis as typeof globalThis & {scheduler?:{yield:()=>Promise<void>}}).scheduler;
  if (scheduler?.yield) await scheduler.yield();
  else await new Promise<void>(resolve => setTimeout(resolve, 0));
}

/** Downgrade only after sustained slow visible frames; never oscillate during a scene. */
export function createRenderQuality(canvas: HTMLCanvasElement, maximum = 1.5) {
  if(typeof location!=='undefined'&&new URLSearchParams(location.search).get('poster-dpr')==='2')maximum=Math.max(maximum,2);
  let level=0, previous = 0, count = 0, slow = 0;
  let ratio = Math.min(devicePixelRatio || 1, maximum);
  const apply = () => { ratio=Math.min(devicePixelRatio||1,[maximum,1.25,1][level]);canvas.dataset.renderQuality = ['full','balanced','lightweight'][level]; };
  apply();
  return {
    get ratio() { return ratio; },
    get shadows() { return level<2; },
    get blurScale() { return level===2?.25:level===1?.375:.5; },
    sample(now: number) {
      const delta = previous ? now - previous : 0; previous = now;
      if (document.hidden || delta > 250 || delta <= 0) { count = slow = 0; return false; }
      if (delta > 25) slow++;
      if (++count < 90) return false;
      const degrade = slow / count > .3 && level < 2;
      count = slow = 0;
      if (degrade) { level++; apply(); }
      return degrade;
    },
    reset() { previous = count = slow = 0; }
  };
}
