'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Settlement Simulator in a site "window": the static simulator page is embedded
 * (same origin) and reports its content height, so the window grows with it.
 */
export function SimulatorWindow({ src, title }: { src: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);

  // Same-origin read on load: the simulator may post its height before this page hydrates.
  const measure = useCallback(() => {
    try {
      const h = frame.current?.contentDocument?.documentElement?.scrollHeight;
      if (h && h > 200) setHeight(Math.ceil(h));
    } catch {
      /* cross-origin or not loaded yet: wait for the posted height */
    }
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as { type?: string; h?: number } | null;
      if (d && d.type === 'aros-sim-height' && typeof d.h === 'number' && d.h > 200) {
        setHeight(Math.ceil(d.h));
      }
    };
    window.addEventListener('message', onMessage);
    measure();
    return () => window.removeEventListener('message', onMessage);
  }, [measure]);

  return (
    <div className="sim-window">
      <div className="sim-window__bar">
        <span className="sim-window__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="sim-window__title">{title}</span>
        <a className="sim-window__open" href={src} target="_blank" rel="noopener noreferrer">
          Full screen ↗
        </a>
      </div>
      <iframe
        ref={frame}
        className="sim-window__frame"
        src={`${src}?embed=1`}
        title={title}
        style={{ height }}
        onLoad={measure}
      />
    </div>
  );
}
