'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  clearSession,
  loadSession,
  portalFetch,
  type PortalSession,
} from '../lib/session';
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const [session, setSession] = useState<PortalSession | null>(null);
  const router = useRouter();

  useEffect(() => {
    setSession(loadSession());
  }, []);

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
      <div className="brand">
        AST Portal
        <span>Institutional clients</span>
      </div>
      <nav className="nav">
        {session ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/processes/new">New process</Link>
            <span className="muted">{session.institutionId}</span>
            <button type="button" className="linkish" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <Link href="/login">Log in</Link>
        )}
      </nav>
    </header>
  );
}
