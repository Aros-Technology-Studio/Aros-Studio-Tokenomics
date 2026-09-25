'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Single shared navigation — transparent, fixed to the top of every page.
 * Matches the AST site map: TECHNOlogic · Institutions · Investment · Resources · About · Contact.
 * Turns solid-glass on scroll for legibility over the iridescent backdrop.
 */

const NAV_ITEMS: { label: string; href: string }[] = [
  { label: 'TECHNOlogic', href: '/technologic' },
  { label: 'Institutions', href: '/institutions' },
  { label: 'Investment', href: '/investment' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

// Routes that live inside the authenticated cabinet — the cabinet's own
// left sidebar is the in-app navigation there, so on mobile this header's
// burger/drawer (marketing nav) is redundant and gets hidden by CSS.
const CABINET_PREFIXES = [
  '/dashboard',
  '/wallet',
  '/history',
  '/setting',
  '/tokenization',
  '/assets',
  '/nodechain',
];

export function AppHeader() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const inCabinet = CABINET_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close the mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`site-nav${solid ? ' solid' : ''}`}
      data-open={open ? 'true' : 'false'}
      data-cabinet={inCabinet ? 'true' : 'false'}
    >
      <button
        type="button"
        className="site-nav__burger"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? '✕' : '☰'}
      </button>

      <nav className="site-nav__links" aria-label="Main">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} data-active={active ? 'true' : 'false'}>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* reserved, empty on purpose — room for a future action (e.g. Sign up)
          between the nav links and the brand mark */}
      <span className="site-nav__slot" aria-hidden="true" />

      <Link href="/" className="site-nav__brand" aria-label="Aros Studio Tokenomics — home">
        <img src="/brand/aros-infinity-white.png" alt="Aros Studio" width={128} height={80} />
      </Link>

      {/* mirrors the reserved slot before the mark, so it sits centered
          between two equal gaps */}
      <span className="site-nav__slot" aria-hidden="true" />

      {/* tap-outside-to-close scrim behind the right-side mobile drawer */}
      <div
        className="site-nav__scrim"
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />
    </header>
  );
}
