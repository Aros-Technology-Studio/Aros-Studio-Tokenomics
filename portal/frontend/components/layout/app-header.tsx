'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  clearSession,
  loadSession,
  portalFetch,
  type PortalSession,
} from '../../lib/auth';

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
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div className="brand">
          <span className="brand-title">Aros Financial Core</span>
          <span className="brand-sub">AST · public trust layer + institutional edge</span>
        </div>
      </Link>
      <nav className="nav">
        <Link href="/about">About</Link>
        <Link href="/system">System</Link>
        <Link href="/explore">Explore</Link>
        {session ? (
          <>
            <Link href="/dashboard">Cabinet</Link>
            <Link href="/tokenization">Tokenization</Link>
            <Link href="/assets">Assets</Link>
            <span className="pill">{session.institutionId}</span>
            <button type="button" className="linkish" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <Link href="/login">
            <button type="button" className="primary" style={{ padding: '0.45rem 0.9rem' }}>
              Institution login
            </button>
          </Link>
        )}
      </nav>
    </header>
  );
}
