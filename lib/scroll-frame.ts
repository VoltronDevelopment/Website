type Listener = (scrollY: number) => void;

const listeners = new Set<Listener>();
let frame = 0;
let idle: ReturnType<typeof setTimeout> | undefined;
let attached = false;

function flush() {
  frame = 0;
  document.documentElement.dataset.scrolling = "true";
  clearTimeout(idle);
  idle = setTimeout(() => { delete document.documentElement.dataset.scrolling; }, 160);
  const y = window.scrollY;
  listeners.forEach(listener => listener(y));
}

function onScroll() {
  if (!frame) frame = requestAnimationFrame(flush);
}

/** One passive scroll listener for the page. Subscribers run once per frame. */
export function subscribeScroll(listener: Listener) {
  listeners.add(listener);
  if (!attached && typeof window !== "undefined") {
    attached = true;
    window.addEventListener("scroll", onScroll, {passive: true});
    window.addEventListener("resize", onScroll);
  }
  return () => { listeners.delete(listener); };
}
