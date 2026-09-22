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

export function AppHeader() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

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
    >
      <Link href="/" className="site-nav__brand" aria-label="Aros Studio Tokenomics — home">
        <img src="/brand/ast-logo-light.png" alt="Aros Studio Tokenomics" width={140} height={40} />
      </Link>

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
    </header>
  );
}
