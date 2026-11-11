"use client";
import { useEffect, useRef } from "react";

const presets = { vera: 5, platform: 3, vision: 4, challenge: 0 } as const;

export function VeraCube({ active = false, variant = "vera" }: { active?: boolean; variant?: keyof typeof presets }) {
  if (variant !== "vera") return <span className="vera-question-cube" data-study={variant} aria-hidden="true"><span className="vera-face-top" /><span className="vera-face-left" /><span className="vera-face-right" /><span className="vera-study-light" /></span>;
  return <VeraIdentity active={active} />;
}

function VeraIdentity({ active }: { active: boolean }) {
  const variant = "vera";
  const host = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const preset = presets[variant];
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false, detach: (() => void) | undefined;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || detach) return;
      observer.disconnect();
      try {
        const { attachVeraCube } = await import("./vera-cube-renderer");
        if (!disposed && canvas.current) detach = attachVeraCube(canvas.current, element, preset);
      } catch { /* The exact agent poster remains visible when WebGL is unavailable. */ }
    });
    observer.observe(element);
    return () => { disposed = true; observer.disconnect(); detach?.(); };
  }, [preset]);
  return <span ref={host} className="vectra-cube" data-variant={variant} data-active={active || undefined} aria-hidden="true">
    <span className="vectra-cube-aura" />
    <span className="vera-cube-poster">
      <img className="art-theme-light" src="/vera/identity-light.png" alt="" width={256} height={256} /><img className="art-theme-dark" src="/vera/identity-dark.png" alt="" width={256} height={256} />
    </span>
    <canvas ref={canvas} className="vera-cube-canvas" />
  </span>;
}
