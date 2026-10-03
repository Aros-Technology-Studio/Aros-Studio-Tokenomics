'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

const SCROLL_RANGE = 480;

function ease(t: number) {
  return t * t * (3 - 2 * t);
}

/**
 * Big centered mark in the hero that shrinks and flies up into the nav's
 * own brand slot as the page scrolls — same source image as the nav mark,
 * so the hand-off at the end is seamless. Also drives --hero-progress on
 * <html>, which the hero tagline (CSS) fades in against as the mark clears.
 */
export function HeroMark() {
  const slotRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef<{ top: number; left: number; width: number; height: number } | null>(
    null,
  );
  const [frame, setFrame] = useState<CSSProperties>({ opacity: 0 });

  useEffect(() => {
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function measureStart() {
      const el = slotRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      startRef.current = {
        top: r.top + window.scrollY,
        left: r.left,
        width: r.width,
        height: r.height,
      };
    }
    measureStart();

    if (reduce) {
      const start = startRef.current;
      if (start) {
        setFrame({
          position: 'fixed',
          left: start.left,
          top: start.top,
          width: start.width,
          height: start.height,
          opacity: 1,
          pointerEvents: 'none',
          zIndex: 60,
        });
      }
      document.documentElement.style.setProperty('--hero-progress', '1');
      return;
    }

    function update() {
      const start = startRef.current;
      const navImg = document.querySelector('.site-nav__brand img') as HTMLElement | null;
      if (!start || !navImg) return;
      const end = navImg.getBoundingClientRect();

      const progress = Math.min(1, Math.max(0, window.scrollY / SCROLL_RANGE));
      const e = ease(progress);

      const startTop = start.top - window.scrollY;
      const left = start.left + (end.left - start.left) * e;
      const top = startTop + (end.top - startTop) * e;
      const width = start.width + (end.width - start.width) * e;
      const height = start.height + (end.height - start.height) * e;

      setFrame({
        position: 'fixed',
        left,
        top,
        width,
        height,
        opacity: progress > 0.97 ? 0 : 1,
        pointerEvents: 'none',
        zIndex: 60,
      });
      document.documentElement.style.setProperty('--hero-progress', String(e));
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', measureStart);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', measureStart);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <>
      <div ref={slotRef} className="hero-mark__slot" aria-hidden="true" />
      <img
        src="/brand/aros-infinity-white.png"
        alt="Aros Studio"
        style={frame}
        aria-hidden="true"
      />
    </>
  );
}
