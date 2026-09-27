'use client';

import { useEffect, useRef } from 'react';

/**
 * Decorative canvas overlay — dozens of colored strands fanning out near the
 * top, converging through a narrow "waist", then falling as a loose vertical
 * bundle. Each strand flows continuously (animated dash offset) — direction
 * (rising or falling) picked per strand, so the bundle reads as a mix rather
 * than one uniform current. Purely decorative: aria-hidden, pointer-events:
 * none, freezes under prefers-reduced-motion.
 *
 * Standalone on purpose: it fills its own positioned ancestor (see the CSS
 * for #code-waterfall), so a page can drop it wherever it's wanted — full
 * background, one section, later even inside GlobalBackground — without
 * this component knowing or caring which.
 */

const PALETTE = ['#2dd4bf', '#f97316', '#8b6cf0', '#ec4899', '#eab308', '#3b82f6', '#22c55e', '#06b6d4'];

interface Strand {
  topX: number;
  topY: number;
  waistX: number;
  waistY: number;
  bottomX: number;
  bottomY: number;
  color: string;
  dashLen: number;
  gapLen: number;
  speed: number;
  phase: number;
  width: number;
  dir: 1 | -1;
}

export function CodeWaterfall() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.8);
    let width = 0;
    let height = 0;
    let strands: Strand[] = [];

    function buildStrands() {
      const count = width < 700 ? 46 : width < 1100 ? 72 : 100;
      const waistY = height * 0.34;
      const waistCenter = width / 2;
      const waistSpread = Math.min(width * 0.5, 620);
      const next: Strand[] = [];
      for (let i = 0; i < count; i++) {
        const waistX = waistCenter + (Math.random() - 0.5) * waistSpread * 0.9;
        next.push({
          topX: Math.random() * width,
          topY: Math.random() * height * 0.14,
          waistX,
          waistY,
          bottomX: waistX + (Math.random() - 0.5) * 70,
          bottomY: height * (0.62 + Math.random() * 0.38),
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          dashLen: 6 + Math.random() * 10,
          gapLen: 5 + Math.random() * 9,
          speed: 22 + Math.random() * 30,
          phase: Math.random() * 1000,
          width: 0.9 + Math.random() * 0.7,
          dir: Math.random() < 0.5 ? 1 : -1,
        });
      }
      strands = next;
    }

    function resize() {
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStrands();
    }
    resize();
    window.addEventListener('resize', resize);

    function pathFor(s: Strand) {
      const p = new Path2D();
      p.moveTo(s.topX, s.topY);
      p.bezierCurveTo(
        s.topX,
        s.topY + (s.waistY - s.topY) * 0.6,
        s.waistX,
        s.waistY - (s.waistY - s.topY) * 0.35,
        s.waistX,
        s.waistY,
      );
      p.bezierCurveTo(
        s.waistX,
        s.waistY + (s.bottomY - s.waistY) * 0.25,
        s.bottomX,
        s.bottomY - (s.bottomY - s.waistY) * 0.25,
        s.bottomX,
        s.bottomY,
      );
      return p;
    }

    let raf = 0;
    let start: number | null = null;
    function frame(ts: number) {
      if (start === null) start = ts;
      const time = (ts - start) / 1000;
      ctx!.clearRect(0, 0, width, height);
      for (const s of strands) {
        const path = pathFor(s);
        ctx!.save();
        ctx!.strokeStyle = s.color;
        ctx!.globalAlpha = 0.42;
        ctx!.lineWidth = s.width;
        ctx!.setLineDash([s.dashLen, s.gapLen]);
        ctx!.lineDashOffset = -(time * s.speed * s.dir + s.phase);
        ctx!.stroke(path);
        ctx!.restore();

        ctx!.save();
        ctx!.fillStyle = s.color;
        ctx!.globalAlpha = 0.85;
        ctx!.beginPath();
        ctx!.arc(s.topX, s.topY, 2, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(s.bottomX, s.bottomY, 2, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas id="code-waterfall" ref={canvasRef} aria-hidden="true" />;
}
