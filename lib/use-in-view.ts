import { useEffect, useState, type RefObject } from "react";

type UseInViewOptions = {
  threshold?: number;
  rootMargin?: string;
  /** Force visible after this many ms if observer never fires. */
  fallbackMs?: number;
};

function elementIsInView(node: HTMLElement, threshold: number) {
  const rect = node.getBoundingClientRect();
  if (rect.height <= 0 && rect.width <= 0) return false;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
  if (visibleHeight <= 0) return false;

  const elementRatio = visibleHeight / rect.height;
  const viewportRatio = visibleHeight / viewportHeight;
  return elementRatio >= threshold || viewportRatio >= Math.min(threshold, 0.12);
}

export function useInView(ref: RefObject<HTMLElement | null>, options: UseInViewOptions = {}) {
  const { threshold = 0.05, rootMargin = "0px 0px -10% 0px", fallbackMs = 8000 } = options;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setVisible(true);
    };

    const check = () => {
      if (elementIsInView(node, threshold)) reveal();
    };

    check();
    const raf = window.requestAnimationFrame(check);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal();
      },
      { threshold: [0, threshold, 0.25], rootMargin }
    );

    observer.observe(node);

    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });

    const fallback = window.setTimeout(() => {
      if (elementIsInView(node, threshold)) reveal();
    }, fallbackMs);

    return () => {
      done = true;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      window.clearTimeout(fallback);
    };
  }, [ref, rootMargin, threshold, fallbackMs]);

  return visible;
}
