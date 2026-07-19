'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  clearSession,
  loadSession,
  portalFetch,
  type PortalSession,
} from '../lib/session';

export function AppHeader() {
  const [session, setSession] = useState<PortalSession | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setSession(loadSession());
  }, [pathname]);

  function logout() {
    const s = loadSession();
    if (s) {
      void portalFetch('/v1/auth/logout', {
        method: 'POST',
        sessionId: s.sessionId,
      });
    }
    clearSession();
    setSession(null);
    router.push('/login');
  }

  return (
    <header className="topbar">
      <Link href={session ? '/dashboard' : '/'} style={{ textDecoration: 'none' }}>
        <div className="brand">
          <span className="brand-title">Aros Financial Core</span>
          <span className="brand-sub">Institutional Portal · AST edge</span>
        </div>
      </Link>
      <nav className="nav">
        {session ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/processes/new">New process</Link>
            <span className="pill">{session.institutionId}</span>
            <button type="button" className="linkish" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/">Overview</Link>
            <Link href="/login">Institution login</Link>
          </>
        )}
      </nav>
    </header>
  );
}
