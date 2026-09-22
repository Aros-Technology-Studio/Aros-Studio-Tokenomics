'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, loadSession, portalFetch } from '../../lib/auth';

/**
 * AST Portal cabinet navigation — left sidebar for the authenticated area,
 * per the site map: NodeChain · Cabinet · Wallet · Tokenization · Assets ·
 * Setting · Log out. Sits alongside the shared top nav/footer from the root
 * shell; this is the *cabinet's own* navigation once an institution is signed in.
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

  function logout() {
    const s = loadSession();
    if (s) {
      void portalFetch('/v1/auth/logout', { method: 'POST', sessionId: s.sessionId });
    }
    clearSession();
    router.push('/login');
  }

  return (
    <nav className="cabinet-sidebar" aria-label="Cabinet">
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
  );
}
