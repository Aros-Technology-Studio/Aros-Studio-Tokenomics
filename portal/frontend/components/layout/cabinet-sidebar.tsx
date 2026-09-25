'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, loadSession, portalFetch } from '../../lib/auth';

/**
 * AST Portal cabinet navigation — left sidebar for the authenticated area,
 * per the site map: NodeChain · Cabinet · Wallet · Tokenization · Assets ·
 * Setting · Log out. Sits alongside the shared top nav/footer from the root
 * shell; this is the *cabinet's own* navigation once an institution is signed in.
 *
 * On mobile the shared top nav is hidden entirely on cabinet routes (see
 * .site-nav[data-cabinet='true'] in theme.css) — this is the only
 * navigation there, opened via its own toggle instead of always sitting
 * on screen.
 */

const ITEMS: { label: string; href: string }[] = [
  { label: 'NodeChain', href: '/nodechain' },
  { label: 'Cabinet', href: '/dashboard' },
  { label: 'Wallet', href: '/wallet' },
  { label: 'Tokenization', href: '/tokenization' },
  { label: 'Assets', href: '/assets' },
  { label: 'Setting', href: '/setting' },
];

export function CabinetSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function logout() {
    const s = loadSession();
    if (s) {
      void portalFetch('/v1/auth/logout', { method: 'POST', sessionId: s.sessionId });
    }
    clearSession();
    router.push('/login');
  }

  return (
    <>
      <button
        type="button"
        className="cabinet-sidebar__toggle"
        aria-label="Toggle cabinet menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? '✕' : '⋮'}
      </button>
      <div
        className="cabinet-sidebar__scrim"
        aria-hidden="true"
        data-open={open ? 'true' : 'false'}
        onClick={() => setOpen(false)}
      />
      <nav className="cabinet-sidebar" aria-label="Cabinet" data-open={open ? 'true' : 'false'}>
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} data-active={active ? 'true' : 'false'}>
              {item.label}
            </Link>
          );
        })}
        <button type="button" className="cabinet-sidebar__logout" onClick={logout}>
          Log out
        </button>
      </nav>
    </>
  );
}
