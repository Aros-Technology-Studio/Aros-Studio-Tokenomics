'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../lib/i18n/context';

/**
 * Settlement Simulator embedded in a site page. The frame is transparent: the
 * simulator's controls render in the site's dark style over the animated
 * background, and only the animation tracks are drawn as white windows.
 * The embedded page (same origin) reports its content height.
 */
export function SimulatorWindow({ src, title }: { src: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);
  const { locale, tx } = useI18n();

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
    <div className="sim-embed">
      <div className="sim-embed__bar">
        <a className="sim-embed__open" href={src} target="_blank" rel="noopener noreferrer">
          {tx('Open full screen ↗')}
        </a>
      </div>
      <iframe
        // remount on language switch: the simulator reads the locale cookie at load
        key={locale}
        ref={frame}
        className="sim-embed__frame"
        src={`${src}?embed=1`}
        title={title}
        style={{ height }}
        onLoad={measure}
      />
    </div>
  );
}
