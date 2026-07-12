import { useEffect, useRef, useState } from 'react';

/** Fire once when the element scrolls into view — used to trigger enter animations. */
export function useInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (seen || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { setSeen(true); io.disconnect(); }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return { ref, seen };
}

/** requestAnimationFrame loop with a 0..1 eased progress, restartable via `key`. */
export function useTween(active: boolean, durationMs: number, key: unknown = 0) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / durationMs);
      setT(easeOutCubic(p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, durationMs, key]);
  return t;
}

export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
export const pct = (x: number) => `${Math.round(x * 100)}%`;
