'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/**
 * Scroll-reveal wrapper — ported from the design artifact.
 * Adds the `.reveal` class and toggles `.in` once the element scrolls into view,
 * driving the fade/translate + child animation-delay transitions defined in theme.css.
 */
export function Reveal({
  children,
  delay,
  className = '',
  as: Tag = 'div',
  style,
}: {
  children: ReactNode;
  delay?: 1 | 2 | 3 | 4;
  className?: string;
  as?: 'div' | 'section';
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const delayClass = delay ? ` d${delay}` : '';
  return (
    <Tag ref={ref as never} className={`reveal${delayClass}${className ? ' ' + className : ''}`} style={style}>
      {children}
    </Tag>
  );
}
